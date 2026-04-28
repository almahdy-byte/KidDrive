import mongoose, { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { Role } from "../../../common";

export interface IDriver {
  _id: Types.ObjectId;
  userName: string;
  email: string;
  nationalId: string;
  licenseNumber?: string;
  licenseImage: { public_id: string; secure_url: string };
  nationalIdImage: { public_id: string; secure_url: string };
  profilePhoto?: { public_id: string; secure_url: string };
  role: Role;
  password: string;
  phone: string;
  isApproved: boolean;
  changeCredentialTime: Date;
  rating: {
    average: number;
    count: number;
  };
  location: {
    city: string;
    department: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const driverSchema = new Schema<IDriver>(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    nationalId: {
      type: String,
      required: true,
      unique: true,
    },
    licenseNumber: { type: String, required: false },
    licenseImage: { secure_url: String, public_id: String },
    nationalIdImage: { secure_url: String, public_id: String },
    profilePhoto: { secure_url: String, public_id: String },
    role: { type: String, default: Role.Driver },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    changeCredentialTime: { type: Date, default: Date.now },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
    location: {
      city: { type: String, required: true },
      department: { type: String, required: true },
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
    },
  },

  {
    timestamps: true,
  }
);

export const DriverModel =
  models.Driver || model<IDriver>("Driver", driverSchema);
export type HDriverDocument = HydratedDocument<IDriver>;
