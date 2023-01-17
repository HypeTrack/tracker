import dotenv from 'dotenv'
dotenv.config()

import Twitter from 'twitter-lite'

// The typings here are just a quick workaround for dotenv being weird.
const client = new Twitter({
    consumer_key:           (process.env.TW_CONSUMER_KEY as string),
    consumer_secret:        (process.env.TW_CONSUMER_SECRET as string),
    access_token_key:       (process.env.TW_ACCESS_KEY as string),
    access_token_secret:    (process.env.TW_ACCESS_SECRET as string)
})

async function tweet(content: string): Promise<void> {
    if (content.length > 280) throw new Error('Status is longer than 280 characters.')

    return client.post('statuses/update', {
        status: content
    })
}

export {
    client,
    tweet
}