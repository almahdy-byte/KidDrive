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

  async addTripsToSchedule(id: string, tripIds: Types.ObjectId[]): Promise<ISubscription | null> {
    return await SubscriptionModel.findByIdAndUpdate(
      id,
      { $addToSet: { schedule: { $each: tripIds } } },
      { new: true }
    )
      .populate('driverId')
      .populate('parentId', 'firstName lastName fullName email phone')
      .populate('childId', 'name age gender photo school')
      .populate('schedule')
      .populate('schedule')
      .exec() as any;
  }

  async findByIdWithPopulate(id: string): Promise<ISubscription | null> {
    return await this.findById({
      id,
      populate: [
        { path: 'driverId' },
        { path: 'parentId', select: 'firstName lastName fullName email phone' },
        { path: 'childId', select: 'name age gender photo school' },
        { path: 'schedule' }
      ]
    });
  }

  async findByDriverPaginated(driverId: string, page = 1, limit = 10, search = "", status?: Status): Promise<{ subscriptions: ISubscription[], total: number }> {
    const filter: any = { driverId };
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { status: { $regex: search, $options: 'i' } },
        { subscriptionType: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const subscriptions = await SubscriptionModel.find(filter)
      .populate('driverId')
      .populate('parentId', 'firstName lastName fullName email phone')
      .populate('childId', 'name age gender photo school')
      .populate('schedule')
      .skip(skip)
      .limit(limit)
      .exec() as any;
    const total = await SubscriptionModel.countDocuments(filter);
    return { subscriptions, total };
  }

  async findByParentPaginated(parentId: string, page = 1, limit = 10, search = "", status?: Status): Promise<{ subscriptions: ISubscription[], total: number }> {
    const filter: any = { parentId };
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { status: { $regex: search, $options: 'i' } },
        { subscriptionType: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const subscriptions = await SubscriptionModel.find(filter)
      .populate('driverId')
      .populate('parentId', 'firstName lastName fullName email phone')
      .populate('childId', 'name age gender photo school')
      .populate('schedule')
      .skip(skip)
      .limit(limit)
      .exec() as any;
    const total = await SubscriptionModel.countDocuments(filter);
    return { subscriptions, total };
  }

  async findByChildPaginated(childId: string, page = 1, limit = 10, search = "", status?: Status): Promise<{ subscriptions: ISubscription[], total: number }> {
    const filter: any = { childId };
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { status: { $regex: search, $options: 'i' } },
        { subscriptionType: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const subscriptions = await SubscriptionModel.find(filter)
      .populate('driverId')
      .populate('parentId', 'firstName lastName fullName email phone')
      .populate('childId', 'name age gender photo school')
      .populate('schedule')
      .skip(skip)
      .limit(limit)
      .exec() as any;
    const total = await SubscriptionModel.countDocuments(filter);
    return { subscriptions, total };
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
          { path: 'parentId', select: 'firstName lastName fullName email phone' },
          { path: 'childId', select: 'name age gender photo school' },
          { path: 'schedule' }
        ]
      });
    }
    return null;
  }

  async findPendingSubscriptionsPaginated(page = 1, limit = 10, search = "", driverId?: string): Promise<{ subscriptions: ISubscription[], total: number }> {
    const filter: any = { status: Status.PENDING };
    if (driverId) {
      filter.driverId = driverId;
    }
    if (search) {
      filter.$and = [
        {
          $or: [
            { subscriptionType: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }
    const skip = (page - 1) * limit;
    const subscriptions = await SubscriptionModel.find(filter)
      .populate('driverId')
      .populate('parentId', 'firstName lastName fullName email phone')
      .populate('childId', 'name age gender photo school')
      .populate('schedule')
      .skip(skip)
      .limit(limit)
      .exec() as any;
    const total = await SubscriptionModel.countDocuments(filter);
    return { subscriptions, total };
  }

  async findActiveSubscriptionsPaginated(page = 1, limit = 10, search = "", driverId?: string, parentId?: string): Promise<{ subscriptions: ISubscription[], total: number }> {
    const filter: any = { status: Status.ACCEPTED };
    if (driverId) {
      filter.driverId = driverId;
    }
    if (parentId) {
      filter.parentId = parentId;
    }
    if (search) {
      filter.$or = [
        { subscriptionType: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const subscriptions = await SubscriptionModel.find(filter)
      .populate('driverId')
      .populate('parentId', 'firstName lastName fullName email phone')
      .populate('childId', 'name age gender photo school')
      .populate('schedule')
      .skip(skip)
      .limit(limit)
      .exec() as any;
    const total = await SubscriptionModel.countDocuments(filter);
    return { subscriptions, total };
  }

  async findExpiringSoon(days: number = 7): Promise<ISubscription[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    return await SubscriptionModel.find({
      expiryDate: { $lte: expiryDate },
      status: Status.ACCEPTED
    } as any)
      .populate('driverId')
      .populate('parentId', 'firstName lastName fullName email phone')
      .populate('childId', 'name age gender photo school')
      .populate('schedule')
      .exec() as any;
  }

  async findAllPaginated(page = 1, limit = 10, search = "", status?: Status): Promise<{ subscriptions: ISubscription[], total: number }> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { status: { $regex: search, $options: 'i' } },
        { subscriptionType: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const subscriptions = await SubscriptionModel.find(filter)
      .populate('driverId')
      .populate('parentId', 'firstName lastName fullName email phone')
      .populate('childId', 'name age gender photo school')
      .populate('schedule')
      .skip(skip)
      .limit(limit)
      .exec() as any;
    const total = await SubscriptionModel.countDocuments(filter);
    return { subscriptions, total };
  }
}

export const subscriptionRepo = new SubscriptionRepo(SubscriptionModel);
