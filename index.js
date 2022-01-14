const http = require('http');
const Registration = require('./server/register.js');
const Ranking = require('./server/ranking.js');

const hostname = '127.0.0.1';
const port = 8976;

const users = new Registration('./server/database/users.json');
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
    let answer = {};

    if (method === 'POST') {
        let body = '';
        req
        .on('data', (chunk)=>{
            body += chunk;
        })
        .on('end', ()=>{
            body = JSON.parse(body);
            answer.style='plain';
            answer.status = 200;

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
                default:
                    answer.status = 404;
                    answer.body={error: 'Unknown request'};
            }

            res.writeHead(answer.status, headers[answer.style]);
            res.end(JSON.stringify(answer.body));
        })
        .on('error', (err) => {
            console.log(err.message);
            res.writeHead(answer.status, headers[answer.style]);
            res.end();
        })
    }
    else if (method === 'GET'){
        switch(url) {
            case '/update':
                answer.style = 'sse';
                break;
            default:
                answer.status = 400;
                break;
        }
    }
    else {
        answer.status = 500;
        answer.style = 'plain';
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