import fs from 'fs'
import debug from 'debug'

const db2Debug = debug('db2')

const filename = 'tracker.json'
let db: Record<string, any> = {}

async function init() {
    try {
        db2Debug('Initializing in-mem database...')
        db = await getDbFromDisk()
        db2Debug('Done! DB is in-memory now.')
        db2Debug(db)
    } catch (_) {
        db2Debug('DB not found on disk. Creating new, empty database.')
        db = {}
        await serializeDbToDisk()
    }
}

async function getDb() {
    if (db.length === 0)
        init()

    return db
}

async function serializeDbToDisk() {
  db2Debug('Syncing database to disk for persistence.')
  db['diskSyncTime'] = Date.now()
  db2Debug(db)
  const serializedDb = JSON.stringify(db)
  db2Debug(serializedDb)
  await fs.promises.writeFile(filename, serializedDb)
  delete db.diskSyncTime
  db2Debug('Done syncing database.')
}

async function getDbFromDisk() {
  try {
    db2Debug(`Attempting to read database from disk from ${filename}.`)
    const serializedDb = await fs.promises.readFile(filename, { encoding: 'utf-8' })
    db2Debug(`Database read from disk.`)
    return JSON.parse(serializedDb)
  } catch (e: any) {
      db2Debug.extend('error')(`Error reading database from disk: %s`, e.message)
      throw new Error(e.message)
  }
}

async function get<T>(key: string): Promise<T | undefined> {
    db2Debug(`Getting value for key ${key}`)
    return db[key]
}

async function set<T>(key: string, val: T): Promise<T> {
    db2Debug(`Setting value for key ${key} to ${val}`)
    db[key] = val

    return db[key]
}

async function getTypeOfKey(key: string) {
    db2Debug(`Getting type of key ${key}`)
    return typeof key
}

export {
    init,
    serializeDbToDisk,
    getDb,
    getDbFromDisk,
    get,
    set,
    getTypeOfKey
}