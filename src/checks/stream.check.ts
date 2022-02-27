// TODO: Why is this here?
// IIRC this was because of some weirdness with the Twitter utils script not finding its keys.
// But game/common works without this.
// import dotenv from 'dotenv'
// dotenv.config()

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
    sendToTwitter: true
}

const messages = {
    streamLive: (playlist: string) => `The HQ stream is live @ https://hls.prod.hype.space/${playlist}.m3u8 (ts: ${Date.now()})`,
    streamDown: (playlist: string) => `The HQ stream (${playlist}) is now down. (ts: ${Date.now()})`
}

async function socials (playlist: string, streamLive: boolean) {
    const text = streamLive
        ? messages.streamLive(playlist)
        : messages.streamDown(playlist)

    if (config.sendToDiscord) {
        await postToDiscord(text)
    }
    
    if (config.sendToTwitter) {
        await tweet(text)
    }
    
    if (config.sendToTelegram) {
        await tg(text)
    }
}

async function check(playlist: string) {
    const d = debug.extend(playlist)

    // Get the already existing streamLive entry in our in-memory database.
    const streamLive = await get<boolean>(`streamLive_${playlist}`)

    try {
        d('Attempting request to %s.m3u8...', playlist)
        await axios.get(`https://hls.prod.hype.space/${playlist}.m3u8`)

        // If we get here, the stream is live.
        if (streamLive === true) {
            // We already tweeted that a stream is live.
            d('Already noticed this is live, bailing.')
            return
        }

        // Set streamLive for this playlist.
        await set<boolean>(`streamLive_${playlist}`, true)

        await socials(playlist, true)
    } catch (error: any) {
        d('%s is not live!', playlist)

        await set<boolean>(`streamLive_${playlist}`, false)

        if (streamLive === true) {
            // The stream has gone offline since our last check.
            d('%s went offline since last check!', playlist)

            await socials(playlist, false)
        }

        return
    }
}

export default check