import { PoolOptions, Pool, createPool } from 'mysql2/promise';
export default class{
    private obj: Pool;
    constructor(public config: PoolOptions) {
        this.obj = createPool(config);
    }
    /** A random method to simulate a step before to get the class methods */
    private ensureConnection() {
        if (!this?.obj) this.obj = createPool(this.config);
    }
    //<T extends keyof tablesFile>(): tablesFile[T][]
    get query() {
        this.ensureConnection();
        return this.obj.query.bind(this.obj)//<ResultSetHeader>
    }
    get execute() {
        this.ensureConnection();
        return this.obj.execute.bind(this.obj)
    }
}