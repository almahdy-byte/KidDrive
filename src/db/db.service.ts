import mongoose, {
  QueryFilter,
  Model,
  PopulateOptions,
  SortOrder
} from 'mongoose';

// Find options
interface FindOptions<TDoc> {
  filter: QueryFilter<TDoc>;
  select?: string;
  populate?: PopulateOptions[];
}

//FindMany options
interface FindManyOptions<TDoc> {
  filter?: QueryFilter<TDoc>;
  select?: string;
  populate?: PopulateOptions[];
  sort?: { [key: string]: SortOrder };
  limit?: number | undefined;
  page?: number | undefined;
}

// Update options
interface UpdateOptions<TDoc> {
  filter: QueryFilter<TDoc>;
  update: Partial<TDoc>;
}

// Delete options
interface DeleteOptions<TDoc> {
  filter?: QueryFilter<TDoc>;
}

// findById options
interface FindByIdOptions {
  id: mongoose.Types.ObjectId | string | undefined;
  select?: string;
  populate?: PopulateOptions[];
}

// FindByIdAndUpdate options
interface FindByIdAndUpdateOptions<TDoc> {
  id: mongoose.Types.ObjectId | string;
  update: Partial<TDoc>;
}

export class DBServices<TDoc> {
  constructor(private model: Model<TDoc>) {

  }


  // Create

  // Find One
  async findOne({
    filter,
    select = '',
    populate = [],
  }: FindOptions<TDoc>): Promise<TDoc | null> {
    return await this.model.findOne(filter).select(select).populate(populate);
  }

  // Find All
  async findAll({
    filter = {},
    select = '',
    populate = [],
    sort,
    limit,
    page = 1,
  }: FindManyOptions<TDoc>): Promise<TDoc[]> {
    const query = this.model.find(filter).select(select).populate(populate);
    if (sort) {
      query.sort(sort);
    }

    if (limit) {

      if (typeof limit !== 'number') {
        limit = parseInt(limit as unknown as string);
      }
      if (limit < 1) {
        limit = 10;
      }
      if (page) {
        if (typeof page !== 'number') {
          page = parseInt(page as unknown as string);
        }
        if (page < 1) {
          page = 1;
        }
        const skip = (page - 1) * limit;
        query.skip(skip);
      }
      query.limit(limit);
    }
    return await query.exec();
  }


  // Update One
  async updateOne({ filter, update }: UpdateOptions<TDoc>): Promise<TDoc | null> {
    return await this.model.findOneAndUpdate(filter, update, { new: true });
  }

  // Find By Id
  async findById({
    id,
    select = '',
    populate = [],
  }: FindByIdOptions): Promise<TDoc | null> {
    return await this.model.findById(id).select(select).populate(populate);
  }

  // Find By Id And Update
  async findByIdAndUpdate({
    id,
    update,
  }: FindByIdAndUpdateOptions<TDoc>): Promise<TDoc | null> {
    return await this.model.findByIdAndUpdate(id, update, { new: true });
  }

  // Delete One By Id
  async deleteById({ id }: FindByIdOptions): Promise<TDoc | null> {
    return await this.model.findByIdAndDelete(id);
  }

  // Delete One By Filter
  async deleteOne({ filter }: DeleteOptions<TDoc>): Promise<TDoc | null> {
    return await this.model.findOneAndDelete(filter);
  }

  // Delete Many By Filter
  async deleteMany({ filter = {} }: DeleteOptions<TDoc>): Promise<{
    deletedCount?: number;
  }> {
    return await this.model.deleteMany(filter);
  }
}
