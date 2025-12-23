import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const askAI = async (req, res) => {
  try {
    console.log("🔥 Received request:", req.body);

    const { question } = req.body;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
  role: "system",
  content: `
  You are an AI career counselor specializing in internships and IT career guidance. Provide clear, helpful answers.
You MUST follow this FORMAT STRICTLY for every answer. 
NO MATTER WHAT the user asks, ALWAYS answer in this structure:

### 🔹 Main Heading (Short)

- Bullet point
- Bullet point
- Bullet point

### 🔹 Key Details

- Bullet point with **bold important words**
- Bullet point with short explanation
- Bullet point with example (if needed)

### 🔹 Final Advice

- 1-2 short bullets only

HARD RULES:
- NEVER write long paragraphs.
- NEVER write more than 2 lines per bullet.
- NEVER write continuous text.
- ALWAYS break content into sections.
- ALWAYS use headings + bullet points.
- ALWAYS keep answers clean and readable.
- If user asks for explanation, STILL use bullets.
- If the model tries to write paragraphs, stop and rewrite in bullets.

If the user asks for code, provide code but with headings + bullet points.
  `,
}
,
        { role: "user", content: question },
      ],
    });

    let answer = response.choices[0].message.content;

    answer = answer
  .replace(/\. /g, ".\n")          // break long sentences
  .replace(/-/g, "\n- ")           // ensure bullet points look clean
  .replace(/•/g, "\n• ")           // fix existing dots
  .replace(/\n\s*\n/g, "\n");  

    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching AI response" });
  }
};




