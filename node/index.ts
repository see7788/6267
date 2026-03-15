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
}
