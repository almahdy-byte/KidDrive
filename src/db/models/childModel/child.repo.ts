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
}

  export const childRepo = new ChildRepo(ChildModel);
