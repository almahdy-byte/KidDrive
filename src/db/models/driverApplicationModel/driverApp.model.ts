import mongoose, { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { ApplicationStatus } from "../../../common";

export interface IDriverApplication {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  licenseImage: { public_id: string; secure_url: string };
  carImage: { public_id: string; secure_url: string };
  nationalIdImage: { public_id: string; secure_url: string };
  status: ApplicationStatus;
}

const driverApplicationSchema = new Schema<IDriverApplication>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    licenseImage: { secure_url: String, public_id: String },
    carImage: { secure_url: String, public_id: String },
    nationalIdImage: { secure_url: String, public_id: String },
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

export const DriverApplicationModel =
  models.DriverApplication || model<IDriverApplication>("DriverApplication", driverApplicationSchema);
export type HDriverApplicationDocument = HydratedDocument<IDriverApplication>;