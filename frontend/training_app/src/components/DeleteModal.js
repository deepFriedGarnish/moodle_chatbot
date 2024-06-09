import React from "react";

import './DeleteModal.css';

export const DeleteModal = (props) => {
    return <div className='modal-container' onClick={(e) => {
        if (e.target.className === "modal-container") {
            props.closeModal();
        }
    }}>
    <div className="modal-delete">
        <div className="title-delete">
            {props.title}
        </div>
        <div className="delete-modal-choices">
            <button type="submit" className="submit-btn" onClick={props.handleDelete}>
                Trinti
            </button>
            <button type="submit" className="submit-btn" onClick={props.handleCancel}>
                Atšaukti
            </button>
        </div>
    </div>
    </div>;
}