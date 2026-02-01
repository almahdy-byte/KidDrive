import bcrypt from 'bcrypt'

export const hash =  (password : string)=>{    
    return bcrypt.hashSync(password , Number(process.env.HASH_SALT))
}
export const compare = (password : string , hash : string)=>{
    return bcrypt.compareSync(password , hash)
}
