import mongoose, { HydratedDocument, model, models, Schema, Types } from "mongoose";

export interface ITrip {
  _id: Types.ObjectId;
  driverId: Types.ObjectId;
  parentId: Types.ObjectId;
  childId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  origin: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'child_boarded' | 'child_dropped_off' | 'trip_started' | 'trip_finished';
  // New fields for scheduled trips
  tripType: 'pickup' | 'dropoff';
  scheduledDate: Date;
  scheduledTime: string; // HH:MM format
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Original timing fields
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tripSchema = new Schema<ITrip>(
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
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    origin: {
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
    destination: {
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
    status: {
      type: String,
      enum: ['child_boarded', 'child_dropped_off', 'trip_started', 'trip_finished'],
      default: 'trip_started',
    },
    tripType: {
      type: String,
      enum: ['pickup', 'dropoff'],
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM format
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by date
tripSchema.index({ scheduledDate: 1, driverId: 1 });
tripSchema.index({ scheduledDate: 1, parentId: 1 });
tripSchema.index({ subscriptionId: 1, scheduledDate: 1 });

export const TripModel =
  models.Trip || model<ITrip>("Trip", tripSchema);

export type HTripDocument = HydratedDocument<ITrip>;
