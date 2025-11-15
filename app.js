const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    let filePath = '';
    
    // Route handling
    if (req.url === '/') {
        filePath = path.join(__dirname, 'views', 'index.html');
    } else if (req.url === '/about') {
        filePath = path.join(__dirname, 'views', 'about.html');
    } else if (req.url === '/services') {
        filePath = path.join(__dirname, 'views', 'services.html');
    } else if (req.url === '/portfolio') {
        filePath = path.join(__dirname, 'views', 'portfolio.html');
    } else if (req.url === '/investment') {
        filePath = path.join(__dirname, 'views', 'investment.html');
    } else if (req.url === '/contact') {
        filePath = path.join(__dirname, 'views', 'contact.html');
    } else if (req.url.startsWith('/css/') || req.url.startsWith('/js/')) {
        filePath = path.join(__dirname, 'public', req.url);
    } else {
        // Serve other static files
        filePath = path.join(__dirname, 'public', req.url);
    }

    // Security: Prevent directory traversal
    filePath = path.normalize(filePath);
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const extname = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Page not found - serve 404.html
                fs.readFile(path.join(__dirname, 'views', '404.html'), (err, notFoundContent) => {
                    if (err) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end('<h1>404 - Page Not Found</h1><p><a href="/">Go Home</a></p>');
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(notFoundContent, 'utf-8');
                    }
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            // Success - serve file with appropriate content type
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('🚀 CIL Website successfully deployed!');
    console.log(`📍 Running at: http://localhost:${PORT}`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`👥 Team: Collaborative Investment Ltd`);
    console.log(`📧 Email: collaborativeinvestmentltd@gmail.com`);
    console.log('💡 Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});