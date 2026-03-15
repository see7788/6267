import { ObjBase_t, resFunCreate, ObjExtendsReturninfer_t, send_t } from "../public/ts"
import WsClient, { WebSocketServer } from "ws"//文档中的客户端是 引用 WebSocket 中具有客户端角色的后端 通信。浏览器客户端必须使用本机 WebSocket 对象。要使相同的代码在 Node.js 和浏览器上无缝运行，您需要 可以使用 npm 上可用的许多包装器之一，例如 isomorphic-ws。
export class WsClientCreate {
    protected obj
    constructor({ url }: { url: string }) {
        const obj = this.obj = new WsClient([url].join("/"));
        obj.onerror = (e) => console.log('ws onerror %s', e)
        obj.onclose = (e) => console.log('ws onclose %s', e)
        obj.onopen = () => {
            console.log('ws open');
            // sendInit(v => c.send(JSON.stringify(v)))
        }
    }
    onmessageInit<T extends ObjBase_t>(apisObj: ObjExtendsReturninfer_t<T>) {
        const call = resFunCreate(apisObj)
        this.obj.onmessage = data => {
            try {
                const db = JSON.parse(data.data.toString())
                call(db)
            } catch (error) {
                console.error({ data, error })
            }
        }
    }
    sendInit<T extends ObjBase_t>(): send_t<T> {
        return (api, db) => new Promise((ok, err) => this.obj.send(JSON.stringify([api, db]), e => {
            if (e) {
                err(e)
            } else {
                ok()
            }
        }))
    }
    disconnect() {
        return this.obj.close()
    }
}
type WsServerCreateParam_t = { port: number }
export class WsServerCreate {
    protected obj: WebSocketServer
    constructor({ port }: WsServerCreateParam_t) {
        this.obj = new WebSocketServer({ port: port });
        this.obj.on("listening", () => console.log("WsServer success"))
    }
    sendOmitMy<T extends ObjBase_t>(my: WsClient): send_t<T> {
        return async (api, db) => this.obj.clients.forEach((client) => {
            if (client !== my && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify([api, db]), { binary: false });
            }
        })
    }
    sendAll<T extends ObjBase_t>(): send_t<T> {
        return async (api, db) => this.obj.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify([api, db]), { binary: false });
            }
        })
    }
    disconnect() {
        return this.obj.close()
    }
    connectionInit<T extends ObjBase_t>(apisObj: ObjExtendsReturninfer_t<T>) {
        const call = resFunCreate(apisObj)
        this.obj.on('connection', (c, req) => {
            //console.log("server.wsCreate port", wsPort);
            // const ip = req.socket.remoteAddress;//获取客户ip
            c.onerror = (e) => console.log('ws onerror %s', e)
            c.onclose = (e) => console.log('ws onclose %s', e)
            c.onmessage = async (data) => {
                try {
                    const qstr = data.data.toString('utf8')
                    const qobj = JSON.parse(qstr)
                    const c2=[...qobj,c]
                  //  await call(c2)
                    //c.send(astr);
                } catch (error) {
                    console.error({ data, error })
                }
            };
        });
    }

}