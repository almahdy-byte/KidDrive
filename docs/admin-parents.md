# Admin — Parents Management Endpoint

Base URL: `http://localhost:3000`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## GET `/admin/parents`

Get all parents with pagination and search. Returns only non-deleted parent accounts with their children populated.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page (max 100) |
| `search` | string | No | — | Search by `firstName`, `lastName`, or `email` |

### Example Request

```
GET /admin/parents?page=1&limit=10&search=ahmed
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Parents retrieved successfully",
  "data": [
    {
      "_id": "665a1f77bcf86cd799439001",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "fullName": "Ahmed Ali",
      "email": "ahmed.ali@example.com",
      "role": "parent",
      "phone": "encrypted_phone",
      "isVerified": true,
      "isDeleted": false,
      "location": {
        "city": "Cairo",
        "department": "Giza"
      },
      "children": [
        {
          "_id": "665a1f77bcf86cd799439020",
          "name": "Youssef",
          "age": 8,
          "gender": "male",
          "photo": "https://res.cloudinary.com/...",
          "school": "International School"
        }
      ],
      "createdAt": "2026-03-01T10:00:00.000Z",
      "updatedAt": "2026-04-05T12:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "modelName": "parents"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` on success |
| `message` | string | Success message |
| `data[]` | array | Array of parent objects |
| `data[]._id` | string | Parent user ID |
| `data[].firstName` | string | Parent first name |
| `data[].lastName` | string | Parent last name |
| `data[].fullName` | string | Auto-generated full name |
| `data[].email` | string | Email address |
| `data[].role` | string | Always `"parent"` |
| `data[].phone` | string | Encrypted phone number |
| `data[].isVerified` | boolean | Email verification status |
| `data[].location` | object | `{ city, department }` |
| `data[].children[]` | array | Array of child objects |
| `data[].children[].name` | string | Child name |
| `data[].children[].age` | number | Child age |
| `data[].children[].gender` | string | `"male"` or `"female"` |
| `data[].children[].photo` | string | Photo URL |
| `data[].children[].school` | string | School name |
| `data[].createdAt` | string | ISO date |
| `data[].updatedAt` | string | ISO date |
| `pagination` | object | Pagination metadata |

### Frontend Usage (React Example)

```tsx
const fetchParents = async (page: number, search: string) => {
  const res = await fetch(
    `${BASE_URL}/admin/parents?page=${page}&limit=10&search=${search}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.json();
};

// Response shape
interface ParentsResponse {
  success: boolean;
  message: string;
  data: Parent[];
  pagination: {
    currentPage: number;
    limit: number;
    total: number;
    totalPages: number;
    modelName: string;
  };
}

interface Parent {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: 'parent';
  phone: string;
  isVerified: boolean;
  location?: { city: string; department: string };
  children: Child[];
  createdAt: string;
  updatedAt: string;
}

interface Child {
  _id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  photo?: string;
  school?: string;
}
```

### Error Responses

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
  "success": false,
  "message": "Access denied. Admin role required."
}
```
