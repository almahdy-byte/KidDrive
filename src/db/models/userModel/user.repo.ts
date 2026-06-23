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

  async findUserById(id: string, select: string = ""): Promise<IUser | null> {
    return await userModel.findById(id).select(select).exec();
  }

  async findUserByIdWithChildren(id: string): Promise<IUser | null> {
    return await userModel.findById(id)
      .populate('children', 'name age gender photo school')
      .exec();
  }

  async findAllParentsPaginated(page: number, limit: number, search?: string): Promise<{ parents: IUser[]; total: number }> {
    const filter: any = { role: 'parent', isDeleted: false };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [parents, total] = await Promise.all([
      userModel.find(filter)
        .select('-password -otp')
        .populate('children', 'name age gender photo school')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      userModel.countDocuments(filter),
    ]);

    return { parents, total };
  }
}

export const userRepo = new UserRepo();
