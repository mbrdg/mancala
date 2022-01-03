export default class AI {
    constructor(game, maxDepth) {
        this.game = game;
        this.maxDepth = maxDepth;
    }

    /**
     *
     * @param maxPlayer Object containing the information about the maximizing player seeds
     * @param minPlayer Object containing the information about the minimizing 2 seeds
     * @returns {number|*}
     */
    findMove(maxPlayer, minPlayer) {

        let findMoveHelper = (maxPlayer, minPlayer, alpha, beta, depth, isMax) => {

            if (this.game.isOver(minPlayer, maxPlayer))
                return { score: this.score(maxPlayer, minPlayer), move : -1 }
            else if (!depth)
                return { score: this.heuristic(maxPlayer, minPlayer), move: -1 }

            let finalScore = isMax ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
            let shouldReplace = isMax ? (x, y) => x > y : (x, y) => x < y;
            let finalMove = -1;

            for (let child in this.children(maxPlayer, minPlayer, isMax)) {
                let tmpValue = findMoveHelper(child.maxPlayer, child.minPlayer,
                    alpha, beta, depth - 1, !child.repeat);

                if (shouldReplace(tmpValue.score, finalScore)) {
                    finalScore = tmpValue.score;
                    finalMove = child.move;
                }

                if (isMax)
                    alpha = Math.max(alpha, tmpValue.score);
                else
                    beta = Math.min(beta, tmpValue.score);

                if (alpha > beta)
                    break;
            }

            return { score: finalScore, move: finalMove };
        }

        let scoreMove = findMoveHelper(maxPlayer, minPlayer, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, this.maxDepth, true);

        return scoreMove.move;
    }

    /**
     * Function that retrieves all the subsequent possible moves
     * @param maxPlayer Object containing the information about the maximizing player seeds
     * @param minPlayer Object containing the information about the minimizing player seeds
     * @param isMax True if we compute the moves for the maximizing player, false otherwise
     * @returns {*[]} Array with an object containing all the moves
     */
    children(maxPlayer, minPlayer, isMax) {
        const numberOfHoles = maxPlayer.seeds.length;
        let children = [];
        let start = isMax ? numberOfHoles + 1 : 0;

        let possibleMove = (isMax, i) => isMax ? maxPlayer.seeds[i] !== 0 : minPlayer.seeds[i] !== 0;

        for (let i = start; i < start + numberOfHoles; i++) {
            if (!possibleMove(isMax, i - start))
                continue;

            let maxPlayerClone = maxPlayer.clone();
            let minPlayerClone = minPlayer.clone();
            let repeatTurn = this.game.executeMove(minPlayerClone, maxPlayerClone, i);
            children.push({
                move: i,
                child: {
                    maxPlayer: maxPlayerClone,
                    minPlayer: minPlayerClone,
                },
                repeat: repeatTurn
            });
        }

        return children;
    }

    /**
     * This is a function that evaluates a given turn.
     * It should return positive values for the maximizing player and negative for
     * the minimizing player - this is an important part of the algorithm.
     * @param maxPlayer Object containing the information about the maximizing player seeds
     * @param minPlayer Object containing the information about the minimizing 2 seeds
     */
    heuristic(maxPlayer, minPlayer) {
        let niceSeeds = maxPlayer.seeds.reduce((h, a) => h + a, 0);
        niceSeeds += 1.5 * maxPlayer.deposit;

        let notNiceSeeds = minPlayer.seeds.reduce((h, a) => h + a, 0);
        notNiceSeeds += 1.5 * minPlayer.deposit;

        return niceSeeds - notNiceSeeds;
    }

    score(maxPlayer, minPlayer) {
        return maxPlayer.deposit - minPlayer.deposit;
    }
}