import { Obj_t, CallObjInit, ObjExtendsReturninfer_t, send_t } from "../public/ts"
import WsClient, { WebSocketServer } from "ws"//文档中的客户端是 引用 WebSocket 中具有客户端角色的后端 通信。浏览器客户端必须使用本机 WebSocket 对象。要使相同的代码在 Node.js 和浏览器上无缝运行，您需要 可以使用 npm 上可用的许多包装器之一，例如 isomorphic-ws。
export class WsClientCreate<Server extends Obj_t> {
    protected obj
    constructor({ url, apisObj }: { url: string, apisObj: ObjExtendsReturninfer_t<Server> }) {
        const call = CallObjInit(apisObj)
        const obj = this.obj = new WsClient([url].join("/"));
        obj.onerror = (e) => console.log('ws onerror %s', e)
        obj.onclose = (e) => console.log('ws onclose %s', e)
        obj.onmessage = (data) => {
            try {
                const db = JSON.parse(data.data.toString())
                call(db)
            } catch (error) {
                console.error({ data, error })
            }
        }
        obj.onopen = () => {
            console.log('ws open');
            // sendInit(v => c.send(JSON.stringify(v)))
        }
    }
    send: send_t<Server> = (api, db) => this.obj.send(JSON.stringify({ api, db }))
    disconnect() {
        return this.obj.close()
    }
}
type WsServerCreateParam_t = { port: number }
export class WsServerCreate<Server extends Obj_t> {
    protected  obj: WebSocketServer
    protected  call
    constructor(apisObj: Server, { port }: WsServerCreateParam_t) {
        this.call = CallObjInit(apisObj)
        this.obj = new WebSocketServer({ port: port });
    }
    //广播
    sendAll: send_t<Server> = (api, db) => {
        this.obj.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ api, db }), { binary: false });
            }
        })
    }
    disconnect() {
        return this.obj.close()
    }
    connection(){
        this.obj.on('connection', (c, req) => {
            //console.log("server.wsCreate port", wsPort);
            // const ip = req.socket.remoteAddress;//获取客户ip
            c.onerror = (e) => console.log('ws onerror %s', e)
            c.onclose = (e) => console.log('ws onclose %s', e)
            c.onmessage = async (data) => {
                try {
                    const qstr = data.data.toString('utf8')
                    const qobj = JSON.parse(qstr)
                    const aobj = await this.call(qobj)
                    const astr = JSON.stringify(aobj)
                    //c.send(astr);
                    //广播//client !== ws排除自身
                    this.obj.clients.forEach(function each(client) {
                        if (client !== c && client.readyState === WebSocket.OPEN) {
                            client.send(astr, { binary: false });
                        }
                    });
                } catch (error) {
                    console.error({ data, error })
                }
            };
        });
    }

}