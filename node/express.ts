import { Obj_t, CallObjInit } from "../public/ts"
import express from "express"
import cors from 'cors';
import bodyParser from "body-parser"
import cookieParser from 'cookie-parser';
export default class {
    protected obj
    constructor() {
        this.obj = express();
    }
    routerTpl<T extends Obj_t>(path: string, apiObj: T) {
        const call = CallObjInit(apiObj)
        this.obj.use(path, cors({ credentials: true, }))// 允许跨域请求携带 cookie
        this.obj.use(path, cookieParser());
        this.obj.use(path, express.json())
        this.obj.use(path, express.urlencoded())
        this.obj.use(path, (req, res, next) => {
            //const api =param.api?.toString()||"";// req.path.substring(1);
            call(req.query as any).then(v => res.send(v)).catch((e) => {
                console.log("express", e)
                next()
            })
        })
        return this
    }
}