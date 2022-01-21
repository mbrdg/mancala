const file = require('./file.js');

module.exports = class Ranking {
    /**
     * Constructor
     * @param filePath - rankngs path 
     */
    constructor(filePath) {
        this.path = filePath;
        this.scores = [];
        file.readFromFile(this.path, (data)=>{this.scores=data;});
    }

    /**
     * Returns the best rankings
     * @returns rankings with a max size of 10 entries
     */
    getRankings() {
        return {ranking: this.scores.slice(0, 10)};
    }

    /**
     * Updates the existing rankings with the game result
     * @param p1 - player 1 name
     * @param p2 - player 2 name
     * @param result - game result
     */
    updateRankings(p1, p2, result){
        let score1 = {};
        let score2 = {};

        for (let i = this.scores.length - 1; i >= 0; i--) {
            if (this.scores[i].nick === p1){
                score1 = this.scores.splice(i, 1)[0];
                score1.games++;
                if (result === p1) score1.victories++;
                continue;
            }
            if (this.scores[i].nick === p2){
                score2 = this.scores.splice(i, 1)[0];
                score2.games++;
                if (result === p2) score2.victories++;
                continue;
            }
        }

        if (score1.nick !== undefined){
            this.insertScore(score1);
        }else {
            this.insertScore({nick: p1, victories: (result === p1 ? 1 : 0),games: 1});
        }

        if (score2.nick !== undefined){
            this.insertScore(score2);
        }else {
            this.insertScore({nick: p2, victories: (result === p2 ? 1 : 0),games: 1});
        }

        file.writeToFile(this.path, this.scores, ()=>{});
        console.log("Ranks updated");
    }

    /**
     * Inserts new score to ranking array in descending victory order
     * @param score - score to be inserted
     */
    insertScore(score) {
        for (const [i, value] of this.scores.entries()) {
            if (value.victories < score.victories) {
                this.scores.splice(i, 0, score);
                return;
            }
        }
        this.scores.push(score);

    }
}