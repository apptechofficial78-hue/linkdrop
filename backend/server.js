
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).split(",").map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Origin not allowed"));
  }
}));

app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "LinkDrop API",
    message: "Backend is working!"
  });
});

app.post("/api/info", (req, res) => {
  const { url } = req.body;

  if (typeof url !== "string" || url.length > 2048) {
    return res.status(400).json({
      error: "Please provide a valid URL."
    });
  }

  let parsed;

  try {
    parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return res.status(400).json({
      error: "Invalid URL. Please enter a full HTTP or HTTPS link."
    });
  }

  const host = parsed.hostname.toLowerCase();
  let platform = "Direct media link";

  if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtu.be") {
    platform = "YouTube";
  } else if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
    platform = "TikTok";
  } else if (host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.watch") {
    platform = "Facebook";
  } else if (host === "instagram.com" || host.endsWith(".instagram.com")) {
    platform = "Instagram";
  } else if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
    platform = "Vimeo";
  } else if (host === "x.com" || host.endsWith(".x.com") || host === "twitter.com" || host.endsWith(".twitter.com")) {
    platform = "X / Twitter";
  }
} else if (
  host === "dailymotion.com" ||
  host.endsWith(".dailymotion.com") ||
  host === "dai.ly"
) {
  platform = "Dailymotion";
}else if (
  host === "dramafren.org" ||
  host.endsWith(".dramafren.org")
) {
  platform = "DramaFren";
}

  res.json({
    success: true,
    platform,
    url: parsed.toString(),
           message: "Link received. Media analysis is the next development stage."
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`LinkDrop API running on port ${PORT}`);
});
