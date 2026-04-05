const readRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return undefined;
  }

  return Buffer.concat(chunks);
};

export default async function handler(req, res) {
  const path = Array.isArray(req.query.path) ? req.query.path.join("/") : "";
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  const backendFallback = "http://127.0.0.1:3001";

  const urlPrimary = `${backendBase}/api/auth/${path}`;
  const urlFallback = `${backendFallback}/api/auth/${path}`;

  const rawBody = req.method === "GET" || req.method === "HEAD" ? undefined : await readRawBody(req);

  const forward = async (url) => {
    const headers = {
      "content-type": req.headers["content-type"] || "application/json",
    };

    if (req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }

    if (req.headers["x-request-id"]) {
      headers["x-request-id"] = req.headers["x-request-id"];
    }

    return fetch(url, {
      method: req.method,
      headers,
      body: rawBody,
    });
  };

  let backendResponse;

  try {
    backendResponse = await forward(urlPrimary);
  } catch (primaryError) {
    try {
      backendResponse = await forward(urlFallback);
    } catch (fallbackError) {
      console.error("[WEB API PROXY ERROR]", {
        primaryUrl: urlPrimary,
        fallbackUrl: urlFallback,
        primaryError: primaryError instanceof Error ? primaryError.message : String(primaryError),
        fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
      });

      res.status(503).json({ message: "Server not reachable" });
      return;
    }
  }

  const text = await backendResponse.text();
  const contentType = backendResponse.headers.get("content-type") || "application/json";

  res.status(backendResponse.status);
  res.setHeader("content-type", contentType);
  res.send(text);
}
