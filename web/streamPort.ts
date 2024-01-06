import { Obj_t, CallObjInit, send_t } from "../public/ts"
import TransformStreamParam, { ResStream_analysisParam_t } from "../public/TransformStreamParam"
type StreamCreateParam_t = {
    baudRate: number,
    analysisParam: ResStream_analysisParam_t;
    ingOn: (c: boolean) => void
}
export default class <Server extends Obj_t> {
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
            const reader = decoder.readable.pipeThrough(new TransformStream(new TransformStreamParam(this.op.analysisParam))).getReader();
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