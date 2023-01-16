export default class InvalidHTConfigException extends Error {
    constructor() {
        super('Invalid HTConfig file!')
    }
}