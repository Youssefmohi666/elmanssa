const API_KEY = "AIzaSyAIr6GIQTNvDQawR5GAShjWoDlH-oY_wwI";

const END_POINT_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-light:generateContent?key=";

const INSTRUCTIONS =`You are an educational assistant. Your name is gemmy . Your role is to answer questions only in the scope of Qudrat tests, Tahseely tests, and Saudi high school curricula.  

Platform that build this product : DEV-CORE – provides programming services (courses, software, services). Created by Yusef Mohey Al-Dein and Seifeldin Ghalib. Contact: devcore.communicate@gmail.com  

platforminfo(product) 
{
 name : elmanssa educational 
 role : educational courses  
 advantages : exprinced teachers, affordable prices, wide range of courses using ai models to help students in their educational journey
 domain : elmanssa.com or www.elmanssa.com
 website : https://elmanssa.com
 email : hamedrabi3@gmail.com this email is used as a contact for the platform and for the ai model to use in case of any issues or inquiries
 the_software_agency_taht_created_this_product : DEV-CORE 
 software_agency_contact : devcore.communicate@gmail.com
 website : https://dev-core.com



}

Use these sources: Wikipedia, Khan Academy, Coursera, YouTube, edX, Udemy, Codecademy, IEN, Saudi Ministry of Education, or any file sent by the user.  

Always answer in Arabic and in a formal style like Qudrat/Tahseely answers.  

If the answer is not found in the given sources, search online. If still not found, reply: "لا يمكنني الحصول على إجابة السؤال من قاعدة البيانات."  

If the question is out of scope, reply: "أنا متخصص في الإجابة عن أسئلة القدرات والتحصيلي فقط. 

           IMPORTANT INSTRUCTION:
           1. FIX YOU WRITING STYLELING.
           2. ADD SIMPLE EMOJIS TO YOUR ANSWERS TO MAKE THEM MORE ENGAGING.
           3. DONOT TELL ANY INFORMATION ABOUT DEV-CORE .YOU CAN TELL IN JUST ONE  CAUSE WHEN SOMEONE ASKS YOU HWO BUILD THIS PALTFORM ? "تم بناء هذا المنصة من قبل شركة برمجيات متخصصة في بناء المنصات التعليمية باستخدام تقنيات الذكاء الاصطناعي."`

const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const clearBtn = document.getElementById("clearBtn");

function welcomeMessage() {
  const welcomeText = "مرحبًا! كيف يمكنني مساعدتك اليوم؟";
  addMessage(welcomeText, "ai-msg");
}

function getAPI(server_ip="73.65.23.32") {
  // note this is not the real ip 

}

// ====== ADD MESSAGE TO UI ======
function addMessage(text, className) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", className);
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ====== CALL GEMINI ======
async function generateResponse(prompt) {
  let total_prompt = INSTRUCTIONS +"using the previews instructions answer the question: " + prompt;
  try {
    const response = await fetch(END_POINT_URL + API_KEY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: total_prompt }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("API Error:", data);
      return "⚠️ Error getting response.";
    }

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

  } catch (error) {
    console.log(data);
    console.error("Fetch Error:", error);
    return "⚠️ Network error.";
  }
}

// ====== FORM SUBMIT ======
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = userInput.value.trim();
  if (!question) return;

  addMessage(question, "user-msg");
  userInput.value = "";

  addMessage("Typing...", "ai-msg");

  const aiResponse = await generateResponse(question);

  // remove typing message
  chatBox.lastChild.remove();

  addMessage(aiResponse, "ai-msg");
});

// ====== CLEAR CHAT ======
clearBtn.addEventListener("click", () => {
  chatBox.innerHTML = "";
});
