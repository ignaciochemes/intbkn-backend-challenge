export interface IGenericRepository<T, ID> {
    save(entity: T): Promise<T>;
    findAll(skip?: number, take?: number): Promise<T[]>;
    findById(id: ID): Promise<T | null>;
    count(): Promise<number>;
}