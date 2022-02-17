import axios from 'axios'
import debug from '../utils/debug.js'
import { tweet } from '../utils/twitter.js'
import { client } from '../utils/discord.js'
import { tg } from '../utils/telegram.js'
import { get, set } from '../utils/db2.js'

import type { HTCheckConfig } from '../types/HTCheckConfig.type.js'

const config: HTCheckConfig = {
    sendToDiscord: true,
    sendToTelegram: true,
    sendToTwitter: true
}

async function check () {
    const d = debug.extend('game')

    try {
        d('Checking for live game...')

        const gameAlreadyLive = await get<boolean>('gameLive')
        
        const { data } = await axios.get('https://api-quiz.hype.space/shows/now')

        if (data.active) {
            if (gameAlreadyLive) {
                d('Game already marked as live')
                return
            }

            // Check if we have the gameLive key
            if (typeof gameAlreadyLive === 'undefined') {
                d('gameLive not present in db2')
                // save current state
                await set<boolean>('gameLive', data.active)
            }

            if (config.sendToTwitter) {
                await tweet(`An HQ game is now live. (ts: ${+new Date()})`)
            }

            if (config.sendToDiscord) {
                await client.send(`An HQ game is now live. (ts: ${+new Date()})`)
            }

            if (config.sendToTelegram) {
                await tg(`An HQ game is now live. (ts: ${+new Date()})`)
            }
        } else {
            d('Game is not live.')

            if (gameAlreadyLive) {
                await set<boolean>('gameLive', false)
                
                if (config.sendToTwitter) {
                    await tweet(`The HQ game is over. (ts: ${+new Date()})`)
                }
    
                if (config.sendToDiscord) {
                    await client.send(`The HQ game is over. (ts: ${+new Date()})`)
                }
    
                if (config.sendToTelegram) {
                    await tg(`The HQ game is over. (ts: ${+new Date()})`)
                }
            }
        }
    } catch (error: any) {
        d('Welp, that broke. %s', error.message)
    }
}