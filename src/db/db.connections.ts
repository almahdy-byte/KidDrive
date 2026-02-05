import { connect } from "mongoose";
import { AppError } from "../common";
import { StatusCodes } from "http-status-codes";



export const connectDB = async ()=>{
    await connect(process.env.DB_URI as string)
        .then(()=>console.log("Database connected"))
        .catch((err)=>new AppError(err?.message+" " , StatusCodes.INTERNAL_SERVER_ERROR))
}

