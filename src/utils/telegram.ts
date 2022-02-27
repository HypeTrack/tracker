import { Telegram } from 'telegraf'
import { Message } from 'typegram'

const client = new Telegram(
    (process.env.TG_TOKEN as string)
)

async function tg(message: string): Promise<Message> {
    return client.sendMessage(
        (process.env.TG_CHAT_ID as string),
        message
    )
}

export {
    client,
    tg
}