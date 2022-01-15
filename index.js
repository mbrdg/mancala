const http = require('http');
const Registration = require('./server/register.js');
const GameController = require('./server/gameController.js');
const Ranking = require('./server/ranking.js');
const fs = require("fs");

const hostname = '127.0.0.1';
const port = 8976;

const users = new Registration('./server/database/users.json');
const controller = new GameController();
const rankings = new Ranking('./server/database/rankings.json');

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
    let answer = { style: 'plain', status: 200 };
    
    if (method === 'POST') {
        let body = '';
        req
        .on('data', (chunk)=>{
            body += chunk;
        })
        .on('end', ()=>{
            if (body!=='') {
                body = JSON.parse(body);
            }

            switch (url) {
                case '/register':
                    try {
                        users.register(body);
                        answer.body={};
                    } catch (err) {
                        answer.status = err.status;
                        answer.body=err.message;
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
                        answer.body=err.message;
                    }
                    break;
                case '/notify':
                    try {
                        users.exists(body);
                        answer.body = controller.notify(body);
                    } catch (err) {
                        answer.status = err.status;
                        answer.body=err.message;
                    }
                    break;
                default:
                    answer.status = 404;
                    answer.body={error: 'Unknown request.'};
            }

            res.writeHead(answer.status, headers[answer.style]);
            res.end(JSON.stringify(answer.body));
        })
        .on('error', (err) => {
            console.log(err.message);
            res.writeHead(500, headers[answer.style]);
            res.end();
        })
    }
    else if (method === 'GET'){
        if (url === '/') {
            fs.readFile("./index.html", "UTF-8", (err, html)=>{

                res.writeHead(200, {'Content-Type': "text/html"});
                res.end(html);
            })
            return;
        }
        if (url !== '/update') {
            res.writeHead(404, headers[answer.style]);
            res.end(JSON.stringify({error: 'Unknown request.'}));
            return;
        }

        let body = '';
        answer.style = 'sse';

        req
        .on('data', (chunk)=>{
            body += chunk;
        })
        .on('end', ()=>{
            if (body!=='') {
                body = JSON.parse(body);
            }

            try {
                controller.update(body, res, (responses, body) => {
                    responses.forEach(response => {
                        response.writeHead(answer.status, headers[answer.style]);
                        response.write(JSON.stringify(body));
                    });
                });
            } catch (err) {
                res.writeHead(err.status, headers['plain']);
                res.end(JSON.stringify(err.message));
            }
        })
        .on('error', (err) => {
            console.log(err.message);
            res.writeHead(500, headers[answer.style]);
            res.end();
        })
    }
    else {
        answer.status = 500;
        res.writeHead(answer.status, headers[answer.style]);
        res.end();
    }
});

server.listen(port, hostname, (err) => {
    if (err) {
        console.log('Something went wrong', error);
    } else {
        console.log(`Server running at http://${hostname}:${port}`);
    }
});