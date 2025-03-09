exports.handler = async (event) => {
    // Determine request path and method
    const path = event.rawPath || event.path || "/";
    const method = event.requestContext?.http?.method || event.httpMethod || "UNKNOWN";
    // Handle only /hello GET request
    if (path === "/hello" && method === "GET") {
    return {
    statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statusCode: 200, message: "Hello from Lambda" }),
    // Fixed message format
    };
    }
    // Handle all other requests with 400 error
    return {
    statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({
    statusCode: 400,
    // Ensure statusCode is included in the response body
    message: `Bad request syntax or unsupported method. Request path: ${path}. HTTP method: ${method}`,
    }),
    };
    };