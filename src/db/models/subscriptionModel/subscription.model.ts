import mongoose, { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { Status, SubscriptionType } from "../../../common";

export interface ILocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface IScheduleItem {
  dayOfWeek: number;      // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  pickupTime: string;     // Format: "HH:MM" (24-hour format)
  dropoffTime: string;    // Format: "HH:MM" (24-hour format)
}

export interface ISubscription {
  _id: Types.ObjectId;
  driverId: Types.ObjectId;
  parentId: Types.ObjectId;
  childId: Types.ObjectId;
  expiryDate: Date;
  status: Status;
  subscriptionType: SubscriptionType;
  // Schedule pattern - array of days with pickup/dropoff times (used to generate trips)
  schedulePattern: IScheduleItem[];
  // Schedule - array of trip IDs generated from the schedule pattern
  schedule: Types.ObjectId[];
  // Locations
  origin: ILocation;      // Pickup location (home)
  destination: ILocation; // Dropoff location (school)
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const scheduleItemSchema = new Schema<IScheduleItem>(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    pickupTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    },
    dropoffTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    },
  },
  { _id: false }
);

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
    schedulePattern: {
      type: [scheduleItemSchema],
      required: true,
      validate: {
        validator: function (v: IScheduleItem[]) {
          return v.length > 0;
        },
        message: "At least one schedule day is required",
      },
    },
    schedule: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: "Trip",
      }],
      default: [],
    },
    origin: {
      type: locationSchema,
      required: true,
    },
    destination: {
      type: locationSchema,
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
