export type HTDB2Config = {
    /** Whether or not to serialize the database to disk when the program starts */
    serializeOnBoot: boolean

    /** Cron string to determine how often the database gets serialized to disk. */
    serializeCronString: string
}