const fs = require('fs');

module.exports.readFromFile = function (path, callback) {
    fs.readFile(path, 'utf8', function(err, data){
        if (!err){
            console.log(data);
            
            data = JSON.parse(data.toString());
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