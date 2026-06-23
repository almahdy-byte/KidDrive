# Vehicle Module

## Overview
Vehicle management for drivers: create a vehicle record and admin approval workflow.

## Endpoints (vehicle.routes.ts)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create vehicle (Driver only, with documents) |
| PATCH | `/:vehicleId/approve` | Approve vehicle (Admin only) |

*Routes are mounted under `/driver/:driverId/vehicle` via driver.routes.ts*

## Controller Functions (vehicle.controller.ts)

### `createVehicle`
- Line 8-80: Creates a new vehicle for a driver
- Line 11: Gets driverId from params
- Line 12-18: Finds and validates the driver (must be approved)
- Line 24-29: Checks for duplicate plate number
- Line 31-38: Returns error if vehicle exists
- Line 40-42: Validates documents are uploaded
- Line 45-47: Checks Cloudinary configuration
- Line 49-57: Uploads document files to Cloudinary
- Line 59-61: Validates at least one document uploaded
- Line 63-69: Creates vehicle record
- Line 73-78: Returns created vehicle

### `approveVehicle`
- Line 82-118: Approves a vehicle (Admin)
- Line 84: Gets driverId and vehicleId
- Line 86-92: Finds pending vehicle for that driver
- Line 94-96: 404 check
- Line 98-101: Updates vehicle status to APPROVED
- Line 103-111: Updates user (driver) record with vehicle reference
- Line 113-117: Returns approved vehicle
