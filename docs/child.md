# Child Module

## Overview
CRUD operations for children. Parents can create and view children; Drivers and Admins can view child info.

## Endpoints (child.routes.ts)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create child (Parent only, form-data with photo) |
| GET | `/:id/basic` | Get child basic info (public) |
| GET | `/:id` | Get full child details (auth required) |

## Controller Functions (child.controller.ts)

### `getChildById`
- Line 6-49: Gets full child details with parent info
- Line 12-16: Validates child ID
- Line 18-22: Finds child with parent populated, checks deleted status
- Line 25-26: Gets current user info
- Line 32-35: Checks if user is the parent, admin, or driver
- Line 37-39: Denies access if not authorized
- Line 41-48: Returns child data

### `getChildBasicInfo`
- Line 51-85: Gets basic child info (name, age, photo, gender, school) — no auth needed
- Line 57-61: Validates ID
- Line 63-67: Finds child, checks deleted status
- Line 70-83: Returns limited fields only

### `createChild`
- Line 87-161: Creates a new child (Parent only)
- Line 89: Destructures child data from body
- Line 92-98: Validates user is authenticated and is a Parent
- Line 100: Gets parent ID
- Line 103-121: Handles optional photo upload to Cloudinary
- Line 113: Finds photo file from uploaded files
- Line 116-119: Uploads to Cloudinary with application folder
- Line 124-131: Builds child data object
- Line 134-136: Adds optional school field
- Line 138-144: Adds optional school location
- Line 146-151: Adds optional schedule (arrive/back home times)
- Line 153-154: Creates child in database
- Line 156-160: Returns created child
