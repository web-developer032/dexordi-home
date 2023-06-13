import { useEffect, useState } from "react";
import useUnisat from "./useUnisat";
import useXverse from "./useXverse";

export default function useMultiWallet() {

  const [connectUnisat, unisatAddress, unisatConnected, unisatSend, unisatBalance] = useUnisat();
  const [connectXverse, xverseAddress, xverseConnected, xverseSend] = useXverse();
  const [connected, setConnected] = useState(false);
  const [walletIndex, setWalletIndex] = useState(0);

  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('');
  const [balance, setBalance] = useState(0);

  const connectWallet = async (index) => {
    switch (index) {
      case 0:
        return await connectUnisat();
      case 1:
        return await connectXverse();
      default:
        break;
    }
  }

  const sendBitcoin = async (to, amount) => {
    switch (walletIndex) {
      case 0:
        return await unisatSend(to, amount);
      case 1:
        return await xverseSend(to, amount);
      default:
        break;
    }
  }

  useEffect(() => {
    switch (walletIndex) {
      case 0:
        setAddress(unisatAddress);
        setConnected(unisatConnected);
        break;
      case 1:
        setAddress(xverseAddress);
        setConnected(xverseConnected);
        break;

      default:
        break;
    }

  }, [walletIndex, unisatAddress, unisatConnected, xverseAddress, xverseConnected])

  useEffect(() => {
    switch (walletIndex) {
      case 0:
        setBalance(unisatBalance.confirmed);
        break;
      case 1:
        break;

      default:
        break;
    }

  }, [walletIndex, unisatBalance])

  return [walletIndex, setWalletIndex, connectWallet, address, connected, network, sendBitcoin, balance]

}