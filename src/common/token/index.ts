import jwt from 'jsonwebtoken'
import { AppError } from '../error'
import { StatusCodes } from 'http-status-codes'
import { NextFunction } from 'express'
import { TokenType } from '../enums'
import { Payload } from '../utils'
export * from "./jwt";

const sign = async(payload : Payload , key : string , options : jwt.SignOptions):Promise<String>=>{
    return await jwt.sign(payload , key , options)
}
const verify = async(token : string , key : string):Promise<Payload>=>{
    return await jwt.verify(token , key) as Payload
}


export const createToken =async (payload:Payload , type?: TokenType):Promise<{accessToken:string , refreshToken?:string}> => {
    const accessToken:String = await sign(payload , process.env.ACCESS_TOKEN_SECRET as string , {expiresIn:'1h'})
    if(type === TokenType.Access){
        return {accessToken:accessToken as string}
    }
    const refreshToken:String = await sign(payload , process.env.REFRESH_TOKEN_SECRET as string , {expiresIn:'7d'})
        return {accessToken:accessToken as string , refreshToken:refreshToken as string}

}
export const decodedToken =async (token : string ,type : TokenType = TokenType.Access ,next:NextFunction):Promise<Payload> => {
    if (!token) {
        throw new AppError("Unauthorized" , StatusCodes.UNAUTHORIZED)
    }
    let decoded:Payload
    if (type === TokenType.Access) {
        decoded =  await verify(token , process.env.ACCESS_TOKEN_SECRET as string)
    }else{
        decoded =  await verify(token , process.env.REFRESH_TOKEN_SECRET as string)
    }
    if(!decoded){
        throw new AppError("Unauthorized" , StatusCodes.UNAUTHORIZED)
    }
    return decoded
}