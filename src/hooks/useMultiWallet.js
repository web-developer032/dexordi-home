import { useEffect, useState } from "react";
import useUnisat from "./useUnisat";
import useXverse from "./useXverse";

export default function useMultiWallet() {

  const [connectUnisat, unisatAddress, unisatConnected] = useUnisat();
  const [connectXverse, xverseAddress, xverseConnected] = useXverse();
  const [connected, setConnected] = useState(false);
  const [walletIndex, setWalletIndex] = useState(0);

  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('')

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

  return [walletIndex, setWalletIndex, connectWallet, address, connected, network]

}