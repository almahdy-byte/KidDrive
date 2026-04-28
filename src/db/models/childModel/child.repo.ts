import { Model } from "mongoose";
import { ChildModel, IChild, IChild as TDocument } from "./child.model";
import { DBServices } from "../../db.service";

export class ChildRepo extends DBServices<TDocument> {
  constructor(protected override readonly model: Model<TDocument>) {
    super(model);
  }
 
  async create(data: Partial<IChild>): Promise<IChild> {
    return await ChildModel.create(data);
  }

  async findChildById(id: string): Promise<IChild | null> {
    return await ChildModel.findById(id).exec();
  }

  async findChildByIdWithParent(id: string): Promise<IChild | null> {
    return await ChildModel.findById(id)
      .populate('parentId', 'firstName lastName fullName email phone')
      .exec() as any;
  }
}

export const childRepo = new ChildRepo(ChildModel);
