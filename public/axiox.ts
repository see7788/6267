import axios, { AxiosResponse } from "axios"
import { ObjBase_t, ObjExtendsReturninfer_t, call_t, resFunCreate } from "./ts"
export default class {
  protected app
  constructor() {
    this.app = axios.create({
      timeout: 5000, // 请求超时时间，单位为毫秒
    });
  }
  postInit<Server extends ObjBase_t>(url: string, apisObj: ObjExtendsReturninfer_t<Server>): call_t<Server> {
    const call = resFunCreate(apisObj)
    return (api, db) => new Promise(async (ok, err) => {
      try {
        type K = typeof api
        const { data } = await this.app.post<Parameters<Server[K]>, AxiosResponse<[api: K, db: Awaited<ReturnType<Server[K]>>]>>([url].join("/"), [api, db])
        await call(data)
        ok(data)
      } catch (e) {
        err({ api, error: String(e) })
      }
    })
  }
  getInit<Server extends ObjBase_t>(url: string, apisObj: ObjExtendsReturninfer_t<Server>): call_t<Server> {
    const call = resFunCreate(apisObj)
    return (api, db) => new Promise(async (ok, err) => {
      try {
        type K = typeof api
        const { data } = await this.app.get<Parameters<Server[K]>, AxiosResponse<[api: K, db: Awaited<ReturnType<Server[K]>>]>>([url].join("/"), { params: [api, db] })
        await call(data)
        ok(data)
      } catch (e) {
        err({ api, error: String(e) })
      }
    })
  }
}