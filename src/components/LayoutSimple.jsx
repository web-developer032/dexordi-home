import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { setDarkModeVariables, setLightModeVariables } from "../utils/utils";
import { useAuthState } from "../context/AuthContext";

import logoLight from "../assets/logo/dexordi-light.png";
import logoDark from "../assets/logo/dexordi-dark.png";
import lightIcon from "../assets/icons/light-icon.png";
import darkIcon from "../assets/icons/dark-icon.png";
import CancelIcon from "../assets/icons/CancelIcon";
import WalletIcon from "../assets/icons/WalletIcon";
import twitterIcon from "../assets/icons/twitter.svg";
import mediumIcon from "../assets/icons/medium.svg";
import telegramIcon from "../assets/icons/telegram.svg";
import okxWalletIcon from "../assets/icons/okxWalletIcon.png";
import metamaskWalletIcon from "../assets/icons/metamaskWalletIcon.png";
import unisatWalletIcon from "../assets/icons/unisatWalletIcon.png";

import { SuccessMessage } from "./Notifications";

const walletOptions = [
    {
        icon: unisatWalletIcon,
        value: 1,
        label: "Unisat Wallet",
        label2: "Support Bitcoin Wallet",
    },
    {
        icon: okxWalletIcon,
        value: 2,
        label: "Xverse Wallet",
        label2: "Support Bitcoin Wallet",
    },
    {
        icon: metamaskWalletIcon,
        value: 3,
        label: "Hiro Wallet",
    },
];

function LayoutSimple() {
    const { authState, updateTheme } = useAuthState();
    const { walletContext } = useAuthState();
    const { walletIndex, setWalletIndex, connectWallet, address, connected } = walletContext;
    const [walletList, setWalletList] = useState(0);
    const toastRef = useRef();

    const handleToastClose = () => {
        toast.dismiss(toastRef.current);
    };

    const notifySuccess = () =>
    (toastRef.current = toast(
        <SuccessMessage
            msg={"You are successfully logged out!"}
            closeToast={handleToastClose}
        />
    ));

    const toggleWalletList = () => {
        setWalletList((prevState) => !prevState);
    };

    useEffect(() => {
        if (authState.preferDark) {
            setDarkModeVariables();
        } else {
            setLightModeVariables();
        }
    }, [authState.preferDark]);

    const handleWalletSelect = async (index) => {
        const result = await connectWallet(index)
        if (result) {
            setWalletIndex(index)
            toggleWalletList();
        }
    }

    return (
        <>
            <header className="header flex items-center justify-between">
                <figure className="logo__container mb-0">
                    <img src={authState.preferDark ? logoDark : logoLight} alt="logo" />
                </figure>

                <section className="flex items-center gap-6">
                    <div className="switch-theme" onClick={updateTheme}>
                        <img
                            src={authState.preferDark ? lightIcon : darkIcon}
                            alt="dark theme"
                            className="icon-xl"
                        />
                    </div>

                    <button
                        className="d-btn d-btn-primary flex items-center gap-6"
                        // onClick={notifySuccess}
                        onClick={toggleWalletList}
                    >
                        <WalletIcon viewBox="0 0 22 22" classes="icon-s" />
                        {connected ? address?.slice(0, 5) + '...' + address?.slice(-6) : 'Connect Wallet'}
                    </button>
                </section>
            </header>

            <Outlet />

            {walletList ? (
                <section className="walletList__container backdrop__container">
                    <section className="wallet__content">
                        <header>
                            <h3>Connect your wallet</h3>
                            <button onClick={toggleWalletList}>
                                <CancelIcon />
                            </button>
                        </header>

                        <ul>
                            {walletOptions.map((item, index) => {
                                return (
                                    <li
                                        className={`cursor-pointer ${index === walletIndex ? "active" : ""
                                            }`}
                                        key={item.label}
                                        onClick={() => handleWalletSelect(index)}
                                    >
                                        <div>
                                            <h3>{item.label}</h3>
                                            {item.label2 && <p>{item.label2}</p>}
                                        </div>

                                        <img src={item.icon} alt={item.label} />
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                </section>
            ) : <></>}

            <footer className="lg:px-40 px-20 py-5 flex justify-between pb-16 simple-footer">
                <div className="left flex gap-16 items-center">
                    <p>Connect</p>

                    <ul className="flex items-center gap-8">
                        <li>
                            <a href="#">
                                <img src={twitterIcon} alt="twitter" className="icon" />
                            </a>
                        </li>
                        <li>
                            <a href="#">
                                <img src={telegramIcon} alt="telegram" className="icon" />
                            </a>
                        </li>
                        <li>
                            <a href="#">
                                <img src={mediumIcon} alt="medium" className="icon" />
                            </a>
                        </li>
                    </ul>
                </div>

                <p className="text-grey-d1">Copyright &copy; 2023 DexOrdi. All rights reserved.</p>
            </footer>
        </>
    );
}

export default LayoutSimple;
