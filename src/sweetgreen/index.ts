import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { URL } from 'url'
import type { Request, Response } from 'express'
import basicAuth from 'express-basic-auth'

import { tweet } from '../utils/twitter.js'
import { tg } from '../utils/telegram.js'
import { get } from '../utils/db2.js'

const app = express()

app.set('view engine', 'pug')
// Workaround for __dirname not being defined in an ES module scope.
app.set('views', new URL('.', import.meta.url).pathname + 'views')
app.use(express.json())
app.use(basicAuth({
    challenge: true,
    users: {
        [(process.env.WEBMIN_USER as string)]: (process.env.WEBMIN_PASS as string)
    },
    realm: 'sweetgreen'
}))
app.use('/assets', express.static(new URL('.', import.meta.url).pathname + 'assets'))

app.get('/', async (req: Request, res: Response): Promise<void> => {
    const prodApi = await get<string>('lastRevision_hypeapi')
    const prodWebSocket = await get<string>('lastRevision_hypeapi-websocket')
    const prodTelemetry = await get<string>('lastRevision_api-telemetry')

    res.render('dash', {
        ts: new Date().toISOString(),
        hypeapi: prodApi,
        hypeapi_ws: prodWebSocket,
        hypeapi_tm: prodTelemetry
    })
})

app.get('/post-as', async (req: Request, res: Response): Promise<void> => {
    res.render('sus')
})

app.post('/api/twt', async (req, res) => {
    const status = req.body.status
    console.log(status)
    try {
        await tweet(status)
        res.status(200).send({
            success: true,
            status
        })
    } catch (error: any) {
        console.log(error)
        return res.status(500).send({
            error: error.message
        })
    }
})

app.post('/api/tg', async (req, res) => {
    const msg = req.body.msg
    console.log(msg)

    try {
        await tg(msg)

        res.status(200).send({
            success: true,
            message: msg
        })
    } catch (error: any) {
        return res.status(500).send({
            error: error.message
        })
    }
})

export default app