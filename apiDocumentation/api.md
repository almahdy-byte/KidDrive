# API Documentation

# Base URL

https://kid-drive.vercel.app/

# This Folder Contain All The API Documentation

# Every Module Has Its Own Documentation File

# Every API Has Its Own Documentation 


# KidDrive API Documentation

## General Notes
- All responses return the standard format:
  - status: "success" on success
  - success: true/false
  - message: brief description
  - data: Returned object (if any)
- Some endpoints require authentication via Authorization: Bearer <token> header.

## Authentication (Auth)

### Register
- Method: POST
- Path: /auth/register
- Request:

```json
{
  "firstName": "Ahmed",
  "lastName": "Ali",
  "email": "ahmed@example.com",
  "password": "password123",
  "role": "parent",
  "phone": "01000000000"
}
```

- Response (201):

```json
{
  "status": "success",
  "success": true,
  "message": "Registered successfully. Please check your email for OTP.",
  "data": {
    "userId": "66f9c9c9c9c9c9c9c9c9c9c9",
    "email": "ahmed@example.com"
  }
}
```

### Verify Email (OTP)
- Method: POST
- Path: /auth/verify-email
- Request:

```json
{
  "email": "ahmed@example.com",
  "code": "123456"
}
```

- Response (200):

```json
{
  "status": "success",
  "success": true,
  "message": "User verified successfully",
  "data": {
    "tokens": {
      "accessToken": "<jwt>",
      "refreshToken": "<jwt>"
    },
    "isVerified": true
  }
}
```

### Login
- Method: POST
- Path: /auth/login
- Request:

```json
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

- Response (200):

```json
{
  "status": "success",
  "success": true,
  "message": "Login successful",
  "data": {
    "tokens": {
      "accessToken": "<jwt>",
      "refreshToken": "<jwt>"
    },
    "isVerified": true
  }
}
```

### Refresh Access Token
- Method: POST
- Path: /auth/refresh-token
- Request:

```json
{
  "refreshToken": "<jwt>"
}
```

- Response (200):

```json
{
  "status": "success",
  "success": true,
  "message": "Refresh token successful",
  "data": {
    "token": "<access_jwt>",
    "isVerified": true
  }
}
```

### Resend Email OTP
- Method: POST
- Path: /auth/resend-email-otp
- Request:

```json
{
  "email": "ahmed@example.com"
}
```

- Response (200):

```json
{
  "status": "success",
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "email": "ahmed@example.com"
  }
}
```

### Forget Password
- Method: POST
- Path: /auth/forget-password
- Request:

```json
{
  "email": "ahmed@example.com"
}
```

- Response (200):

```json
{
  "status": "success",
  "success": true,
  "message": "Reset password OTP sent successfully",
  "data": {
    "email": "ahmed@example.com"
  }
}
```

### Verify Reset Code
- Method: POST
- Path: /auth/verify-reset-otp
- Request:

```json
{
  "email": "ahmed@example.com",
  "code": "123456"
}
```

- Response (200): Returns a temporary token for reset

```json
{
  "status": "success",
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "<reset_access_jwt>"
  }
}
```

### Reset Password
- Method: POST
- Path: /auth/reset-password
- Request:

```json
{
  "token": "<reset_access_jwt>",
  "password": "newPassword123"
}
```

- Response (200):

```json
{
  "status": "success",
  "success": true,
  "message": "Password reset successfully"
}
```

## User

All user endpoints are protected by Bearer authentication.

### Get Profile
- Method: GET
- Path: /user/profile
- Headers:
  - Authorization: Bearer <access_token>
- Response (200):

```json
{
  "status": "success",
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "66f9c9c9c9c9c9c9c9c9c9c9",
    "firstName": "Ahmed",
    "lastName": "Ali",
    "fullName": "Ahmed Ali",
    "email": "ahmed@example.com",
    "role": "parent",
    "isVerified": true,
    "isDeleted": false,
    "createdAt": "2026-02-05T12:00:00.000Z",
    "updatedAt": "2026-02-05T12:00:00.000Z",
    "phone": "01000000000",
    "children": [
      {
        "childFirstName": "Omar",
        "childFullname": "Omar Ahmed",
        "image": { "url": "https://..." },
        "age": 8,
        "dob": "2017-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Update Profile
- Method: PATCH
- Path: /user/profile
- Headers:
  - Authorization: Bearer <access_token>
- Request (optional fields):

```json
{
  "firstName": "Ahmed",
  "lastName": "Ali",
  "phone": "01000000001"
}
```

- Response (200):

```json
{
  "status": "success",
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "firstName": "Ahmed",
    "lastName": "Ali",
    "phone": "01000000001",
    "email": "ahmed@example.com",
    "role": "parent",
    "isDeleted": false,
    "isVerified": true,
    "createdAt": "2026-02-05T12:00:00.000Z",
    "updatedAt": "2026-02-05T12:10:00.000Z",
    "fullName": "Ahmed Ali",
    "_id": "66f9c9c9c9c9c9c9c9c9c9c9"
  }
}
```

## Parent

All parent endpoints are protected by Bearer authentication.

### Add Child
- Method: POST
- Path: /parent
- Headers:
  - Authorization: Bearer <access_token>
- Request:

```json
{
  "name": "Omar",
  "age": 8,
  "gender": "male",
  "photo": "https://example.com/photo.jpg"
}
```

- Response (201):

```json
{
  "status": "success",
  "success": true,
  "message": "Child added successfully",
  "data": {
    "_id": "66f9d1d1d1d1d1d1d1d1d1d1",
    "name": "Omar",
    "age": 8,
    "gender": "male",
    "photo": "https://example.com/photo.jpg",
    "parent": "66f9c9c9c9c9c9c9c9c9c9c9",
    "isDeleted": false,
    "createdAt": "2026-02-06T10:00:00.000Z",
    "updatedAt": "2026-02-06T10:00:00.000Z"
  }
}
```

### Get All Children
- Method: GET
- Path: /parent
- Headers:
  - Authorization: Bearer <access_token>
- Response (200):

```json
{
  "status": "success",
  "success": true,
  "results": 1,
  "data": [
    {
      "_id": "66f9d1d1d1d1d1d1d1d1d1d1",
      "name": "Omar",
      "age": 8,
      "gender": "male",
      "photo": "https://example.com/photo.jpg",
      "parent": "66f9c9c9c9c9c9c9c9c9c9c9",
      "isDeleted": false
    }
  ]
}
```

### Get Single Child
- Method: GET
- Path: /parent/:childId
- Headers:
  - Authorization: Bearer <access_token>
- Response (200):

```json
{
  "status": "success",
  "success": true,
  "data": {
    "_id": "66f9d1d1d1d1d1d1d1d1d1d1",
    "name": "Omar",
    "age": 8,
    "gender": "male",
    "photo": "https://example.com/photo.jpg",
    "parent": "66f9c9c9c9c9c9c9c9c9c9c9",
    "isDeleted": false
  }
}
```

### Update Child Data
- Method: PATCH
- Path: /parent/:childId/update
- Headers:
  - Authorization: Bearer <access_token>
- Request:

```json
{
  "name": "Omar Updated",
  "age": 9
}
```

- Response (200):

```json
{
  "status": "success",
  "success": true,
  "message": "Child updated successfully",
  "data": {
    "_id": "66f9d1d1d1d1d1d1d1d1d1d1",
    "name": "Omar Updated",
    "age": 9,
    "gender": "male",
    "photo": "https://example.com/photo.jpg",
    "parent": "66f9c9c9c9c9c9c9c9c9c9c9",
    "isDeleted": false,
    "updatedAt": "2026-02-06T10:10:00.000Z"
  }
}
```

### Delete Child (Soft Delete)
- Method: DELETE
- Path: /parent/:childId/delete
- Headers:
  - Authorization: Bearer <access_token>
- Response (200):

```json
{
  "status": "success",
  "success": true,
  "message": "Child deleted successfully"
}
```

### Restore Child
- Method: PATCH
- Path: /parent/:childId/restore
- Headers:
  - Authorization: Bearer <access_token>
- Response (200):

```json
{
  "status": "success",
  "success": true,
  "message": "Child restored successfully",
  "data": {
    "_id": "66f9d1d1d1d1d1d1d1d1d1d1",
    "name": "Omar",
    "age": 8,
    "isDeleted": false
  }
}
```
