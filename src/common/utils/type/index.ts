import { Request } from "express";
import { IUser  } from "../../../db";
import { Types } from "mongoose";

export interface IRequest extends Request{
    user? : IUser 
}

export interface Payload{
    _id:Types.ObjectId,
    changeCredentialTime:string,
    role:string
}
