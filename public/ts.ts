import { z } from 'zod';
export type Returninfer_t<T extends (db: any) => Promise<any> | any> = ReturnType<T> extends Promise<infer R> ? R : never////ReturnType<T>
export type Obj_t = { [k in string]: (db: any) => Promise<any> }// | any }
export type ObjExtendsReturninfer_t<T extends Obj_t> = { [K in keyof T]: (db: Returninfer_t<T[K]>) => Promise<any> }// | any }
export type send_t<T extends Obj_t> = <K extends keyof T>(api: K, db: Parameters<T[K]>) => void
export type call_t<T extends Obj_t> = <K extends keyof T>(api: K, db: Parameters<T[K]>) => Promise<{ api: K, db: Returninfer_t<T[K]> }>
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


// class MyClass {
//   overloaded(arg: string): number;
//   overloaded(arg: number): string;
//   overloaded(arg: string | number): string | number {
//     switch (typeof arg) {
//       case "string":
//         return "";
//       case "number":
//         return 123;
//       case "bigint":
//         return 123
//     }
//   }
// }

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