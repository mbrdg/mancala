const fs = require('fs');
const path = require('path');

module.exports = class staticServer {
    /**
     * Constructor
     * @param documentRoot - documents root path 
     */
    constructor(documentRoot) {
        this.documentRoot = documentRoot;
        this.defaultIndex = 'index.html';
        this.mediaTypes = {
            'txt':      'text/plain',
            'html':     'text/html',
            'css':      'text/css',
            'js':       'application/javascript',
            'png':      'image/png',
            'jpeg':     'image/jpeg',
            'jpg':      'image/jpeg',
            'gif':      'image/gif',
        };
    }

    getMediaType(pathname) {
        const lastDot = pathname.lastIndexOf('.');
        let mediaType;

        if (lastDot !== -1)
            mediaType = this.mediaTypes[pathname.substring(lastDot + 1)];

        if (mediaType === undefined)
            mediaType = 'text/plain';
        return mediaType;
    }

    isText(mediaType) {
        return !mediaType.startsWith('image');
    }

    getPathname(req) {
        let pathname = path.normalize(this.documentRoot + req.url)

        if (!pathname.startsWith(this.documentRoot))
            pathname = null;
        return pathname;
    }

    doGetPathname(pathname, res) {
        const mediaType = this.getMediaType(pathname);
        const encoding = this.isText(mediaType) ? 'utf-8' : null;

        fs.readFile(pathname, encoding, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end();
            } else {
                res.writeHead(200, { 'Content-Type': mediaType });
                res.end(data);
            }
        });
    }

    /**
     * Processes the given request
     * @param req - request 
     * @param res - response 
     */
    processRequest(req, res) {
        const pathname = this.getPathname(req);

        if (pathname === null) {
            res.writeHead(403);
            res.end();
        } else {
            fs.stat(pathname, (err, stats) => {
                if (err) {
                    res.writeHead(500);
                    res.end();
                } else if (stats.isDirectory()) {
                    if (pathname.endsWith('/')) {
                        this.doGetPathname(pathname + this.defaultIndex, res);
                    } else {
                        res.writeHead(301, { 'Location': pathname + '/'});
                        res.end();
                    }
                } else {
                    this.doGetPathname(pathname, res);
                }
            });
        }
    }
}
