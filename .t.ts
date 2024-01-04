import axios, { AxiosResponse } from "axios"
import { z } from 'zod';
import mqttClient from "mqtt"
type Returninfer_t<T extends (db: any) => Promise<any> | any> = ReturnType<T> extends Promise<infer R> ? R : ReturnType<T>
export type Obj_t = { [k in string]: (db: any) => Promise<any> | any }
export type ObjExtendsReturninfer_t<T extends Obj_t> = { [K in keyof T]: (db: Returninfer_t<T[K]>) => Promise<any> | any }
export type send_t<T extends Obj_t> = <K extends keyof T>(api: K extends string ? K : never, db: Parameters<T[K]>[0]) => any
export type call_t<T extends Obj_t> = <K extends keyof T>(api: K extends string ? K : never, db: Parameters<T[K]>[0]) => Promise<{ api: K, db: Returninfer_t<T[K]> }>
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
  disconnect
  constructor(apisObj: ObjExtendsReturninfer_t<Server>, { url, op, connect }: MqttCreateParam_t) {
    // url = "mqtt://39.97.216.195:1883"//tcp
    // url = "ws://39.97.216.195:8083/mqtt"//ws
    const call = CallObjInit(apisObj)
    const c = this.mqttObj = mqttClient.connect(url, {
      clientId: Math.random().toString(16).substring(2, 8),
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
  subscribe<T extends keyof Server>(api: T extends string ? T : never) {
    return this.mqttObj.subscribe(
      api,  //通配符#+在//之间或者末尾:#任意层，+一层
      {
        qos: 2,//MQTT v5 中，如果你在订阅时将此选项设置为 1，那么服务端将不会向你转发你自己发布的消息
      },
      (e, granted) => {
        //granted订阅成功，QoS 等级为
      });
  }
  publish: send_t<Server> = (api, db) => this.mqttObj.publish(api, JSON.stringify(db), { qos: 2 })
}
export default { HttpCreate, MqttCreate }
type getUse_t = {
  email: string,
  name: string,
  c: number
}
export const testApi = {
  async getUse(params: getUse_t) {
    const token: z.ZodType<getUse_t> = z.object({
      email: z.string().email(),
      name: z.string(),
      c: z.number()
    });
    await token.parseAsync(params)//.then(() => 123).catch(v => "error");
    return 123
  },
  async test() {
    // throw new Error(JSON.stringify({
    //     ok:"xxx"
    // }))
    return "11"
  }
}

// const ccc = new HttpCreate()
//   .getInit<typeof testApi>(
//     "",
//     {
//       test: n => n,
//       getUse: n => n
//     })("test",undefined)