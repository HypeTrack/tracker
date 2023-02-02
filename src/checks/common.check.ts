import axios from 'axios'
import debug from '../utils/debug.js'
import { tweet } from '../utils/twitter.js'
import { client } from '../utils/discord.js'
import { tg } from '../utils/telegram.js'
// import { Message } from '@cryb/mesa'
import { get, set } from '../utils/db2.js'
import type { HTCheckConfig } from '../types/HTCheckConfig.type.js'
import type { HTHost } from '../types/HTHost.type.js'
import type { HTRevisionHistory } from '../types/HTRevisionHistory.type.js'

const config: HTCheckConfig = {
    sendToDiscord: true,
    sendToTelegram: true,
    sendToTwitter: false
}

/**
 * Splits a hostname into an HTHost object.
 * @param {string} hostname Hostname returned from an axios.head() request.
 * @returns {HTHost} Split up hostname object
 */
function k8sSplit(hostname: string): HTHost {
    const splitHostname: string[] = hostname.split('-')

    if (splitHostname.length >= 3) {
        const podHash = splitHostname.pop()!
        const clusterHash = splitHostname.pop()!

        return {
            serviceName: splitHostname.join('-'),
            clusterHash,
            podHash
        }
    } else throw new Error('The array is too short.')
}

async function check(apiHost: string, friendlyHostname: string) {
    /**
     * This is the specific debug namespace for friendlyHostname.
     */
    const d = debug.extend(friendlyHostname)

    try {
        d('Checking endpoint.')

        const { headers } = await axios.head(apiHost)
        const { clusterHash: rev } = k8sSplit(headers['x-hostname'])
        const localRev = await get<string>(`lastRevision_${friendlyHostname}`)

        if (typeof localRev === 'undefined') {
            // There is no local revision set. Set the revision and bail.
            d('No local revision for this endpoint! Setting and bailing.')
            await set<string>(`lastRevision_${friendlyHostname}`, rev)
            return
        }

        if (localRev === rev) {
            d('No change between localRev and rev. localRev is %s, remoteRev is %s.', localRev, rev)
        } else {
            // The hashes are different, but we could be catching the endpoint in the middle of a redeploy.
            // In this case, we need to check revisionHistory.
            let revHistory = await get<HTRevisionHistory[]>('revisionHistory')

            if (typeof revHistory === 'undefined') {
                // Fail-safe here, we need to actually set the revisionHistory key in db2.
                await set<HTRevisionHistory[]>('revisionHistory', [])
                revHistory = await get<HTRevisionHistory[]>('revisionHistory')
            }

            // Check if this was a previous hash. If so, return.
            // NOTE: We're using the non-null assertion operator (!) here because we've already handled
            //       what to do if revHistory returns undefined above.
            const previousHashes: HTRevisionHistory | undefined = revHistory!.find((el: HTRevisionHistory) => el.name === friendlyHostname && el.rev === rev)

            if (typeof previousHashes === 'undefined') {
                // If we get an undefined value here, there is nothing in the revision history and we've probably hit a new hash.
                d('The localRev and remoteRev do not match, and there is no match in the revisionHistory.')

                if (config.sendToDiscord) {
                    await client.send({
                        content: 'Hear ye hear ye, new API',
                        embeds: [{
                            title: `${friendlyHostname} Changed`,
                            description: `\`${friendlyHostname}\`'s revision has changed! This could indicate a scale-up or new API changes.`,
                            color: 'RANDOM',
                            fields: [
                                {
                                    name: 'Old Revision',
                                    value: `\`${localRev}\``,
                                    inline: true
                                },
                                {
                                    name: 'New Revision',
                                    value: `\`${rev}\``,
                                    inline: true
                                }
                            ],
                            timestamp: new Date()
                        }]
                    })
                }

                if (config.sendToTelegram) {
                    await tg(`${friendlyHostname}'s revision has changed! This could indicate a scale-up or new API changes.\n\nOld Revision: ${localRev}\nNew Revision: ${rev}\nDate: ${new Date()}`)
                }

                if (config.sendToTwitter) {
                    await tweet(`🛠️ I've detected that ${friendlyHostname}'s revision has changed. This could indicate an API change or a scale-up.\n\nOld revision: ${localRev}\nNew revision: ${rev}`)
                }

                // To ensure we don't send out duplicates, create a new HTRevisionHistory object and append it to the revHistory.
                // Then we write this back.
                const newHistoryEntry: HTRevisionHistory = {
                    name: friendlyHostname,
                    rev
                }

                // See note at L77-78 for the reason the non-null assertion operator is used here.
                revHistory!.push(newHistoryEntry)
                await set('revisionHistory', revHistory)

                // Now set the new hash.
                await set(`lastRevision_${friendlyHostname}`, rev)

                return
            } else {
                // We've hit a duplicate.
                d('The localRev and remoteRev do not match, but they match something previously in the revisionHistory.')

                await set(`lastRevision_${friendlyHostname}`, rev)

                return
            }
        }
    } catch (error: any) {
        console.error('CommonCheck error!', error)
        d('An error occurred when sending a request to the endpoint.')
    }
}

export default check