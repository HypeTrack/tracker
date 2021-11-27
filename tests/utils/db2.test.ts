jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn().mockResolvedValue(JSON.stringify({ key: 'value' })),
        writeFile: jest.fn().mockResolvedValue(undefined)
    }
}))

import fs from 'fs'
import { getDbFromDisk } from '../../src/utils/db2'

describe('DB2', () => {
    it('Attempts to read a database from disk on getDbFromDisk() being called.', async () => {
        const res = await getDbFromDisk()

        expect(fs.promises.writeFile).toHaveBeenCalledTimes(1)

        expect(res).toEqual({ key: 'value' })
    })
})