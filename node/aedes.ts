
import aedes from "aedes"
import { createServer as aedesfactory } from "aedes-server-factory"
import { Obj_t,CallObjInit } from "../.t"
type aedesCreateParam_t={ wsPort?: number, tcpPort?: number}
export default class <T extends Obj_t> {
    private c
    constructor(apisObj: T ,{ wsPort, tcpPort }:aedesCreateParam_t) {
        const c = this.c = new aedes();
        //aedes.connectedClients 获取客户端明细
        //连接
        c.on('client', function (client) {
            console.log('server.mqtt.client:', client.id, c.connectedClients);
        });
        //连接拦截
        c.authenticate = function (client, username, password, callback) {
            console.log('server.mqtt.authenticate', username, password?.toString())//,client);
            callback(null, true)
            // callback(null, (username === 'user' && password?.toString() === '123456'));
        }
        // 客户端断开事件
        c.on('clientDisconnect', function (client) {
            console.log('server.mqtt.clientDisconnect: \x1b[31m' + (client ? client.id : client) + '\x1b[0m', 'to broker', c.id);
        });
        //发布
        c.on("publish", (packet) => {
            if (packet?.cmd) {
                console.log("server.mqtt.publish", { ...packet, payload: packet?.payload?.toString() });
            }
        })
        //发布拦截
        c.authorizePublish = function (client, packet, callback) {
            console.log("server.mqtt.authorizePublish", packet?.topic, packet?.payload?.toString());
            //callback(new Error('=======authorizePublish========'));//拦截
            callback(undefined);//放行
        }
        //监听
        c.on("subscribe", (e, c) => console.log("server.mqtt.subscribe", e))
        //监听拦截
        c.authorizeSubscribe = function (client, sub, callback) {
            console.log("server.mqtt.authorizeSubscribe", sub)//,client, sub);
            // callback(new Error('==========authorizeSubscribe========='));//拦截
            callback(null, sub);
        }
        // 使用 Websocket 协议传输的 Broker 
        if (wsPort) aedesfactory(c, { ws: true }).listen(wsPort, function () {
            console.info("Aedes MQTT Websocket server listening on port ", wsPort);
        });
        // 使用 TCP 协议传输的 Broker
        if (tcpPort) aedesfactory(c, { trustProxy: true }).listen(tcpPort, function () {
            console.info("Aedes MQTT TCP server started and listening on port ", tcpPort);
        });
    }
    close():Promise<void> {
        return new Promise((ok)=>this.c.close(()=>ok()))
    }
}