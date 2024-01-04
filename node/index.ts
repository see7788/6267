import { RequestHandler } from "express"
import MyMysql from "./mysql"
import WsClient, { WebSocketServer } from "ws"//文档中的客户端是 引用 WebSocket 中具有客户端角色的后端 通信。浏览器客户端必须使用本机 WebSocket 对象。要使相同的代码在 Node.js 和浏览器上无缝运行，您需要 可以使用 npm 上可用的许多包装器之一，例如 isomorphic-ws。
import t, { Obj_t, CallObjInit, ObjExtendsReturninfer_t, call_t,send_t } from "../.t"
import aedesCreate from "./aedes"
// process.on("uncaughtException", (err) => {
//     console.log(__filename + "Uncaught exception:", err);
// });


export const client = {
    ...t,
    WsCreate: class <Server extends Obj_t> {
        private obj
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
        send: send_t<Server> = (api, db) =>this.obj.send(JSON.stringify({ api, db }))
        disconnect() {
            return this.obj.close()
        }
    },
    MyMysql
}
type WsServerCreateParam_t = { port: number }
export const server = {
    expressRequestHandlerCreate<Server extends Obj_t>(apiObj: Server): RequestHandler {
        const callback = CallObjInit(apiObj)
        return (req, res, next) => {
            //const api =param.api?.toString()||"";// req.path.substring(1);
            callback(req.query as any).then(v => res.send(v)).catch((e) => {
                console.log("expressRequestHandlerCreate", e)
                next()
            })
        }
    },
    aedesCreate,
    WsCreate: class <Server extends Obj_t> {
        private obj: WebSocketServer
        constructor(apisObj: Server, { port }: WsServerCreateParam_t) {
            const call = CallObjInit(apisObj)
            this.obj = new WebSocketServer({ port: port });
            this.obj.on('connection', (c, req) => {
                //console.log("server.wsCreate port", wsPort);
                // const ip = req.socket.remoteAddress;//获取客户ip
                c.on('error', (e) => console.error("error", e));
                c.on('message', function (data, isBinary) {
                    try{
                        const db = JSON.parse(data.toString('utf8'))
                        call(db)
                    }catch(error){
                        console.error({ data, error })
                    }
                    //广播//client !== ws排除自身
                    // root.clients.forEach(function each(client) {
                    //     if (client !== c && client.readyState === WebSocket.OPEN) {
                    //         client.send(data, { binary: false });
                    //     }
                    // });
                });
            });
        }
        sendAll:send_t<Server>=(api,db)=> {
            this.obj.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ api, db }), { binary: false });
                }
            })
        }
        disconnect() {
            return this.obj.close()
        }

    },
    ipcTest() {
        //ipc.server.mqttCreate({ wsPort: 8083, tcpPort: 1883 })
        //const c = ipc.client.mqttCreate<typeof testApi>()
        //c.on()
        // c.subscribe("param", "#")
        // c.publish("return", "test", JSON.stringify({ a: "node" }) as any)
        // server.wsCreate<typeof testApi>({ wsPort: 8085, apis: testApi })
        //ipc.client.wsCreate("ws://127.0.0.1:8085")
        //return { expressRequestHandler: server.expressRequestHandlerCreate(testApi) }
    }
}
