import axios from 'axios'
import debug from '../utils/debug.js'
import { tweet } from '../utils/twitter.js'
import { client } from '../utils/discord.js'
import { tg } from '../utils/telegram.js'
import { get, set } from '../utils/db2.js'

import type { HTCheckConfig } from '../types/HTCheckConfig.type.js'

const key = 'gameLive'

const config: HTCheckConfig = {
    sendToDiscord: true,
    sendToTelegram: true,
    sendToTwitter: true
}

const messages = {
    gameLive: `An HQ game is active. (ts: ${+new Date()})`,
    gameOver: `HQ is no longer active. (ts: ${+new Date()})`
}

async function social (gameLive: boolean) {
    let text = gameLive ? messages.gameLive : messages.gameOver

    if (config.sendToDiscord) {
        await client.send(text)
    }

    if (config.sendToTwitter) {
        await tweet(text)
    }

    if (config.sendToTelegram) {
        await tg(text)
    }
}

async function check () {
    const d = debug.extend('game')

    try {
        d('Checking for live game...')

        // Check DB2 for if the game is already live.
        const gameAlreadyLive = await get<boolean>(key)

        if (typeof gameAlreadyLive === 'undefined') {
            // Set to false and return.
            d(`${key} is not in DB2. Setting and leaving until next check.`)
            await set<boolean>(key, false)
            return
        }

        // Get JSON data from /shows/now.
        const { data } = await axios.get('https://api-quiz.hype.space/shows/now')

        if (data.active) {
            // If the game is already live, we don't want to spam the notifiers
            if (gameAlreadyLive) {
                d('Game already marked as live')
                return
            }

            d('Game live!')

            await social(data.active)
        } else {
            d('Game is not live.')

            if (gameAlreadyLive) {
                await set<boolean>(key, false)
                await social(data.active)
            }
        }
    } catch (error: any) {
        d('Game check machine broke. %s', error.message)
    }
}

export default check
