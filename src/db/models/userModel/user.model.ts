import mongoose, { Document, model, Schema, Types } from "mongoose";
import { decrypt, encrypt, Role } from "../../../common";

export interface IUser extends Document<Types.ObjectId, {}, IUser> {
  _id: Types.ObjectId,
  firstName: string,
  lastName: string,
  fullName: string,
  role?: Role,
  isBanned?: boolean,
  email: string,
  password: string,
  isVerified: boolean,
  phone?: string,
  otp?: {
    code: string,
    expiresAt: Date
  } | undefined,
  children?: Types.ObjectId[],
  changeCredentialTime: Date
  updatedAt?: Date,
  deletedAt?: Date,
  isDeleted?: boolean,
  createdAt?: Date,
  isApprovedDriver?: boolean,
  vehicles?: Types.ObjectId[],
  fcmToken?: string,
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
    department?: string;
  };
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: Role.Parent,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      // required:true
    },
    otp: {
      code: {
        type: String,
      },
      expiresAt: {
        type: Date,
      },
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Child",
        required: false,
      },
    ],
    changeCredentialTime: {
      type: Date,
      default: Date.now(),
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    deletedAt: {
      type: Date,
    },
    isApprovedDriver: {
      type: Boolean,
      required: false,
    },
    vehicles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required:  false,
      },
    ],
    fcmToken: { type: String },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
      city: { type: String },
      department: { type: String },
    },
  },
  {
    timestamps: true,
    virtuals: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);



userSchema.post(/^find/, async function (docs) {
    if (!docs) return;

    const decryptUser = async (user: any) => {
        if (user.phone) user.phone = await decrypt(user.phone);
    };

    // find → array
    if (Array.isArray(docs)) {
        await Promise.all(docs.map(decryptUser));
    }
    // findOne → object
    else {
        await decryptUser(docs);
    }
});

userSchema.pre('save', async function () {
    if (this.isModified('phone')) {
        this.phone = await encrypt(this.phone as string);
    }
    this.fullName = `${this.firstName} ${this.lastName}`;
});
export const userModel = model('User', userSchema)
