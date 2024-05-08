import React from "react";

import './NLUInput.css';

export const NLUInput = (props) => {
    return (
        <div className="nlu-subwrapper">
            <div className="nlu-subtitle">
                {props.title}
            </div>
            {props.data.map((example, index) => (
                <div className="nlu-input" key={index}>
                    <input 
                        type="text"
                        value={example}
                        className="form-group question-input"
                        onChange={(event) => props.handleQuestionChange(event, index, props.type)}
                    />
                    <button className="nlu-remove-btn" onClick={(event) => props.handleQuestionRemove(index, event, props.type)}>-</button>
                </div>
            ))}
            <button className="nlu-add-btn" onClick={(event) => props.handleQuestionAdd(event, props.type)}>+</button>
        </div>
    );
}