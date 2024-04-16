const unknown_prompt_message = ['Atsiprašau, negaliu atsakyti į šį klausimą. Informuosiu dėstytoją, ' +
    'jis papildys mano žinių bagažą. Galbūt turi dar kokių nors klausimų iš kitos tematikos?'];

class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.getElementById('send__button')
        }
        this.state = false;
        this.messages = [];
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
        this.messages.push(message);
        this.updateChatText(chatbox);
        inputField.value = '';

        // Making the API call to get back the prediction
        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            body: JSON.stringify({
                message: inputText
            }),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
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
                fetch('http://127.0.0.1:5000/prompt', {
                    method: 'POST',
                    body: JSON.stringify({
                        message: inputText
                    }),
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                });
            } else {
                returnedMessage = {
                    name: 'Sam',
                    message: r.answer
                };
            };

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