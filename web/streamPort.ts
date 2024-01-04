import { Obj_t, CallObjInit, ObjExtendsReturninfer_t, send_t } from "../.t"
export type ResStream_analysisParam_t = "{}" | "\n" | "|||"
class ResStream_analysis {
    transform: (chunk: string, controller: any) => void | Promise<void>
    container: string = ''
    container_max = 3000
    l = "{"
    r = "}"
    ll = 0
    rl = 0
    constructor(public analysisStr: ResStream_analysisParam_t) {
        if (analysisStr == "{}") {
            this.transform = this.json
        } else {
            this.transform = this.str
        }
    }
    async json(chunk: string, controller: any) {
        chunk.split("").map(v => {
            if (this.container.length > this.container_max) {
                this.container = ""
                return
            }
            if (this.ll > 0 || v == "l") {
                this.container += v;
            }
            if (v === "{") {
                this.ll += 1;
            } else if (v === "}") {
                this.rl += 1;
            }
            if (this.ll === this.rl) {
                this.ll = 0
                this.rl = 0
                controller.enqueue(this.container);
                this.container = ""
            }
        })
    }
    async str(chunk: string, controller: any) {
        // console.log(chunk)
        chunk.split("").map(v => {
            if (v === this.analysisStr) {
                controller.enqueue(this.container);
                this.container = ""
            } else if (this.container.length > this.container_max) {
                console.log("this.container.length > this.container_max", this.container)
                this.container = ""
            } else {
                this.container += v;
            }
        })
    }
    flush(controller: any) {
        controller.enqueue("flush");
    }
}
type StreamCreateParam_t = {
    baudRate: number,
    analysisParam: ResStream_analysisParam_t;
    ingOn: (c: boolean) => void
}
export class StreamCreate<Server extends Obj_t> {
    private callback
    disconnect
    private writer: WritableStreamDefaultWriter<Uint8Array> | undefined
    constructor(apisObj: Server, public op: StreamCreateParam_t) {
        this.callback = CallObjInit(apisObj)
        this.disconnect = async () => console.log("StreamCreate 未打开")
    }
    async connect() {
        try {
            const port = await navigator!.serial!.requestPort();
            await port.open({ baudRate: this.op.baudRate });
            this.writer = port.writable!.getWriter();
            const decoder = new TextDecoderStream("utf-8", {});
            const readclose = port.readable!.pipeTo(decoder.writable);
            const reader = decoder.readable.pipeThrough(new TransformStream(new ResStream_analysis(this.op.analysisParam))).getReader();
            this.disconnect = async () => {
                await this.writer!.close()!.catch(console.log);
                await reader!.cancel()!.catch(console.log);
                await readclose!.catch(console.log);
                await port!.close()!.catch(console.log);
                this.op.ingOn(false);
            }
            this.op.ingOn(true);
            while (this?.writer) {
                const { value, done } = await reader.read()
                if (value) {
                    const c = JSON.parse(value)
                    this.callback(c)
                }
                if (done) {
                    reader.releaseLock();
                }
            }
        } catch (e) {
            this.op.ingOn(false);
            console.error("StreamCreate connect", e)
        }
    }
    send: send_t<Server> = (api, db) => {
        const c = new TextEncoder().encode(JSON.stringify({ api, db }))
        if (this.writer?.write) {
            this.writer.write(c)
        } else {
            this.op.ingOn(false);
            console.error("StreamCreate send")
        }
    }
}