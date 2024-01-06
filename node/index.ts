import expressCreate from "./express"
import MyMysql from "./mysql"
import AxioxCreate from "../public/axiox"
import MqttCreate from "../public/mqtt"
import AedesCreate from "./aedes"
import {WsClientCreate,WsServerCreate} from "./ws"
// process.on("uncaughtException", (err) => {
//     console.log(__filename + "Uncaught exception:", err);
// });


export const client = {
    AxioxCreate,
    MqttCreate,
    WsCreate:WsClientCreate,
    MyMysql
}
export const server = {
    expressCreate,
    AedesCreate,
    WsCreate: WsServerCreate,
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
