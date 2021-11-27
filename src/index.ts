import dotenv from 'dotenv'
dotenv.config()

import debug from './utils/debug.js'
import commonCheck from './checks/common.check.js'
import streamCheck from './checks/stream.check.js'
import { init, serializeDbToDisk } from './utils/db2.js'
import cron from 'node-cron'

const timeoutTime = parseInt((process.env.TIMEOUT_TIME as string))
let cycle = 0

debug('HypeTrack started on %s.', new Date())
// TODO: Web and Mesa.

// Initialize DB2.
await init()
await serializeDbToDisk() // Initially serialize a copy of the database to disk.

// This cron job serializes the database to disk every five minutes.
cron.schedule('*/5 * * * *', async () => {
    await serializeDbToDisk()
})

// This detects interrupts, and will serialize the DB to disk before breaking.
// TODO: I don't think this works on Windows.
process.on('SIGINT', async () => {
    console.log('Interrupt caught! Serializing database to disk.')
    await serializeDbToDisk()
    process.exit(0)
})

// TODO: Have a way to have this dynamically expandable.
setInterval(async () => {
    debug('We\'re on check cycle %d.', cycle)
    await commonCheck('https://api.prod.hype.space', 'hypeapi')
    await commonCheck('https://ws.prod.hype.space', 'hypeapi-websocket')
    await commonCheck('https://telemetry.prod.hype.space', 'api-telemetry')

    await streamCheck('internet_high')
    await streamCheck('intranet_high')
    await streamCheck('wirecast_high')
    
    // Increment cycle
    debug('Cycle %d ended.', cycle)
    cycle++
}, timeoutTime)