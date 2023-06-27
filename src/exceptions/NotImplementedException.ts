export default class NotImplementedException extends Error {
    constructor() {
        super('Method is not implemented')
    }
}
