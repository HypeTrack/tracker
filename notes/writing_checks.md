# Writing HypeTrack Checks

HypeTrack checks are built to be as simple as possible to implement.

## Import libraries

In most cases, you'll need these at the top of your new check:
```ts
import axios from 'axios'
import debug from '../utils/debug.js'
import { tweet } from '../utils/twitter.js'
import { postToDiscord } from '../utils/discord.js'
import { tg } from '../utils/telegram.js'
import { get, set } from '../utils/db2.js'
import type { HTCheckConfig } from '../types/HTCheckConfig.type.js'
```

Explanation for each import:
* `axios`
    * Used for HTTP requests. (This will be changed eventually when Node.js gets native fetch support.)
* `../utils/debug.js`
    * Used for visual debugging. This is the script that handles the base namespace for tracker's debug logs.
* `../utils/twitter.js`
    * Helper script for tweeting. Handles the checks for tweets being too long as well.
* `../utils/discord.js`
    * Helper script for posting to Discord.
* `../utils/telegram.js`
    * Helper script for posting to Telegram.
* `../utils/db2.js`
    * This one is critical! It handles writing and fetching data from the in-memory database (DB2.)
* `../types/HTCheckConfig.type.js`
    * Used as a type for the `config` constant.

## Set up config

The `HTCheckConfig` type has types for telling the `socials` function where to post messages.

You write the config like this:
```ts
const config: HTCheckConfig {
    sendToDiscord: true,
    sendToTelegram: true,
    sendToTwitter: true
}
```

If you don't want the check to initiate a message to a specific service, change the specific value to `false`.

In the event you need to do a one-off config option, you can handle it by making an inline [intersection type](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types).
```ts
const config: HTCheckConfig & { sendToMastodon: boolean } {
    sendToDiscord: true,
    sendToTelegram: true,
    sendToTwitter: true,
    sendToMastodon: true
}
```

## Set up messages

While not strictly required, first-party HypeTrack checks use this construct to make it easier to change what is posted in certain places.

It's easy, just make a constant called `messages` and set up your messages like this:
```ts
const messages = {
    stringA: "Didn't plan to never land",
    stringB: (arbitraryParam: string) => `Just never thought that we could ${arbitraryParam}`
}
```

For stringA, you'd reference it as `messages.stringA`. For stringB, you'll have to pass a value for arbitraryParam, so this would work: `messages.stringB("drown")`.

> Note that because `arbitraryParam` is strictly typed as a string, you can only pass strings to it. This means that `messages.stringB(42)` wouldn't work.

## Define socials function

The `socials` function should be an asynchronous function that returns nothing. So the definition of it should be something like this:
```ts
async function socials (anyParametersNeededHere: any): void {
    // ...
}
```

You'd use the options defined in `config` to determine what the socials function needs to do.

### Posting to Discord

You'd normally use the `postToDiscord` function exported from `../utils/discord.js`, but the full Discord.js client is exported as `client` in the event that embeds need to be made.

```ts
if (config.sendToDiscord) {
    await postToDiscord('This will be posted to Discord.')

    // Alternatively:
    await client.send('This will be posted to Discord.')
}
```

### Posting to Telegram

Use the `tg` function.

```ts
if (config.sendToTelegram) {
    await tg('This will be posted to Telegram.')
}
```

### Posting to Twitter

Use the `tweet` function.

> Note that you don't have to check how long the text you're tweeting is. The `tweet` function will throw if your text is too long.

```ts
if (config.sendToTwitter) {
    await tweet('This will be posted to Twitter.')
}
```

## Defining the check function

The check function is asynchronous and returns nothing, so you'd do this:
```ts
async function check (anyParametersNeeded: any): void {
    // ...
}
```

A couple things you should do in your checks:
* **Extend out the debug scope and assign it to a constant called `d`.**
    * `const d = debug.extend("check")`
* Wrap your code in a try-catch block so you can handle errors.

### Checking if a key exists in DB2

Most tracker checks use this pattern to check if a key exists in DB2:
```ts
const data = await get<string>('someKeyHere')

if (typeof data === 'undefined') {
    // Write a default value.
    await set<string>('someKeyHere', 'abc')

    // Return and come back next time
    return
}
```

The `<string>` part of the statement tells DB2 how to get and write the data to DB2.