# Admin Module

## Overview
Admin dashboard and driver application management — listing, approving, and rejecting driver applications.

## Endpoints (admin.routes.ts)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/stats` | Get dashboard statistics |
| GET | `/applications` | Get driver applications (paginated, filterable) |
| GET | `/applications/:id` | Get specific driver application |
| PATCH | `/applications/:id/approve` | Approve driver application |
| PATCH | `/applications/:id/reject` | Reject driver application |

*All admin routes require authentication + Admin role*

## Controller Functions (admin.controller.ts)

### `getDriverApplications`
- Line 8-61: Lists driver applications with pagination and search
- Line 10: Extracts query params (page, limit, status, search)
- Line 12-15: Builds filter by optional status
- Line 17-36: If search term provided, searches in application status and driver details
- Line 22-28: Finds drivers matching search (userName, email, nationalId)
- Line 38-40: Calculates skip for pagination
- Line 42-48: Queries DriverApplicationModel with populate and sort
- Line 50: Counts total documents
- Line 52-54: Builds paginated response
- Line 56-59: Returns response

### `getDriverApplicationById`
- Line 63-86: Gets single application by ID
- Line 66: Handles array param
- Line 68-69: Validates ObjectId
- Line 72-75: Finds application with driver and vehicle populated
- Line 77-79: 404 if not found
- Line 81-85: Returns application data

### `approveDriverApplication`
- Line 88-143: Approves application with transaction
- Line 91: Gets application ID from params
- Line 98-101: Finds application
- Line 103-105: Validates it's in PENDING status
- Line 107-108: Starts Mongoose session/transaction
- Line 112-113: Updates application status to APPROVED
- Line 116-120: Updates driver to active
- Line 122: Commits transaction
- Line 124-135: Returns success response
- Line 137-140: Aborts transaction on error

### `rejectDriverApplication`
- Line 145-203: Rejects application with transaction
- Line 148: Gets application ID
- Line 155-157: Validates rejection reason is provided
- Line 159-162: Finds application
- Line 164-166: Validates PENDING status
- Line 168-169: Starts session/transaction
- Line 173-174: Updates status to REJECTED
- Line 177-181: Updates driver to inactive
- Line 183: Commits transaction
- Line 185-196: Returns success with rejection reason
- Line 198-201: Aborts on error

### `getDashboardStats`
- Line 206-245: Returns aggregated dashboard statistics
- Line 208-224: Runs 7 count queries in parallel:
  - totalApplications
  - pendingApplications
  - approvedApplications
  - rejectedApplications
  - totalDrivers
  - activeDrivers
  - totalParents
- Line 226-244: Returns structured stats response with application, driver, and parent counts
