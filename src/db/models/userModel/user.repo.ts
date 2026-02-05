import { PopulateOptions } from "mongoose";
import { DBServices } from "../../db.service";
import { IUser, userModel } from "./user.model";


interface FindByEmailOptions{
  email:string,
  populate?:PopulateOptions[] | PopulateOptions,
  select?:string
}
class UserRepo extends DBServices<IUser> {
  constructor() {
    super(userModel);
  }
  async findByEmail({email , select = "" , populate = []} : FindByEmailOptions): Promise<IUser | null> {
    return await userModel.findOne({ email }).select(select).populate(populate);
  }
    async create(data: Partial<IUser>): Promise<IUser> {
    return await userModel.create(data);
  }
}

export const userRepo = new UserRepo();
