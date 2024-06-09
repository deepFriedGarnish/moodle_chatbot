import React from "react";

import './SuccessModal.css';

export const SuccessModal = (props) => {
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
            <button type="submit" className="submit-btn" onClick={() => props.closeModal()}>
                Uždaryti
            </button>
        </div>
    </div>
    </div>;
}