const http = require('http');
const fs = require('fs');
const url  = require('url');

const PORT = 3000;

const server = http.createServer(function(req, res) {
    const parsedUrl = url.parse(req.url,true);
    const pathname = parsedUrl.pathname;
})

server.listen(PORT, function(error) {
    if (error) {
        console.log('Something went wrong', error);
    } else {
        console.log(`Server is listening on port ${PORT}`);
    }
})