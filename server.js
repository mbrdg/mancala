const http = require('http');
const Registration = require('server/register');

const hostname = '127.0.0.1';
const port = 3000;

const users = new Registration();

const headers = {
    plain: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'        
    },
    sse: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive'
    },
};

let server = http.createServer((req, res) => {
    const { method, url } = req;

    if (method === 'POST') {
        switch (url) {
            case '/register':
                try {
                    users.register();
                } catch (e) {
                    res.writeHead(400, headers.plain);
                }
                break;
            case '/ranking':
                try {
                } catch (e) {
                    res.writeHead(400, headers.plain);
                }
        }
    }

    res.end();
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});