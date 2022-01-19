const http = require('http');
const url = require('url');

const StaticServer = require('./server/staticServer.js');
const Registration = require('./server/register.js');
const GameController = require('./server/gameController.js');
const Ranking = require('./server/ranking.js');

const hostname = 'twserver.alunos.dcc.fc.up.pt';
const port = 8976;

const staticServer = new StaticServer('/net/areas/homes/up201905952/public_html');
const users = new Registration('./server/database/users.json');
const rankings = new Ranking('./server/database/rankings.json');
const controller = new GameController(rankings);

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
    cors: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'false',
        'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept',
        'Access-Control-Max-Age': '86400'
    }
};

let server = http.createServer((req, res) => {
    const { method } = req;
    const { pathname, query, path } = url.parse(req.url, true);

    let answer = { style: 'plain', status: 200 };
    
    if (method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        }).on('end', () => {
            if (body!=='') {
                body = JSON.parse(body);
            }

            switch (path) {
                case '/register':
                    try {
                        users.register(body);
                        answer.body = {};
                    } catch (err) {
                        answer.status = err.status;
                        answer.body = err.message;
                    }
                    break;
                case '/ranking':
                    answer.body = rankings.getRankings();
                    break;
                case '/join':
                    try {
                        users.exists(body);
                        answer.body = controller.join(body);
                    } catch (err) {
                        answer.status = err.status;
                        answer.body = err.message;
                    }
                    break;
                case '/notify':
                    try {
                        users.exists(body);
                        controller.notify(body, (responses, body) =>{
                            responses.forEach(res => {
                                res.write(`data: ${JSON.stringify(body)}\n\n`);
                            });
                        });
                        answer.body = {};
                    } catch (err) {
                        answer.status = err.status;
                        answer.body = err.message;
                    }
                    break;
                case '/leave':
                    try {
                        users.exists(body);
                        controller.leave(body, (responses, body) =>{
                            responses.forEach(res => {
                                if (body.first){
                                    res.writeHead(answer.status, headers['sse']);
                                }
                                res.write(`data: ${JSON.stringify(body.message)}\n\n`);
                            });
                        });
                        answer.body = {};
                    } catch (err) {
                        answer.status = err.status;
                        answer.body = err.message;
                    }
                    break;
                default:
                    answer.status = 404;
                    answer.body = { error: 'Unknown request.' };
            }

            res.writeHead(answer.status, headers[answer.style]);
            res.end(JSON.stringify(answer.body));
        })
        .on('error', (err) => {
            console.log(err.message);
            res.writeHead(500, headers[answer.style]);
            res.end();
        })
    } else if (method === 'GET') {

        answer.style = 'sse';

        if (pathname === '/update') {
            try {
                controller.update(query, res, (responses, body) => {
                    responses.forEach(res => {
                        if (body.first){
                            res.writeHead(answer.status, headers[answer.style]);
                        }
                        res.write(`data: ${JSON.stringify(body.message)}\n\n`);
                    });
                });
                return;
            } catch (err) {
                res.writeHead(err.status, headers['plain']);
                res.end(JSON.stringify(err.message));
                return;
            }
        }

        staticServer.processRequest(req, res);

    } else if (method === 'OPTIONS') {
        answer.style = 'cors';
        res.writeHead(answer.status, headers[answer.style]);
        res.end();
    } else {
        answer.status = 500;
        res.writeHead(answer.status, headers[answer.style]);
        res.end();
    }
});

server.listen(port, hostname, (err) => {
    if (err) {
        console.log('Something went wrong', err);
    } else {
        console.log(`Server running at http://${hostname}:${port}`);
    }
});
