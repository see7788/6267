import { z } from 'zod';
// export type Returninfer_t<T extends (db: any) => Promise<any> | any> = ReturnType<T> extends Promise<infer R> ? R : never////ReturnType<T>
export type ObjBase_t = { [k in string]: (db: any) => Promise<any> }// | any }
export type ObjExtendsReturninfer_t<T extends ObjBase_t> = { [K in keyof T]: (arr: Awaited<ReturnType<T[K]>>) => Promise<any> }// | any }
export type send_t<T extends ObjBase_t> = <K extends keyof T>(api: K, arr: Parameters<T[K]>[0]) => Promise<void>
export type call_t<T extends ObjBase_t> = <K extends keyof T>(api: K, arr: Parameters<T[K]>[0]) => Promise<[api: K, db: Awaited<ReturnType<T[K]>>]>
export function resFunCreate<T extends ObjBase_t>(apiObj: T) {
  return function <K extends keyof T>([api, arr]: [api: K, arr: Parameters<T[K]>[0]]): Promise<[api: K, db: Awaited<ReturnType<T[K]>>]> {
    return new Promise(async (ok, err) => {
      if (Object.prototype.hasOwnProperty.call(apiObj, api) && typeof apiObj[api] === "function") {
        try {
          const data = await apiObj[api](arr)
          ok([api, data])
        } catch (error) {
          err({ api, error: String(error) })
        }
      } else {
        err({ api, error: "api not in apiObj" })
      }
    })
  }
}
// enum ColorsEnum {
//   white = '#ffffff',
//   black = '#000000',
// }

// type Colors = keyof typeof ColorsEnum;
export const testApi = {
  async getUse<T extends {
    email: string,
    name: string,
    c: number
  }>({ email, name, c }: T) {
    const data = await z.object({
      email: z.string().email(),
      name: z.string(),
      c: z.number()
    }).parseAsync({ email, name, c })//.then(() => 123).catch(v => "error");
    return data;
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