const file = require('./file.js');

module.exports = class Ranking {
    constructor(filePath) {
        this.path = filePath;
        this.scores = [];
        file.readFromFile(this.path, (data)=>{this.scores=data;});
    }

    getRankings() {
        return {ranking: this.scores.slice(0, 10)};
    }
}