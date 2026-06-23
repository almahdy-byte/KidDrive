# Database Service (db.service.ts)

## Overview
Abstract generic database service class `DBServices<TDoc>` providing reusable CRUD operations for all MongoDB models.

## File: src/db/db.service.ts — Line-by-Line

### Types & Interfaces

- **Line 1-12**: Imports Mongoose types for typing
- **Line 15**: `lean<T>` type alias — hydrated + flattened document
- **Lines 17-21**: `FindOptions<TDoc>` — filter, select, populate for single document find
- **Lines 24-31**: `FindManyOptions<TDoc>` — extends find options with sort, limit, page
- **Lines 34-37**: `UpdateOptions<TDoc>` — filter + update fields
- **Lines 40-42**: `DeleteOptions<TDoc>` — optional filter
- **Lines 45-49**: `FindByIdOptions` — id, select, populate
- **Lines 52-55**: `FindByIdAndUpdateOptions<TDoc>` — id + update

### Abstract Class

- **Line 57**: `export abstract class DBServices<TDoc>` — abstract generic class
- **Line 58**: `constructor(protected readonly model: Model<TDoc>)` — takes Mongoose model

### Methods

- **Lines 63-69**: `findOne({filter, select, populate})` — finds single document by filter
- **Lines 72-105**: `findAll({filter, select, populate, sort, limit, page})` — finds multiple documents with pagination support
  - Line 80: Starts query with filter, select, populate
  - Lines 81-83: Applies sort if provided
  - Lines 85-103: Applies pagination (skip + limit) with defaults
  - Line 104: Returns executed query
- **Lines 108-132**: `updateOne({filter, update, options})` — updates single document
  - Lines 117-125: If update is an array (pipeline), appends __v increment
  - Lines 127-131: Otherwise spreads update with $inc: { __v: 1 }
- **Lines 135-141**: `findById({id, select, populate})` — finds by _id
- **Lines 144-149**: `findByIdAndUpdate({id, update})` — finds and updates, returns new doc
- **Lines 152-154**: `deleteById({id})` — deletes by _id
- **Lines 157-159**: `deleteOne({filter})` — deletes first matching document
- **Lines 162-166**: `deleteMany({filter})` — deletes all matching documents
- **Lines 168-182**: `findOneAndUpdate({filter, update, options})` — finds and updates with options, increments __v
- **Lines 184-186**: `countDocuments(filter)` — counts matching documents
