import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from google import genai
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging

# =============================
# Load Environment Variables
# =============================
load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment variables.")

# =============================
# Logging
# =============================
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AI-Service")

# =============================
# Rate Limiter
# =============================
limiter = Limiter(key_func=get_remote_address)

# =============================
# FastAPI App
# =============================
app = FastAPI(title="AI Service Platform")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

# =============================
# Gemini Client
# =============================
client = genai.Client(api_key=GEMINI_API_KEY)

# =============================
# Root Redirect
# =============================
@app.get("/")
def root_redirect():
    return RedirectResponse(url="/ai")

# =============================
# Helpers
# =============================
async def generate_ai_response(prompt: str, model_name: str = "gemini-1.5-flash") -> str:
    try:
        # تحقق من الموديل
        models = client.models.list()
        if not any(model.name == model_name for model in models):
            msg = f"Model '{model_name}' is not available for your account."
            logger.error(msg)
            return msg

        # Generate content
        response = await client.models.generate_content_async(
            model=model_name,
            contents=prompt
        )

        if not response.text:
            return "AI did not generate any response."

        return response.text

    except Exception as e:
        logger.exception(f"AI generation failed: {e}")
        return f"AI generation error: {str(e)}"

# =============================
# Frontend Pages
# =============================
@app.get("/ai")
async def ai_root():
    return FileResponse(os.path.join(BASE_DIR, "static/ai.html"))

@app.get("/ai/chat")
async def ai_chat_page():
    return FileResponse(os.path.join(BASE_DIR, "static/chat.html"))

@app.get("/ai/generate")
async def ai_generate_page():
    return FileResponse(os.path.join(BASE_DIR, "static/generate.html"))

# =============================
# API Endpoints with Rate Limiting
# =============================
@app.post("/api/ai/{model_id}")
@limiter.limit("10/minute")  # 10 requests per minute per IP
async def ai_api_handler(model_id: str, request: Request):
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    if model_id == "chatbot":
        user_message = data.get("message")
        if not user_message:
            raise HTTPException(status_code=400, detail="Message is required")
        ai_response = await generate_ai_response(user_message)
        return JSONResponse({"message": ai_response})

    elif model_id == "generator":
        user_prompt = data.get("prompt")
        if not user_prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")
        ai_response = await generate_ai_response(user_prompt)
        return JSONResponse({"result": ai_response})

    else:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found")

# =============================
# Health Check
# =============================
@app.get("/api/health")
async def health_check():
    try:
        models = [model.name for model in client.models.list()]
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        models = []
    return JSONResponse({
        "status": "healthy",
        "service": "AI Service",
        "gemini_ready": bool(GEMINI_API_KEY),
        "available_models": models
    })

# =============================
# Run server
# =============================
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=True)
