
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:5173"
)
  .split(",")
  .map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Origin not allowed"));
  }
}));

app.use(express.json({ limit: "10kb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "LinkDrop API",
    message: "Backend is working!"
  });
});

// Platform detection
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

  if (
    host === "youtube.com" ||
    host.endsWith(".youtube.com") ||
    host === "youtu.be"
  ) {
    platform = "YouTube";
  } else if (
    host === "tiktok.com" ||
    host.endsWith(".tiktok.com")
  ) {
    platform = "TikTok";
  } else if (
    host === "facebook.com" ||
    host.endsWith(".facebook.com") ||
    host === "fb.watch"
  ) {
    platform = "Facebook";
  } else if (
    host === "instagram.com" ||
    host.endsWith(".instagram.com")
  ) {
    platform = "Instagram";
  } else if (
    host === "vimeo.com" ||
    host.endsWith(".vimeo.com")
  ) {
    platform = "Vimeo";
  } else if (
    host === "x.com" ||
    host.endsWith(".x.com") ||
    host === "twitter.com" ||
    host.endsWith(".twitter.com")
  ) {
    platform = "X / Twitter";
  } else if (
    host === "dailymotion.com" ||
    host.endsWith(".dailymotion.com") ||
    host === "dai.ly"
  ) {
    platform = "Dailymotion";
  } else if (
    host === "dramafren.org" ||
    host.endsWith(".dramafren.org")
  ) {
    platform = "DramaFren";
  }

  return res.json({
    success: true,
    platform,
    url: parsed.toString(),
    message: "Link received. Media analysis is the next development stage."
  });
});

// Dailymotion metadata extraction
const { execFile } = require("child_process");
const path = require("path");

const YT_DLP_PATH = path.resolve(
  __dirname,
  "../venv/bin/yt-dlp"
);

app.post("/api/extract", async (req, res) => {
  const { url } = req.body;

  if (typeof url !== "string" || url.length > 2048) {
    return res.status(400).json({
      success: false,
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
      success: false,
      error: "Invalid URL."
    });
  }

  const host = parsed.hostname.toLowerCase();

  const allowedHosts = [
    "dailymotion.com",
    "www.dailymotion.com",
    "dai.ly",
    "geo.dailymotion.com"
  ];

  if (!allowedHosts.includes(host)) {
    return res.status(400).json({
      success: false,
      error: "Currently, metadata extraction supports Dailymotion only."
    });
  }

  execFile(
    YT_DLP_PATH,
    [
      "--dump-single-json",
      "--no-download",
      "--no-warnings",
      "--no-playlist",
      parsed.toString()
    ],
    {
      timeout: 60000,
      maxBuffer: 5 * 1024 * 1024
    },
    (error, stdout) => {
      if (error) {
        console.error("Extraction failed:", error.message);
        console.error("yt-dlp stderr:", error.stderr?.toString());
        console.error("yt-dlp stdout:", error.stdout?.toString());

        return res.status(422).json({
          success: false,
          error: "Unable to analyse this video. It may be unavailable or unsupported."
        });
      }

      try {
        const data = JSON.parse(stdout);

        return res.json({
          success: true,
          platform: "Dailymotion",
          video: {
            id: data.id,
            title: data.title,
            description: data.description,
            thumbnail: data.thumbnail,
            duration: data.duration,
            uploader: data.uploader,
            formats: (data.formats || [])
              .filter(format =>
                format.ext === "mp4" &&
                format.height
              )
              .map(format => ({
                quality: `${format.height}p`,
                format: format.ext
              }))
          }
        });
      } catch {
        return res.status(500).json({
          success: false,
          error: "Unable to process video information."
        });
      }
    }
  );
});
// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`LinkDrop API running on port ${PORT}`);
});

