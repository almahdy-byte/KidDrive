import mongoose, { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { Status, SubscriptionType } from "../../../common";

export interface ISubscription {
  _id: Types.ObjectId;
  driverId: Types.ObjectId;
  parentId: Types.ObjectId;
  childId: Types.ObjectId;
  expiryDate: Date;
  status: Status;
  subscriptionType: SubscriptionType;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    childId: {
      type: Schema.Types.ObjectId,
      ref: "Child",
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.PENDING,
    },
    subscriptionType: {
      type: String,
      enum: Object.values(SubscriptionType),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SubscriptionModel =
  models.Subscription || model<ISubscription>("Subscription", subscriptionSchema);

export type HSubscriptionDocument = HydratedDocument<ISubscription>;
