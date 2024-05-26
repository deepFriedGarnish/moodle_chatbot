const unknown_prompt_message = ['Atsiprašau, negaliu atsakyti į šį klausimą. Informuosiu dėstytoją, ' +
    'jis papildys mano žinių bagažą. Galbūt turi dar kokių nors klausimų iš kitos tematikos?'];

const duplicate_promp_message = ['Atsiprašau, nebeturiu daugiau žinių šiuo klausimu. Informuosiu ' + 
    'dėstytoją dėl šio tavo klausimo. Gal turi kokį nors klausimą iš kitos temos? Mielai stengsiuosi atsakyti.'];

const default_fallback_reply = 'Atsiprašau, nesu įsitikinęs ar suprantu Tave, gal gali perfrazuoti savo klausimą?';

const helpText = 'Kaip naudotis chatbot\'u: \n\n Boto geriausia klausti naudojant šias formuluotes: \n - Kas tai yra? \n - Kur galėčiau apie tai pasiskaityti? \n - Pateik man pavyzdžių apie tai... \n - Kur tai naudojama? \n \n Į kai kuriuos klausimus bot\'as gali neatsakyti. Tačiau \napie šiuos klausimus yra informuojamas dėstytojas ir \nbotas jais yra papildomai apmokomas. \n\nTad tiesiog nebijok klausti, galbūt ateityje botas žinos \n atsakymą į Tavo klausimą! :)';
let faqText = 'Dažniausiai užduodami klausimai:<br>';

const FLASK_API_HOST_NAME = 'http://127.0.0.1:5000';
const CONTENT_TYPE = 'application/json';
const UNANSWERED_TYPE = 'unanswered';
const DUPLICATE_TYPE = 'duplicate';

// Session variables set up
sessionStorage.setItem('currentConversationId', 0);
loadChatbotUI();

class Chatbox {
    constructor() {
        this.openButton = document.querySelector('.chatbox__button');   // The open button, to open the chatbot UI
        this.chatBox = document.querySelector('.chatbox__support');     // The whole chatbox UI
        this.sendButton = document.getElementById('send__button');      // The message send button inside the chatbot UI
        this.helpButton = document.getElementById('help__button');      // Hrlp button element
        this.faqButton = document.getElementById('faq__button');        // Hrlp button element
        this.helpDiv = document.querySelector('.chatbox__help');        // Help window element
        this.faqDiv = document.querySelector('.chatbox__faq');          // Help window element
        this.helpState = false;                                         // False - help window is not visible, True - help window is visible
        this.faqState = false;                                          // False - faq window is not visible, True - faq window is visible
        this.state = false;                                             // False - chatbot window is not visible, True - chatbot window is visible
        this.conversation = [];                                         // Here we store the whole session conversation
        this.lastBotReply = {                                           // The bot's previous reply
            name: null,
            message: null
        };
    }

    display() {
        this.helpButton.addEventListener('click', () => this.toggleHelp());
        this.faqButton.addEventListener('click', () => this.toggleFAQ());
        this.openButton.addEventListener('click', () => this.toggleState());
        this.sendButton.addEventListener('click', () => this.onSendButton());
        this.chatBox.querySelector('input').addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton();
            }
        });

        fetch(`${FLASK_API_HOST_NAME}/faq`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': CONTENT_TYPE
            },
        })
        .then(r => r.json())
        .then(r => {
            let index = 1;
            r.forEach(topic => {
                faqText = faqText + index + '. ' + topic + '<br>';
                index++;
            });
            this.faqDiv.innerHTML = faqText;
        });
    }

    toggleState() {
        this.state = !this.state;
        if (this.state) {
            this.chatBox.classList.add('chatbox--active');
            this.chatBox.classList.remove('chatbox--hidden');
        } else {
            this.chatBox.classList.remove('chatbox--active');
            this.chatBox.classList.add('chatbox--hidden');
            this.helpDiv.classList.add('chatbox--hidden');
            this.faqDiv.classList.add('chatbox--hidden');
            this.faqState = false;
            this.helpState = false;
        }
    }

    toggleHelp() {
        this.helpState = !this.helpState;
        if (this.helpState) {
            this.helpDiv.classList.remove('chatbox--hidden');
            this.faqDiv.classList.add('chatbox--hidden');
            this.faqState = false;
        } else {
            this.helpDiv.classList.add('chatbox--hidden');
        }
    }

    toggleFAQ() {
        this.faqState = !this.faqState;
        if (this.faqState) {
            this.faqDiv.classList.remove('chatbox--hidden');
            this.helpDiv.classList.add('chatbox--hidden');
            this.helpState = false;
        } else {
            this.faqDiv.classList.add('chatbox--hidden');
        }
    }

    onSendButton() {
        // Here we pickup the user prompt text
        const inputField = this.chatBox.querySelector('input');
        let inputText = inputField.value;
        
        // Here we check whether the prompt is empty
        if (inputText === '') {
            return;
        }

        // Disable send button
        this.sendButton.disabled = true;

        // Here we compose the message for the API call
        let message = {
            name: "User",
            message: inputText
        }

        // Push the current message to an array containing all messages
        this.conversation.push(message);
        this.updateChatText();
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
            let botAnswer = {
                name: 'Bot',
                message: r.answer
            };

            // Check if returned message is empty
            if (r.answer.length === 0){
                botAnswer = {
                    name: 'Bot',
                    message: unknown_prompt_message
                };
                // Call backend API to upload the question to DB
                fetch(`${FLASK_API_HOST_NAME}/unansweredPrompt`, {
                    method: 'POST',
                    body: JSON.stringify({
                        message: inputText,
                        conversation: removeLTCharacters(JSON.stringify(this.conversation)),
                        conversationId: sessionStorage.getItem('currentConversationId'),
                        type: UNANSWERED_TYPE
                    }),
                    mode: 'cors',
                    headers: {
                        'Content-Type': CONTENT_TYPE
                    },
                });
            }
            // Else if the previous response is the same as the current response call
            else if (JSON.stringify(this.lastBotReply.message) === JSON.stringify(r.answer)){
                botAnswer = {
                    name: 'Bot',
                    message: duplicate_promp_message
                };
                // Call backend API to upload the question to DB
                fetch(`${FLASK_API_HOST_NAME}/unansweredPrompt`, {
                    method: 'POST',
                    body: JSON.stringify({
                        message: inputText,
                        conversation: removeLTCharacters(JSON.stringify(this.conversation)),
                        conversationId: sessionStorage.getItem('currentConversationId'),
                        type: DUPLICATE_TYPE
                    }),
                    mode: 'cors',
                    headers: {
                        'Content-Type': CONTENT_TYPE
                    },
                });
            };

            this.lastBotReply = botAnswer;
            this.conversation.push(botAnswer);
            this.updateChatText();
            this.updateConversationInDB();

            // Enable send button after receiving response
            this.sendButton.disabled = false;
        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText();
        });
    }

    updateChatText() {
        let html = '';
        this.conversation.slice().reverse().forEach(function(item) {
            if (item.name === "Bot"){
                item.message.reverse().forEach(msg => {
                    if (msg.indexOf('csharp') !== -1){
                        html += '<div class="messages__item messages__item--visitor pre"><code>' + msg + '</code></div>';
                    } else {
                        html += '<div class="messages__item messages__item--visitor">' + msg + '</div>';
                    }
                });
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>';
            }
        });
        const chatmessage = this.chatBox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }

    updateConversationInDB() {
        // Call flask API to update the conversation in DB
        fetch(`${FLASK_API_HOST_NAME}/updateConversation`, {
            method: 'POST',
            body: JSON.stringify({
                conversation: removeLTCharacters(JSON.stringify(this.conversation)),
                conversationId: sessionStorage.getItem('currentConversationId')
            }),
            mode: 'cors',
            headers: {
                'Content-Type': CONTENT_TYPE
            },
        })
        .then(returnedId => returnedId.json())
        .then(returnedId => {
                sessionStorage.setItem('currentConversationId', returnedId[0]);
            }
        );
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

function loadChatbotUI() {
    const head = document.head;
    const body = document.body;

    const containerDiv = document.createElement("div");
    containerDiv.className = 'container';
    const chatboxDiv = document.createElement("div");
    chatboxDiv.className = 'chatbox';

    const chatbox__helpDiv = document.createElement("div");
    chatbox__helpDiv.className = 'chatbox__help chatbox--hidden';
    chatbox__helpDiv.innerText = helpText;

    const chatbox__faqDiv = document.createElement("div");
    chatbox__faqDiv.className = 'chatbox__faq chatbox--hidden';
    chatbox__faqDiv.innerText = faqText;

    const chatbox__supportDiv = document.createElement("div");
    chatbox__supportDiv.className = 'chatbox__support chatbox--hidden';
    const chatbox__headerDiv = document.createElement("div");
    chatbox__headerDiv.className = 'chatbox__header';
    const chatbox__header__imageDiv = document.createElement("div");
    chatbox__header__imageDiv.className = 'chatbox__image--header';
    const chatbox__header__imageImg = document.createElement("img");
    chatbox__header__imageImg.src = "https://cdn.jsdelivr.net/gh/deepFriedGarnish/moodle_chatbot@1.0.3/frontend/chatbot_ui/static/images/moodle-logo.svg"
    chatbox__header__imageImg.alt = 'image';
    const chatbox__content__headerDiv = document.createElement("div");
    chatbox__content__headerDiv.className = "chatbox__content--header";
    const chatbox__content__headerH4 = document.createElement("h4");
    chatbox__content__headerH4.className = "chatbox__heading--header";
    chatbox__content__headerH4.innerText = "MOODLE chatbot'as";

    const helperDiv = document.createElement("div");
    helperDiv.className = "helper_div";

    const chatbox__helpBtn = document.createElement("button");
    chatbox__helpBtn.id = "help__button";
    const chatbox__helpBtn__img = document.createElement("img");
    chatbox__helpBtn__img.src = "../static/images/help-button.svg";
    chatbox__helpBtn__img.className = "help_button_img";

    const chatbox__faqBtn = document.createElement("button");
    chatbox__faqBtn.id = "faq__button";
    const chatbox__faqBtn__img = document.createElement("img");
    chatbox__faqBtn__img.src = "../static/images/faq-icon.svg";
    chatbox__faqBtn__img.className = "faq_button_img";

    const chatbox__content__headerP = document.createElement("p");
    chatbox__content__headerP.className = "chatbox__description--header";
    chatbox__content__headerP.innerText = "Labas. Gal galėčiau Tau kuo nors padėti?";
    const chatbox__messagesDiv = document.createElement("div");
    chatbox__messagesDiv.className = "chatbox__messages";
    const emptyDiv = document.createElement("div");
    const chatbox__footerDiv = document.createElement("div");
    chatbox__footerDiv.className = "chatbox__footer";
    const chatbox__footerInput = document.createElement("input");
    chatbox__footerInput.type = "text";
    chatbox__footerInput.placeholder = "Rašyk savo klausimą čia...";
    const chatbox__footerBtn = document.createElement("button");
    chatbox__footerBtn.id = "send__button";
    chatbox__footerBtn.className = "chatbox__send--footer";
    const chatbox__footerImg = document.createElement("img");
    chatbox__footerImg.src = "https://cdn.jsdelivr.net/gh/deepFriedGarnish/moodle_chatbot@1.0.3/frontend/chatbot_ui/static/images/send-button.svg";
    const chatbox__buttonDiv = document.createElement("div");
    chatbox__buttonDiv.className = 'chatbox__button';
    const chatbox__buttonBtn = document.createElement("button");
    const chatbox__buttonImg = document.createElement("img");
    chatbox__buttonImg.src = "https://cdn.jsdelivr.net/gh/deepFriedGarnish/moodle_chatbot@1.0.3/frontend/chatbot_ui/static/images/chatbox-icon.svg";

    const cssSheet = document.createElement("link");
    cssSheet.rel = "stylesheet";
    cssSheet.type = "text/css";
    cssSheet.href = "https://cdn.jsdelivr.net/gh/deepFriedGarnish/moodle_chatbot@1.0.3/frontend/chatbot_ui/static/css/main.css"
    // cssSheet.href = "../static/css/main.css"

    head.append(cssSheet);
    chatbox__buttonBtn.append(chatbox__buttonImg);
    chatbox__buttonDiv.append(chatbox__buttonBtn);
    chatbox__header__imageDiv.append(chatbox__header__imageImg);
    chatbox__headerDiv.append(chatbox__header__imageDiv);
    chatbox__content__headerDiv.append(chatbox__content__headerH4);
    chatbox__content__headerDiv.append(chatbox__content__headerP);
    chatbox__headerDiv.append(chatbox__content__headerDiv);
    chatbox__helpBtn.append(chatbox__helpBtn__img);
    chatbox__faqBtn.append(chatbox__faqBtn__img);
    helperDiv.append(chatbox__helpBtn);
    helperDiv.append(chatbox__faqBtn)
    chatbox__headerDiv.append(helperDiv);
    chatbox__messagesDiv.append(emptyDiv);
    chatbox__supportDiv.append(chatbox__headerDiv);
    chatbox__supportDiv.append(chatbox__messagesDiv);
    chatbox__footerDiv.append(chatbox__footerInput);
    chatbox__footerBtn.append(chatbox__footerImg);
    chatbox__footerDiv.append(chatbox__footerBtn);
    chatbox__supportDiv.append(chatbox__footerDiv);
    chatboxDiv.append(chatbox__supportDiv);
    chatboxDiv.append(chatbox__buttonDiv);
    containerDiv.append(chatboxDiv);
    body.append(chatbox__helpDiv);
    body.append(chatbox__faqDiv);
    body.append(containerDiv);
}