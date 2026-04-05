# Admin Dashboard API Documentation

Base URL: `http://localhost:3000`

**Authentication**: All endpoints require Bearer token with Admin role.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 1. Get Dashboard Statistics

### GET `/admin/dashboard/stats`

Get overall statistics for the dashboard including applications, drivers, and parents counts.

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

## 2. Get All Driver Applications

### GET `/admin/applications`

Get all driver applications with pagination and optional status filtering.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Items per page (max 100) |
| status | string | No | - | Filter: `pending`, `approved`, `rejected` |

**Example:**
```
GET /admin/applications?page=1&limit=10&status=pending
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
        "firstName": "Omar",
        "lastName": "Hassan",
        "email": "omar.driver@example.com",
        "nationalId": "12345678901234",
        "phone": "01001234569"
      },
      "vehicle": {
        "_id": "507f1f77bcf86cd799439013",
        "make": "Toyota",
        "model": "Camry",
        "year": 2020,
        "licensePlate": "ABC 1234"
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

## 3. Get Single Application

### GET `/admin/applications/:id`

Get a specific driver application by ID.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Application ID |

**Example:**
```
GET /admin/applications/507f1f77bcf86cd799439011
```

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

## 4. Approve Driver Application

### PATCH `/admin/applications/:id/approve`

Approve a driver application. This activates the driver.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Application ID |

**Request Body:**
```json
{
  "notes": "All documents verified. Driver approved."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| notes | string | No | Optional approval notes |

**Example:**
```
PATCH /admin/applications/507f1f77bcf86cd799439011/approve
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

- 400: "Application has already been processed"
- 404: "Application not found"
- 400: "Invalid application ID"

---

## 5. Reject Driver Application

### PATCH `/admin/applications/:id/reject`

Reject a driver application. This deactivates the driver.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Application ID |

**Request Body:**
```json
{
  "reason": "Incomplete vehicle documents. Registration expired."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Rejection reason (max 500 chars) |

**Example:**
```
PATCH /admin/applications/507f1f77bcf86cd799439011/reject
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

- 400: "Rejection reason is required"
- 400: "Application has already been processed"
- 404: "Application not found"

---

## 6. Get All Drivers

### GET `/driver/`

Get all drivers with optional filtering by city/department.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number |
| limit | number | No | Items per page |
| city | string | No | Filter by city |
| department | string | No | Filter by department |

**Example:**
```
GET /driver/?page=1&limit=10&city=Cairo&department=Giza
```

**Response (200):**
```json
{
  "message": "Drivers retrieved successfully",
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userName": "Omar Driver",
      "email": "omar.driver@example.com",
      "phone": "encrypted_phone",
      "nationalId": "12345678901234",
      "isApproved": true,
      "rating": {
        "average": 4.5,
        "count": 10
      },
      "location": {
        "city": "Cairo",
        "department": "Giza",
        "latitude": 30.033,
        "longitude": 31.223,
        "address": "789 Driver Street"
      },
      "createdAt": "2026-04-01T10:00:00Z"
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

## 7. Apply to Become Driver

### POST `/driver/apply`

Driver submits application with vehicle details and documents.

**Headers:**
```
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| licenseImage | file | Yes | Driver license image |
| nationalIdImage | file | Yes | National ID image |
| governmentDocuments | file | Yes | Vehicle documents |
| carModel | string | Yes | Vehicle model |
| plateNumber | string | Yes | License plate |
| carColor | string | Yes | Vehicle color |
| nationalId | string | Yes | National ID number |
| userName | string | Yes | Username |
| email | string | Yes | Email address |
| phone | string | Yes | Phone number |
| password | string | Yes | Password |
| city | string | Yes | City |
| department | string | Yes | Department |
| latitude | number | No | Latitude |
| longitude | number | No | Longitude |

**Response (201):**
```json
{
  "status": "success",
  "message": "Driver application submitted successfully",
  "data": {
    "driver": "507f1f77bcf86cd799439012",
    "application": {
      "_id": "507f1f77bcf86cd799439011",
      "status": "pending"
    },
    "vehicle": {
      "_id": "507f1f77bcf86cd799439013",
      "status": "pending"
    }
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Driver with this national ID already has an application"
}
```

---

## Test Credentials

Run `npm run seed` to populate test data.

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kiddrive.com | Admin@123 |
| Parent | ahmed.ali@example.com | password123 |
| Driver | omar.driver@example.com | password123 |

---

## Common Error Responses

**401 Unauthorized:**
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

**400 Bad Request:**
```json
{
  "status": "error",
  "message": "Invalid application ID"
}
```

---

## Integration Guide

### Frontend Integration Steps

1. **Login as Admin**
   ```
   POST /auth/login
   Body: { "email": "admin@kiddrive.com", "password": "Admin@123" }
   ```
   Save the `accessToken` for subsequent requests.

2. **Get Dashboard Stats**
   ```
   GET /admin/dashboard/stats
   Headers: { "Authorization": "Bearer <accessToken>" }
   ```

3. **View Applications**
   ```
   GET /admin/applications?page=1&limit=10&status=pending
   Headers: { "Authorization": "Bearer <accessToken>" }
   ```

4. **View Application Details**
   ```
   GET /admin/applications/:id
   Headers: { "Authorization": "Bearer <accessToken>" }
   ```

5. **Approve Application**
   ```
   PATCH /admin/applications/:id/approve
   Headers: { "Authorization": "Bearer <accessToken>" }
   Body: { "notes": "Approved for pickup services" }
   ```

6. **Reject Application**
   ```
   PATCH /admin/applications/:id/reject
   Headers: { "Authorization": "Bearer <accessToken>" }
   Body: { "reason": "Documents not complete" }
   ```

7. **Get All Drivers**
   ```
   GET /driver/?page=1&limit=10&city=Cairo
   Headers: { "Authorization": "Bearer <accessToken>" }
   ```

---

## 8. Approve Vehicle

### PATCH `/driver/:driverId/vehicle/:vehicleId/approve`

Approve a vehicle for a driver. This is typically done after driver application is approved.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| driverId | string | Yes | Driver ID |
| vehicleId | string | Yes | Vehicle ID |

**Example:**
```
PATCH /driver/507f1f77bcf86cd799439012/vehicle/507f1f77bcf86cd799439013/approve
```

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
