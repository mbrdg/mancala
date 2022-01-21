const fs = require('fs');

/**
 * Reads information from file
 * @param path - file path
 * @param callback - sucess calback
 */
module.exports.readFromFile = function (path, callback) {
    fs.readFile(path, 'utf8', function(err, data){
        if (!err && data.length != 0){
            
            data = JSON.parse(data.toString());
            callback(data);
        }
    });
}

/**
 * Writes data to file
 * @param path - file path
 * @param data - information to write
 * @param callback - error callback
 */
module.exports.writeToFile = function (path, data, callback) {
    fs.writeFile(path, JSON.stringify(data),'utf8', function(err){
        if(err){
            callback();
        }
    });
}