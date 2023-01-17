export default class DataAdapter {
    data = {}

    constructor (data: any) {
        this.data = data
    }

    get (key: string) {
        return this.data[key]
    }

    set (key: string, value: any) {
        this.data[key] = value
    }
}