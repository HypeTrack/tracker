# Tracker

Tracker is the main codebase for [@HQMonitor](//twitter.com/HQMonitor) (also known as HypeTrack), a server monitoring system for [HQ Trivia](//hqtrivia.com).

## Features

Tracker can:
* Determine when the server is being re-deployed or scaled up
* Determine when an HQ stream has gone live

Tracker also has the ability to send notifications when it detects changes. Currently, it can notify via the following:
* Discord webhook (set `DISCORD_WEBHOOK_ID` and `DISCORD_WEBHOOK_SECRET` in your `.env`)
* Telegram chat (set `TG_TOKEN` and `TG_CHAT_ID`)
* Twitter (set `TW_CONSUMER_KEY`, `TW_CONSUMER_SECRET`, `TW_ACCESS_KEY`, and `TW_ACCESS_SECRET`)

## Running Tracker

Instructions coming soon™

## License

Tracker is licensed under the GNU Affero General Public License v3.0.

For more information on what this means, see [here](https://choosealicense.com/licenses/agpl-3.0/).