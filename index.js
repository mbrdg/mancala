const http = require('http');
const url  = require('url');

const fs = require('fs');

const updater = require('.updater.js');
//Modulo de game
//Modulo de autenticação
//...
const PORT = 3000;
/*
module.exports.algo = function(){} || value
const mod = require('./module.js');
mod.algo();
*/
/* Preferencia assíncrona (bellow)

fs.readFile('file', function(error, data) {
    if (error) return;

})
fs.writeFile('file', (error) => {
    if (error) return;
    
})
*/


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
    }
};

const server = http.createServer(function(request, response) {
    const parsedUrl = url.parse(request.url,true);
    const pathName = parsedUrl.pathname;
    let answer = {};

    if (request.method === 'POST') {
        switch(pathName) {
            case '/register':
                break;
            case '/join':
                break;
            case '/leave':
                break;
            case '/notify':
                break;
            case '/ranking':
                break;
            default:
                answer.status = 400;
                break;
        }
    } 
    else if (request.method === 'GET'){
        switch(pathName) {
            case '/update':
                updater.remember(response);
                answer.style = 'sse';
                break;
            default:
                answer.status = 400;
                break;
        }
    }
    else {
        answer.status = 400;
    }

    if(answer.status === undefined)
        answer.status = 200;
    if(answer.style === undefined)
        answer.style = 'plain';

    response.writeHead(answer.status, headers[answer.style]);
    if(answer.style === 'plain')
        response.end();
})

server.listen(PORT, function(error) {
    if (error) {
        console.log('Something went wrong', error);
    } else {
        console.log(`Server is listening on port ${PORT}`);
    }
})