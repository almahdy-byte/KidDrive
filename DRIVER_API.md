# KidDrive Driver API Documentation

Complete reference for all API endpoints available to **Driver** role users in the KidDrive application.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Driver Profile](#2-driver-profile)
3. [Documents Management](#3-documents-management)
4. [Subscriptions](#4-subscriptions)
5. [Trips](#5-trips)
6. [Chat](#6-chat)
7. [User Profile](#7-user-profile)
8. [Parent & Child Info](#8-parent--child-info)

---

## 1. Authentication

### POST /driver/login
**Driver login endpoint**

**Auth:** Public (No token required)

**Request Body:**
```json
{
  "email": "omar.driver@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    },
    "driver": {
      "_id": "driver_id",
      "userName": "Omar Driver",
      "email": "omar.driver@example.com",
      "isApproved": true
    }
  }
}
```

**What it does:** Authenticates a driver and returns JWT tokens. Checks if driver is approved.

---

### POST /driver/apply
**Submit driver application**

**Auth:** Public (No token required)

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userName` | string | Yes | Driver's username |
| `email` | string | Yes | Email address |
| `password` | string | Yes | Password |
| `phone` | string | Yes | Phone number |
| `nationalId` | string | Yes | National ID number |
| `carModel` | string | Yes | Vehicle model |
| `plateNumber` | string | Yes | License plate |
| `carColor` | string | Yes | Vehicle color |
| `city` | string | Yes | City |
| `department` | string | Yes | Department/Area |
| `latitude` | number | No | Location latitude |
| `longitude` | number | No | Location longitude |
| `address` | string | No | Full address |
| `licenseImage` | file | Yes | Driver's license image |
| `nationalIdImage` | file | Yes | National ID image |
| `governmentDocuments` | file | Yes | Government documents |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "application": { ... },
    "driver": { ... },
    "vehicle": { ... }
  }
}
```

**What it does:** Creates a new driver account, vehicle record, and application. Uploads documents to Cloudinary.

---

## 2. Driver Profile

### GET /driver/profile
**Get current driver's profile**

**Auth:** Required (Driver only)

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "driver": {
      "_id": "driver_id",
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
        "department": "Nasr City",
        "latitude": 30.0330,
        "longitude": 31.2230,
        "address": "789 Driver Street"
      },
      "licenseImage": {
        "public_id": "license_omar_001",
        "secure_url": "https://..."
      },
      "nationalIdImage": {
        "public_id": "nationalid_omar_001",
        "secure_url": "https://..."
      },
      "profilePhoto": {
        "public_id": "profile_omar_001",
        "secure_url": "https://..."
      }
    },
    "vehicle": {
      "_id": "vehicle_id",
      "carModel": "Toyota Camry 2022",
      "plateNumber": "ABC 1234",
      "carColor": "Silver",
      "governmentDocuments": [...],
      "status": "approved",
      "isApproved": true
    }
  }
}
```

**What it does:** Returns the authenticated driver's profile along with their vehicle information.

---

### PATCH /driver/profile
**Update driver basic profile**

**Auth:** Required (Driver only)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "userName": "Updated Name",
  "email": "new.email@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "driver_id",
    "userName": "Updated Name",
    "email": "new.email@example.com",
    ...
  }
}
```

**What it does:** Updates driver's username and/or email. Checks email uniqueness.

---

## 3. Documents Management

### PATCH /driver/documents
**Update driver documents and profile photo**

**Auth:** Required (Driver only)

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `nationalId` | string | No | National ID number |
| `licenseNumber` | string | No | Driver's license number |
| `nationalIdImage` | file | No | New national ID image |
| `licenseImage` | file | No | New license image |
| `profilePhoto` | file | No | Profile photo |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Driver documents updated successfully",
  "data": {
    "driverId": "driver_id",
    "nationalId": "12345678901234",
    "licenseNumber": "DL123456789",
    "licenseImage": {
      "public_id": "license_new_001",
      "secure_url": "https://..."
    },
    "nationalIdImage": {
      "public_id": "nationalid_new_001",
      "secure_url": "https://..."
    },
    "profilePhoto": {
      "public_id": "profile_new_001",
      "secure_url": "https://..."
    }
  }
}
```

**What it does:** Updates driver documents including national ID, license number, and uploads new document images or profile photo to Cloudinary.

---

## 4. Subscriptions

### GET /subscription/my
**Get current driver's subscriptions**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search term |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "subscription_id",
      "driverId": "driver_id",
      "parentId": {
        "_id": "parent_id",
        "firstName": "Ahmed",
        "lastName": "Ali",
        "fullName": "Ahmed Ali",
        "email": "ahmed.ali@example.com",
        "phone": "01001234567"
      },
      "childId": {
        "_id": "child_id",
        "name": "Youssef Ahmed",
        "age": 8,
        "gender": "male",
        "photo": "https://...",
        "school": "Cairo American College"
      },
      "expiryDate": "2026-06-01T00:00:00.000Z",
      "status": "accepted subscription",
      "subscriptionType": "monthly",
      "schedule": [
        {
          "dayOfWeek": 0,
          "pickupTime": "07:00",
          "dropoffTime": "15:00"
        },
        {
          "dayOfWeek": 2,
          "pickupTime": "07:00",
          "dropoffTime": "15:00"
        }
      ],
      "origin": {
        "latitude": 30.0444,
        "longitude": 31.2357,
        "address": "123 Main Street, Nasr City"
      },
      "destination": {
        "latitude": 30.0456,
        "longitude": 31.2367,
        "address": "Casablanca Street, Maadi"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

**What it does:** Returns all subscriptions where the current authenticated user is the driver. Automatically populated with parent and child names.

---

### GET /subscription/driver/:driverId
**Get subscriptions by driver ID**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driverId` | string | Yes | Driver's MongoDB ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter by status: `accepted subscription`, `rejected subscription`, `canceled`, `waiting for confirmation` |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search term |

**Response (200 OK):** Same format as `/subscription/my`

**What it does:** Returns subscriptions for a specific driver. Drivers can only view their own subscriptions.

---

### GET /subscription/driver/:driverId/subscriptions
**Get driver subscriptions with status filter**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driverId` | string | Yes | Driver's MongoDB ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | `active` or `accepted` = accepted subscriptions, `pending` = pending subscriptions, or any status |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search term |

**Response (200 OK):** Same format as `/subscription/my`

**What it does:** Returns driver subscriptions with optional status filter. Use `?status=active` to get accepted subscriptions, `?status=pending` to get pending ones.

---

### GET /subscription/driver/:driverId/pending
**Get pending subscriptions for a driver**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driverId` | string | Yes | Driver's MongoDB ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search term |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "subscription_id",
      "parentId": {
        "firstName": "Mona",
        "lastName": "Ibrahim",
        "fullName": "Mona Ibrahim",
        "email": "mona.ibrahim@example.com"
      },
      "childId": {
        "name": "Mariam Mona",
      "school": "New Generation International School"
      },
      "status": "waiting for confirmation",
      "subscriptionType": "monthly",
      "schedule": [...]
    }
  ],
  "pagination": { ... }
}
```

**What it does:** Returns only pending subscriptions (`waiting for confirmation` status) for the specified driver.

---

### GET /subscription/driver/:driverId/active
**Get active/accepted subscriptions for a driver**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driverId` | string | Yes | Driver's MongoDB ID |

**Query Parameters:** Same as pending

**Response (200 OK):** Same format but with `status: "accepted subscription"`

**What it does:** Returns only accepted subscriptions for the specified driver.

---

### GET /subscription/pending/all
**Get all pending subscriptions**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search term |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "subscription_id",
      "parentId": { ... },
      "childId": { ... },
      "status": "waiting for confirmation",
      ...
    }
  ],
  "pagination": { ... }
}
```

**What it does:** Returns pending subscriptions. Drivers see only subscriptions addressed to them. Admin sees all.

---

### PATCH /subscription/:id/status
**Accept or reject a subscription**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Subscription ID |

**Request Body:**
```json
{
  "status": "accepted subscription"
}
```
**Valid statuses for drivers:** `accepted subscription` or `rejected subscription`

**Response (200 OK) when accepting:**
```json
{
  "success": true,
  "message": "Subscription accepted and trips generated successfully",
  "data": {
    "subscription": {
      "_id": "subscription_id",
      "status": "accepted subscription",
      "parentId": { ... },
      "childId": { ... },
      ...
    },
    "generatedTripsCount": 26
  }
}
```

**What it does:** Drivers can accept or reject subscriptions assigned to them. When accepted, trips are automatically generated based on the subscription schedule for the next 30 days.

---

### POST /subscription/:id/generate-trips
**Manually generate trips from subscription**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Subscription ID |

**Request Body:**
```json
{
  "daysAhead": 30
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Generated 26 trips successfully",
  "data": {
    "generatedTripsCount": 26,
    "trips": [
      {
        "_id": "trip_id",
        "driverId": "driver_id",
        "parentId": "parent_id",
        "childId": "child_id",
        "subscriptionId": "subscription_id",
        "tripType": "pickup",
        "scheduledDate": "2026-04-28T00:00:00.000Z",
        "scheduledTime": "07:00",
        "status": "trip_started",
        "origin": { ... },
        "destination": { ... }
      }
    ]
  }
}
```

**What it does:** Generates trips for a subscription. Creates 2 trips per scheduled day (pickup + dropoff). Only works for accepted subscriptions.

---

## 5. Trips

### POST /trip/start
**Start a new trip**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "driverId": "driver_id",
  "parentId": "parent_id",
  "childId": "child_id",
  "subscriptionId": "subscription_id",
  "origin": {
    "latitude": 30.0444,
    "longitude": 31.2357,
    "address": "123 Main Street, Nasr City"
  },
  "destination": {
    "latitude": 30.0456,
    "longitude": 31.2367,
    "address": "Casablanca Street, Maadi"
  },
  "tripType": "pickup",
  "scheduledDate": "2026-04-28",
  "scheduledTime": "07:00"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Trip started successfully",
  "data": {
    "_id": "trip_id",
    "driverId": "driver_id",
    "parentId": "parent_id",
    "childId": "child_id",
    "subscriptionId": "subscription_id",
    "status": "trip_started",
    "tripType": "pickup",
    "scheduledDate": "2026-04-28T00:00:00.000Z",
    "scheduledTime": "07:00",
    "startTime": "2026-04-28T07:05:00.000Z",
    "origin": { ... },
    "destination": { ... }
  }
}
```

**What it does:** Creates a new trip. Drivers can only start trips where they are the assigned driver.

---

### PATCH /trip/:id/end
**End a trip**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Trip ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Trip ended successfully",
  "data": {
    "_id": "trip_id",
    "status": "trip_finished",
    "endTime": "2026-04-28T07:30:00.000Z",
    ...
  }
}
```

**What it does:** Ends a trip. Only the assigned driver can end their own trip.

---

### PATCH /trip/:id/status
**Update trip status**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Trip ID |

**Request Body:**
```json
{
  "status": "child_boarded"
}
```

**Valid statuses:** `child_boarded`, `child_dropped_off`, `trip_started`, `trip_finished`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Trip status updated successfully",
  "data": {
    "_id": "trip_id",
    "status": "child_boarded",
    "startTime": "2026-04-28T07:05:00.000Z",
    ...
  }
}
```

**What it does:** Updates trip status. Only the assigned driver can update. Setting `child_boarded` automatically sets `startTime`, and `trip_finished` sets `endTime`.

---

### GET /trip/:id
**Get trip by ID**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Trip ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "trip_id",
    "driverId": { ... },
    "parentId": { ... },
    "childId": { ... },
    "subscriptionId": { ... },
    "status": "trip_started",
    "tripType": "pickup",
    "scheduledDate": "2026-04-28T00:00:00.000Z",
    "scheduledTime": "07:00",
    "origin": { ... },
    "destination": { ... },
    "startTime": "2026-04-28T07:05:00.000Z",
    "endTime": null
  }
}
```

**What it does:** Returns trip details with all references populated (driver, parent, child, subscription).

---

### GET /trip/driver/:driverId
**Get trips by driver**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driverId` | string | Yes | Driver's MongoDB ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter by status |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search term |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Trips retrieved successfully",
  "data": [
    {
      "_id": "trip_id",
      "driverId": { ... },
      "parentId": { ... },
      "childId": { ... },
      "subscriptionId": { ... },
      "tripType": "pickup",
      "scheduledDate": "2026-04-28T00:00:00.000Z",
      "scheduledTime": "07:00",
      "status": "trip_started",
      "origin": { ... },
      "destination": { ... }
    }
  ],
  "pagination": { ... }
}
```

**What it does:** Returns paginated trips for a driver. Drivers can only view their own trips.

---

### GET /trip/driver/:driverId/today
**Get today's trips for a driver**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driverId` | string | Yes | Driver's MongoDB ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Today's trips retrieved successfully",
  "data": [
    {
      "_id": "trip_id",
      "tripType": "pickup",
      "scheduledDate": "2026-04-28T00:00:00.000Z",
      "scheduledTime": "07:00",
      "status": "trip_started",
      "childId": {
        "name": "Youssef Ahmed",
        "school": "Cairo American College"
      },
      "origin": { ... },
      "destination": { ... }
    },
    {
      "_id": "trip_id_2",
      "tripType": "dropoff",
      "scheduledTime": "15:00",
      "status": "trip_started",
      ...
    }
  ]
}
```

**What it does:** Returns all scheduled trips for today. Useful for the driver's daily dashboard.

---

### GET /trip/driver/:driverId/from-subscriptions
**Get trips from driver's subscriptions**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `driverId` | string | Yes | Driver's MongoDB ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | - | Filter by trip status |
| `startDate` | string | - | Filter from date (ISO format) |
| `endDate` | string | - | Filter to date (ISO format) |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search term |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Trips from subscriptions retrieved successfully",
  "subscriptionsCount": 3,
  "data": [
    {
      "_id": "trip_id",
      "tripType": "pickup",
      "scheduledDate": "2026-04-28T00:00:00.000Z",
      "scheduledTime": "07:00",
      "status": "trip_started",
      "childId": {
        "name": "Youssef Ahmed",
        "school": "Cairo American College"
      },
      "origin": { ... },
      "destination": { ... }
    }
  ],
  "pagination": { ... }
}
```

**What it does:** Returns all trips generated from the driver's accepted subscriptions. Shows how many active subscriptions the trips are coming from.

---

### GET /trip/active
**Get active trips**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | - | Search term |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Active trips retrieved successfully",
  "data": [
    {
      "_id": "trip_id",
      "tripType": "pickup",
      "status": "trip_started",
      "scheduledDate": "2026-04-28T00:00:00.000Z",
      "scheduledTime": "07:00",
      "childId": {
        "name": "Youssef Ahmed"
      },
      ...
    }
  ],
  "pagination": { ... }
}
```

**What it does:** Returns active trips. Drivers see only their own active trips. Admin sees all.

---

## 6. Chat

> **Note:** Chat endpoints use Socket.IO for real-time messaging, but REST endpoints also exist.

### Socket.IO Events

**Connection URL:** `ws://localhost:3000`

**Authentication:** Pass token in connection auth:
```javascript
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'Bearer <accessToken>'
  }
});
```

**Events:**

#### `join_chat_rooms`
Join all chat rooms where the driver is a participant.

**Emit:**
```javascript
socket.emit('join_chat_rooms');
```

**Listen:**
```javascript
socket.on('chat_rooms_joined', (data) => {
  console.log(data.rooms);
  // [{ id: 'chat_id', participant: { ... } }]
});
```

#### `join_chat_room`
Join a specific chat room.

**Emit:**
```javascript
socket.emit('join_chat_room', 'chat_room_id');
```

**Listen:**
```javascript
socket.on('joined_chat_room', (data) => {
  console.log(data.chatRoomId);
});
```

#### `send_message`
Send a message in a chat room.

**Emit:**
```javascript
socket.emit('send_message', {
  chatRoomId: 'chat_room_id',
  text: 'Hello, the child has been picked up safely'
});
```

**Listen for new messages:**
```javascript
socket.on('new_message', (message) => {
  console.log(message);
  // {
  //   _id: 'message_id',
  //   senderId: { userName, firstName, lastName, email },
  //   text: 'Hello...',
  //   chatRoomId: 'chat_room_id',
  //   createdAt: '2026-04-28T10:00:00.000Z'
  // }
});
```

**Listen for chat room updates:**
```javascript
socket.on('chat_room_updated', (data) => {
  console.log(data);
  // {
  //   chatRoomId: 'chat_room_id',
  //   lastMessage: { senderId, text, createdAt }
  // }
});
```

---

## 7. User Profile

### GET /user/profile
**Get current user profile**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "firstName": "Omar",
    "lastName": "Driver",
    "fullName": "Omar Driver",
    "email": "omar.driver@example.com",
    "phone": "01001234569",
    "role": "driver",
    "isVerified": true,
    "location": {
      "latitude": 30.0330,
      "longitude": 31.2230,
      "address": "789 Driver Street",
      "city": "Cairo",
      "department": "Nasr City"
    }
  }
}
```

**What it does:** Returns the current authenticated user's profile.

---

### PATCH /user/profile
**Update user profile**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "phone": "01009998877",
  "location": {
    "city": "Alexandria",
    "department": "Sidi Gaber"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "user_id",
    "firstName": "Updated",
    "lastName": "Name",
    "fullName": "Updated Name",
    "email": "omar.driver@example.com",
    "phone": "01009998877",
    "role": "driver",
    "location": {
      "city": "Alexandria",
      "department": "Sidi Gaber"
    }
  }
}
```

**What it does:** Updates the current user's profile information.

---

## 8. Parent & Child Info

### GET /parent/:id
**Get parent details**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Parent's MongoDB ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Parent retrieved successfully",
  "data": {
    "_id": "parent_id",
    "firstName": "Ahmed",
    "lastName": "Ali",
    "fullName": "Ahmed Ali",
    "email": "ahmed.ali@example.com",
    "phone": "01001234567",
    "location": {
      "latitude": 30.0444,
      "longitude": 31.2357,
      "address": "123 Main Street",
      "city": "Cairo",
      "department": "Nasr City"
    },
    "children": [
      {
        "_id": "child_id",
        "name": "Youssef Ahmed",
        "age": 8,
        "gender": "male",
        "photo": "https://...",
        "school": "Cairo American College"
      },
      {
        "_id": "child_id_2",
        "name": "Layla Ahmed",
        "age": 6,
        "gender": "female",
        "photo": "https://...",
        "school": "British International School Cairo"
      }
    ]
  }
}
```

**What it does:** Returns parent details with their children. Drivers can access parents of children in their subscriptions.

---

### GET /child/:id
**Get child details**

**Auth:** Required (Any role)

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Child's MongoDB ID |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Child retrieved successfully",
  "data": {
    "_id": "child_id",
    "name": "Youssef Ahmed",
    "age": 8,
    "gender": "male",
    "photo": "https://...",
    "school": "Cairo American College",
    "schoolLocation": {
      "latitude": 30.0456,
      "longitude": 31.2367,
      "address": "Casablanca Street, Maadi"
    },
    "parentId": {
      "_id": "parent_id",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "fullName": "Ahmed Ali",
      "email": "ahmed.ali@example.com",
      "phone": "01001234567"
    }
  }
}
```

**What it does:** Returns child details with parent information. Drivers can access children in their subscriptions.

---

## Quick Reference

### Driver Authentication Flow

1. **Login:** `POST /driver/login` → Get tokens
2. **Use token:** Add `Authorization: Bearer <accessToken>` to all requests
3. **Get profile:** `GET /driver/profile`
4. **Get pending subscriptions:** `GET /subscription/my?status=waiting for confirmation`
5. **Accept subscription:** `PATCH /subscription/:id/status` with `{ status: "accepted subscription" }`
6. **Get today's trips:** `GET /trip/driver/:driverId/today`
7. **Update trip status:** `PATCH /trip/:id/status` as child is picked up/dropped off

### Common Status Values

**Subscription Status:**
- `waiting for confirmation` - Pending driver approval
- `accepted subscription` - Active subscription
- `rejected subscription` - Driver rejected
- `canceled` - Canceled by parent or admin

**Trip Status:**
- `trip_started` - Trip created/scheduled
- `child_boarded` - Child picked up (auto sets startTime)
- `child_dropped_off` - Child dropped off
- `trip_finished` - Trip completed (auto sets endTime)

**Trip Type:**
- `pickup` - Home to school
- `dropoff` - School to home

### Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error description"
}
```

---

*Last Updated: 2026-04-28*
