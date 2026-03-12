import { Model, Types } from "mongoose";
import {
  TripModel,
  ITrip,
  ITrip as TDocument,
} from "./trip.model";
import { DBServices } from "../../db.service";

export class TripRepo extends DBServices<TDocument> {
  constructor(protected override readonly model: Model<TDocument>) {
    super(model);
  }

  async create(data: Partial<ITrip>): Promise<ITrip | null> {
    return await TripModel.create(data);
  }

  async findByIdWithPopulate(id: string): Promise<ITrip | null> {
    return await this.model.findById(id).populate('driverId parentId childId subscriptionId').exec() as any;
  }

  async findByDriver(driverId: string, status?: ITrip['status']): Promise<ITrip[]> {
    const filter: any = { driverId };
    if (status) {
      filter.status = status;
    }
    return await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .exec() as any;
  }

  async findByDriverPaginated(driverId: string, page = 1, limit = 10, status?: ITrip['status']): Promise<{ trips: ITrip[], total: number }> {
    const filter: any = { driverId };
    if (status) {
      filter.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const trips = await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .skip(skip)
      .limit(limit)
      .exec() as any;
    
    const total = await TripModel.countDocuments(filter);
    
    return { trips, total };
  }

  async findByParent(parentId: string, status?: ITrip['status']): Promise<ITrip[]> {
    const filter: any = { parentId };
    if (status) {
      filter.status = status;
    }
    return await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .exec() as any;
  }

  async findByParentPaginated(parentId: string, page = 1, limit = 10, status?: ITrip['status']): Promise<{ trips: ITrip[], total: number }> {
    const filter: any = { parentId };
    if (status) {
      filter.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const trips = await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .skip(skip)
      .limit(limit)
      .exec() as any;
    
    const total = await TripModel.countDocuments(filter);
    
    return { trips, total };
  }

  async findByChild(childId: string, status?: ITrip['status']): Promise<ITrip[]> {
    const filter: any = { childId };
    if (status) {
      filter.status = status;
    }
    return await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .exec() as any;
  }

  async findByChildPaginated(childId: string, page = 1, limit = 10, status?: ITrip['status']): Promise<{ trips: ITrip[], total: number }> {
    const filter: any = { childId };
    if (status) {
      filter.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const trips = await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .skip(skip)
      .limit(limit)
      .exec() as any;
    
    const total = await TripModel.countDocuments(filter);
    
    return { trips, total };
  }

  async findBySubscription(subscriptionId: string): Promise<ITrip[]> {
    return await TripModel.find({ subscriptionId } as any)
      .populate('driverId parentId childId subscriptionId')
      .exec() as any;
  }

  async updateStatus(id: string, status: ITrip['status']): Promise<ITrip | null> {
    const updateData: Partial<ITrip> = { status };
    
    if (status === 'child_boarded') {
      updateData.startTime = new Date();
    } else if (status === 'trip_finished') {
      updateData.endTime = new Date();
    }

    const result = await this.model
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('driverId parentId childId subscriptionId')
      .exec() as any;
    
    return result;
  }

  async findActiveTrips(): Promise<ITrip[]> {
    return await TripModel.find({
      status: { $in: ['child_boarded', 'trip_started'] }
    } as any)
      .populate('driverId parentId childId subscriptionId')
      .exec() as any;
  }

  async findActiveTripsPaginated(page = 1, limit = 10, driverId?: string): Promise<{ trips: ITrip[], total: number }> {
    const filter: any = {
      status: { $in: ['child_boarded', 'trip_started'] }
    };
    
    if (driverId) {
      filter.driverId = driverId;
    }
    
    const skip = (page - 1) * limit;
    
    const trips = await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .skip(skip)
      .limit(limit)
      .exec() as any;
    
    const total = await TripModel.countDocuments(filter);
    
    return { trips, total };
  }

  async findActiveTripsByDriver(driverId: string): Promise<ITrip[]> {
    return await TripModel.find({
      driverId,
      status: { $in: ['child_boarded', 'trip_started'] }
    } as any)
      .populate('driverId parentId childId subscriptionId')
      .exec() as any;
  }

  async findTripsByStatus(status: ITrip['status']): Promise<ITrip[]> {
    return await TripModel.find({ status } as any)
      .populate('driverId parentId childId subscriptionId')
      .exec() as any;
  }

  async findAllTrips(status?: ITrip['status']): Promise<ITrip[]> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    return await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .exec() as any;
  }

  async findAllTripsPaginated(page = 1, limit = 10, status?: ITrip['status']): Promise<{ trips: ITrip[], total: number }> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const trips = await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .skip(skip)
      .limit(limit)
      .exec() as any;
    
    const total = await TripModel.countDocuments(filter);
    
    return { trips, total };
  }
}

export const tripRepo = new TripRepo(TripModel);
