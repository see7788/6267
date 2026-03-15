import { ObjBase_t, send_t, ObjExtendsReturninfer_t, resFunCreate } from "../public/ts"
type WsCreateParam_t = { url: string, onopen: (e: Event) => void }

export default class {
    private obj
    constructor({ url, onopen }: WsCreateParam_t) {
        const c = this.obj = new WebSocket([url].join("/"))
        c.onclose = (e) => console.log('ws onclose %s', e)
        c.onerror = (e) => console.log('ws onerror %s', e)
        c.onopen = onopen
    }
    disconnect() {
        return this.obj.close()
    }
    sendInit<T extends ObjBase_t>(): send_t<T> {
        return (api, db) => new Promise((ok, err) => {
            try {
                this.obj.send(JSON.stringify([api, db]))
                ok()
            } catch (e) {
                err(e)
            }
        })
    }
    onmessageInit<T extends ObjBase_t>(apisObj: ObjExtendsReturninfer_t<T>) {
        const call = resFunCreate(apisObj)
        this.obj.onmessage = data => {
            try {
                const db = JSON.parse(data.data)
                call(db)
            } catch (error) {
                console.error({ data, error })
            }
        }
    }
}