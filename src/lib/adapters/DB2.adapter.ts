import DataAdapter from "./DataAdapter";
import fs from 'node:fs/promises'
import debug from 'debug'

const db2Debug = debug('db2')

class DB2Adapter extends DataAdapter {
    private filename: string = 'tracker.json'

    constructor() {
        super({})
        this.init()
    }

    async init () {
        try {
            db2Debug('Initializing DB2 adapter')
            this.data = await this.getDbFromDisk()
            db2Debug('Done!')
            db2Debug(this.data)
        } catch (_) {
            db2Debug('No database found in fs, creating new database.')
            this.data = {}
            await this.serializeDbToDisk()
        }
    }

    async getDb () {
        if (Object.keys(this.data).length === 0) {
            await this.init()
        }

        return this.data
    }

    async serializeDbToDisk () {
        db2Debug('Serializing database to disk.')
        this.data['diskSyncTime'] = Date.now()
        db2Debug('Database: ' + this.data)
        const serializedDb = await JSON.stringify(this.data)
        db2Debug('Serialized: ' + serializedDb)
        await fs.writeFile(this.filename, serializedDb)
        this.data.diskSyncTime = undefined;
        db2Debug('Synced to disk.')
    }

    async getDbFromDisk () {
        try {
            db2Debug(`Attempting to read database from disk from ${this.filename}`)
            const serializedDb = await fs.readFile(this.filename, { encoding: 'utf-8' })
            db2Debug('Database read from disk.')
            return JSON.parse(serializedDb)
        } catch (e: any) {
            db2Debug.extend('error')('Error reading database from disk: %s', e.message)
            throw e
        }
    }

    async getTypeOfKey (key: string) {
        db2Debug('Getting type of key %s', key)
        return typeof this.data[key]
    }
}

export default DB2Adapter
