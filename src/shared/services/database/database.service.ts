import { Injectable } from "@nestjs/common"
import mongoose, { ClientSession, Document, Model } from "mongoose";

@Injectable()
export abstract class DataBaseService<T extends Document>
{
    constructor(
        public entityModel:Model<T>,
        public connection:mongoose.Connection,
        public toPopuloate:string[]=[]
        ){}

    createInstance(createEntityDTO)
    {
        return new this.entityModel(createEntityDTO);
    }

    async create(createEntityDTO,session=null):Promise<T>
    {
        return this.createInstance(createEntityDTO).save({session});
    }

    async findAll(): Promise<T[]>
    {
        return this.entityModel.find<T>({isDeleted:false}).sort({createdAt:1}).populate(this.toPopuloate).exec();
    }

    async findByPage(select:Record<string,any>={},page=1,limit=10)
    {
        return this.entityModel.find(select).sort({createdAt:1}).limit(limit).skip(page*limit).populate(this.toPopuloate).exec()
    }

    async findByField(entityObj:Record<string,any>):Promise<T[]>
    {
        return this.entityModel.find<T>({...entityObj,isDeleted:false}).sort({createdAt:1}).populate(this.toPopuloate).exec();
    }

    async findOneByField(entityObj:Record<string,any>,select:Record<string,any>={}):Promise<T>
    {
        return this.entityModel.findOne<T>({...entityObj,isDeleted:false}).select(select).exec().then((result)=>result?result.populate(this.toPopuloate):null);
    }

    async update(filter:Record<string,any>,toUpdate:Record<string,any>,session=null):Promise<T>
    {
        return this.entityModel.findOneAndUpdate<T>({...filter,isDeleted:false},toUpdate,{session,new:true});
    }

    async delete(filter,session=null)
    {
        await this.entityModel.findOneAndDelete({...filter,isDeleted:false},{session});
    }

    async executeWithTransaction(functionToExecute:(session:ClientSession)=>any)
    {
        const transaction:ClientSession= await this.connection.startSession();
        transaction.startTransaction();
        let result=null;
        try {    
            result= await functionToExecute(transaction);
            await transaction.commitTransaction();
        } 
        catch(err)
        {
            await transaction.abortTransaction();
            throw err
        }
        finally
        {
            transaction.endSession();
        }     
        return  result;
    }
}