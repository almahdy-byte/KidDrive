import { Model } from "mongoose";
import { VehicleModel, IVehicle, IVehicle as TDocument } from "./vehicle.model";
import { DBServices } from "../../db.service";

export class VehicleRepo extends DBServices<TDocument> {
  constructor(protected override readonly model: Model<TDocument>) {
    super(model);
  }

  async create(data: Partial<IVehicle>): Promise<IVehicle | null> {
    return await VehicleModel.create(data);
  }

  async findByPlateNumber(plateNumber: string): Promise<IVehicle | null> {
    return await VehicleModel.findOne({ plateNumber } as any).exec();
  }
}

  export const vehicleRepo = new VehicleRepo(VehicleModel);
