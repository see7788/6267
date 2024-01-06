import mqttClient from "mqtt"
import {Obj_t,ObjExtendsReturninfer_t,send_t,call_t,CallObjInit} from "./ts"
type MqttCreateParam_t = { url: string, op: mqttClient.IClientOptions, connect: (c: mqttClient.IConnackPacket) => void }
export default class <Server extends Obj_t> {
  private obj
  private clientId
  disconnect
  constructor(apisObj: ObjExtendsReturninfer_t<Server>, { url, op, connect }: MqttCreateParam_t) {
    // url = "mqtt://39.97.216.195:1883"//tcp
    // url = "ws://39.97.216.195:8083/mqtt"//ws
    const call = CallObjInit(apisObj)
    const clientId = this.clientId = Math.random().toString(16).substring(2, 8)
    const c = this.obj = mqttClient.connect(url, {
      clientId,
      // username: op.username,
      // password: op.password,
      protocolVersion: 5,
      reconnectPeriod: 5000,//断线重连间隔
      connectTimeout: 1000, // 超时时间
      ...op
    })
    this.disconnect = this.obj.end
    this.obj.on("connect", connect)
    c.on("disconnect", () => console.log("mqttCliet.disconnect主动断开连接"))
    c.on("close", () => console.log("mqttCliet.close关闭连接"))
    // client.on("packetreceive", (e) =>console.log("packetreceive", e))
    c.on("reconnect", () => console.log("mqttCliet.reconnect非主动断开连接"))
    c.on("offline", () => console.log("mqttCliet.offline下线"))
    c.on("outgoingEmpty", () => console.log("outgoingEmpty"))
    c.subscribe(
      this.clientId,  //通配符#+在//之间或者末尾:#任意层，+一层
      {
        qos: 2,//MQTT v5 中，如果你在订阅时将此选项设置为 1，那么服务端将不会向你转发你自己发布的消息
      },
      (e, granted) => {
        //granted订阅成功，QoS 等级为
      });
    c.on("message", (
      topic, //publish的第一个参数
      message
    ) => {
      // message is Buffer
      try {
        const { api, db } = JSON.parse(message.toString())
        call({ api, db })
      } catch (e) {
        console.log("mqtt onmessage", e)
      }
    })
  }
  subscribe(api: keyof Server) {
    return this.obj.subscribe(
      this.clientId,  //通配符#+在//之间或者末尾:#任意层，+一层
      {
        qos: 2,//MQTT v5 中，如果你在订阅时将此选项设置为 1，那么服务端将不会向你转发你自己发布的消息
      },
      (e, granted) => {
        //granted订阅成功，QoS 等级为
      });
  }
  publish: send_t<Server> = (api, db) => {
    this.obj.publish(this.clientId, JSON.stringify({ api, db }), { qos: 2 })
  }
}