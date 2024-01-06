import axios, { AxiosResponse } from "axios"
import {Obj_t,ObjExtendsReturninfer_t,Returninfer_t,call_t,CallObjInit} from "./ts"
export default class {
    protected app
    constructor() {
      this.app = axios.create({
        timeout: 5000, // 请求超时时间，单位为毫秒
      });
    }
    postInit<Server extends Obj_t>(url: string, apisObj: ObjExtendsReturninfer_t<Server>): call_t<Server> {
      const call = CallObjInit(apisObj)
      return (api, db) => new Promise(async (ok, err) => {
        try {
          type K = typeof api
          const { data } = await this.app.post<Parameters<Server[K]>, AxiosResponse<{ api: K, db: Returninfer_t<Server[K]> }>>([url].join("/"), { api, db })
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
          const { data } = await this.app.get<Parameters<Server[K]>, AxiosResponse<{ api: K, db: Returninfer_t<Server[K]> }>>([url].join("/"), { params: { api, db } })
          return call(data).then(ok)
        } catch (e) {
          err({ api, error: String(e) })
        }
      })
    }
  }