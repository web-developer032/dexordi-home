import React, { useRef } from "react";

import CheckIcon from "../assets/icons/CheckIcon";
import CloseIcon from "../assets/icons/CloseIcon";
import CancelIcon from "../assets/icons/CancelIcon";
import WarningIcon from "../assets/icons/WarningIcon";

export function SuccessMessage({ msg, closeToast }) {
    return (
        <MessageContainer type="success">
            <div className="msg__icon">
                <CheckIcon />
            </div>
            <div className="msg__text">{msg}</div>
            <button className="msg__icon-close" onClick={closeToast}>
                <CloseIcon />
            </button>
        </MessageContainer>
    );
}

export function WarningMessage({ msg, closeToast }) {
    return (
        <MessageContainer type="warning">
            <div className="msg__icon">
                <WarningIcon />
            </div>
            <div className="msg__text">{msg}</div>
            <button className="msg__icon-close" onClick={closeToast}>
                <CloseIcon />
            </button>
        </MessageContainer>
    );
}

export function FailedMessage({ msg, closeToast }) {
    return (
        <MessageContainer type="failed">
            <div className="msg__icon">
                <CancelIcon />
            </div>
            <div className="msg__text">{msg}</div>
            <button className="msg__icon-close" onClick={closeToast}>
                <CloseIcon />
            </button>
        </MessageContainer>
    );
}

function MessageContainer({ children, type = "success" }) {
    return <div className={`msg__container ${type}`}> {children}</div>;
}
