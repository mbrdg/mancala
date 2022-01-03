/**
 * Abstraction for the chat element on the right of the game board
 */
export default class Chat {
    constructor() {
        this.chat = document.getElementById('chat');
        console.debug('Chat object created');
    }

    clear() {
        this.chat.textContent = '';
    }

    message(text, sender) {
        const className = sender ? 'player-msg' : 'opponent-msg';
        const newElem = document.createElement('p');
        newElem.classList.add(className);

        const node = document.createTextNode(text);
        newElem.append(node);

        this.chat.prepend(newElem);
        this.chat.scrollTop = this.chat.scrollHeight;
    }
}
