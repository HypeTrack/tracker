import { type HTDB2Config } from "./HTDB2Config.type"
import { type HTCheck } from "./HTCheck.type"
export type HTConfig = {
    /** Options to configure DB2 (the in-memory database) */
    db2: HTDB2Config

    /** The time to wait between checks. */
    timeoutMs: number,

    /** Configured checks to run. */
    checks: HTCheck[]
}