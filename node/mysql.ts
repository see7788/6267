import { PoolOptions, Pool, createPool } from 'mysql2/promise';
export default class{
    private c: Pool;
    constructor(public config: PoolOptions) {
        this.c = createPool(config);
    }
    /** A random method to simulate a step before to get the class methods */
    private ensureConnection() {
        if (!this?.c) this.c = createPool(this.config);
    }
    //<T extends keyof tablesFile>(): tablesFile[T][]
    get query() {
        this.ensureConnection();
        return this.c.query.bind(this.c)//<ResultSetHeader>
    }
    get execute() {
        this.ensureConnection();
        return this.c.execute.bind(this.c)
    }
}