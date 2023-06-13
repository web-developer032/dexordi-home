import axios from "axios"
import { useEffect } from "react"
import { getBalanceApi } from "../utils/apiRoutes"


export default function useGetBalance(token, address) {

  const getBalance = async (token, address) => {
    try {
      const res = await axios.get(getBalanceApi + token + '/' + address);
      return res.data.data
    } catch (error) {
      return 0
    }
  }
  return [getBalance]
}