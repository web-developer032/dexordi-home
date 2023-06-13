import React, { useEffect, useState } from "react";

import CopyIcon from "../assets/icons/CopyIcon";
import InfoIcon from "../assets/icons/InfoIcon";
import DblArrow from "../assets/icons/DblArrow";
import bitCoinIcon from "../assets/icons/bitcoin.svg";
import ordinalsIcon from "../assets/icons/ordinals.svg";
import ArrowDown from "../assets/icons/ArrowDown";
import DataList from "../components/DataList";
import { searchOptions } from "../assets/data";
import CancelIcon from "../assets/icons/CancelIcon";
import { useTime } from "../hooks/useTime";
import { useAuthState } from "../context/AuthContext";
import WalletIcon from "../assets/icons/WalletIcon";
import { validate, getAddressInfo } from 'bitcoin-address-validation';
import useToast from "../hooks/useToast";
import { BTCNETWORK, factoryWalletAddress, formatBTCNumber } from "../utils/constants";
import { useModalState } from "../context/ModalContext";
import ReactPortal from "../components/ReactPortal";
import axios from "axios";
import { tokenTransferApi } from "../utils/apiRoutes";
import useGetBalance from "../hooks/useGetBalance";

const rateTexts = [{
    title: 'Slow',
    text1: 'About 10',
    text2: 'minutes',
}, {
    title: 'Avg',
    text1: 'About 30',
    text2: 'minutes',
}, {
    title: 'Slow',
    text1: 'About 1',
    text2: 'hour',
}
]

function Home() {

    const { walletContext } = useAuthState();
    const { messageApi } = useToast();
    const { walletIndex, setWalletIndex, connectWallet, address, connected, network, sendBitcoin, balance } = walletContext;
    const [currnetTimestamp, delta1, delta2] = useTime();
    const [toggleDataList, setToggleDataList] = useState(false);
    const [toggleSteps, setToggleSteps] = useState(false);
    const [selectedOption, setSelectedOption] = useState({
        value: "BTC",
        icon: bitCoinIcon,
    });

    const [receiverAddress, setReceiverAddress] = useState('');
    const [bTCAmount, setBTCAmount] = useState('');
    const [oxinAmount, setOxinAmount] = useState('');
    const [isMAX, setIsMAX] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { modalState, openModal, closeModal, addModal, removeModal } = useModalState();
    const [feeRateIndex, setFeeRateIndex] = useState(1);
    const [getBalance] = useGetBalance();
    const [oxinBalance, setOxinBalance] = useState(0);
    useEffect(() => {
        const func = async () => {
            const net = BTCNETWORK == 0 ? 'testnet' : 'mainnet';
            if (validate(receiverAddress, net)) {
                const bal = await getBalance('oxin', receiverAddress);
                setOxinBalance(bal);
            }
            else setOxinAmount(0);
        }
        func();
    }, [receiverAddress])

    useEffect(() => {
        setReceiverAddress(address)
    }, [address])

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

    const ConnectBtn = () => (
        <button
            className="d-btn d-btn-primary active flex items-center gap-8 text-4xl mx-auto"
            onClick={connectWallet}
        >
            <WalletIcon viewBox="0 0 22 22" classes="icon" />
            Connect Wallet
        </button>
    )

    const PurchaseBtn = () => (
        <button
            className="d-btn d-btn-primary active flex items-center gap-8 text-4xl mx-auto"
            onClick={handlePurchaseBtn}
        >
            Purchase Now <DblArrow />
        </button>
    )

    const validateInput = () => {
        const net = BTCNETWORK == 0 ? 'testnet' : 'mainnet';

        if (!validate(receiverAddress, net)) {
            messageApi.notifyWarning('Invalid Recipient  address!');
            return false;
        }

        if (bTCAmount == '' || oxinAmount == 0) {
            messageApi.notifyWarning('Please input token amount to buy.');
            return false;
        }

        return true;
    }

    const handlePurchaseBtn = () => {

        if (validateInput()) {
            openModal()
        }
    }

    const handlePurchase = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const tx_id = await sendBitcoin(factoryWalletAddress, bTCAmount * 1e8);
            console.log('object');
            const body = {
                fee_txid: tx_id,
                sender_address: address,
                token_owner_address: address,
                token_receive_address: receiverAddress,
                fee_rate: 1,
                btc_amount: bTCAmount * 1e8,
                tokenAmount: oxinAmount,
                token: 'oxin'
            }
            const res = await axios.post(tokenTransferApi, body);
            console.log('transferAPI===>', res);
        } catch (error) {
            console.log(error);
        }
        closeModal();
        setIsLoading(false);
    }

    const rate = 1 / 0.000007;
    const rateReverse = 0.000007;
    const maxOxin = 0.01400000 / rateReverse;

    const handleBTCChange = (e) => {
        let value = e.target.value.trim().replace(/\s+/g, '');
        if (!isNaN(value)) {
            if (value < 0) value = -value;
            const tokenAmount = Math.floor(value * rate);
            if (tokenAmount < maxOxin) {
                setBTCAmount(value);
                setOxinAmount(tokenAmount)
            } else {
                setOxinAmount(maxOxin)

                setBTCAmount(Math.ceil(1e8 * maxOxin / rate) / 1e8)
            }
        }

    }

    const handleOxinChange = (e) => {
        let value = Number(e.target.value);
        if (isNaN(value)) {
            setOxinAmount(0)
            setBTCAmount(0)
        } else {
            value = Math.floor(value)
            if (value >= maxOxin) value = maxOxin;
            setOxinAmount(value)
            setBTCAmount(formatBTCNumber(Math.ceil(1e8 * value * rateReverse) / 1e8))

        }
    }

    return (
        <>
            {modalState.open && (
                <ReactPortal>
                    <section className="modal__content">
                        <h2 className="leading-normal">{`Are you sure to buy ${oxinAmount} oxin with ${bTCAmount} BTC?`}</h2>
                        <div className="flex w-full justify-center mt-16 gap-8">
                            {rateTexts.map((item, index) => (
                                <button
                                    className={`d-btn d-btn-block ${index == feeRateIndex && 'd-btn-primary'}`}
                                    onClick={() => { setFeeRateIndex(index) }}
                                    key={index}
                                >
                                    <div className="text-4xl py-2">{item.title}</div>
                                    <div className="text-grey-d1">{item.text1}</div>
                                    <div className="text-grey-d1">{item.text2}</div>
                                </button>
                            ))}
                        </div>
                        <div className="btn-group">
                            <button
                                className="d-btn d-btn-primary active"
                                onClick={handlePurchase}
                            >
                                {isLoading && <span className="loader-animation"></span>}
                                Yes
                            </button>
                            <button className="d-btn d-btn-outline" onClick={() => { closeModal(); setIsLoading(false) }}>
                                No
                            </button>
                        </div>
                    </section>
                </ReactPortal>
            )}
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
                                        <div className="box-no">{delta1?.days}</div>
                                        <span>Days</span>
                                    </div>
                                    <div className="box">
                                        <div className="box-no">{delta1?.hours}</div>
                                        <span>Hours</span>
                                    </div>
                                    <div className="box">
                                        <div className="box-no">{delta1?.minutes}</div>
                                        <span>Minutes</span>
                                    </div>
                                    <div className="box">
                                        <div className="box-no">{delta1?.seconds}</div>
                                        <span>Seconds</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="purchase__container mb-10 blur-glass-effect">
                            <p className="mb-6 text-center">
                                <span className="text-grey-d1">Recipient address</span>
                            </p>
                            <div className='flex w-full justify-center'>
                                <div className="flex justify-center w-full">
                                    <input
                                        value={receiverAddress}
                                        onChange={(e) => { setReceiverAddress(e.target.value) }}
                                        className="mb-6 text-center text-3xl input"
                                        placeholder="Please input the recipient address."
                                        type="text"
                                        autoComplete="off"
                                        name="from"
                                        id="from"
                                    />
                                </div>
                            </div>
                            <section className="trade__container flex items-center gap-16">
                                <div className="left">
                                    <div className="top flex items-center justify-between">
                                        <span className="text-grey-d1">From</span>
                                        <span>
                                            <span className="text-grey-d1 mr-2">Balance:</span> {balance / 1e8}
                                        </span>
                                    </div>

                                    <div className="bottom">
                                        <input
                                            type="text"
                                            name="from"
                                            id="from"
                                            placeholder="Please input the recipient address."
                                            value={bTCAmount}
                                            onChange={handleBTCChange}
                                            autoComplete="off"
                                        />
                                        <div className="flex items-center p-1">
                                            {isMAX && <span className="text-grey-d1 mr-4 text-3xl">MAX</span>}
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
                                            <span className="text-grey-d1 mr-2">Balance:</span>{oxinBalance}
                                        </span>
                                    </div>
                                    <div className="bottom">
                                        <input
                                            type="number"
                                            name="from"
                                            id="from"
                                            placeholder="Please input token amount to buy."
                                            value={oxinAmount}
                                            onChange={handleOxinChange}
                                            autoComplete="off"
                                            min={0}
                                        />
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={ordinalsIcon}
                                                alt="bitcoin"
                                                className="icon"
                                            />
                                            <p className="pr-7">oxin</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </section>

                        {
                            connected ? <PurchaseBtn /> : <ConnectBtn />
                        }
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
            </section >
            {modalState.addModalContainer && (
                <section className="modal__container backdrop__container" id="modal" />
            )}
        </>
    );
}

export default Home;
