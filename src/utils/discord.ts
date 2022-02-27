import dotenv from 'dotenv'
dotenv.config()

import type { APIMessage } from 'discord-api-types'
import { WebhookClient } from 'discord.js'

// Typings here are weird because of dotenv.
const client = new WebhookClient({
    id: (process.env.DISCORD_WEBHOOK_ID as string),
    token: (process.env.DISCORD_WEBHOOK_TOKEN as string)
})

async function postToDiscord(message: string): Promise<APIMessage> {
    return client.send(message)
}

export {
    client,
    postToDiscord
}