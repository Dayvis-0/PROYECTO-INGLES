import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Real-time proxy for High-Quality Text-To-Speech (Google Translate premium voice)
  app.get("/api/tts", async (req, res) => {
    try {
      const text = req.query.text as string;
      if (!text) {
        return res.status(400).json({ error: "Text parameter is required" });
      }

      // We call Google Translate TTS directly from the backend server to avoid CORS/Referer blockages in the browser iframe.
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(text)}`;
      
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          "Referer": "https://translate.google.com/"
        }
      });

      if (!response.ok) {
        throw new Error(`Google TTS status: ${response.status}`);
      }

      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "public, max-age=86400"); // cache the voice files for performance

      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error("Error in server-side TTS proxy:", err);
      
      // Fallback: try StreamElements TTS (Amazon Polly Salli) as cache-friendly natural high-quality backup proxy!
      try {
        const text = req.query.text as string;
        const backupUrl = `https://api.streamelements.com/c3/v2/tts?voice=Salli&text=${encodeURIComponent(text)}`;
        const backupResp = await fetch(backupUrl);
        if (backupResp.ok) {
          res.setHeader("Content-Type", "audio/mp3");
          const arrBuf = await backupResp.arrayBuffer();
          return res.send(Buffer.from(arrBuf));
        }
      } catch (backupErr) {
        console.error("Backup TTS proxy also failed:", backupErr);
      }

      res.status(500).json({ error: "Failed to generate human-like pronunciation" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
