export type ResStream_analysisParam_t = "{}" | "\n" | "|||"
export default class  {
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