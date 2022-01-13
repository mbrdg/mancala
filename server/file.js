const fs = require('fs');

module.exports.readFromFile = function (path, callback) {
    fs.readFile(path, 'utf8', function(err, data){
        if (!err && data.length != 0){
            
            data = JSON.parse(data.toString());
            console.log(data);
            callback(data);
        }
    });
}

module.exports.writeToFile = function (path, data, callback) {
    fs.writeFile(path, JSON.stringify(data), function(err){
        if(err){
            callback();
        }
    });
}