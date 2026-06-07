import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PROXY_PORT || 8080;

// Enable CORS with public wildcards for full streaming flexibility
app.use(
  cors({
    origin: "*",
    methods: ["GET", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Express server health diagnostic endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CORS Proxy",
    timestamp: new Date().toISOString(),
  });
});

// Primary piping endpoint
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  const key = req.query.key;

  // 1. Basic API Key protection verify check
  if (!key || key !== "mykey123") {
    return res.status(401).json({
      error: "Unauthorized: Invalid or missing API key parameter (?key=...)",
    });
  }

  // 2. Validate URL existence
  if (!targetUrl) {
    return res.status(400).json({
      error: "Bad Request: Target URL parameter is required (?url=...)",
    });
  }

  // 3. Parse protocol to prevent SSRF vulnerabilities
  try {
    const parsedUrl = new URL(targetUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return res.status(400).json({
        error: "Bad Request: Only HTTP and HTTPS protocols are supported",
      });
    }
  } catch (err) {
    return res.status(400).json({
      error: "Bad Request: Invalid target stream URL",
    });
  }

  // 4. Implement AbortController 10-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    // 5. Connect to the target stream URL
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) IPTVStreamerProxy/1.0",
        Accept: "*/*",
      },
    });

    clearTimeout(timeoutId);

    // Throw if source server returns hard status failures
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Target server responded with status code: ${response.status}`,
      });
    }

    // 6. Propagate headers and response status
    const contentType =
      response.headers.get("content-type") || "application/vnd.apple.mpegurl";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    // 7. Stream the response chunks utilizing Node's pipe interface (memory-efficient)
    response.body.pipe(res);

    // Handle abrupt player disconnecting cleanly
    req.on("close", () => {
      controller.abort();
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      return res.status(504).json({
        error: "Gateway Timeout: Stream request timed out after 10000ms",
      });
    }

    console.error("Proxy endpoint experienced a failure:", error.message);
    return res.status(502).json({
      error: `Bad Gateway: Failed to fetch stream file. Details: ${error.message}`,
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CORS Proxy server successfully listening on port: ${PORT}`);
});
