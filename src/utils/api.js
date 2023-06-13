const express = require('express')
const parser = require('body-parser')
const cors = require('cors')
const https = require('https')

const {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} = require('fs')

const MempoolJS = require('@mempool/mempool.js')
const { MongoClient } = require('mongodb')

const {
  NETWORK,
  WALLET_NAME,
  VAULT_ADDRESS,
  MONGODB_URI,
  DB_NAME,
  COLLECTION_NAME,
  FRONT_SERVER,
  TOKEN_NAME,
  TOKEN_ADDRESS,
  TOKEN_PRICE,
  MIN_TOKEN_AMOUNT,
  MAX_TOKEN_AMOUNT,
  PRESALE_TOKEN_SUPPLY,
  MAX_PENDING_ORDER_COUNT,
  STATIC_FEE,
  DYNAMIC_FEE,
  PRESALE_START_TIME,
  PRESALE_END_TIME,
  INSCRIPTION_PATH,
} = require('./config.js')

const {
  waitForSeconds,
} = require('./util.js')

const {
  inscribeOrdinal,
  sendOrdinal,
} = require('./ord-wallet.js')

////////////////////////////////////////////////////////////////

const ORDER_STATUS_ORDERED = 1
const ORDER_STATUS_TOKEN_TRANSFER_INSCRIBED = 2
const ORDER_STATUS_TOKEN_TRANSFERED = 3
const ORDER_STATUS_FAILED = 4
const ORDER_STATUS_CONFIRMED = 5

const BRC20_PROTOCOL = 'brc-20'

const app = express()

app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())

app.use(cors())

const privateKey = readFileSync('key.pem', 'utf8')
const certificate = readFileSync('cert.pem', 'utf8')
const credentials = {
  key: privateKey,
  cert: certificate,
}

const server = https.createServer(credentials, app)

const mempool = MempoolJS({
  hostname: 'mempool.space',
  network: NETWORK,
  timeout: 60000,
})

const bitcoin = mempool.bitcoin

const mongoClient = new MongoClient(MONGODB_URI)

const mongodb = mongoClient.db(DB_NAME)
const collection = mongodb.collection(COLLECTION_NAME)

let lastBlockHeight = 0

const WAIT_TIME = 10

const DIR_PATH = `${INSCRIPTION_PATH}/transfer/${TOKEN_NAME}`

if (!existsSync(DIR_PATH)) {
  mkdirSync(DIR_PATH)
}

////////////////////////////////////////////////////////////////

async function inscribe_transfer_brc20(amount, destination, feeRate) {
  const transferInfo = {
    p: BRC20_PROTOCOL,
    op: 'transfer',
    tick: TOKEN_NAME,
    amt: amount.toString(),
  }

  const inscriptionPath = `${DIR_PATH}/${destination}-${amount}.txt`
  writeFileSync(inscriptionPath, JSON.stringify(transferInfo))

  return await inscribeOrdinal(inscriptionPath, destination, feeRate)
}

const getInscriptionSats = async (inscription) => {
  try {
    const parts = inscription.split('i')
    const txid = parts[0]
    const vout = parts[1]

    const tx = await bitcoin.transactions.getTx({ txid })

    if (tx && tx.status.confirmed) {
      return tx.vout[vout].value
    }
  } catch (error) {
    console.error
  }
}

const getTransactionFee = async (txid) => {
  try {
    const tx = await bitcoin.transactions.getTx({ txid })

    if (tx && tx.status.confirmed) {
      return tx.fee
    }
  } catch (error) {
    console.error
  }
}

const isTransactionConfirmed = async (txid) => {
  try {
    const tx = await bitcoin.transactions.getTx({ txid })

    if (tx && tx.status.confirmed) {
      return true
    }
  } catch (error) {
    console.error
  }
}

async function checkOrder(order) {
  try {
    if (!order.send_address
      || !order.receive_address
      || !order.btc_amount
      || !order.token_amount
      || !order.fee_rate) {
      order.description = 'Invalid parameter'
      return
    }

    const time = Date.now()

    if (time < PRESALE_START_TIME || time > PRESALE_END_TIME) {
      order.description = 'Invalid time'
      return
    }

    order.btc_amount = Number(order.btc_amount)
    order.token_amount = Number(order.token_amount)

    if (order.btc_amount < order.token_amount * TOKEN_PRICE) {
      order.description = 'Insufficient BTC amount'
      return
    }

    if (order.token_amount < MIN_TOKEN_AMOUNT || order.token_amount > MAX_TOKEN_AMOUNT) {
      order.description = 'Invalid token amount'
      return
    }

    const confirmedOrders = await collection.find({ order_status: ORDER_STATUS_CONFIRMED }).toArray()

    let transferedTokenAmount = 0

    for (const confirmedOrder of confirmedOrders) {
      transferedTokenAmount += confirmedOrder.token_amount
    }

    if (transferedTokenAmount > PRESALE_TOKEN_SUPPLY) {
      order.description = 'Exceed presale token supply'
      return
    }

    const pendingOrders = await collection.find({ order_status: { $lt: ORDER_STATUS_FAILED } }).toArray()

    if (pendingOrders && pendingOrders.length > MAX_PENDING_ORDER_COUNT) {
      order.description = 'Exceed max pending order count'
      return
    }
  } catch (error) {
    console.error(error)
  }
}

async function checkTransaction(order) {
  try {
    const feeTxs = await collection.find({ txid: order.txid }).toArray()

    if (feeTxs.length > 1) {
      order.description = 'Duplicated transaction'
      return
    }

    const feeTx = await bitcoin.transactions.getTx({ txid: order.txid })

    if (!feeTx) {
      order.description = 'Transaction not exist'
      return
    }

    let validSendAddress = true

    for (const vin of feeTx.vin) {
      if (vin.prevout.scriptpubkey_address !== order.send_address) {
        validSendAddress = false
        break
      }
    }

    if (!validSendAddress) {
      order.description = 'Invalid send address'
      return
    }

    let btcBalance = 0
    let invalidTransaction = true

    for (const vout of feeTx.vout) {
      if (vout.scriptpubkey_address === VAULT_ADDRESS) {
        btcBalance += vout.value
        invalidTransaction = false
      }
    }

    if (invalidTransaction) {
      order.description = 'Invalid transaction'
      return
    }

    order.btc_balance = btcBalance
    order.spent_fee = 0

    const minBtcAmount = order.btc_amount + STATIC_FEE + DYNAMIC_FEE * order.fee_rate

    if (order.btc_balance < minBtcAmount) {
      order.description = 'Insufficient BTC balance'
      return
    }

    return true
  } catch (error) {
    console.error(error)
  }
}

async function orderThread() {
  while (true) {
    try {
      const blockHeight = await bitcoin.blocks.getBlocksTipHeight()

      if (blockHeight > lastBlockHeight) {
        await waitForSeconds(WAIT_TIME)

        const orders = await collection.find({ order_status: { $lt: ORDER_STATUS_FAILED } }).toArray()

        for (const order of orders) {
          try {
            switch (order.order_type) {
              case ORDER_STATUS_ORDERED:
                const tokenTransfer = await inscribe_transfer_brc20(TOKEN_NAME, order.token_amount, TOKEN_ADDRESS, order.fee_rate)

                if (!tokenTransfer) {
                  order.status = ORDER_STATUS_FAILED
                  order.description = 'Token transfer inscribe failed'
                  break
                }

                order.status = ORDER_STATUS_TOKEN_TRANSFER_INSCRIBED
                order.description = 'Token transfer inscribed'
              case ORDER_STATUS_TOKEN_TRANSFER_INSCRIBED:
                if (!(await isTransactionConfirmed(order.token_transfer.reveal))) {
                  break
                }

                const token_send_txid = await sendOrdinal(order.token_transfer.inscription, order.receive_address, order.fee_rate)

                if (!token_send_txid) {
                  order.status = ORDER_STATUS_FAILED
                  order.description = 'Token transfer failed'
                  break
                }

                order_status = ORDER_STATUS_TOKEN_TRANSFERED
                order.description = 'Token transfered'
              case ORDER_STATUS_TOKEN_TRANSFERED:
                if (!(await isTransactionConfirmed(order.token_transfer.reveal))) {
                  break
                }

                order.status = ORDER_STATUS_CONFIRMED
                order.description = 'Confirmed'
                break
            }

            await collection.updateOne({ _id: order._id }, { $set: order })
          } catch (error) {
            console.error(error)
          }
        }

        lastBlockHeight = blockHeight
      }

      await waitForSeconds(WAIT_TIME)
    } catch (error) {
      console.error(error)
    }
  }
}

app.get('/currenttime', async function (req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', FRONT_SERVER)
    res.setHeader('Access-Control-Allow-Methods', 'GET')

    res.send(JSON.stringify({ status: 'success', data: Date.now() }))
  } catch (error) {
    console.error(error)
    res.send(JSON.stringify({ status: 'error', description: ERROR_UNKNOWN }))
  }
})

app.post('/checkorder', async function (req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', FRONT_SERVER)
    res.setHeader('Access-Control-Allow-Methods', 'POST')

    const order = req.body

    if (!(await checkOrder(order))) {
      res.send(JSON.stringify({ status: 'error', description: order.description }))
      return
    }

    res.send(JSON.stringify({ status: 'success' }))
  } catch (error) {
    console.error(error)
    res.send(JSON.stringify({ status: 'error', description: ERROR_UNKNOWN }))
  }
})

app.post('/buytoken', async function (req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', FRONT_SERVER)
    res.setHeader('Access-Control-Allow-Methods', 'POST')

    const order = req.body
    order.timestamp = Date.now()

    const result = await collection.insertOne(order)

    if (!(await checkOrder(order))) {
      order.status = ORDER_STATUS_FAILED
      await collection.updateOne({ _id: order._id }, { $set: order })

      res.send(JSON.stringify({ status: 'error', description: order.description }))
      return
    }

    if (!(await checkTransaction(order))) {
      order.status = ORDER_STATUS_FAILED
      await collection.updateOne({ _id: order._id }, { $set: order })

      res.send(JSON.stringify({ status: 'error', description: order.description }))
      return
    }

    order.status = ORDER_STATUS_ORDERED
    order.description = 'Ordered'
    await collection.updateOne({ _id: order._id }, { $set: order })

    res.send(JSON.stringify({ status: 'success' }))
  } catch (error) {
    console.error(error)
    res.send(JSON.stringify({ status: 'error', description: ERROR_UNKNOWN }))
  }
})

module.exports = {
  orderThread,
  server,
}
