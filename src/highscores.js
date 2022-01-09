export default class HighScores {
    constructor(api) {
        api.ranking().then((ranking) => {
            const table = document.getElementById('online-ranking').getElementsByTagName('tbody')[0];

            console.log(ranking);
            ranking.forEach((rank, i) => {
                const row = table.insertRow();

                row.insertCell(0).textContent = `#${i + 1}`;
                row.insertCell(1).textContent = rank.nick;
                row.insertCell(2).textContent = rank.victories;
                row.insertCell(3).textContent = rank.games;
            });
        });
    }
}