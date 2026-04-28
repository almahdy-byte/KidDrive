import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { Gender } from "../../../common";

export interface IChild {
  _id: Types.ObjectId;
  name: string;
  age: number;
  parentId: Types.ObjectId;
  isDeleted: boolean;
  gender: Gender;
  photo: string;
  school?: string;  // School name
  schoolLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  schedule?: {
    arriveTime: string;
    backHome: string;
  };
}

const childSchema = new Schema<IChild>(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    parentId: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    gender: { type: String, default: Gender.Male, required: true },
    isDeleted: { type: Boolean, required: false , default:false },
    photo: { type: String, required: false },
    school: { type: String, required: false },  // School name
    schoolLocation: {
      latitude: { type: Number, required: false },
      longitude: { type: Number, required: false },
      address: { type: String, required: false },
    },
    schedule: {
      arriveTime: { type: String, required: false },
      backHome: { type: String, required: false },
    },
  },
  {
    timestamps: true,
  },
);

export const ChildModel =
  models.Child || model<IChild>("Child", childSchema);
export type HChildDocument = HydratedDocument<IChild>;
