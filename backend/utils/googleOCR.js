const fetch = require("node-fetch");
const fs = require("fs");

async function extraerTextoImagenVision(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");

  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GCP_VISION_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: "TEXT_DETECTION" }]
        }
      ]
    }),
  });

  const data = await response.json();
  return data.responses?.[0]?.fullTextAnnotation?.text || "";
}

module.exports = { extraerTextoImagenVision };
