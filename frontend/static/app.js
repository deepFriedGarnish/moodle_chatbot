const unknown_prompt_message = ['Atsiprašau, negaliu atsakyti į šį klausimą. Informuosiu dėstytoją, ' +
    'jis papildys mano žinių bagažą. Galbūt turi dar kokių nors klausimų iš kitos tematikos?'];

const duplicate_promp_message = ['Atsiprašau, nebeturiu daugiau žinių šiuo klausimu. Informuosiu ' + 
    'dėstytoją dėl šio tavo klausimo. Gal turi kokį nors klausimą iš kitos temos? Mielai stengsiuosi atsakyti.'];

const FLASK_API_HOST_NAME = 'http://127.0.0.1:5000';
const CONTENT_TYPE = 'application/json';
const UNANSWERED_TYPE = 'unanswered';
const DUPLICATE_TYPE = 'duplicate';

class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.getElementById('send__button')
        }
        this.state = false;
        this.messages = [];

        this.bot_replies = [];
        this.user_prompts = [];
    }

    display() {
        const {openButton, chatBox, sendButton} = this.args;
        const node = chatBox.querySelector('input');
        
        openButton.addEventListener('click', () => this.toggleState(chatBox))
        sendButton.addEventListener('click', () => this.onSendButton(chatBox))
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox);
            }
        });
    }

    toggleState(chatbox) {
        this.state = !this.state;
        if (this.state) {
            chatbox.classList.add('chatbox--active')
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    onSendButton(chatbox) {
        // Here we pickup the user prompt text
        const inputField = chatbox.querySelector('input');
        let inputText = inputField.value;
        
        // Here we check whether the prompt is empty
        if (inputText === '') {
            return;
        }

        // Disable send button
        this.args.sendButton.disabled = true;

        // Here we compose the message for the API call
        let message = {
            name: "User",
            message: inputText
        }

        // Push the current message to an array containing all messages
        this.user_prompts.push(message.message);
        this.messages.push(message);
        this.updateChatText(chatbox);
        inputField.value = '';

        // Making the API call to get back the prediction
        fetch(`${FLASK_API_HOST_NAME}/predict`, {
            method: 'POST',
            body: JSON.stringify({
                message: inputText
            }),
            mode: 'cors',
            headers: {
                'Content-Type': CONTENT_TYPE
            },
        })
        .then(r => r.json())
        .then(r => {
            let returnedMessage;

            // Check if returned message is empty
            if (r.answer.length === 0){
                returnedMessage = {
                    name: 'Sam',
                    message: unknown_prompt_message
                };

                // Call backend API to upload the question to DB
                fetch(`${FLASK_API_HOST_NAME}/unansweredPrompt`, {
                    method: 'POST',
                    body: JSON.stringify({
                        message: inputText,
                        conversation: removeLTCharacters(JSON.stringify(this.messages)),
                        type: UNANSWERED_TYPE
                    }),
                    mode: 'cors',
                    headers: {
                        'Content-Type': CONTENT_TYPE
                    },
                });
            }
            // If message is not empty, return the message 
            else 
            {
                returnedMessage = {
                    name: 'Sam',
                    message: r.answer
                };
            };

            // If the previous response is the same as the current response call 
            // flask API and provide a duplicate_promp_message to the user
            if (this.bot_replies.length !== 0 && 
                this.bot_replies[this.bot_replies.length - 1].toString() === returnedMessage.message.toString()){
                returnedMessage = {
                    name: 'Sam',
                    message: duplicate_promp_message
                };
                // Call backend API to upload the question to DB
                fetch(`${FLASK_API_HOST_NAME}/unansweredPrompt`, {
                    method: 'POST',
                    body: JSON.stringify({
                        message: inputText,
                        conversation: removeLTCharacters(JSON.stringify(this.messages)),
                        type: DUPLICATE_TYPE
                    }),
                    mode: 'cors',
                    headers: {
                        'Content-Type': CONTENT_TYPE
                    },
                });
            }
            this.bot_replies.push(returnedMessage.message);
            this.messages.push(returnedMessage);
            this.updateChatText(chatbox);

            // Enable send button after receiving response
            this.args.sendButton.disabled = false;
        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox);
        });
    }

    updateChatText(chatbox) {
        let html = '';
        this.messages.slice().reverse().forEach(function(item) {
            if (item.name === "Sam"){
                item.message.reverse().forEach(msg => {
                    html += '<div class="messages__item messages__item--visitor">' + msg + '</div>';
                });
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>';
            }
        });
        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }
}

const chatBox = new Chatbox();
chatBox.display();

function removeLTCharacters(str) {
    newStr = '';
    newStr = str.replace('ą', 'a')
    .replace('ę|ė', 'e')
    .replace('į', 'i')
    .replace('š', 's')
    .replace('ū|ų', 'u')
    .replace('ž', 'z');
    return newStr;
}