import React, { useState } from "react";

import CopyIcon from "../assets/icons/CopyIcon";
import InfoIcon from "../assets/icons/InfoIcon";
import DblArrow from "../assets/icons/DblArrow";
import bitCoinIcon from "../assets/icons/bitcoin.svg";
import ordinalsIcon from "../assets/icons/ordinals.svg";
import ArrowDown from "../assets/icons/ArrowDown";
import DataList from "../components/DataList";
import { searchOptions } from "../assets/data";
import CancelIcon from "../assets/icons/CancelIcon";

function Home() {
    const [toggleDataList, setToggleDataList] = useState(false);
    const [toggleSteps, setToggleSteps] = useState(false);
    const [selectedOption, setSelectedOption] = useState({
        value: "BTC",
        icon: bitCoinIcon,
    });

    const handleDataListBlur = (e) => {
        e.stopPropagation();
        setTimeout(() => {
            setToggleDataList(false);
        }, 100);
    };

    const handleToggleDataList = (e) => {
        e.preventDefault();
        setToggleDataList(!toggleDataList);
    };

    return (
        <>
            <section className="home__container">
                <section className="home__content">
                    <h1 className="text-center mb-5">Welcome to the DexOrdi Presale</h1>
                    <h3 className="text-center mb-5">This is our DexOrdi token address</h3>

                    <section className="home__details">
                        <div className="info flex gap-12 lg:justify-between flex-wrap justify-center  mb-12">
                            <div className="token flex items-center gap-8 flex-1 justify-center">
                                <h3>0x3cD60B512fAAeDDa07548c898e80fe818e076EeC</h3>
                                <CopyIcon classes={"icon-xs"} />
                            </div>
                            <div
                                className="how flex items-center gap-8  justify-center"
                                onClick={() => setToggleSteps(true)}
                            >
                                <p>How to Use</p>
                                <InfoIcon classes={"icon-s"} />
                            </div>
                        </div>

                        <section className="timer__container flex gap-16 mb-8 blur-glass-effect">
                            <div className="left flex flex-col justify-between items-center gap-16">
                                <p className="flex items-center gap-16">
                                    <span className="text-grey-d1">Start Time</span>
                                    <strong>
                                        <b className="text-grey-d">June 27th, 12:00 GMT</b>
                                    </strong>
                                </p>

                                <h3 className="text-center">
                                    TIME REMAINING <br />
                                    TO PARTICIPATE <br />
                                    IN PRESALE
                                </h3>
                            </div>

                            <div className="bottom flex justify-between items-center flex-col gap-16">
                                <p className="flex items-center gap-16">
                                    <span className="text-grey-d1">End Time</span>
                                    <strong>
                                        <b>June 30th, 18:00 GMT</b>
                                    </strong>
                                </p>
                                <div className="counter flex gap-7 items-center text-center">
                                    <div className="box">
                                        <div className="box-no">26</div>
                                        <span>Days</span>
                                    </div>
                                    <div className="box">
                                        <div className="box-no">08</div>
                                        <span>Hours</span>
                                    </div>
                                    <div className="box">
                                        <div className="box-no">17</div>
                                        <span>Minutes</span>
                                    </div>
                                    <div className="box">
                                        <div className="box-no">59</div>
                                        <span>Seconds</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="purchase__container mb-10 blur-glass-effect">
                            <p className="mb-6 text-center">
                                <span className="text-grey-d1">DexOrdi Price</span> : $0.025
                            </p>
                            <input
                                type="text"
                                className="mb-6 text-center text-3xl mb-10 input"
                                placeholder={"Please enter the ORDI amount you'd like to purchase"}
                            />

                            <section className="trade__container flex items-center gap-16">
                                <div className="left">
                                    <div className="top flex items-center justify-between">
                                        <span className="text-grey-d1">From</span>
                                        <span>
                                            <span className="text-grey-d1 mr-2">Balance:</span> 0
                                        </span>
                                    </div>
                                    <div className="bottom">
                                        <input
                                            type="number"
                                            name="from"
                                            id="from"
                                            placeholder="100"
                                            defaultValue={100}
                                        />
                                        <div className="flex items-center">
                                            <span className="text-grey-d1 mr-4 text-3xl">MAX</span>

                                            <div className="coin__list">
                                                <button
                                                    className="flex items-center gap-3"
                                                    onClick={handleToggleDataList}
                                                >
                                                    <img
                                                        src={selectedOption.icon}
                                                        alt="bitcoin"
                                                        className="icon-s"
                                                    />
                                                    <p className="mr-6">{selectedOption.value}</p>
                                                    <ArrowDown />
                                                </button>

                                                {toggleDataList && (
                                                    <DataList
                                                        options={searchOptions}
                                                        handleBlur={handleDataListBlur}
                                                        handleOptionClick={setSelectedOption}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="self-end flex-none mb-5">
                                    <DblArrow classes="icon-xs" />
                                </p>

                                <div className="right">
                                    <div className="top flex items-center justify-between">
                                        <span className="text-grey-d1">To</span>
                                        <span>
                                            <span className="text-grey-d1 mr-2">Balance:</span> 0
                                        </span>
                                    </div>
                                    <div className="bottom">
                                        <input
                                            type="number"
                                            name="from"
                                            id="from"
                                            placeholder="100"
                                            defaultValue={100}
                                        />
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={ordinalsIcon}
                                                alt="bitcoin"
                                                className="icon"
                                            />
                                            <p>Ordi</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </section>

                        <button className="d-btn d-btn-primary flex items-center gap-8 text-4xl mx-auto">
                            Purchase Now <DblArrow classes="icon-xs" />
                        </button>
                    </section>
                </section>

                {toggleSteps && (
                    <section className="backdrop__container simple-backdrop">
                        <div className="backdrop__content">
                            <button className="close-icon" onClick={() => setToggleSteps(false)}>
                                <CancelIcon />
                            </button>

                            <header className="flex justify-between gap-6">
                                <h1>How to participate</h1>
                            </header>

                            <ul>
                                <li>
                                    <h3>
                                        <span>Step 1.</span>
                                        First input token amount to buy.
                                    </h3>
                                </li>
                                <li>
                                    <h3>
                                        <span>Step 2.</span>
                                        Input token receive address. (We recommend to use UniSat
                                        wallet address because you can check it easily.)
                                    </h3>
                                </li>
                                <li>
                                    <h3>
                                        <span>Step 3.</span>
                                        Click purchase button.
                                    </h3>
                                </li>
                                <li>
                                    <h3>
                                        <span>Step 4.</span>
                                        When wallet sign dialogue appear, then click "Sign & Send"
                                        button.
                                    </h3>
                                </li>
                                <li>
                                    <h3>
                                        <span>Step 5.</span>
                                        After some minutes(2 block confirmation time, maybe 10~15
                                        mins), "Token purchased" notification will be displayed.
                                    </h3>
                                </li>
                                <li>
                                    <h3>
                                        <span>Step 6.</span>
                                        Open wallet you inputted token receive address. In "BRC-20"
                                        tab, you can see token transferred correctly.
                                    </h3>
                                </li>
                            </ul>

                            <h3>Welcome to the DexOrdi community.</h3>
                        </div>
                    </section>
                )}
            </section>
        </>
    );
}

export default Home;
