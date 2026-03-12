# KidDrive API Integration Guide

## Overview

This guide provides comprehensive information for frontend developers to integrate with the KidDrive API - a school transportation management system.

## Base URL

```
Development: http://localhost:3000
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Types

- **Access Token**: Short-lived token for API requests (typically 15-30 minutes)
- **Refresh Token**: Long-lived token for obtaining new access tokens

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "parent|driver|admin",
  "phone": "+1234567890",
  "location": {
    "city": "New York",
    "department": "Manhattan"
  }
}
```

#### Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "123456"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "parent"
  }
}
```

#### Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Forgot Password
```http
POST /auth/forget-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "password": "newpassword123"
}
```

### User Management

#### Get User Profile
```http
GET /user/profile
Authorization: Bearer <token>
```

#### Update User Profile
```http
PATCH /user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

### Parent Management

#### Add Child
```http
POST /parent/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sarah",
  "age": 8,
  "gender": "female",
  "photo": "https://example.com/photo.jpg"
}
```

#### Get All Children
```http
GET /parent/
Authorization: Bearer <token>
```

#### Get Single Child
```http
GET /parent/{childId}
Authorization: Bearer <token>
```

#### Update Child
```http
PATCH /parent/{childId}/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sarah",
  "age": 9
}
```

#### Delete Child (Soft Delete)
```http
DELETE /parent/{childId}/delete
Authorization: Bearer <token>
```

#### Restore Child
```http
PATCH /parent/{childId}/restore
Authorization: Bearer <token>
```

#### Update Parent Profile
```http
PATCH /parent/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "location": {
    "city": "New York",
    "department": "Manhattan"
  }
}
```

### Driver Management

#### Apply to Become Driver
```http
POST /driver/apply
Content-Type: multipart/form-data

licenseImage: [File]
carImage: [File]
nationalIdImage: [File]
governmentDocuments: [File]
carModel: "Toyota Camry"
plateNumber: "ABC123"
carColor: "Blue"
nationalId: "1234567890123"
userName: "johndriver"
email: "driver@example.com"
phone: "+1234567890"
password: "password123"
city: "New York"
department: "Manhattan"
```

#### Driver Login
```http
POST /driver/login
Content-Type: application/json

{
  "email": "driver@example.com",
  "password": "password123"
}
```

#### Get Driver Profile
```http
GET /driver/profile
Authorization: Bearer <token>
```

#### Update Driver Profile
```http
PATCH /driver/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "userName": "johndriver",
  "email": "driver@example.com"
}
```

#### Update Vehicle Information
```http
PATCH /driver/vehicle
Authorization: Bearer <token>
Content-Type: multipart/form-data

carModel: "Toyota Camry"
plateNumber: "ABC123"
carColor: "Blue"
governmentDocuments: [File]
```

#### Get All Drivers
```http
GET /driver/?city=New York&department=Manhattan&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Nearby Drivers
```http
GET /driver/nearby?page=1&limit=10
Authorization: Bearer <token>
```

#### Rate Driver
```http
POST /driver/{driverId}/rate
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5
}
```

### Vehicle Management

#### Create Vehicle
```http
POST /driver/{driverId}/vehicle
Authorization: Bearer <token>
Content-Type: multipart/form-data

documents: [File]
```

#### Approve Vehicle
```http
PATCH /driver/{driverId}/vehicle/{vehicleId}/approve
Authorization: Bearer <token>
```

### Subscription Management

#### Create Subscription
```http
POST /subscription/
Authorization: Bearer <token>
Content-Type: application/json

{
  "driverId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "childId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "expiryDate": "2024-12-31T23:59:59.000Z",
  "subscriptionType": "monthly|term"
}
```

#### Get My Subscriptions
```http
GET /subscription/my
Authorization: Bearer <token>
```

#### Get Subscription by ID
```http
GET /subscription/{id}
Authorization: Bearer <token>
```

#### Get Subscriptions by Driver
```http
GET /subscription/driver/{driverId}
Authorization: Bearer <token>
```

#### Get Subscriptions by Parent
```http
GET /subscription/parent/{parentId}
Authorization: Bearer <token>
```

#### Get Subscriptions by Child
```http
GET /subscription/child/{childId}
Authorization: Bearer <token>
```

#### Update Subscription Status
```http
PATCH /subscription/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted subscription|rejected subscription|canceled|waiting for confirmation"
}
```

#### Get Pending Subscriptions
```http
GET /subscription/pending/all
Authorization: Bearer <token>
```

### Trip Management

#### Start Trip
```http
POST /trip/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "driverId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "parentId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "childId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "subscriptionId": "64f8a1b2c3d4e5f6a7b8c9d3",
  "origin": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York, NY"
  },
  "destination": {
    "latitude": 40.7580,
    "longitude": -73.9855,
    "address": "456 School Ave, New York, NY"
  }
}
```

#### End Trip
```http
PATCH /trip/{id}/end
Authorization: Bearer <token>
```

#### Update Trip Status
```http
PATCH /trip/{id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "child_boarded|child_dropped_off|trip_started|trip_finished"
}
```

#### Get Trip by ID
```http
GET /trip/{id}
Authorization: Bearer <token>
```

#### Get Trips by Driver
```http
GET /trip/driver/{driverId}
Authorization: Bearer <token>
```

#### Get Trips by Parent
```http
GET /trip/parent/{parentId}
Authorization: Bearer <token>
```

#### Get Trips by Child
```http
GET /trip/child/{childId}
Authorization: Bearer <token>
```

#### Get Active Trips
```http
GET /trip/active
Authorization: Bearer <token>
```

### Admin Management

#### Get Dashboard Statistics
```http
GET /admin/dashboard/stats
Authorization: Bearer <token>
```

#### Get Driver Applications
```http
GET /admin/applications?page=1&limit=10&status=pending
Authorization: Bearer <token>
```

#### Get Driver Application by ID
```http
GET /admin/applications/{id}
Authorization: Bearer <token>
```

#### Approve Driver Application
```http
PATCH /admin/applications/{id}/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Application approved after review"
}
```

#### Reject Driver Application
```http
PATCH /admin/applications/{id}/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Incomplete documentation"
}
```

## Data Models

### User
```json
{
  "_id": "string",
  "firstName": "string",
  "lastName": "string",
  "fullName": "string",
  "role": "admin|driver|parent",
  "isBanned": "boolean",
  "email": "string",
  "isVerified": "boolean",
  "phone": "string",
  "children": ["string"],
  "changeCredentialTime": "string",
  "updatedAt": "string",
  "deletedAt": "string",
  "isDeleted": "boolean",
  "createdAt": "string",
  "isApprovedDriver": "boolean",
  "vehicles": ["string"],
  "location": {
    "city": "string",
    "department": "string"
  }
}
```

### Driver
```json
{
  "_id": "string",
  "userName": "string",
  "email": "string",
  "nationalId": "string",
  "licenseImage": {
    "public_id": "string",
    "secure_url": "string"
  },
  "nationalIdImage": {
    "public_id": "string",
    "secure_url": "string"
  },
  "role": "admin|driver|parent",
  "phone": "string",
  "isApproved": "boolean",
  "changeCredentialTime": "string",
  "rating": {
    "average": "number",
    "count": "number"
  },
  "location": {
    "city": "string",
    "department": "string"
  },
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Child
```json
{
  "_id": "string",
  "name": "string",
  "age": "number",
  "parentId": "string",
  "isDeleted": "boolean",
  "gender": "male|female",
  "photo": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Vehicle
```json
{
  "_id": "string",
  "driver": "string",
  "carModel": "string",
  "plateNumber": "string",
  "carColor": "string",
  "governmentDocuments": [
    {
      "public_id": "string",
      "secure_url": "string"
    }
  ],
  "status": "pending|approved|rejected",
  "isApproved": "boolean",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Subscription
```json
{
  "_id": "string",
  "driverId": "string",
  "parentId": "string",
  "childId": "string",
  "expiryDate": "string",
  "status": "accepted subscription|rejected subscription|canceled|waiting for confirmation",
  "subscriptionType": "monthly|term",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Trip
```json
{
  "_id": "string",
  "driverId": "string",
  "parentId": "string",
  "childId": "string",
  "subscriptionId": "string",
  "origin": {
    "latitude": "number",
    "longitude": "number",
    "address": "string"
  },
  "destination": {
    "latitude": "number",
    "longitude": "number",
    "address": "string"
  },
  "status": "child_boarded|child_dropped_off|trip_started|trip_finished",
  "startTime": "string",
  "endTime": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "message": "Error description",
  "cause": 400,
  "stack": "Error stack trace (in development only)"
}
```

## Common Error Scenarios

### Invalid ObjectId
```json
{
  "message": "Invalid ObjectId",
  "cause": 400
}
```

### Missing Required Field
```json
{
  "message": "\"parentId\" is required",
  "cause": 400
}
```

### Unauthorized Access
```json
{
  "message": "Unauthorized",
  "cause": 401
}
```

## Pagination

For paginated endpoints, use these query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## File Uploads

For endpoints that require file uploads (driver application, vehicle documents), use `multipart/form-data`:

```javascript
const formData = new FormData();
formData.append('licenseImage', file);
formData.append('carModel', 'Toyota Camry');
// ... other fields

fetch('/driver/apply', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Role-Based Access Control

Different roles have different permissions:

- **Admin**: Full access to all endpoints
- **Driver**: Access to driver-specific endpoints and own data
- **Parent**: Access to parent-specific endpoints and own data

## WebSocket Integration

The API also supports WebSocket connections for real-time features like chat and trip updates. Connect to the WebSocket server at:

```
ws://localhost:3000
```

## SDK Examples

### JavaScript/TypeScript Example

```typescript
class KidDriveAPI {
  private baseURL = 'http://localhost:3000';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(data.accessToken);
    return data;
  }

  async getProfile() {
    return this.request('/user/profile');
  }

  async getChildren() {
    return this.request('/parent/');
  }

  async addChild(childData: any) {
    return this.request('/parent/', {
      method: 'POST',
      body: JSON.stringify(childData),
    });
  }
}

// Usage
const api = new KidDriveAPI();
await api.login('user@example.com', 'password');
const profile = await api.getProfile();
const children = await api.getChildren();
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface UseAPIResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useAPI<T>(endpoint: string): UseAPIResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
}

// Usage
function ChildrenList() {
  const { data: children, loading, error } = useAPI<Child[]>('/parent/');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {children?.map(child => (
        <li key={child._id}>{child.name}</li>
      ))}
    </ul>
  );
}
```

## Testing

Use tools like Postman or Insomnia to test the API endpoints. Import the OpenAPI specification (`openapi.json`) to get pre-configured collections.

## Support

For any integration issues or questions, please refer to the API documentation or contact the development team.

---

**Note**: This guide covers the main API endpoints. For complete documentation, refer to the OpenAPI specification file (`openapi.json`) included in the project.
