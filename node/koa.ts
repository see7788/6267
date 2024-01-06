import { Obj_t, CallObjInit } from "../public/ts"
import koa from "koa"
import bodyParser from "koa-body"
import Router from "koa-router"
import cookieParser from "koa-cookie"
import cors from "koa-cors"
export default class {
    protected obj
    constructor() {
        this.obj = new koa()
    }
    routerTpl<T extends Obj_t>(path: string, apiObj: T) {
        const call = CallObjInit(apiObj)
        const router = new Router();
        router.use(cors({ credentials: true, }))// 允许跨域请求携带 cookie
        router.use(cookieParser());        // 解析 cookie
        router.use(bodyParser());    // 解析 JSON 请求体
        router.use((ctx, next) => {
            call(ctx.query as any).then(v => {
                ctx.body = v
            }).catch((e) => {
                console.log("koa", e)
                next()
            })
        })
        router.use(router.allowedMethods());
        this.obj.use(router.routes())
        return this
    }
}