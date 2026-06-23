# Admin Driver Ban/Unban

## Overview
Ban and unban drivers. Banned drivers cannot log in or access the platform. Ban/unban actions are recorded with the admin who performed them and a reason.

## Endpoints (admin.routes.ts)

| Method | Path | Description |
|--------|------|-------------|
| PATCH | `/admin/drivers/:id/ban` | Ban a driver |
| PATCH | `/admin/drivers/:id/unban` | Unban a driver |
| GET | `/admin/drivers/banned` | List all banned drivers (paginated, searchable) |

*All admin routes require authentication + Admin role*

---

## Implementation Plan

### 1. Driver Model — Add `isBanned` and `banInfo` fields

**File:** `src/db/models/driverModel/driver.model.ts`

Add to the `IDriver` interface:
```typescript
isBanned: boolean;
banInfo?: {
  bannedBy: Types.ObjectId;
  bannedAt: Date;
  reason: string;
  unbanInfo?: {
    unbannedBy: Types.ObjectId;
    unbannedAt: Date;
    reason: string;
  };
};
```

Add to the schema:
```typescript
isBanned: { type: Boolean, default: false },
banInfo: {
  bannedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  bannedAt: { type: Date },
  reason: { type: String },
  unbanInfo: {
    unbannedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    unbannedAt: { type: Date },
    reason: { type: String }
  }
}
```

### 2. Driver Repo — Add ban/unban methods

**File:** `src/db/models/driverModel/driver.repo.ts`

```typescript
async ban(driverId: string, adminId: string, reason: string): Promise<IDriver | null> {
  return await this.model.findByIdAndUpdate(
    driverId,
    {
      isBanned: true,
      isActive: false,
      'banInfo.bannedBy': new Types.ObjectId(adminId),
      'banInfo.bannedAt': new Date(),
      'banInfo.reason': reason,
      $unset: { 'banInfo.unbanInfo': '' }
    },
    { new: true }
  );
}

async unban(driverId: string, adminId: string, reason: string): Promise<IDriver | null> {
  return await this.model.findByIdAndUpdate(
    driverId,
    {
      isBanned: false,
      isActive: true,
      'banInfo.unbanInfo': {
        unbannedBy: new Types.ObjectId(adminId),
        unbannedAt: new Date(),
        reason
      }
    },
    { new: true }
  );
}
```

### 3. Validation

**File:** `src/modules/admin/admin.validation.ts`

```typescript
export const banDriverValidation = Joi.object({
  reason: Joi.string().required().min(10).max(500).messages({
    'string.empty': 'Ban reason is required',
    'string.min': 'Ban reason must be at least 10 characters',
    'any.required': 'Ban reason is required'
  }),
  id: Joi.string().required()
});

export const unbanDriverValidation = Joi.object({
  reason: Joi.string().optional().max(500),
  id: Joi.string().required()
});
```

### 4. Controller Functions

**File:** `src/modules/admin/admin.controller.ts`

#### `banDriver`
- `PATCH /admin/drivers/:id/ban`
- Validates driver exists
- Validates driver is not already banned
- Calls `driverRepo.ban(driverId, adminId, reason)`
- Returns the updated driver

#### `unbanDriver`
- `PATCH /admin/drivers/:id/unban`
- Validates driver exists
- Validates driver is currently banned
- Calls `driverRepo.unban(driverId, adminId, reason)`
- Returns the updated driver

#### `getBannedDrivers`
- `GET /admin/drivers/banned`
- Paginated list with search (userName, email, nationalId, phone)
- Filters `isBanned: true`

### 5. Routes

**File:** `src/modules/admin/admin.routes.ts`

```typescript
import { banDriver, unbanDriver, getBannedDrivers } from "./admin.controller";
import { banDriverValidation, unbanDriverValidation } from "./admin.validation";

router.patch('/drivers/:id/ban',
  validate(banDriverValidation),
  banDriver
);

router.patch('/drivers/:id/unban',
  validate(unbanDriverValidation),
  unbanDriver
);

router.get('/drivers/banned', getBannedDrivers);
```

### 6. Auth Middleware — Block Banned Drivers

**File:** `src/middleware/auth.middleware.ts`

In the `auth` function, after the driver is fetched (line 57-62), add a check:

```typescript
case Role.Driver:
  user = await driverRepo.findOne({
    filter: { _id: decoded._id },
    select: "-password"
  });

  if (user?.isBanned) {
    return next(
      new AppError("Your account has been banned. Contact support.", StatusCodes.FORBIDDEN)
    );
  }
  break;
```

### 7. Driver Login — Block Banned Drivers

**File:** `src/modules/driver/driver.controller.ts`

In the `login` function, after finding the driver, check `isBanned`:

```typescript
if (driver.isBanned) {
  return next(
    new AppError("Your account has been banned. Contact support.", StatusCodes.FORBIDDEN)
  );
}
```

---

## Request/Response Examples

### Ban Driver

**Request:**
```json
PATCH /admin/drivers/507f1f77bcf86cd799439012/ban
{
  "reason": "Repeated violations of platform terms of service - unauthorized route changes"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Driver banned successfully",
  "data": {
    "driverId": "507f1f77bcf86cd799439012",
    "userName": "Omar Hassan",
    "isBanned": true,
    "bannedBy": "507f1f77bcf86cd799439000",
    "bannedAt": "2026-06-23T10:00:00.000Z",
    "reason": "Repeated violations of platform terms of service - unauthorized route changes"
  }
}
```

**Error Responses:**
- 400: `"Driver is already banned"`
- 404: `"Driver not found"`

### Unban Driver

**Request:**
```json
PATCH /admin/drivers/507f1f77bcf86cd799439012/unban
{
  "reason": "Driver appealed successfully, accepted apologies"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Driver unbanned successfully",
  "data": {
    "driverId": "507f1f77bcf86cd799439012",
    "userName": "Omar Hassan",
    "isBanned": false,
    "isActive": true,
    "unbannedBy": "507f1f77bcf86cd799439000",
    "unbannedAt": "2026-06-23T12:00:00.000Z",
    "reason": "Driver appealed successfully, accepted apologies"
  }
}
```

**Error Responses:**
- 400: `"Driver is not banned"`
- 404: `"Driver not found"`

### Get Banned Drivers

**Request:**
```
GET /admin/drivers/banned?page=1&limit=10&search=omar
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userName": "Omar Hassan",
      "email": "omar.driver@example.com",
      "phone": "encrypted_phone",
      "nationalId": "12345678901234",
      "isBanned": true,
      "isActive": false,
      "banInfo": {
        "bannedBy": {
          "_id": "507f1f77bcf86cd799439000",
          "fullName": "Admin User"
        },
        "bannedAt": "2026-06-23T10:00:00.000Z",
        "reason": "Repeated violations of platform terms of service"
      },
      "rating": { "average": 4.5, "count": 10 },
      "location": { "city": "Cairo", "department": "Giza" },
      "createdAt": "2026-04-01T10:00:00.000Z",
      "updatedAt": "2026-06-23T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```
