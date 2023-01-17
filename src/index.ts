import dotenv from 'dotenv'
dotenv.config()

import debug from './utils/debug.js'
import commonCheck from './checks/common.check.js'
import streamCheck from './checks/stream.check.js'
import gameCheck from './checks/game.check.js'
import { init, serializeDbToDisk } from './utils/db2.js'
import cron from 'node-cron'

import getConfig from './utils/config-parser.js'

const { config } = await getConfig()

const timeoutTime = config.timeoutMs
let cycle = 0

debug('HypeTrack started on %s.', new Date())
// TODO: Web and Mesa.

// Initialize DB2 if config says to do so.
config.db2.initializeOnBoot && await init()

if (config.db2.serializeOnBoot) {
    await serializeDbToDisk() // Initially serialize a copy of the database to disk.
}

if (typeof config.db2.serializeCronString === 'string') {
    // This cron job serializes the database to disk every five minutes.
    cron.schedule(config.db2.serializeCronString, async () => {
        await serializeDbToDisk()
    })
}

// This detects interrupts, and will serialize the DB to disk before breaking.
// TODO: I don't think this works on Windows.
process.on('SIGINT', async () => {
    console.log('Interrupt caught!')
    if (config.db2.serializeOnInterrupt) {
        console.log('Serializing database to disk')
        await serializeDbToDisk()
    }
    process.exit(0)
})

const commonChecks = config.checks.filter(check => check.type === 'common')
const streamChecks = config.checks.filter(check => check.type === 'stream')
const gameChecks = config.checks.filter(check => check.type === 'game')

let checkCount = 0;
[commonChecks, streamChecks, gameChecks].forEach(checks => checkCount += checks.length)
debug('Starting %d checks.', checkCount)
setInterval(async () => {
    debug('We\'re on check cycle %d.', cycle)

    for (const check of commonChecks) {
        await commonCheck(check.params[0], check.params[1])
    }

    for (const check of streamChecks) {
        await streamCheck(check.params[0])
    }

    if (gameChecks.length > 0) {
        await gameCheck()
    }
    
    // Increment cycle
    debug('Cycle %d ended.', cycle)
    cycle++
}, timeoutTime)