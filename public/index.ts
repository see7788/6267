import axios, { AxiosResponse } from "axios"
import { z } from 'zod';
import mqttClient from "mqtt"
type Returninfer_t<T extends (db: any) => Promise<any> | any> = ReturnType<T> extends Promise<infer R> ? R : never//ReturnType<T>
export type Obj_t = { [k in string]: (db: any) => Promise<any> }// | any }
export type ObjExtendsReturninfer_t<T extends Obj_t> = { [K in keyof T]: (db: Returninfer_t<T[K]>) => Promise<any> }// | any }
export type send_t<T extends Obj_t> = <K extends keyof T>(api: K, db: Parameters<T[K]>[0]) => void
export type call_t<T extends Obj_t> = <K extends keyof T>(api: K, db: Parameters<T[K]>[0]) => Promise<{ api: K, db: Returninfer_t<T[K]> }>
export function CallObjInit<T extends Obj_t>(apiObj: T) {
  return function <K extends keyof T>({ api, db }: { api: K, db: Parameters<T[K]>[0] }): Promise<{ api: K, db: Returninfer_t<T[K]> }> {
    return new Promise(async (ok, err) => {
      if (Object.prototype.hasOwnProperty.call(apiObj, api) && typeof apiObj[api] === "function") {
        try {
          const rs = { api, db: await apiObj[api](db) }
          ok(rs)
        } catch (error) {
          err({ api, error: String(error) })
        }
      } else {
        err({ api, error: "api not in apiObj" })
      }
    })
  }
}
class HttpCreate {
  private c
  constructor() {
    this.c = axios.create({
      timeout: 5000, // 请求超时时间，单位为毫秒
    });
  }
  postInit<Server extends Obj_t>(url: string, apisObj: ObjExtendsReturninfer_t<Server>): call_t<Server> {
    const call = CallObjInit(apisObj)
    return (api, db) => new Promise(async (ok, err) => {
      try {
        type K = typeof api
        const { data } = await this.c.post<Parameters<Server[K]>, AxiosResponse<{ api: K, db: Returninfer_t<Server[K]> }>>([url].join("/"), { api, db })
        return call(data).then(ok)
      } catch (e) {
        err({ api, error: String(e) })
      }
    })
  }
  getInit<Server extends Obj_t>(url: string, apisObj: ObjExtendsReturninfer_t<Server>): call_t<Server> {
    const call = CallObjInit(apisObj)
    return (api, db) => new Promise(async (ok, err) => {
      try {
        type K = typeof api
        const { data } = await this.c.get<Parameters<Server[K]>, AxiosResponse<{ api: K, db: Returninfer_t<Server[K]> }>>([url].join("/"), { params: { api, db } })
        return call(data).then(ok)
      } catch (e) {
        err({ api, error: String(e) })
      }
    })
  }
}
type MqttCreateParam_t = { url: string, op: mqttClient.IClientOptions, connect: (c: mqttClient.IConnackPacket) => void }
class MqttCreate<Server extends Obj_t> {
  private mqttObj
  private clientId
  disconnect
  constructor(apisObj: ObjExtendsReturninfer_t<Server>, { url, op, connect }: MqttCreateParam_t) {
    // url = "mqtt://39.97.216.195:1883"//tcp
    // url = "ws://39.97.216.195:8083/mqtt"//ws
    const call = CallObjInit(apisObj)
    const clientId = this.clientId = Math.random().toString(16).substring(2, 8)
    const c = this.mqttObj = mqttClient.connect(url, {
      clientId,
      // username: op.username,
      // password: op.password,
      protocolVersion: 5,
      reconnectPeriod: 5000,//断线重连间隔
      connectTimeout: 1000, // 超时时间
      ...op
    })
    this.disconnect = this.mqttObj.end
    this.mqttObj.on("connect", connect)
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
    return this.mqttObj.subscribe(
      this.clientId,  //通配符#+在//之间或者末尾:#任意层，+一层
      {
        qos: 2,//MQTT v5 中，如果你在订阅时将此选项设置为 1，那么服务端将不会向你转发你自己发布的消息
      },
      (e, granted) => {
        //granted订阅成功，QoS 等级为
      });
  }
  publish: send_t<Server> = (api, db) => {
    this.mqttObj.publish(this.clientId, JSON.stringify({ api, db }), { qos: 2 })
  }
}
export default { HttpCreate, MqttCreate }
type getUse_t = {
  email: string,
  name: string,
  c: number
}
export const testApi = {
  async getUse({ email, name, c }: getUse_t) {
    const token: z.ZodType<getUse_t> = z.object({
      email: z.string().email(),
      name: z.string(),
      c: z.number()
    });
    await token.parseAsync({ email, name, c })//.then(() => 123).catch(v => "error");
    return { email, name }
  },
  async test(c: string) {
    // throw new Error(JSON.stringify({
    //     ok:"xxx"
    // }))
    if (c.length / 2) {
      return 11111111
    } else {
      return "1111111111"
    }
  }
}
type c1_t = ObjExtendsReturninfer_t<typeof testApi>
const c1: c1_t = {
  test: async (c) => c,
  getUse: async (c) => c
}
const c2 = new HttpCreate().getInit<typeof testApi>("", c1);
const c3 = c2("test", "111")