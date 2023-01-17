# Tracker

Tracker is the main codebase for [@HQMonitor](//twitter.com/HQMonitor) (also known as HypeTrack), a server monitoring system for [HQ Trivia](//hqtrivia.com).

## Features

Tracker can:
* Determine when the server is being re-deployed or scaled up
* Determine when an HQ stream has gone live
* Determine when a game is live

Tracker also has the ability to send notifications when it detects changes. Currently, it can notify via the following:
* Discord webhook (set `DISCORD_WEBHOOK_ID` and `DISCORD_WEBHOOK_SECRET` in your `.env`)
* Telegram chat (set `TG_TOKEN` and `TG_CHAT_ID`)
* Twitter (set `TW_CONSUMER_KEY`, `TW_CONSUMER_SECRET`, `TW_ACCESS_KEY`, and `TW_ACCESS_SECRET`)

## Running Tracker

1. Install dependencies using your package manager of choice (I use `yarn`).
1. Set your environment: set up Discord, Telegram, and Twitter keys (or turn them off in the check configuration.)
1. Build HypeTrack by running the build script (for yarn, this would be `yarn build`)
1. Run `start.sh` to start the bot.

### Running in Production

I literally just use `screen` lol

## License

Tracker is licensed under the GNU Affero General Public License v3.0.

For more information on what this means, see [here](https://choosealicense.com/licenses/agpl-3.0/).