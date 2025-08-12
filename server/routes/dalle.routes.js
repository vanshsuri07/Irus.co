// server/routes/dalle.routes.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const router = express.Router();

// API keys from .env
const HF_API_KEY = process.env.HF_API_KEY; // Hugging Face
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Optional Gemini

// Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function enhancePromptWithGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(
      `Rewrite this prompt to make it perfect for generating a creative, minimal, vector-style logo: ${prompt}`
    );
    return result.response.text().trim();
  } catch (err) {
    console.error("Gemini enhancement failed, using original prompt:", err);
    return prompt;
  }
}

// Updated function with multiple model fallbacks
async function generateLogo(prompt) {
  const models = [
    "stabilityai/stable-diffusion-xl-base-1.0", // SDXL - best quality
    "black-forest-labs/FLUX.1-schnell", // FLUX Schnell - good for logos
    "playgroundai/playground-v2.5-1024px-aesthetic", // High quality model
    "runwayml/stable-diffusion-v1-5", // SD 1.5 fallback
    "CompVis/stable-diffusion-v1-4", // Final fallback
  ];

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              num_inference_steps: 50, // More steps = better quality
              guidance_scale: 12, // Higher guidance = more adherence to prompt
              width: 1024, // Higher resolution
              height: 1024,
              negative_prompt:
                "blurry, low quality, pixelated, jpeg artifacts, watermark, text, signature, frame, border", // What to avoid
            },
          }),
        }
      );

      if (response.ok) {
        console.log(`✅ Success with model: ${model}`);
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer).toString("base64");
      } else {
        const errText = await response.text();
        console.log(
          `❌ Model ${model} failed: ${response.status} - ${errText}`
        );
        continue; // Try next model
      }
    } catch (error) {
      console.log(`❌ Model ${model} error:`, error.message);
      continue; // Try next model
    }
  }

  throw new Error("All image generation models failed");
}

function enhancePrompt(userPrompt) {
  return `Create a professional minimalist logo design: "${userPrompt}". 
Style: clean vector art, simple geometric shapes, limited color palette (2-3 colors max), 
high contrast, scalable design, modern typography if text included, 
suitable for business branding, white or transparent background.`;
}

// Test endpoint to check API key
router.get("/test", async (req, res) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: "test image" }),
      }
    );

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log("📝 Received prompt:", req.body.prompt);

    // Validate API key
    if (!HF_API_KEY) {
      throw new Error("HF_API_KEY not configured in environment variables");
    }

    const rawPrompt = req.body.prompt || "simple logo design";
    const enhancedPrompt = enhancePrompt(rawPrompt);

    console.log("🚀 Enhanced prompt:", enhancedPrompt);

    const base64Image = await generateLogo(enhancedPrompt);

    console.log("✅ Image generated successfully");
    res.json({ photo: base64Image });
  } catch (error) {
    console.error("❌ Error generating logo:", error);
    res.status(500).json({
      error: error.message,
      details: "Check server logs for more information",
    });
  }
});

export default router;
