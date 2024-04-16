function printMyMessage(msg){
    console.log("Here is your message: " + msg);
}

const head = document.head;
const body = document.body;

// "container" div
const containerDiv = document.createElement("div");
containerDiv.className = 'container';

// "chatbox" div
const chatboxDiv = document.createElement("div");
chatboxDiv.className = 'chatbox';

// "chatbox__support" div
const chatbox__supportDiv = document.createElement("div");
chatbox__supportDiv.className = 'chatbox__support';

// "chatbox__header" div
const chatbox__headerDiv = document.createElement("div");
chatbox__headerDiv.className = 'chatbox__header';

// "chatbox__image--header" div
const chatbox__header__imageDiv = document.createElement("div");
chatbox__header__imageDiv.className = 'chatbox__image--header';

// "chatbox__button" div
const chatbox__buttonDiv = document.createElement("div");
chatbox__buttonDiv.className = 'chatbox__button';

// "chatbox__button" button
const chatbox__buttonBtn = document.createElement("button");

// "chatbox__button" image
const chatbox__buttonImg = document.createElement("img");
chatbox__buttonImg.src = "https://cdn.jsdelivr.net/gh/deepFriedGarnish/moodle_chatbot@main/frontend/static/images/chatbox-icon.svg"

const cssSheet = document.createElement("link");
cssSheet.rel = "stylesheet";
cssSheet.type = "text/css";
cssSheet.href = "https://cdn.jsdelivr.net/gh/deepFriedGarnish/moodle_chatbot@main/frontend/static/css/main.css"

head.append(cssSheet);
chatbox__buttonBtn.append(chatbox__buttonImg);
chatbox__buttonDiv.append(chatbox__buttonBtn);
chatbox__headerDiv.append(chatbox__header__imageDiv);
chatbox__supportDiv.append(chatbox__headerDiv);
chatboxDiv.append(chatbox__supportDiv);
chatboxDiv.append(chatbox__buttonDiv);
containerDiv.append(chatboxDiv);
body.append(containerDiv);
console.log(containerDiv);