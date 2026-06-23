# Driver Module

## Overview
Driver management: application submission, approval workflow, login, profile updates, vehicle management, ratings, and location-based search.

## Endpoints (driver.routes.ts)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/apply` | Submit driver application (with documents) |
| PATCH | `/application/:applicationId/approve` | Approve application (Admin) |
| POST | `/login` | Driver login |
| GET | `/profile` | Get driver profile (Driver only) |
| PATCH | `/profile` | Update profile (Driver only) |
| PATCH | `/vehicle` | Update vehicle info (Driver only) |
| GET | `/` | Get all drivers (Admin & Parent) |
| GET | `/nearby` | Get nearby drivers (Parent only) |
| POST | `/:driverId/rate` | Rate driver (Parent only) |
| PATCH | `/documents` | Update driver documents (Driver only) |
| GET | `/:driverId` | Get driver by ID (Admin & Parent) |

## Controller Functions (driver.controller.ts)

### `apply`
- Line 9-138: Submits a driver application with vehicle and documents
- Line 13: Checks if driver already exists by nationalId
- Line 15-21: Checks for existing pending application
- Line 24-27: Validates city/department required
- Line 29-32: Validates files were uploaded
- Line 35-37: Checks Cloudinary config
- Line 39-51: Uploads documents (licenseImage, nationalIdImage, governmentDocuments) to Cloudinary
- Line 55-88: Creates driver if new (hashes password, encrypts phone), otherwise uses existing
- Line 97-100: Checks plate number uniqueness
- Line 103-113: Creates vehicle with driver reference
- Line 121-125: Creates driver application linking driver + vehicle
- Line 127-136: Returns created application, driver, and vehicle

### `approveApplication`
- Line 140-194: Approves a driver application
- Line 142-149: Finds pending application
- Line 156-159: Updates application to APPROVED
- Line 162-165: Updates driver role
- Line 167-170: Updates vehicle approved status
- Line 173-188: Updates user record with Driver role
- Line 190-193: Returns success

### `login`
- Line 196-235: Driver login
- Line 200-203: Finds driver by email
- Line 205-207: Checks approved status
- Line 209-212: Validates password
- Line 214-218: Creates auth tokens
- Line 220-234: Returns tokens and driver info

### `updateProfile`
- Line 237-276: Updates driver profile (userName, email)
- Line 239-240: Gets update fields
- Line 242-244: Validates auth
- Line 246-254: Builds update data, checks email uniqueness
- Line 256-263: Updates driver
- Line 265-275: Returns updated driver

### `updateVehicle`
- Line 278-341: Updates driver's vehicle info
- Line 280-285: Gets update fields, validates auth
- Line 287-293: Finds vehicle for driver
- Line 295-299: Builds update data for car fields
- Line 300-318: Handles government document upload if files provided
- Line 321-328: Updates vehicle
- Line 330-340: Returns updated vehicle

### `getAllDrivers`
- Line 343-417: Lists all drivers with vehicles
- Line 345-346: Gets optional city/department filters
- Line 349-363: Queries by location or sorted by rating
- Line 366-400: For each driver, fetches their vehicle info
- Line 402-409: Builds pagination
- Line 411-416: Returns drivers with vehicles

### `getDriversNearParent`
- Line 419-495: Finds nearby drivers based on parent location
- Line 421-425: Gets authenticated parent
- Line 427-433: Finds parent with location
- Line 435-441: Queries nearby drivers with pagination
- Line 444-477: Attaches vehicle info to each driver
- Line 480-493: Returns paginated results

### `getProfile`
- Line 497-551: Gets driver profile with vehicle
- Line 499-503: Validates auth
- Line 505-511: Gets driver
- Line 513-516: Gets driver's vehicle
- Line 518-550: Returns driver + vehicle data

### `rateDriver`
- Line 553-578: Rates a driver (1-5)
- Line 555-556: Gets driverId and rating
- Line 558-560: Validates rating range
- Line 562-565: Updates driver rating via repo
- Line 568-577: Returns new rating

### `getDriverById`
- Line 580-634: Gets driver by ID with vehicle
- Line 582: Gets driverId
- Line 584-586: Validates
- Line 588-594: Finds driver
- Line 596-599: Gets vehicle
- Line 601-633: Returns driver + vehicle

### `updateDriverDocuments`
- Line 636-705: Updates driver documents (nationalId, license, photos)
- Line 638-641: Validates auth
- Line 644: Gets optional fields
- Line 647-649: Checks Cloudinary config if files provided
- Line 651-671: Builds update data, uploads new files to Cloudinary
- Line 674-681: Updates driver
- Line 683-704: Returns updated document info
