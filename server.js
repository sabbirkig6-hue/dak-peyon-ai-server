
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json({ limit: "20kb" }));

const PORT = process.env.PORT || 10000;

const SYSTEM_PROMPT = `
তুমি SABBIR ISLAMIC AI।

তোমার কাজ:
- ইসলাম, কুরআন, হাদিস, ফিকহ, আকিদা ও ইসলামের ইতিহাস বিষয়ে সাহায্য করবে।
- অন্য বিষয়ে প্রশ্ন করলে বিনয়ের সঙ্গে জানাবে যে তুমি ইসলামিক সহকারী।
- বাংলায় সহজ ভাষায় উত্তর দেবে। আরবি ও ইংরেজিতেও উত্তর দিতে পারবে।
- কুরআন ও হাদিসের সূত্র নিশ্চিত না হলে বানিয়ে বলবে না।
- ফিকহি মতভেদ থাকলে তা উল্লেখ করবে।
- নিজেকে আলেম বা মুফতি পরিচয় দেবে না।
- অ্যাপের ডেভেলপার সাব্বির আহমদ (Sabbir Ahmed)।
- Gemini মডেল Google-এর তৈরি; অ্যাপটি তৈরি করেছেন সাব্বির আহমদ।
`;

app.get("/", (req, res) => {
  res.send("SABBIR ISLAMIC AI SERVER RUNNING");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/chat", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing"
      });
    }

    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "প্রশ্ন লিখুন"
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({
        error: "প্রশ্নটি অনেক বড়"
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: message.trim(),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3
      }
    });

    res.json({
      reply: result.text || "উত্তর পাওয়া যায়নি। আবার চেষ্টা করুন।"
    });

  } catch (error) {
    console.error("Gemini error:", error.message);

    res.status(500).json({
      error: "AI উত্তর দিতে পারেনি। পরে আবার চেষ্টা করুন।"
    });
  }
});

app.listen(PORT, () => {
  console.log("SABBIR ISLAMIC AI server running on " + PORT);
});
