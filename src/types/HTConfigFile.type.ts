import { type HTConfig } from './HTConfig.type'

export type HTConfigFile = {
    /** Schema version */
    __v: number,

    /** Config root */
    config: HTConfig
}