//Galo
let current = 'X';
let board = undefined;

function initBoard() {
    board = new Array(9);

    for(let b=0; b<9; b++) {
        board[b] = ' ';
    }
}

function play() {
   let piece = current;

   current = (current == 'X' ? 'O' : 'X'); 
   board[message.pos] = piece;
}

initBoard();