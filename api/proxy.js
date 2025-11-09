import axios from "axios";

export default async function handler(req, res) {
  try {
    console.log("📩 [proxy.js] Incoming request body:", req.body);

    const { text } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!text) {
      console.error("❌ No text provided in request body.");
      return res.status(400).json({ error: "No text provided." });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing OPENROUTER_API_KEY in environment.");
      return res.status(500).json({ error: "Missing OPENROUTER_API_KEY." });
    }

    console.log("🔑 Using OpenRouter key:", apiKey.substring(0, 10) + "...");

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mixtral-8x7b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a fact-checking assistant. Classify the statement as Likely True, Likely False, or Uncertain and provide a short explanation.",
          },
          {
            role: "user",
            content: text,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.VERCEL_URL || "https://your-app.vercel.app", // Change to your Vercel URL after deploy
          "X-Title": "FakeCheck AI",
        },
      }
    );

    console.log("✅ OpenRouter response received.");

    const result = response.data?.choices?.[0]?.message?.content || "No response received.";
    res.status(200).json({ result });

  } catch (error) {
    console.error("🔥 OpenRouter Error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
      return res.status(error.response.status).json({
        error: error.response.data,
      });
    } else {
      console.error(error.message);
      return res.status(500).json({ error: error.message });
    }
  }
}