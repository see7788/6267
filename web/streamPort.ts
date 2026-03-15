import { ObjBase_t, resFunCreate, ObjExtendsReturninfer_t, send_t } from "../public/ts"
import TransformStreamParam, { ResStream_analysisParam_t } from "../public/TransformStreamParam"
interface funParam_t {
    baudRate: number,
    analysisParam: ResStream_analysisParam_t;
}
interface classParam_t extends funParam_t {
    port: SerialPort,
}
class Init {
    reader: ReadableStreamDefaultReader<any>
    writer: WritableStreamDefaultWriter<Uint8Array>
    readclose: Promise<void>
    constructor(public op: classParam_t) {
        this.writer = this.op.port.writable!.getWriter();
        const decoder = new TextDecoderStream("utf-8", {});
        this.readclose = this.op.port.readable!.pipeTo(decoder.writable);
        this.reader = decoder.readable.pipeThrough(new TransformStream(new TransformStreamParam(this.op.analysisParam))).getReader();
    }
    async disconnect() {
        await this.writer!.close()!.catch(console.log);
        await this.reader!.cancel()!.catch(console.log);
        await this.readclose!.catch(console.log);
        await this.op.port!.close()!.catch(console.log);
    }
    async onInit<T extends ObjBase_t>(apisObj: ObjExtendsReturninfer_t<T>) {
        const call = resFunCreate(apisObj)
        while (this.op.port.readable?.getReader()) {
            const { value, done } = await this.reader.read()
            if (value) {
                const c = JSON.parse(value)
                call(c)
            }
            if (done) {
                this.reader.releaseLock();
            }
        }
    }
    sendInit<T extends ObjBase_t>(): send_t<T> {
        return (api, db) => new Promise((ok, err) => {
            const c = new TextEncoder().encode(JSON.stringify([api, db]))
            if (this.writer?.write) {
                this.writer.write(c)
                ok()
            } else {
                err("StreamCreate send")
            }
        })
    }
}

export default async (op: funParam_t) => {
    try {
        const port: SerialPort = await navigator!.serial!.requestPort();
        await port.open({ baudRate: op.baudRate });
        return new Init({ ...op, port })
    } catch (e) {
        console.log(e)
    }
}