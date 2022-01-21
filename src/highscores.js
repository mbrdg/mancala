export default class HighScores {
    /**
     * Contructor
     * @param api - server api reference 
     */
    constructor(api) {
        this.api = api;
        this.updateOnline();
        this.updateOffline();
    }

    /**
     * Updates offline scores according to local storage information
     */
    updateOffline(){
        let offlineRankings = localStorage.getItem('offline-rankings');
        if (!offlineRankings) 
            return;

        offlineRankings = JSON.parse(offlineRankings);
        const tbody = document.getElementById('offline-ranking').getElementsByTagName('tbody')[0];
        tbody.textContent = "";

        offlineRankings.forEach((rank, i) => {
            const row = tbody.insertRow();

            row.insertCell(0).textContent = `#${i + 1}`;
            row.insertCell(1).textContent = rank.nick;
            row.insertCell(2).textContent = rank.points;
            row.insertCell(3).textContent = rank.opponent;
        });        
    }

    /**
     * Inserts offline score according to score value
     * @param score - score to be inserted
     */
    insertScore(score){
        let offlineRankings = localStorage.getItem('offline-rankings');
        if (!offlineRankings) {
            localStorage.setItem('offline-rankings', JSON.stringify([score]));
            this.updateOffline();
            return;
        }

        offlineRankings = JSON.parse(offlineRankings);

        const binarySearch = (array, value) => {
            let low = 0, high = array.length;
        
            while (low < high) {
                let mid = (low + high) >>> 1;
                if (array[mid].points >= value) low = mid + 1;
                else high = mid;
            }
            return low;
        }

        const index = binarySearch(offlineRankings, score.points);
        offlineRankings.splice(index, 0, score);
        offlineRankings = offlineRankings.slice(0, 5);
        localStorage.setItem('offline-rankings', JSON.stringify(offlineRankings));
        this.updateOffline();
    }

    /**
     * Updates online scores according to server response
     */
    updateOnline(){
        this.api.ranking().then((onlineRankings) => {
            const tbody = document.getElementById('online-ranking').getElementsByTagName('tbody')[0];
            tbody.textContent = "";

            onlineRankings.forEach((rank, i) => {
                const row = tbody.insertRow();

                row.insertCell(0).textContent = `#${i + 1}`;
                row.insertCell(1).textContent = rank.nick;
                row.insertCell(2).textContent = rank.victories;
                row.insertCell(3).textContent = rank.games;
            });
        });
    }
}