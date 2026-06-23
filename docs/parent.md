# Parent Module

## Overview
Parent profile management and child CRUD operations (add, list, update, delete, restore children).

## Endpoints (parent.routes.ts)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/:id/basic` | Get parent basic info (public) |
| GET | `/:id` | Get parent by ID (auth required) |
| POST | `/` | Add child (Parent/Admin, form-data with photo) |
| GET | `/` | Get all children (Parent/Admin) |
| GET | `/:childId` | Get single child |
| PATCH | `/:childId/update` | Update child (Parent/Admin) |
| DELETE | `/:childId/delete` | Soft delete child (Parent/Admin) |
| PATCH | `/:childId/restore` | Restore deleted child (Parent/Admin) |
| PATCH | `/profile` | Update parent profile (Parent only) |

## Controller Functions (parent.controller.ts)

### `getParentById`
- Line 7-48: Gets parent by ID with children
- Line 9-13: Validates ID
- Line 15-19: Finds parent with children populated, checks deleted/role
- Line 22-23: Gets current user info
- Line 26-31: Allows self, admin, or driver access
- Line 34-47: Returns parent with children

### `getParentBasicInfo`
- Line 51-78: Gets basic parent info (public)
- Line 53-57: Validates ID
- Line 59-63: Finds parent with limited fields
- Line 65-77: Returns basic info only

### `addChild`
- Line 81-168: Adds a child for the authenticated parent
- Line 83: Gets parentId from auth
- Line 85: Destructures child data
- Line 88-106: Handles optional photo upload to Cloudinary
- Line 109-116: Builds child data
- Line 119-129: Adds optional school and location
- Line 131-136: Adds optional schedule
- Line 138-150: Checks for duplicate child name
- Line 151: Creates child
- Line 153-160: Adds child reference to parent's children array
- Line 161-167: Returns created child

### `getAllChildren`
- Line 170-197: Lists all children for the authenticated parent
- Line 172: Gets parentId
- Line 173: Gets pagination options
- Line 175-179: Builds filter (parentId, not deleted, optional name search)
- Line 181-185: Fetches children with pagination
- Line 187-189: Builds paginated response
- Line 191-196: Returns children

### `getChild`
- Line 199-224: Gets a single child by ID
- Line 201: Gets childId
- Line 205: Gets parentId from auth
- Line 206-212: Finds child (filtered by parentId)
- Line 214-216: 404 if not found
- Line 218-223: Returns child

### `updateChild`
- Line 226-252: Updates a child
- Line 228-229: Gets parentId and childId
- Line 232-239: Finds and updates child (filtered by parentId, not deleted)
- Line 241-243: 404 if not found
- Line 245-251: Returns updated child

### `deleteChild`
- Line 254-279: Soft deletes a child (sets isDeleted: true)
- Line 257: Gets childId
- Line 260: Gets parentId
- Line 261-268: Finds and soft-deletes
- Line 270-272: 404 if not found
- Line 274-278: Returns success

### `restoreChild`
- Line 282-322: Restores a soft-deleted child
- Line 283-285: Gets parentId and childId
- Line 287-291: Validates auth
- Line 293-299: Verifies parent exists
- Line 302-309: Finds and restores (sets isDeleted: false)
- Line 311-313: 404 if not found
- Line 315-321: Returns restored child

### `updateProfile`
- Line 324-367: Updates parent profile
- Line 326-329: Gets update fields
- Line 331-333: Validates auth
- Line 333-349: Builds update data (firstName, lastName, email, phone, location)
- Line 337-341: Checks email uniqueness
- Line 351-354: Updates user
- Line 356-358: 404 if not found
- Line 360-366: Returns updated profile
