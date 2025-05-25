// test-openai.js
// Run this with: node test-openai.js
import * as dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

async function testOpenAI() {
  console.log("Starting OpenAI API test...");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("ERROR: No API key found in environment variables");
    console.log("Make sure you have a .env file with OPENAI_API_KEY=your_key");
    return;
  }

  console.log("API key found:", apiKey.substring(0, 5) + "...");

  const openai = new OpenAI({
    apiKey: apiKey,
  });

  try {
    console.log("Testing OpenAI models list API...");
    const models = await openai.models.list();
    console.log("✅ Successfully connected to OpenAI API");
    console.log(`Found ${models.data.length} models`);

    // Try a simple text completion as a secondary test
    console.log("\nTesting OpenAI chat completion API...");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, how are you?" }],
    });
    console.log("✅ Successfully got chat completion");
    console.log("Response:", completion.choices[0]?.message?.content);

    // Finally, test image generation with a very simple prompt
    console.log("\nTesting OpenAI image generation API...");
    console.log("This may take a few seconds...");
    const imageResponse = await openai.images.generate({
      prompt: "Abstract colorful shapes",
      n: 1,
      size: "256x256", // Using smallest size for faster testing
      response_format: "b64_json",
    });

    if (
      imageResponse.data &&
      imageResponse.data[0] &&
      imageResponse.data[0].b64_json
    ) {
      const imageDataLength = imageResponse.data[0].b64_json.length;
      console.log(
        `✅ Successfully generated image (data length: ${imageDataLength})`
      );
    } else {
      console.error("❌ Image generation response was missing expected data");
      console.log("Response:", JSON.stringify(imageResponse));
    }
  } catch (error) {
    console.error("❌ Error during OpenAI API test:", error);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }

    console.log("\nTroubleshooting tips:");
    console.log("1. Check if your API key is correct");
    console.log(
      "2. Verify your account has access to the image generation API"
    );
    console.log("3. Check if you have billing set up on your OpenAI account");
    console.log("4. Ensure you're not experiencing rate limiting");
  }
}

testOpenAI().catch(console.error);
