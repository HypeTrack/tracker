import fs from 'node:fs/promises'
import InvalidHTConfigException from '../exceptions/InvalidHTConfigException'
import { type HTConfigFile } from '../types/HTConfigFile.type'

let config: HTConfigFile

export default async function getConfigFile (fileName: string = "tkrcfg.json") {
    if (config) {
        return config
    }

    // Open file.
    const file = await fs.open(fileName, 'r')

    // Read file.
    const fileContents = await file.readFile()

    // Parse file.
    const parsedFile = JSON.parse(fileContents.toString()) as HTConfigFile

    // Check if file is valid.
    if (!parsedFile) {
        throw new InvalidHTConfigException()
    }

    // Save config.
    config = parsedFile

    // Return json.
    return parsedFile
}