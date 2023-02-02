import dotenv from 'dotenv'
dotenv.config()

import axios from 'axios'
import debug from '../utils/debug.js'
import { tweet } from '../utils/twitter.js'
import { postToDiscord } from '../utils/discord.js'
import { tg } from '../utils/telegram.js'
import { get, set } from '../utils/db2.js'
import type { HTCheckConfig } from '../types/HTCheckConfig.type.js'

const config: HTCheckConfig = {
    sendToDiscord: true,
    sendToTelegram: true,
    sendToTwitter: false
}

const HLS_URL = 'https://hls-origin.prod.hype.space'

async function check(playlist: string) {
    const d = debug.extend(playlist)

    // Get the already existing streamLive entry in our in-memory database.
    const streamLive = await get<boolean>(`streamLive_${playlist}`)

    try {
        d('Attempting request to %s.m3u8...', playlist)
        await axios.get(`${HLS_URL}/${playlist}.m3u8`)

        // If we get here, the stream is live.
        if (streamLive === true) {
            // We already tweeted that a stream is live.
            d('Already noticed this is live, bailing.')
            return
        }

        // Set streamLive for this playlist.
        await set<boolean>(`streamLive_${playlist}`, true)

        if (config.sendToDiscord) {
            await postToDiscord(`The HQ stream is live @ ${HLS_URL}/${playlist}.m3u8 (ts: ${Date.now()})`)
        }

        if (config.sendToTelegram) {
            await tg(`The HQ stream is live @ ${HLS_URL}/${playlist}.m3u8 (ts: ${Date.now()})`)
        }

        if (config.sendToTwitter) {
            await tweet(`The HQ stream is live @ ${HLS_URL}/${playlist}.m3u8 (ts: ${Date.now()})`)
        }
    } catch (error: any) {
        d('%s is not live!', playlist)

        await set<boolean>(`streamLive_${playlist}`, false)

        if (streamLive === true) {
            // The stream has gone offline since our last check.
            d('%s went offline since last check!', playlist)

            if (config.sendToDiscord) {
                await postToDiscord(`The HQ stream (${playlist}) is now down. (ts: ${Date.now()})`)
            }

            if (config.sendToTelegram) {
                await tg(`The HQ stream (${playlist}) is now down. (ts: ${Date.now()})`)
            }

            if (config.sendToTwitter) {
                await tweet(`The HQ stream (${playlist}) is now down. (ts: ${Date.now()})`)
            }
        }

        return
    }
}

export default check