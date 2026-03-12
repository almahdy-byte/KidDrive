import { Model, Types } from "mongoose";
import {
  SubscriptionModel,
  ISubscription,
  ISubscription as TDocument,
} from "./subscription.model";
import { DBServices } from "../../db.service";
import { Status } from "../../../common";

export class SubscriptionRepo extends DBServices<TDocument> {
  constructor(protected override readonly model: Model<TDocument>) {
    super(model);
  }

  async create(data: Partial<ISubscription>): Promise<ISubscription | null> {
    return await SubscriptionModel.create(data);
  }

  async findByIdWithPopulate(id: string): Promise<ISubscription | null> {
    return await this.findById({
      id,
      populate: [
        { path: 'driverId' },
        { path: 'parentId' },
        { path: 'childId' }
      ]
    });
  }

  async findByDriver(driverId: string): Promise<ISubscription[]> {
    return await SubscriptionModel.find({ driverId } as any)
      .populate('driverId parentId childId')
      .exec() as any;
  }

  async findByParent(parentId: string): Promise<ISubscription[]> {
    return await SubscriptionModel.find({ parentId } as any)
      .populate('driverId parentId childId')
      .exec() as any;
  }

  async findByChild(childId: string): Promise<ISubscription[]> {
    return await SubscriptionModel.find({ childId } as any)
      .populate('driverId parentId childId')
      .exec() as any;
  }

  async updateStatus(id: string, status: Status): Promise<ISubscription | null> {
    const result = await this.findByIdAndUpdate({
      id,
      update: { status }
    });
    
    if (result) {
      return await this.findById({
        id,
        populate: [
          { path: 'driverId' },
          { path: 'parentId' },
          { path: 'childId' }
        ]
      });
    }
    return null;
  }

  async findPendingSubscriptions(): Promise<ISubscription[]> {
    return await SubscriptionModel.find({ status: Status.PENDING } as any)
      .populate('driverId parentId childId')
      .exec() as any;
  }

  async findExpiringSoon(days: number = 7): Promise<ISubscription[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    return await SubscriptionModel.find({
      expiryDate: { $lte: expiryDate },
      status: Status.ACCEPTED
    } as any)
      .populate('driverId parentId childId')
      .exec() as any;
  }

  async findAll(): Promise<ISubscription[]> {
    return await SubscriptionModel.find({} as any)
      .populate('driverId parentId childId')
      .exec() as any;
  }
}

export const subscriptionRepo = new SubscriptionRepo(SubscriptionModel);
