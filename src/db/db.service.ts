import mongoose, {
  QueryFilter,
  Model,
  PopulateOptions,
  SortOrder,
  UpdateQuery,
  QueryOptions,
  HydratedDocument,
  FlattenMaps,
  UpdateWriteOpResult,
  MongooseUpdateQueryOptions,
} from "mongoose";


export type lean<T> = HydratedDocument<FlattenMaps<T>>;
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

export abstract class DBServices<TDoc> {
  constructor(protected readonly model: Model<TDoc>) {}

  // Create

  // Find One
  async findOne({
    filter,
    select = "",
    populate = [],
  }: FindOptions<TDoc>): Promise<TDoc | null> {
    return await this.model.findOne(filter).select(select).populate(populate);
  }

  // Find All
  async findAll({
    filter = {},
    select = "",
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
      if (typeof limit !== "number") {
        limit = parseInt(limit as unknown as string);
      }
      if (limit < 1) {
        limit = 10;
      }
      if (page) {
        if (typeof page !== "number") {
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
  async updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<TDoc>;
    update: UpdateQuery<TDoc>;
    options?: MongooseUpdateQueryOptions<TDoc> | null;
  }): Promise<UpdateWriteOpResult> {
    if (Array.isArray(update)) {
      update.push({
        $set: {
          __v: {
            $add: ["$__v", 1],
          },
        },
      });
      return await this.model.updateOne(filter, update, options);
    }
    return await this.model.updateOne(
      filter,
      { ...update, $inc: { __v: 1 } },
      options,
    );
  }

  // Find By Id
  async findById({
    id,
    select = "",
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

  async findOneAndUpdate({
    filter,
    update = { new: true },
    options,
  }: {
    filter?: any;
    update: UpdateQuery<TDoc>;
    options?: QueryOptions<TDoc> | null;
  }): Promise<HydratedDocument<TDoc> | lean<TDoc> | null> {
    return await this.model.findOneAndUpdate(
      filter,
      { ...update, $inc: { __v: 1 } },
      options,
    );
  }
}
