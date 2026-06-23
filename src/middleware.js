import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  
  // Get content type
  const contentType = response.headers.get("content-type") || "";
  
  // We compress HTML, JSON, CSS, and JS
  const shouldCompress = 
    response.body && 
    (contentType.includes("text/html") || 
     contentType.includes("application/json") || 
     contentType.includes("text/css") || 
     contentType.includes("application/javascript"));
     
  // Check if browser/client accepts gzip
  const acceptEncoding = context.request.headers.get("accept-encoding") || "";
  const supportsGzip = acceptEncoding.includes("gzip");

  if (shouldCompress && supportsGzip) {
    const headers = new Headers(response.headers);
    headers.set("content-encoding", "gzip");
    headers.delete("content-length"); // Length changes during compression
    
    // Pipe the response body stream through the native CompressionStream
    const compressedBody = response.body.pipeThrough(new CompressionStream("gzip"));
    
    return new Response(compressedBody, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
  
  return response;
});
