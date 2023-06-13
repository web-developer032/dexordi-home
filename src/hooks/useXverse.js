import { useEffect, useRef, useState } from "react";
import useToast from "./useToast";
import { getAddress, signTransaction } from 'sats-connect'
import { BTCNETWORK } from "../utils/constants";

let currentNetwork = ''
const netArray = ['Testnet', 'Mainnet']

export default function useXverse() {

  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [publicKey, setPublicKey] = useState("");
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  });
  const [network, setNetwork] = useState("livenet");
  const [unisatInstalled, setUnisatInstalled] = useState(false);
  const { messageApi } = useToast();

  const connectWallet = async () => {
    let ret = false;
    const getAddressOptions = {
      payload: {
        purposes: ['ordinals', 'payment'],
        message: 'Address for receiving Ordinals and payments',
        network: {
          type: netArray[BTCNETWORK]
          // type: 'Mainnet'
        },
      },
      onFinish: (response) => {
        const add = response.addresses[1].address
        { messageApi.notifySuccess('Xverse Wallet connect success!') }
        setAddress(add)
        ret = true
      },
      onCancel: () => { messageApi.notifyFailed('Xverse Wallet connect Failed!') }
    }

    const address = await getAddress(getAddressOptions);
    return ret;
  }

  const checkConnect = async () => {
    return new Promise(async (res, rej) => {

      currentNetwork = '';
      setTimeout(async () => {
        if (currentNetwork === '') {
          // setConnected(false);
          messageApi.notifyWarning(
            'Unisat wallet is disconnected! Please reload the page.',
            5
          )
          setConnected(false)
          await window.unisat.requestAccounts();
          setConnected(true)

          res(false);
        }
      }, 1000);
      if (!connected)
        currentNetwork = await window.unisat.getNetwork();
      else
        currentNetwork = await window.unisat.requestAccounts();
      console.log('Wallet is connected!');
      res(true)
    })
  }

  const getBasicInfo = async () => {
    const unisat = (window).unisat;
    const [address] = await unisat.getAccounts();
    console.log('address=========>', address);
    setAddress(address);

    const publicKey = await unisat.getPublicKey();
    setPublicKey(publicKey);

    const balance = await unisat.getBalance();
    setBalance(balance);

    const network = await unisat.getNetwork();
    setNetwork(network);
  };

  const selfRef = useRef({
    accounts: [],
  });

  const self = selfRef.current;
  const handleAccountsChanged = (_accounts) => {
    if (self.accounts[0] === _accounts[0]) {
      // prevent from triggering twice
      return;
    }
    self.accounts = _accounts;
    if (_accounts.length > 0) {
      setAccounts(_accounts);
      setConnected(true);

      setAddress(_accounts[0]);

      getBasicInfo();
    } else {
      setConnected(false);
    }
  };

  const handleNetworkChanged = (network) => {
    setNetwork(network);
    getBasicInfo();
  };


  useEffect(() => {
    if (window.unisat) {
      setUnisatInstalled(true);
    } else {
      return;
    }
    window.unisat.getAccounts().then((accounts) => {
      handleAccountsChanged(accounts);
    });

    window.unisat.on("accountsChanged", handleAccountsChanged);
    window.unisat.on("networkChanged", handleNetworkChanged);
    getBasicInfo();

    return () => {
      window.unisat.removeListener("accountsChanged", handleAccountsChanged);
      window.unisat.removeListener("networkChanged", handleNetworkChanged);
    };
  }, [])
  return [connectWallet, address, connected]

}