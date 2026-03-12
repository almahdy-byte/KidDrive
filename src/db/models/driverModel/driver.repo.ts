import { Model, Types } from "mongoose";
import {
  DriverModel,
  IDriver,
  IDriver as TDocument,
} from "./driver.model";
import { DBServices } from "../../db.service";

export class DriverRepo extends DBServices<TDocument> {
  constructor(protected override readonly model: Model<TDocument>) {
    super(model);
  }

  async create(data: Partial<IDriver>): Promise<IDriver | null> {
    return await DriverModel.create(data);
  }

  async findByNationalId(nationalId: string): Promise<IDriver | null> {
    return await DriverModel.findOne({ nationalId } as any);
  }

  async findByEmail({ email }: { email: string }): Promise<IDriver | null> {
    return await DriverModel.findOne({ email } as any).exec();
  }

  async updateRating(driverId: string, newRating: number): Promise<IDriver | null> {
    const driver = await this.model.findById(driverId);
    if (!driver) return null;

    const currentTotal = driver.rating.average * driver.rating.count;
    const newCount = driver.rating.count + 1;
    const newAverage = (currentTotal + newRating) / newCount;

    return await this.model.findByIdAndUpdate(
      driverId,
      {
        rating: {
          average: Math.round(newAverage * 10) / 10, // Round to 1 decimal place
          count: newCount,
        },
      },
      { new: true }
    );
  }

  async findByLocation(city?: string, department?: string): Promise<IDriver[]> {
    const filter: any = { isApproved: true };
    
    if (city) filter['location.city'] = city;
    if (department) filter['location.department'] = department;

    return await this.model.find(filter).sort({ 'rating.average': -1 });
  }

  async findByLocationPaginated(city?: string, department?: string, page = 1, limit = 10): Promise<{ drivers: IDriver[], total: number }> {
    const filter: any = { isApproved: true };
    
    if (city) filter['location.city'] = city;
    if (department) filter['location.department'] = department;

    const skip = (page - 1) * limit;
    const drivers = await this.model.find(filter)
      .sort({ 'rating.average': -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await this.model.countDocuments(filter);
    
    return { drivers, total };
  }

  async findAllSortedByRating(): Promise<IDriver[]> {
    return await this.model.find({ isApproved: true }).sort({ 'rating.average': -1 });
  }

  async findAllSortedByRatingPaginated(page = 1, limit = 10): Promise<{ drivers: IDriver[], total: number }> {
    const filter = { isApproved: true };
    const skip = (page - 1) * limit;
    
    const drivers = await this.model.find(filter)
      .sort({ 'rating.average': -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await this.model.countDocuments(filter);
    
    return { drivers, total };
  }

  async findDriversNearParent(parentLocation: { city: string; department: string }): Promise<IDriver[]> {
    return await this.model.find({
      isApproved: true,
      $or: [
        { 'location.city': parentLocation.city },
        { 'location.department': parentLocation.department }
      ]
    }).sort({ 'rating.average': -1 });
  }

  async findDriversNearParentPaginated(parentLocation: { city: string; department: string }, page = 1, limit = 10): Promise<{ drivers: IDriver[], total: number }> {
    const filter = {
      isApproved: true,
      $or: [
        { 'location.city': parentLocation.city },
        { 'location.department': parentLocation.department }
      ]
    };
    
    const skip = (page - 1) * limit;
    
    const drivers = await this.model.find(filter)
      .sort({ 'rating.average': -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await this.model.countDocuments(filter);
    
    return { drivers, total };
  }
}

export const driverRepo = new DriverRepo(DriverModel);
