import React from "react";
import SVGIconWrapper from "./SVGIconWrapper";

function WalletIcon(props) {
    return (
        <SVGIconWrapper {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.60016 5.59992V4.24992C5.60016 2.01317 7.4134 0.199921 9.65015 0.199921H12.3502C14.5869 0.199921 16.4001 2.01317 16.4001 4.24992V5.59992H19.1001C20.5913 5.59992 21.8001 6.80875 21.8001 8.29992V13.1204C18.4382 14.3678 14.8002 15.0498 11.0002 15.0498C7.2001 15.0498 3.56215 14.3678 0.200161 13.1204V8.29992C0.200161 6.80875 1.40899 5.59992 2.90016 5.59992H5.60016ZM8.30015 4.24992C8.30015 3.50434 8.90457 2.89992 9.65015 2.89992H12.3502C13.0957 2.89992 13.7002 3.50434 13.7002 4.24992V5.59992H8.30015V4.24992ZM9.65015 10.9999C9.65015 10.2543 10.2546 9.64992 11.0002 9.64992H11.0137C11.7592 9.64992 12.3637 10.2543 12.3637 10.9999C12.3637 11.7455 11.7592 12.3499 11.0137 12.3499H11.0002C10.2546 12.3499 9.65015 11.7455 9.65015 10.9999Z"
                fill="inherit"
            />
            <path
                d="M0.200161 15.9845V19.0999C0.200161 20.5911 1.40899 21.7999 2.90016 21.7999H19.1001C20.5913 21.7999 21.8001 20.5911 21.8001 19.0999V15.9845C18.4079 17.1295 14.7753 17.7498 11.0002 17.7498C7.22505 17.7498 3.59243 17.1295 0.200161 15.9845Z"
                fill="inherit"
            />
        </SVGIconWrapper>
    );
}

export default WalletIcon;
