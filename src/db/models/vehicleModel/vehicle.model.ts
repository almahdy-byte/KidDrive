import mongoose, { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { ApplicationStatus } from "../../../common";

export interface IVehicle {
  _id: Types.ObjectId;
  driver: Types.ObjectId;
  carModel: string;
  plateNumber: string;
  carColor: string;
  governmentDocuments: [{ public_id: string; secure_url: string }];
  status: ApplicationStatus;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    governmentDocuments: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    carModel: { type: String, required: true },
    plateNumber: { type: String, required: true, unique: true },
    carColor: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const VehicleModel =
  models.Vehicle || model<IVehicle>("Vehicle", vehicleSchema);
export type HVehicleDocument = HydratedDocument<IVehicle>;