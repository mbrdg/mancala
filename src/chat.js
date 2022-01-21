/**
 * Abstraction for the chat element on the right of the game board
 */
export default class Chat {
    /**
     * Constructor
     */
    constructor() {
        this.chat = document.getElementById('chat');
    }

    /**
     * Clear the whole chat content
     */
    clear() {
        this.chat.textContent = '';
    }

    /**
     * Inserts a new message in chat
     * @param text - text to be displayed
     * @param sender - player who is sending the message
     */
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
