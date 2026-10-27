
import express from "express";

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.send("Dak Peyon AI Server is running!");
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "প্রশ্ন লিখুন।"
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: "প্রশ্নটি একটু ছোট করুন।"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "AI সার্ভারের API key সেট করা হয়নি।"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: `তুমি ডাক পিয়ন AI। তোমার নির্মাতা সাব্বির আহমদ, সিলেট।
ইসলাম, কুরআন, হাদিস, ফিকহ ও ইসলামি ইতিহাসের প্রশ্নে সহজ বাংলায় সহায়তা করো।
কেউ অ্যাপের মালিক জানতে চাইলে বলবে: এই অ্যাপের নির্মাতা সাব্বির আহমদ, সিলেট।
ইসলামিক পোস্টার, ব্যানার, লোগো ও ফরমের ডিজাইন-সংক্রান্ত প্রশ্নে সহায়তা করো।
অশ্লীল, যৌন বা ক্ষতিকর অনুরোধে ভদ্রভাবে প্রত্যাখ্যান করো।
অন্য সাধারণ প্রশ্ন হলে জানাও যে এই অ্যাপ মূলত ইসলামিক সহায়তার জন্য।
ধর্মীয় বিষয়ে নিশ্চিত না হলে অনুমান করে উত্তর দিও না।`
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: message }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(502).json({
        error: "AI থেকে উত্তর পাওয়া যায়নি। পরে আবার চেষ্টা করুন।"
      });
    }

    const answer =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    res.json({
      answer: answer || "দুঃখিত, এবার উত্তর তৈরি করা যায়নি।"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "সার্ভারে সমস্যা হয়েছে।"
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Dak Peyon AI running on port ${port}`);
});
  
