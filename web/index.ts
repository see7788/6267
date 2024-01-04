import t, { Obj_t, send_t, ObjExtendsReturninfer_t, CallObjInit } from "../public"
import { StreamCreate } from "./streamPort"
type WsCreateParam_t = { url: string, onopen: (e: Event) => void }
export default {
    ...t,
    StreamCreate,
    WsCreate: class <T extends Obj_t> {
        private obj
        constructor(apisObj: ObjExtendsReturninfer_t<T>, { url, onopen }: WsCreateParam_t) {
            const call = CallObjInit(apisObj)
            const c = this.obj = new WebSocket([url].join("/"))
            c.onclose = (e) => console.log('ws onclose %s', e)
            c.onerror = (e) => console.log('ws onerror %s', e)
            c.onmessage = (data) => {
                try {
                    const db = JSON.parse(data.data)
                    call(db)
                } catch (error) {
                    console.error({ data, error })
                }
            }
            c.onopen = onopen
        }
        disconnect() {
            return this.obj.close()
        }
        send: send_t<T> = (api, db) => {
            return this.obj.send(JSON.stringify({ api, db }))
        }
    }

}