const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function addMessage(message, type) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add(
        "message",
        type === "user" ? "user-message" : "ai-message"
    );
    msgDiv.textContent = message;

    // Add feedback buttons only for AI messages
    if (type === "ai") {
        const feedbackDiv = document.createElement("div");
        feedbackDiv.classList.add("feedback");

        feedbackDiv.innerHTML = `
            <span class="like">👍</span>
            <span class="dislike">👎</span>
        `;

        msgDiv.appendChild(feedbackDiv);

        feedbackDiv.querySelector(".like")
            .addEventListener("click", () =>
                giveFeedback("like", message, feedbackDiv)
            );

        feedbackDiv.querySelector(".dislike")
            .addEventListener("click", () =>
                giveFeedback("dislike", message, feedbackDiv)
            );
    }

    // always append at the end
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    saveChatHistory();
}



async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    const welcomeScreen = document.getElementById("welcome-screen");
if (welcomeScreen) {
    welcomeScreen.classList.add("fade-out");
    setTimeout(()=>welcomeScreen.remove(),400);
}

hideFAQs();


    console.log("📤 Sending:", message);

    // add user message
    addMessage(message, "user");
    const welcome = document.getElementById("welcome-screen");
if (welcome) {
    welcome.classList.add("fade-out");
    setTimeout(() => welcome.remove(), 400);
}

    userInput.value = "";

    //  Show typing indicator
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "ai-message");
    typingDiv.textContent = "Typing...";
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("http://localhost:5000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: message })
        });

        const data = await response.json();
        console.log("🤖 AI Response:", data);

        //  Remove typing indicator
        typingDiv.remove();

        //  Add AI response
        if (data.answer) {
            addMessage(data.answer, "ai");
        } else {
            addMessage("Sorry, I couldn't generate a response.", "ai");
        }

    } catch (error) {
        console.error("❌ Error:", error);
        typingDiv.remove();
        addMessage("Server error. Please try again later.", "ai");
    }
}




function hideFAQs() {
    const faq = document.getElementById("faq-container");
    if (faq) faq.remove();
}


function saveChatHistory() {
    const messages = chatBox.innerHTML;
    localStorage.setItem("chatHistory", messages);
}


function clearChatHistory() {
    localStorage.removeItem("chatHistory");
    chatBox.innerHTML = "";
    alert("Chat history cleared!");
}



function giveFeedback(type, message, parentDiv) {
    const feedback = {
        response: message,
        rating: type,
        time: new Date().toLocaleString()
    };

    // Store in localStorage
    let stored = JSON.parse(localStorage.getItem("feedback") || "[]");
    stored.push(feedback);
    localStorage.setItem("feedback", JSON.stringify(stored));

    // Mark selected button
    parentDiv.innerHTML = type === "like" 
        ? `👍 Liked` 
        : `👎 Disliked`;

    parentDiv.style.opacity = "0.7";
}



function loadChatHistory() {
    const saved = localStorage.getItem("chatHistory");

    if (!saved) {
        alert("No chat history found.");
        return;
    }

    chatBox.innerHTML = saved;

    // Reattach feedback event listeners
    document.querySelectorAll(".feedback").forEach(div => {
        const likeBtn = div.querySelector(".like");
        const dislikeBtn = div.querySelector(".dislike");
        const parentMessage = div.parentElement.firstChild.textContent;

        if (likeBtn) {
            likeBtn.addEventListener("click", () => giveFeedback("like", parentMessage, div));
        }
        if (dislikeBtn) {
            dislikeBtn.addEventListener("click", () => giveFeedback("dislike", parentMessage, div));
        }
    });

    
}


document.addEventListener("click", (e) => {
    if (e.target.classList.contains("faq-btn")) {
        userInput.value = e.target.textContent;
        sendMessage();
    }
});



document.getElementById("show-history").addEventListener("click", () => {
    loadChatHistory();
});


document.getElementById("clear-history").addEventListener("click", clearChatHistory);

