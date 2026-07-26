/**
 * Vercel serverless function — TTS Proxy
 *
 * Reemplaza el endpoint /api/tts del server.ts de Express.
 * En producción (Vercel) se usa esta function; en local se sigue usando server.ts.
 */

import type { IncomingMessage, ServerResponse } from "node:http";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Solo aceptamos GET
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const url = new URL(req.url!, `http://${req.headers.host}`);
  const text = url.searchParams.get("text");

  if (!text) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Text parameter is required" }));
    return;
  }

  try {
    // Intentar con Google Translate TTS
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(text)}`;

    const response = await fetch(ttsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
    });

    if (!response.ok) {
      throw new Error(`Google TTS status: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
      "Content-Length": audioBuffer.byteLength.toString(),
    });
    res.end(Buffer.from(audioBuffer));
  } catch (err: unknown) {
    console.error("Error en TTS primario:", err);

    // Fallback: StreamElements TTS (Amazon Polly Salli)
    try {
      const fallbackUrl = `https://api.streamelements.com/c3/v2/tts?voice=Salli&text=${encodeURIComponent(text)}`;
      const fallbackResp = await fetch(fallbackUrl);

      if (fallbackResp.ok) {
        const audioBuffer = await fallbackResp.arrayBuffer();
        res.writeHead(200, {
          "Content-Type": "audio/mp3",
          "Cache-Control": "public, max-age=86400",
          "Content-Length": audioBuffer.byteLength.toString(),
        });
        res.end(Buffer.from(audioBuffer));
        return;
      }
    } catch (backupErr) {
      console.error("Fallback TTS también falló:", backupErr);
    }

    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to generate pronunciation audio" }));
  }
}
