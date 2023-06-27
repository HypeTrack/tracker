import { type HTCheckType } from "./HTCheckType.type"

export type HTCheck = {
    /** Type of check */
    type: HTCheckType,

    /** Params to pass to the check method. */
    // rome-ignore lint/suspicious/noExplicitAny: Types can be anything on this, honestly. Too lazy to give it explicit types.
    params: any[]
}