import React from "react";

import './ConversationModal.css';

export const ConversationModal = (props) => {
    return <div className='modal-container' onClick={(e) => {
        if (e.target.className === "modal-container") {
            props.closeModal();
        }
    }}>
    <div className='modal'>
        <div className="title">
            {`Pokalbio ID: ${props.data.id}`}
        </div>
        <div className="conversation">
            {JSON.parse(props.data.conversation_text).map((element, index) => {
            if (element.name === 'Bot'){
                if (element.message[0].indexOf("csharp") !== -1){
                    return (<div key={index} className={element.name === 'User' ? 'user-msg-wrapper' : 'bot-msg-wrapper'}>
                        <pre>
                            <p className='msg'>{element.message}</p>
                        </pre>
                    </div>)
                }
            }
            return (<div key={index} className={element.name === 'User' ? 'user-msg-wrapper' : 'bot-msg-wrapper'}>
                <p className='msg'>{element.message}</p>
            </div>)
        })}
        </div>
    </div>
    </div>;
}