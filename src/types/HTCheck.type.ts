import { type HTCheckType } from "./HTCheckType.type"

export type HTCheck = {
    /** Type of check */
    type: HTCheckType,

    /** Params to pass to the check method. */
    params: any[]
}