# KidDrive Backend API Enhancements

This document describes the recent enhancements made to the KidDrive backend API to support the mobile application features.

## Table of Contents

1. [Child Endpoints](#child-endpoints)
2. [Parent Endpoints](#parent-endpoints)
3. [Subscription Enhancements](#subscription-enhancements)
4. [Driver Subscriptions Endpoint](#driver-subscriptions-endpoint)
5. [School Information](#school-information)
6. [Driver Documents Endpoint](#driver-documents-endpoint)

---

## Child Endpoints

### GET /child/:id
Retrieve full child details including parent information.

**Authentication:** Required

**Authorization:** 
- Admin: Full access
- Parent: Access to own children only
- Driver: Access to children in their subscriptions

**Response:**
```json
{
  "success": true,
  "message": "Child retrieved successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "age": number,
    "gender": "male" | "female",
    "photo": "string",
    "school": "string",
    "schoolLocation": {
      "latitude": number,
      "longitude": number,
      "address": "string"
    },
    "parentId": {
      "_id": "string",
      "firstName": "string",
      "lastName": "string",
      "fullName": "string",
      "email": "string",
      "phone": "string"
    }
  }
}
```

### GET /child/:id/basic
Retrieve basic child information (public endpoint, no authentication required).

**Response:**
```json
{
  "success": true,
  "message": "Child basic info retrieved successfully",
  "data": {
    "_id": "string",
    "name": "string",
    "age": number,
    "photo": "string",
    "gender": "male" | "female",
    "school": "string"
  }
}
```

---

## Parent Endpoints

### GET /parent/:id
Retrieve parent details with their children.

**Authentication:** Required

**Authorization:**
- Admin: Full access
- Parent: Access to own profile only
- Driver: Access to parents of children in their subscriptions

**Response:**
```json
{
  "success": true,
  "message": "Parent retrieved successfully",
  "data": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": {
      "latitude": number,
      "longitude": number,
      "address": "string",
      "city": "string",
      "department": "string"
    },
    "children": [
      {
        "_id": "string",
        "name": "string",
        "age": number,
        "gender": "male" | "female",
        "photo": "string",
        "school": "string"
      }
    ]
  }
}
```

### GET /parent/:id/basic
Retrieve basic parent information (public endpoint).

**Response:**
```json
{
  "success": true,
  "message": "Parent basic info retrieved successfully",
  "data": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string"
  }
}
```

---

## Subscription Enhancements

### Enriched Subscription Response

All subscription endpoints now return enriched data with parent and child information:

```json
{
  "_id": "string",
  "driverId": "string",
  "parentId": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string"
  },
  "childId": {
    "_id": "string",
    "name": "string",
    "age": number,
    "gender": "male" | "female",
    "photo": "string",
    "school": "string"
  },
  "expiryDate": "date-time",
  "status": "accepted subscription" | "rejected subscription" | "canceled" | "waiting for confirmation",
  "subscriptionType": "monthly" | "term",
  "schedule": [
    {
      "dayOfWeek": number,
      "pickupTime": "string (HH:MM)",
      "dropoffTime": "string (HH:MM)"
    }
  ],
  "origin": {
    "latitude": number,
    "longitude": number,
    "address": "string"
  },
  "destination": {
    "latitude": number,
    "longitude": number,
    "address": "string"
  }
}
```

This eliminates the need for separate API calls to resolve parent and child names.

---

## Driver Subscriptions Endpoint

### GET /subscription/driver/:driverId/subscriptions

Retrieve subscriptions for a specific driver with optional status filtering.

**Authentication:** Required

**Authorization:** Drivers can only view their own subscriptions.

**Query Parameters:**
- `status` (optional): Filter by status
  - `active` or `accepted` - Returns accepted subscriptions
  - `pending` - Returns pending subscriptions
  - Other values - Returns subscriptions with that specific status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "parentId": {
        "firstName": "string",
        "lastName": "string",
        "fullName": "string"
      },
      "childId": {
        "name": "string",
        "school": "string"
      },
      "status": "string",
      "subscriptionType": "string"
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

**Usage for DriverLoaded:**
```
GET /subscription/driver/{driverId}/subscriptions?status=active
```

---

## School Information

### Child Model Updates

The Child model now includes school information:

```typescript
interface IChild {
  // ... existing fields
  school?: string;  // School name
  schoolLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}
```

This information is included in:
- Child endpoints (`GET /child/:id`, `GET /child/:id/basic`)
- Parent endpoints (in the children array)
- Subscription responses (in the childId object)

**Display on Families Card:**
The school name can now be displayed on the families card using the `childId.school` field from the subscription response.

---

## Driver Documents Endpoint

### PATCH /driver/documents

Update driver documents including national ID, license, and profile photo.

**Authentication:** Required

**Authorization:** Driver only

**Content-Type:** multipart/form-data

**Request Body:**
- `nationalId` (optional): National ID number
- `licenseNumber` (optional): License number
- `nationalIdImage` (optional): National ID image file
- `licenseImage` (optional): License image file
- `profilePhoto` (optional): Profile photo file

**Response:**
```json
{
  "success": true,
  "message": "Driver documents updated successfully",
  "data": {
    "driverId": "string",
    "nationalId": "string",
    "licenseNumber": "string",
    "licenseImage": {
      "public_id": "string",
      "secure_url": "string"
    },
    "nationalIdImage": {
      "public_id": "string",
      "secure_url": "string"
    },
    "profilePhoto": {
      "public_id": "string",
      "secure_url": "string"
    }
  }
}
```

**Usage Example:**
```javascript
const formData = new FormData();
formData.append('nationalId', '1234567890');
formData.append('licenseNumber', 'DL123456');
formData.append('nationalIdImage', nationalIdFile);
formData.append('licenseImage', licenseFile);
formData.append('profilePhoto', profileFile);

fetch('/driver/documents', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

---

## Migration Notes

### For Frontend Developers

1. **Child Names:** Use `GET /child/:id/basic` for public access or `GET /child/:id` for full details. Child information is also embedded in subscription responses.

2. **Parent Names:** Use `GET /parent/:id/basic` for public access or `GET /parent/:id` for full details. Parent information is now embedded in subscription responses.

3. **Active Subscriptions:** Use `GET /subscription/driver/{driverId}/subscriptions?status=active` for the DriverLoaded cubit.

4. **School Info:** Access via `childId.school` in subscription responses or `school` field in child responses.

5. **Driver Documents:** Use `PATCH /driver/documents` to update documents after initial registration.

---

## API Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /child/:id | GET | Yes | Get child details with parent info |
| /child/:id/basic | GET | No | Get basic child info |
| /parent/:id | GET | Yes | Get parent details with children |
| /parent/:id/basic | GET | No | Get basic parent info |
| /subscription/driver/:driverId/subscriptions | GET | Yes | Get driver subscriptions with filter |
| /driver/documents | PATCH | Yes | Update driver documents |

All subscription endpoints now return enriched data with parent and child information populated.
