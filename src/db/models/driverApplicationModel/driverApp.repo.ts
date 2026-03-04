import { Model } from "mongoose";
import {
  DriverApplicationModel,
  IDriverApplication,
  IDriverApplication as TDocument,
 } from "./driverApp.model";
import { DBServices } from "../../db.service";

export class DriverApplicationRepo extends DBServices<TDocument> {
  constructor(protected override readonly model: Model<TDocument>) {
    super(model);
  }
 
  async create(data: Partial<IDriverApplication>): Promise<IDriverApplication> {
    return await DriverApplicationModel.create(data);
  }
}

  export const driverApplicationRepo = new DriverApplicationRepo(DriverApplicationModel);
