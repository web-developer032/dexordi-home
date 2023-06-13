// export const host = 'http://95.217.106.211:443'
// export const host = 'http://94.130.34.216:443'
export const host = 'https://api.dexordi.com';

export const worldTimeApi = 'https://worldtimeapi.org/api/timezone/Europe/Paris';
export const factoryWalletApi = `${host}/getvaultaddress/`;
export const getWeightApi = `${host}/getfee/`;
export const tokenListApi = `${host}/tokenlist/`;
export const tokenInfoApi = `${host}/tokeninfo/`;
export const poolListApi = `${host}/getpool/`;
export const createPoolApi = `${host}/createpool`;
export const addLiquidityApi = `${host}/addliquidity`;
export const addLiquidityAmountApi = `${host}/addliquidity/tokenamount`;
export const removeLiquidityApi = `${host}/removeliquidity`;
export const removeLiquidityAmountApi = `${host}/removeliquidity/tokenamount`;
export const swapApi = `${host}/swap`;
export const swapAmountApi = `${host}/swap/tokenamount`;
export const getOrderListApi = `${host}/getorder/`;
export const getBalanceApi = `${host}/gettokenbalance/`;
export const deployTokenApi = `${host}/deploy/`;
export const getWhitelistApi = `${host}/getwhitelisttoken`;
export const updateOrderApi = `${host}/updateorder/`
export const tokenTransferApi = `${host}/transfertoken/`

export const BTCTestExplorerUrl = 'https://mempool.space/testnet/tx/'

export const dayilyURL = 'https://api.coingecko.com/api/v3/coins/ordinals/market_chart?vs_currency=usd&days=1&interval=hourly'
export const weeklyURL = 'https://api.coingecko.com/api/v3/coins/ordinals/market_chart?vs_currency=usd&days=7&interval=hourly'
export const monthlyURL = 'https://api.coingecko.com/api/v3/coins/ordinals/market_chart?vs_currency=usd&days=31&interval=daily'
export const yearlyURL = 'https://api.coingecko.com/api/v3/coins/ordinals/market_chart?vs_currency=usd&days=365&interval=daily'