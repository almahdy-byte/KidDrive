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

  async findByDriverPaginated(driverId: string, page = 1, limit = 10, status?: ITrip['status'], search = ""): Promise<{ trips: ITrip[], total: number }> {
    const filter: any = { driverId };
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { status: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const trips = await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .sort({ scheduledDate: -1, scheduledTime: 1 })
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

  async findByParentPaginated(parentId: string, page = 1, limit = 10, status?: ITrip['status'], search = ""): Promise<{ trips: ITrip[], total: number }> {
    const filter: any = { parentId };
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { status: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const trips = await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .sort({ scheduledDate: -1, scheduledTime: 1 })
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

  async findByChildPaginated(childId: string, page = 1, limit = 10, status?: ITrip['status'], search = ""): Promise<{ trips: ITrip[], total: number }> {
    const filter: any = { childId };
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { status: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const trips = await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .sort({ scheduledDate: -1, scheduledTime: 1 })
      .skip(skip)
      .limit(limit)
      .exec() as any;
    
    const total = await TripModel.countDocuments(filter);
    
    return { trips, total };
  }

  async findBySubscription(subscriptionId: string): Promise<ITrip[]> {
    return await TripModel.find({ subscriptionId } as any)
      .populate('driverId parentId childId subscriptionId')
      .sort({ scheduledDate: -1, scheduledTime: 1 })
      .exec() as any;
  }

  async findBySubscriptionPaginated(
    subscriptionId: string, 
    page = 1, 
    limit = 10, 
    status?: ITrip['status']
  ): Promise<{ trips: ITrip[], total: number }> {
    const filter: any = { subscriptionId };
    if (status) {
      filter.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const trips = await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .sort({ scheduledDate: -1, scheduledTime: 1 })
      .skip(skip)
      .limit(limit)
      .exec() as any;
    
    const total = await TripModel.countDocuments(filter);
    
    return { trips, total };
  }

  async updateStatus(id: string, status: ITrip['status']): Promise<ITrip | null> {
    const updateData: Partial<ITrip> = { status };
    
    if (status === 'trip_started') {
      updateData.startTime = new Date();
    } else if (status === 'child_boarded') {
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

  async findActiveTripsPaginated(page = 1, limit = 10, driverId?: string, search = ""): Promise<{ trips: ITrip[], total: number }> {
    const filter: any = {
      status: { $in: ['child_boarded', 'trip_started'] }
    };
    
    if (driverId) {
      filter.driverId = driverId;
    }
    
    if (search) {
      filter.$and = [
        {
          $or: [
            { status: { $regex: search, $options: 'i' } },
            { origin: { $regex: search, $options: 'i' } },
            { destination: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const trips = await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .sort({ scheduledDate: -1, scheduledTime: 1 })
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
      .sort({ scheduledDate: -1, scheduledTime: 1 })
      .exec() as any;
  }

  async findAllTripsPaginated(page = 1, limit = 10, status?: ITrip['status'], search = ""): Promise<{ trips: ITrip[], total: number }> {
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { status: { $regex: search, $options: 'i' } },
        { origin: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const trips = await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .sort({ scheduledDate: -1, scheduledTime: 1 })
      .skip(skip)
      .limit(limit)
      .exec() as any;
    
    const total = await TripModel.countDocuments(filter);
    
    return { trips, total };
  }

  /**
   * Find trips by driver within a date range (for subscription-based trips)
   */
  async findByDriverAndDateRange(
    driverId: string,
    startDate: Date,
    endDate: Date,
    status?: ITrip['status']
  ): Promise<ITrip[]> {
    const filter: any = {
      driverId,
      scheduledDate: {
        $gte: startDate,
        $lte: endDate,
      },
    };
    
    if (status) {
      filter.status = status;
    }
    
    return await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .exec() as any;
  }

  /**
   * Find trips by parent within a date range (for subscription-based trips)
   */
  async findByParentAndDateRange(
    parentId: string,
    startDate: Date,
    endDate: Date,
    status?: ITrip['status']
  ): Promise<ITrip[]> {
    const filter: any = {
      parentId,
      scheduledDate: {
        $gte: startDate,
        $lte: endDate,
      },
    };
    
    if (status) {
      filter.status = status;
    }
    
    return await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .exec() as any;
  }

  /**
   * Find trips by multiple subscription IDs within a date range (paginated)
   */
  async findBySubscriptionsAndDateRangePaginated(
    subscriptionIds: string[],
    startDate: Date,
    endDate: Date,
    page = 1,
    limit = 10
  ): Promise<{ trips: ITrip[], total: number }> {
    const filter: any = {
      subscriptionId: { $in: subscriptionIds },
      scheduledDate: {
        $gte: startDate,
        $lte: endDate,
      },
    };
    
    const skip = (page - 1) * limit;
    
    const trips = await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .sort({ scheduledTime: 1 })
      .skip(skip)
      .limit(limit)
      .exec() as any;
    
    const total = await TripModel.countDocuments(filter);
    
    return { trips, total };
  }

  /**
   * Find trips by multiple subscription IDs
   */
  async findBySubscriptionsPaginated(
    subscriptionIds: string[],
    page = 1,
    limit = 10,
    status?: ITrip['status']
  ): Promise<{ trips: ITrip[], total: number }> {
    const filter: any = {
      subscriptionId: { $in: subscriptionIds },
    };
    
    if (status) {
      filter.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const trips = await TripModel.find(filter)
      .populate('driverId parentId childId subscriptionId')
      .sort({ scheduledDate: -1, scheduledTime: 1 })
      .skip(skip)
      .limit(limit)
      .exec() as any;
    
    const total = await TripModel.countDocuments(filter);
    
    return { trips, total };
  }
}

export const tripRepo = new TripRepo(TripModel);
