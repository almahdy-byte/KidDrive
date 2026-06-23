# Admin Dashboard API Documentation — Full Reference

Base URL: `http://localhost:3000`

**Authentication**: All protected endpoints require a Bearer token.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Admin Role Guard**: Endpoints marked `[Admin]` require `Admin` role. Admin can also access many endpoints shared with `Parent` and `Driver` roles.

---

## — AUTH ENDPOINTS —

### POST `/auth/register`
Register a new parent account. No auth required.

**Request Body:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Ali",
  "email": "ahmed.ali@example.com",
  "password": "password123",
  "phone": "01001234567",
  "location": {
    "city": "Cairo",
    "department": "Giza"
  }
}
```

**Response (201):**
```json
{
  "message": "Registered successfully. Please check your email for OTP.",
  "success": true,
  "status": "success",
  "data": { "userId": "...", "email": "ahmed.ali@example.com" }
}
```

---

### POST `/auth/verify-email`
Verify email with OTP code sent after registration.

**Request Body:**
```json
{
  "email": "ahmed.ali@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "User verified successfully",
  "success": true,
  "status": "success",
  "data": {
    "tokens": {
      "accessToken": "<jwt>",
      "refreshToken": "<jwt>"
    },
    "isVerified": true
  }
}
```

---

### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@kiddrive.com",
  "password": "Admin@123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "success": true,
  "status": "success",
  "data": {
    "tokens": {
      "accessToken": "<jwt>",
      "refreshToken": "<jwt>"
    },
    "isVerified": true
  }
}
```

**Note:** If user is not verified, returns:
```json
{
  "message": "User not verified",
  "success": false,
  "status": "failed",
  "data": { "isVerified": false }
}
```

---

### POST `/auth/refresh-token`
Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "<refresh_token>"
}
```

**Response (200):**
```json
{
  "message": "Refresh token successful",
  "success": true,
  "status": "success",
  "data": { "token": "<new_access_token>", "isVerified": true }
}
```

---

### POST `/auth/resend-email-otp`
Resend email verification OTP.

**Request Body:**
```json
{
  "email": "ahmed.ali@example.com"
}
```

**Response (200):**
```json
{
  "message": "OTP sent successfully",
  "success": true,
  "status": "success",
  "data": { "email": "ahmed.ali@example.com" }
}
```

---

### POST `/auth/forget-password`
Send forget password OTP to email.

**Request Body:**
```json
{
  "email": "ahmed.ali@example.com"
}
```

**Response (200):**
```json
{
  "message": "Reset password OTP sent successfully",
  "success": true,
  "status": "success",
  "data": { "email": "ahmed.ali@example.com" }
}
```

---

### POST `/auth/verify-reset-otp`
Verify reset password OTP.

**Request Body:**
```json
{
  "email": "ahmed.ali@example.com",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "OTP verified successfully",
  "success": true,
  "status": "success",
  "data": { "token": "<reset_token>" }
}
```

---

### POST `/auth/reset-password`
Reset password using token from verify-reset-otp.

**Headers:**
```
Authorization: Bearer <reset_token>
```

**Request Body:**
```json
{
  "password": "newPassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully",
  "success": true,
  "status": "success"
}
```

---

## — USER PROFILE ENDPOINTS —

### GET `/user/profile` `[Auth]`
Get current authenticated user's profile.

**Response (200):**
```json
{
  "message": "Profile retrieved successfully",
  "success": true,
  "status": "success",
  "data": {
    "_id": "...",
    "firstName": "Admin",
    "lastName": "User",
    "fullName": "Admin User",
    "email": "admin@kiddrive.com",
    "role": "admin",
    "phone": "encrypted_phone",
    "isVerified": true,
    "isDeleted": false,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

### PATCH `/user/profile` `[Auth]`
Update current user's profile.

**Request Body:**
```json
{
  "firstName": "Admin",
  "lastName": "Updated",
  "phone": "01009999999"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "success": true,
  "status": "success",
  "data": { "firstName": "Admin", "lastName": "Updated", "phone": "01009999999", ... }
}
```

---

## — ADMIN DASHBOARD ENDPOINTS `[Admin]` —

### GET `/admin/dashboard/stats`
Get overall dashboard statistics.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "applications": {
      "total": 10,
      "pending": 3,
      "approved": 5,
      "rejected": 2
    },
    "drivers": {
      "total": 15,
      "active": 12,
      "inactive": 3
    },
    "parents": {
      "total": 25
    }
  }
}
```

---

### GET `/admin/applications`
Get all driver applications (paginated, filterable).

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Items per page (max 100) |
| status | string | No | - | Filter: `pending`, `approved`, `rejected` |
| search | string | No | - | Search by status text or driver userName/email/nationalId |

**Example:**
```
GET /admin/applications?page=1&limit=10&status=pending&search=omar
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "driver": {
        "_id": "507f1f77bcf86cd799439012",
        "userName": "Omar Hassan",
        "email": "omar.driver@example.com",
        "nationalId": "12345678901234",
        "phone": "encrypted_phone"
      },
      "vehicle": {
        "_id": "507f1f77bcf86cd799439013",
        "carModel": "Toyota Camry",
        "plateNumber": "ABC 1234",
        "carColor": "Silver"
      },
      "status": "pending",
      "createdAt": "2026-04-05T10:00:00Z",
      "updatedAt": "2026-04-05T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### GET `/admin/applications/:id`
Get a specific driver application by ID with full details.

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "driver": {
      "_id": "507f1f77bcf86cd799439012",
      "firstName": "Omar",
      "lastName": "Hassan",
      "email": "omar.driver@example.com",
      "nationalId": "12345678901234",
      "phone": "01001234569",
      "city": "Cairo",
      "department": "Giza"
    },
    "vehicle": {
      "_id": "507f1f77bcf86cd799439013",
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "licensePlate": "ABC 1234",
      "registrationExpiry": "2027-01-01T00:00:00Z",
      "insuranceExpiry": "2026-06-01T00:00:00Z",
      "images": []
    },
    "status": "pending",
    "createdAt": "2026-04-05T10:00:00Z",
    "updatedAt": "2026-04-05T10:00:00Z"
  }
}
```

**Response (404):**
```json
{
  "status": "error",
  "message": "Application not found"
}
```

---

### PATCH `/admin/applications/:id/approve`
Approve a driver application. Activates the driver.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| notes | string | No | Optional approval notes |

```json
{
  "notes": "All documents verified. Driver approved."
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Driver application approved successfully",
  "data": {
    "applicationId": "507f1f77bcf86cd799439011",
    "driverId": "507f1f77bcf86cd799439012",
    "status": "approved",
    "approvedBy": "507f1f77bcf86cd799439000",
    "approvedAt": "2026-04-05T12:00:00Z",
    "notes": "All documents verified. Driver approved."
  }
}
```

**Error Responses:**
- 400: `"Application has already been processed"`
- 404: `"Application not found"`

---

### PATCH `/admin/applications/:id/reject`
Reject a driver application. Deactivates the driver.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Rejection reason (max 500 chars) |

```json
{
  "reason": "Incomplete vehicle documents. Registration expired."
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Driver application rejected successfully",
  "data": {
    "applicationId": "507f1f77bcf86cd799439011",
    "driverId": "507f1f77bcf86cd799439012",
    "status": "rejected",
    "rejectedBy": "507f1f77bcf86cd799439000",
    "rejectedAt": "2026-04-05T12:00:00Z",
    "reason": "Incomplete vehicle documents. Registration expired."
  }
}
```

**Error Responses:**
- 400: `"Rejection reason is required"`
- 400: `"Application has already been processed"`
- 404: `"Application not found"`

---

## — PARENT MANAGEMENT ENDPOINTS (Admin-Accessible) —

### GET `/admin/parents` `[Admin]`
Get all parents with pagination and search. Shows only non-deleted parent accounts with their children.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Items per page (max 100) |
| search | string | No | - | Search by firstName, lastName, or email |

**Example:**
```
GET /admin/parents?page=1&limit=10&search=ahmed
```

**Response (200):**
```json
{
  "success": true,
  "message": "Parents retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439001",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "fullName": "Ahmed Ali",
      "email": "ahmed.ali@example.com",
      "role": "parent",
      "phone": "encrypted_phone",
      "isVerified": true,
      "location": {
        "city": "Cairo",
        "department": "Giza"
      },
      "children": [
        {
          "_id": "507f1f77bcf86cd799439020",
          "name": "Youssef",
          "age": 8,
          "gender": "male",
          "photo": "https://res.cloudinary.com/...",
          "school": "International School"
        }
      ],
      "createdAt": "2026-03-01T10:00:00Z",
      "updatedAt": "2026-04-05T12:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## — DRIVER MANAGEMENT ENDPOINTS (Admin-Accessible) —

### GET `/driver/` `[Admin, Parent]`
Get all drivers with vehicles, paginated, filterable by city/department.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Items per page |
| city | string | No | - | Filter by city |
| department | string | No | - | Filter by department |
| search | string | No | - | Search by userName/email |

**Response (200):**
```json
{
  "message": "Drivers retrieved successfully",
  "success": true,
  "data": [
    {
      "driver": {
        "_id": "507f1f77bcf86cd799439012",
        "userName": "Omar Driver",
        "email": "omar.driver@example.com",
        "phone": "encrypted_phone",
        "nationalId": "12345678901234",
        "isApproved": true,
        "rating": { "average": 4.5, "count": 10 },
        "location": {
          "city": "Cairo",
          "department": "Giza",
          "latitude": 30.033,
          "longitude": 31.223,
          "address": "789 Driver Street"
        },
        "licenseImage": { "public_id": "...", "secure_url": "..." },
        "nationalIdImage": { "public_id": "...", "secure_url": "..." },
        "createdAt": "2026-04-01T10:00:00Z",
        "updatedAt": "2026-04-01T10:00:00Z"
      },
      "vehicle": {
        "_id": "507f1f77bcf86cd799439013",
        "carModel": "Toyota Camry",
        "plateNumber": "ABC 1234",
        "carColor": "Silver",
        "governmentDocuments": [{ "public_id": "...", "secure_url": "..." }],
        "status": "approved",
        "isApproved": true,
        "createdAt": "2026-04-01T10:00:00Z",
        "updatedAt": "2026-04-01T10:00:00Z"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### GET `/driver/:driverId` `[Admin, Parent]`
Get a single driver by ID with vehicle info.

**Response (200):** Same structure as the driver object inside `data[].driver` + `data[].vehicle` above.

**Response (404):**
```json
{
  "message": "Driver not found",
  "success": false
}
```

---

### PATCH `/driver/application/:applicationId/approve` `[Admin]`
Alternative approve endpoint (also available via `/admin/applications/:id/approve`).

**Response (200):**
```json
{
  "message": "Driver approved successfully",
  "data": {
    "_id": "applicationId",
    "driver": "driverId",
    "vehicle": "vehicleId",
    "status": "approved"
  }
}
```

---

### PATCH `/driver/:driverId/vehicle/:vehicleId/approve` `[Admin]`
Approve a vehicle for a driver.

**Response (200):**
```json
{
  "message": "Driver approved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "driver": "507f1f77bcf86cd799439012",
    "carModel": "Toyota Camry",
    "plateNumber": "ABC 1234",
    "carColor": "Silver",
    "status": "approved",
    "isApproved": true,
    "governmentDocuments": [...]
  }
}
```

**Response (404):**
```json
{
  "status": "error",
  "message": "Vehicle not found"
}
```

---

## — PARENT & CHILD MANAGEMENT (Admin-Accessible) —

### GET `/parent/:id` `[Auth: Admin, Self, Driver]`
Get parent by ID with children.

**Response (200):**
```json
{
  "success": true,
  "message": "Parent retrieved successfully",
  "data": {
    "_id": "...",
    "firstName": "Ahmed",
    "lastName": "Ali",
    "fullName": "Ahmed Ali",
    "email": "ahmed.ali@example.com",
    "phone": "encrypted_phone",
    "location": { "city": "Cairo", "department": "Giza" },
    "children": [
      {
        "_id": "...",
        "name": "Youssef",
        "age": 8,
        "gender": "male",
        "photo": "url",
        "school": "International School",
        "schoolLocation": { "latitude": 30.0, "longitude": 31.0, "address": "..." },
        "schedule": { "arriveTime": "08:00", "backHome": "14:00" }
      }
    ]
  }
}
```

---

### GET `/parent/:id/basic` `[No Auth]`
Get parent basic public info.

**Response (200):**
```json
{
  "success": true,
  "message": "Parent basic info retrieved successfully",
  "data": {
    "_id": "...",
    "firstName": "Ahmed",
    "lastName": "Ali",
    "fullName": "Ahmed Ali",
    "email": "ahmed.ali@example.com",
    "phone": "encrypted_phone"
  }
}
```

---

### POST `/parent/` `[Admin, Parent]` — multipart/form-data
Add a child for a parent.

**Form Data Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| photo | file | No | Child photo image |
| name | string | Yes | Child name |
| age | number | Yes | Child age |
| gender | string | No | `male` or `female` (default: male) |
| school | string | No | School name |
| schoolLatitude | number | No | School latitude |
| schoolLongitude | number | No | School longitude |
| schoolAddress | string | No | School address |
| arriveTime | string | No | School arrival time (HH:MM) |
| backHome | string | No | Back home time (HH:MM) |

**Response (201):**
```json
{
  "message": "Child added successfully",
  "success": true,
  "status": "success",
  "data": {
    "_id": "...",
    "name": "Youssef",
    "age": 8,
    "parentId": "...",
    "gender": "male",
    "isDeleted": false,
    "photo": "url",
    "school": "International School",
    "schoolLocation": { "latitude": 30.0, "longitude": 31.0, "address": "..." },
    "schedule": { "arriveTime": "08:00", "backHome": "14:00" }
  }
}
```

---

### GET `/parent/` `[Admin, Parent]`
Get all children for the authenticated parent (or all if admin — but admin uses the same parentId context).

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| search | string | No | Search by child name |

**Response (200):**
```json
{
  "success": true,
  "status": "success",
  "data": [ ...children array ... ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

---

### GET `/parent/:childId` `[Auth]`
Get a single child.

**Response (200):**
```json
{
  "success": true,
  "status": "success",
  "data": { ...child object ... }
}
```

---

### PATCH `/parent/:childId/update` `[Admin, Parent]`
Update a child's information.

**Request Body:** Any child fields to update (name, age, gender, school, etc.)

**Response (200):**
```json
{
  "message": "Child updated successfully",
  "success": true,
  "status": "success",
  "data": { ...updated child object ... }
}
```

---

### DELETE `/parent/:childId/delete` `[Admin, Parent]`
Soft delete a child.

**Response (200):**
```json
{
  "message": "Child deleted successfully",
  "success": true,
  "status": "success"
}
```

---

### PATCH `/parent/:childId/restore` `[Admin, Parent]`
Restore a soft-deleted child.

**Response (200):**
```json
{
  "message": "Child restored successfully",
  "success": true,
  "status": "success",
  "data": { ...restored child object ... }
}
```

---

## — SUBSCRIPTION MANAGEMENT (Admin-Accessible) —

### POST `/subscription/` `[Auth: Parent, Admin]`
Create a new subscription. Automatically generates trips for 30 days.

**Request Body:**
```json
{
  "driverId": "507f1f77bcf86cd799439012",
  "parentId": "507f1f77bcf86cd799439001",
  "childId": "507f1f77bcf86cd799439020",
  "subscriptionType": "monthly",
  "expiryDate": "2026-05-05T00:00:00Z",
  "schedule": [
    {
      "dayOfWeek": 0,
      "pickupTime": "07:30",
      "dropoffTime": "14:00"
    },
    {
      "dayOfWeek": 1,
      "pickupTime": "07:30",
      "dropoffTime": "14:00"
    },
    {
      "dayOfWeek": 2,
      "pickupTime": "07:30",
      "dropoffTime": "14:00"
    },
    {
      "dayOfWeek": 3,
      "pickupTime": "07:30",
      "dropoffTime": "14:00"
    }
  ],
  "origin": {
    "latitude": 30.033,
    "longitude": 31.223,
    "address": "Home Address"
  },
  "destination": {
    "latitude": 30.05,
    "longitude": 31.25,
    "address": "School Address"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| driverId | string | Yes | Driver ID |
| parentId | string | Yes | Parent ID |
| childId | string | Yes | Child ID |
| subscriptionType | string | Yes | `monthly` or `term` |
| expiryDate | string | No | ISO date (defaults to 1 month from now) |
| schedule | array | Yes | Array of schedule items (min 1) |
| schedule[].dayOfWeek | number | Yes | 0=Sunday, 1=Monday ... 6=Saturday |
| schedule[].pickupTime | string | Yes | HH:MM format |
| schedule[].dropoffTime | string | Yes | HH:MM format |
| origin | object | Yes | Pickup location |
| origin.latitude | number | Yes | Latitude |
| origin.longitude | number | Yes | Longitude |
| origin.address | string | Yes | Address text |
| destination | object | Yes | Dropoff location |
| destination.latitude | number | Yes | Latitude |
| destination.longitude | number | Yes | Longitude |
| destination.address | string | Yes | Address text |

**Response (201):**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "_id": "...",
    "driverId": { ...populated driver... },
    "parentId": "...",
    "childId": { ...populated child... },
    "expiryDate": "2026-05-05T00:00:00.000Z",
    "status": "waiting for confirmation",
    "subscriptionType": "monthly",
    "schedulePattern": [...],
    "schedule": ["tripId1", "tripId2", ...],
    "origin": { "latitude": 30.033, "longitude": 31.223, "address": "Home Address" },
    "destination": { "latitude": 30.05, "longitude": 31.25, "address": "School Address" },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/subscription/` `[Admin]`
Get all subscriptions (admin only).

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| search | string | No | Search term |

**Response (200):**
```json
{
  "success": true,
  "data": [...subscriptions array...],
  "pagination": { "currentPage": 1, "limit": 10, "total": 5, "totalPages": 1 }
}
```

---

### GET `/subscription/pending/all` `[Auth]`
Get pending subscriptions. Admin sees all pending.

**Response (200):**
```json
{
  "success": true,
  "data": [...pending subscriptions...],
  "pagination": { "currentPage": 1, "limit": 10, "total": 2, "totalPages": 1 }
}
```

---

### GET `/subscription/my` `[Auth]`
Get current user's subscriptions. Admin sees 403 — this is for Parent/Driver only.

---

### GET `/subscription/:id` `[Auth]`
Get subscription by ID with full populated data (driver, child, schedule trips).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "driverId": { ...populated driver object ... },
    "parentId": { ...populated parent object ... },
    "childId": { ...populated child object ... },
    "expiryDate": "2026-05-05T00:00:00.000Z",
    "status": "accepted subscription",
    "subscriptionType": "monthly",
    "schedulePattern": [...],
    "schedule": [{ ...populated trip objects ... }],
    "origin": { ... },
    "destination": { ... },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/subscription/driver/:driverId` `[Auth]`
Get subscriptions by driver ID. Admin can access any driver.

### GET `/subscription/driver/:driverId/subscriptions` `[Auth]`
Get driver subscriptions with optional status filter.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | `active`, `accepted`, `pending`, or any subscription status |

### GET `/subscription/parent/:parentId` `[Auth]`
Get subscriptions by parent ID. Admin can access any parent.

### GET `/subscription/child/:childId` `[Auth]`
Get subscriptions by child ID. Admin can access any child.

### PATCH `/subscription/:id/status` `[Auth]`
Update subscription status. Admin can set any status.

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Status Values:**
| Value | Description |
|-------|-------------|
| `accepted` | Accepted by driver (auto-generates trips) |
| `rejected` | Rejected by driver |
| `canceled` | Canceled |
| `waiting for confirmation` | Default pending state |

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription accepted and trips generated successfully",
  "data": {
    "subscription": { ...full populated subscription... },
    "generatedTripsCount": 20
  }
}
```

---

### POST `/subscription/:id/generate-trips` `[Auth]`
Manually generate trips from an accepted subscription.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| daysAhead | number | No | Number of days to generate trips for (default: 30) |

**Response (200):**
```json
{
  "success": true,
  "message": "Generated 20 trips successfully",
  "data": {
    "generatedTripsCount": 20,
    "trips": [ ...generated trip objects... ]
  }
}
```

---

## — TRIP MANAGEMENT (Admin-Accessible) —

### GET `/trip/` `[Admin]`
Get all trips (admin only).

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| status | string | No | Filter by trip status |
| search | string | No | Search term |

**Response (200):**
```json
{
  "success": true,
  "message": "All trips retrieved successfully",
  "data": [...trips...],
  "pagination": { "currentPage": 1, "limit": 10, "total": 50, "totalPages": 5 }
}
```

---

### GET `/trip/active` `[Auth]`
Get active trips. Admin sees all active trips.

**Response (200):**
```json
{
  "success": true,
  "message": "Active trips retrieved successfully",
  "data": [...active trips...],
  "pagination": { "currentPage": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

---

### GET `/trip/:id` `[Auth]`
Get trip by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "driverId": { ...populated driver... },
    "parentId": { ...populated parent... },
    "childId": { ...populated child... },
    "subscriptionId": { ...populated subscription... },
    "origin": { "latitude": 30.033, "longitude": 31.223, "address": "Home" },
    "destination": { "latitude": 30.05, "longitude": 31.25, "address": "School" },
    "status": "idle",
    "tripType": "pickup",
    "scheduledDate": "2026-04-10T00:00:00.000Z",
    "scheduledTime": "07:30",
    "dayOfWeek": 0,
    "startTime": null,
    "endTime": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### GET `/trip/driver/:driverId` `[Auth]`
Get trips by driver. Admin can access any driver.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number |
| limit | number | Items per page |
| status | string | Filter by status (`idle`, `trip_started`, `child_boarded`, `child_dropped_off`, `trip_finished`) |
| search | string | Search term |

---

### GET `/trip/parent/:parentId` `[Auth]`
Get trips by parent. Admin can access any parent.

Same query parameters as driver trips.

---

### GET `/trip/child/:childId` `[Auth]`
Get trips by child. Admin can access any child.

---

### GET `/trip/subscription/:subscriptionId` `[Auth]`
Get trips by subscription. Admin can access any.

---

### GET `/trip/driver/:driverId/from-subscriptions` `[Auth]`
Get scheduled trips from driver's subscriptions for a specific day.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| day | number | (0-6) Day of week to get trips for |
| date | string | ISO date string to get trips for |
| page | number | Page number |
| limit | number | Items per page |

If neither `day` nor `date` provided, defaults to today.

**Response (200):**
```json
{
  "success": true,
  "message": "Scheduled trips from subscriptions retrieved successfully",
  "dayOfWeek": 0,
  "date": "2026-04-10",
  "subscriptionsCount": 2,
  "data": [...trips...],
  "pagination": { "currentPage": 1, "limit": 10, "total": 4, "totalPages": 1 }
}
```

---

### GET `/trip/parent/:parentId/from-subscriptions` `[Auth]`
Get scheduled trips from parent's subscriptions. Same query params and response shape as driver version.

---

### GET `/trip/driver/:driverId/today` `[Auth]`
Get today's trips for a driver.

**Response (200):**
```json
{
  "success": true,
  "message": "Today's trips retrieved successfully",
  "data": [...trips...]
}
```

---

### GET `/trip/parent/:parentId/today` `[Auth]`
Get today's trips for a parent.

---

### POST `/trip/start` `[Auth]`
Start a new trip (driver or parent).

**Request Body:**
```json
{
  "driverId": "...",
  "parentId": "...",
  "childId": "...",
  "subscriptionId": "...",
  "origin": { "latitude": 30.033, "longitude": 31.223, "address": "Home" },
  "destination": { "latitude": 30.05, "longitude": 31.25, "address": "School" },
  "tripType": "pickup",
  "scheduledDate": "2026-04-10",
  "scheduledTime": "07:30"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Trip started successfully",
  "data": { ...trip object... }
}
```

---

### PATCH `/trip/:id/end` `[Auth]`
End a trip (driver, parent, or admin).

**Response (200):**
```json
{
  "success": true,
  "message": "Trip ended successfully",
  "data": { ...updated trip with status "trip_finished"... }
}
```

---

### PATCH `/trip/:id/start` `[Auth]`
Start an existing idle trip.

**Response (200):**
```json
{
  "success": true,
  "message": "Trip started successfully",
  "data": { ...trip with status "trip_started"... }
}
```

---

### PATCH `/trip/:id/status` `[Auth]`
Update trip status.

**Trip Status Values:**
| Status | Description |
|--------|-------------|
| `idle` | Trip created but not started |
| `trip_started` | Trip in progress |
| `child_boarded` | Child has boarded |
| `child_dropped_off` | Child dropped off |
| `trip_finished` | Trip completed |

**Request Body:**
```json
{
  "status": "child_boarded"
}
```

---

### POST `/trip/subscription/:subscriptionId/generate` `[Auth]`
Generate trips from subscription manually.

**Request Body:**
```json
{
  "daysAhead": 30
}
```

---

## — VEHICLE ENDPOINTS (Admin-Accessible) —

### PATCH `/driver/:driverId/vehicle/:vehicleId/approve` `[Admin]`
Approve a vehicle. Marked above in Driver Management.

---

## — TEST CREDENTIALS —

Run `npm run seed` to populate test data.

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kiddrive.com | Admin@123 |
| Parent | ahmed.ali@example.com | password123 |
| Driver | omar.driver@example.com | password123 |

---

## — COMMON ERROR RESPONSES —

**401 Unauthorized (No Token):**
```json
{
  "status": "error",
  "message": "No token provided"
}
```

**403 Forbidden:**
```json
{
  "status": "error",
  "message": "Access denied. Admin role required."
}
```

**400 Bad Request (Validation):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [ { "field": "email", "message": "\"email\" is required" } ]
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## — COMPLETE DATA MODELS REFERENCE —

### User (collection: `User`)
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `firstName` | String | Required |
| `lastName` | String | Required |
| `fullName` | String | Auto-set as `firstName + lastName` |
| `email` | String | Required, unique |
| `password` | String | Hashed |
| `role` | String | `parent` (default), `admin`, `driver` |
| `isVerified` | Boolean | Default: false |
| `isBanned` | Boolean | Default: false |
| `phone` | String | Encrypted at rest |
| `otp.code` | String | OTP hash |
| `otp.expiresAt` | Date | OTP expiry |
| `children` | [ObjectId] | References Child |
| `vehicles` | [ObjectId] | References Vehicle |
| `location.city` | String | |
| `location.department` | String | |
| `location.latitude` | Number | |
| `location.longitude` | Number | |
| `location.address` | String | |
| `changeCredentialTime` | Date | For token invalidation |
| `isDeleted` | Boolean | Soft delete |
| `isApprovedDriver` | Boolean | |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

### Driver (collection: `Driver`)
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `userName` | String | Required |
| `email` | String | Required |
| `nationalId` | String | Required, unique |
| `licenseNumber` | String | |
| `licenseImage` | { public_id, secure_url } | Cloudinary |
| `nationalIdImage` | { public_id, secure_url } | Cloudinary |
| `profilePhoto` | { public_id, secure_url } | Cloudinary |
| `role` | String | Default: `driver` |
| `password` | String | Hashed |
| `phone` | String | Required |
| `isApproved` | Boolean | Default: false |
| `isActive` | Boolean | Set by admin on approve/reject |
| `rating.average` | Number | 0-5 |
| `rating.count` | Number | |
| `location.city` | String | Required |
| `location.department` | String | Required |
| `location.latitude` | Number | |
| `location.longitude` | Number | |
| `location.address` | String | |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

### Child (collection: `Child`)
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `name` | String | Required |
| `age` | Number | Required |
| `parentId` | ObjectId | Ref: User, Required |
| `gender` | String | `male` (default) or `female` |
| `isDeleted` | Boolean | Default: false |
| `photo` | String | URL |
| `school` | String | |
| `schoolLocation` | { latitude, longitude, address } | |
| `schedule.arriveTime` | String | HH:MM |
| `schedule.backHome` | String | HH:MM |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

### Driver Application (collection: `DriverApplication`)
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `driver` | ObjectId | Ref: Driver, Required |
| `vehicle` | ObjectId | Ref: Vehicle, Required |
| `status` | String | `pending` (default), `approved`, `rejected` |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

### Vehicle (collection: `Vehicle`)
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `driver` | ObjectId | Ref: User, Required |
| `carModel` | String | Required |
| `plateNumber` | String | Required, unique |
| `carColor` | String | Required |
| `governmentDocuments` | [{ public_id, secure_url }] | Cloudinary array |
| `status` | String | `pending`, `approved`, `rejected` |
| `isApproved` | Boolean | Default: false |
| `location` | { latitude, longitude, address } | |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

### Subscription (collection: `Subscription`)
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `driverId` | ObjectId | Ref: Driver, Required |
| `parentId` | ObjectId | Ref: User, Required |
| `childId` | ObjectId | Ref: Child, Required |
| `expiryDate` | Date | Default: 1 month from creation |
| `status` | String | `waiting for confirmation` (default), `accepted subscription`, `rejected subscription`, `canceled` |
| `subscriptionType` | String | `monthly` or `term`, Required |
| `schedulePattern` | [{ dayOfWeek, pickupTime, dropoffTime }] | Required (min 1) |
| `schedule` | [ObjectId] | Ref: Trip, generated trips |
| `origin` | { latitude, longitude, address } | Required |
| `destination` | { latitude, longitude, address } | Required |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

### Trip (collection: `Trip`)
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `driverId` | ObjectId | Ref: Driver, Required |
| `parentId` | ObjectId | Ref: User, Required |
| `childId` | ObjectId | Ref: Child, Required |
| `subscriptionId` | ObjectId | Ref: Subscription, Required |
| `origin` | { latitude, longitude, address } | Required |
| `destination` | { latitude, longitude, address } | Required |
| `status` | String | `idle` (default), `trip_started`, `child_boarded`, `child_dropped_off`, `trip_finished` |
| `tripType` | String | `pickup` or `dropoff`, Required |
| `scheduledDate` | Date | Required |
| `scheduledTime` | String | HH:MM, Required |
| `dayOfWeek` | Number | 0=Sunday ... 6=Saturday |
| `startTime` | Date | |
| `endTime` | Date | |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

---

## — COMPLETE FRONTEND INTEGRATION GUIDE (Build Your Dashboard) —

### Step 1: Login as Admin
```
POST /auth/login
Body: { "email": "admin@kiddrive.com", "password": "Admin@123" }
→ Save accessToken & refreshToken
```

### Step 2: Dashboard Home Screen — Get Stats
```
GET /admin/dashboard/stats
→ Show: total/pending/approved/rejected applications
→ Show: total/active/inactive drivers
→ Show: total parents
```

### Step 3: Applications Management Screen
```
GET /admin/applications?page=1&limit=10&status=pending
GET /admin/applications/:id (click to view details)
PATCH /admin/applications/:id/approve (with optional notes)
PATCH /admin/applications/:id/reject (with required reason)
```

### Step 4: Drivers Management Screen
```
GET /driver/?page=1&limit=10
GET /driver/:driverId (view single driver with vehicle)
PATCH /driver/application/:applicationId/approve
PATCH /driver/:driverId/vehicle/:vehicleId/approve
```

### Step 5: Parents & Children Management Screen
```
GET /admin/parents (all parents — admin only, paginated, searchable)
GET /parent/:id (view parent with children)
POST /parent/ (form-data — add child)
PATCH /parent/:childId/update (edit child)
DELETE /parent/:childId/delete (soft delete)
PATCH /parent/:childId/restore (restore)
```

### Step 6: Subscriptions Management Screen
```
GET /subscription/ (all subscriptions — admin only)
GET /subscription/pending/all (pending subscriptions)
GET /subscription/:id (subscription detail)
GET /subscription/driver/:driverId (by driver)
GET /subscription/parent/:parentId (by parent)
GET /subscription/child/:childId (by child)
PATCH /subscription/:id/status (update status — accept/reject/cancel)
POST /subscription/ (create new subscription)
POST /subscription/:id/generate-trips (generate trips manually)
```

### Step 7: Trips Management Screen
```
GET /trip/ (all trips — admin only)
GET /trip/:id (trip detail)
GET /trip/active (active trips)
GET /trip/driver/:driverId (by driver)
GET /trip/parent/:parentId (by parent)
GET /trip/child/:childId (by child)
GET /trip/subscription/:subscriptionId (by subscription)
GET /trip/driver/:driverId/today (today's trips for driver)
GET /trip/parent/:parentId/today (today's trips for parent)
GET /trip/driver/:driverId/from-subscriptions?day=0 (scheduled by day)
PATCH /trip/:id/status (update trip status)
PATCH /trip/:id/end (end trip)
```

### Step 8: Admin Profile
```
GET /user/profile (view profile)
PATCH /user/profile (update name/phone)
```

### Auth Helpers (for UI):
```
POST /auth/refresh-token { refreshToken } → get new access token
POST /auth/forget-password { email }
POST /auth/verify-reset-otp { email, code } → get reset token
POST /auth/reset-password { password } (with reset token in header)
```

---

## — ENUM REFERENCE —

**Roles:** `admin`, `driver`, `parent`

**ApplicationStatus:** `pending`, `approved`, `rejected`

**Subscription Status:**
- `waiting for confirmation` (pending)
- `accepted subscription`
- `rejected subscription`
- `canceled`

**Subscription Type:** `monthly`, `term`

**Trip Status:** `idle`, `trip_started`, `child_boarded`, `child_dropped_off`, `trip_finished`

**Trip Type:** `pickup`, `dropoff`

**Gender:** `male`, `female`

**Days of Week:** 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
