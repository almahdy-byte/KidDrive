import mongoose, { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { ApplicationStatus } from "../../../common";

export interface IDriverApplication {
  _id: Types.ObjectId;

  driver: Types.ObjectId;
  vehicle: Types.ObjectId;
  status: ApplicationStatus;
}

const driverApplicationSchema = new Schema<IDriverApplication>(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
  },
  {
    timestamps: true,
  },
);

export const DriverApplicationModel = models.DriverApplication as mongoose.Model<IDriverApplication> || model<IDriverApplication>("DriverApplication", driverApplicationSchema);
export type HDriverApplicationDocument = HydratedDocument<IDriverApplication>;