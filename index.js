const http = require('node:http');

const PORT = process.env.PORT || 6767;

const server = http.createServer((req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const parsedUrl = new URL(req.url, `http://${host}`);
  const pathname = parsedUrl.pathname;

  // Set default JSON headers
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // Health check endpoint
  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200);
    return res.end(
      JSON.stringify({
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      })
    );
  }

  // Single API endpoint
  if (pathname === '/api' && req.method === 'GET') {
    res.writeHead(200);
    return res.end(
      JSON.stringify({
        message: 'Hello from the API endpoint!',
        status: 'success',
        data: {
          app: 'k8s-cicd-app',
          port: PORT,
          environment: process.env.NODE_ENV || 'development',
        },
      })
    );
  }

  // Root endpoint
  if (pathname === '/' && req.method === 'GET') {
    res.writeHead(200);
    return res.end(
      JSON.stringify({
        name: 'k8s-cicd-app',
        message: 'Application is running.',
        endpoints: {
          health: '/health',
          api: '/api',
        },
      })
    );
  }

  // 404 handler
  res.writeHead(404);
  return res.end(
    JSON.stringify({
      error: 'Not Found',
      message: `Cannot ${req.method} ${pathname}`,
    })
  );
});

// Start listening if run directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    console.log(`Health endpoint: http://localhost:${PORT}/health`);
    console.log(`API endpoint:    http://localhost:${PORT}/api`);
  });

  // Graceful shutdown handling
  const shutdown = (signal) => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    server.close(() => {
      console.log('Server closed successfully.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = server;
