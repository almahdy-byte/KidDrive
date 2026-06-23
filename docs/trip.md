# Trip Module

## Overview
Trip lifecycle management: start/end trips, track status, retrieve trips by driver/parent/child/subscription, and automatic trip generation from subscription schedules.

## Endpoints (trip.routes.ts)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/start` | Start a new trip |
| PATCH | `/:id/end` | End a trip |
| PATCH | `/:id/start` | Start an existing (idle) trip |
| PATCH | `/:id/status` | Update trip status |
| GET | `/:id` | Get trip by ID |
| GET | `/driver/:driverId` | Get trips by driver |
| GET | `/parent/:parentId` | Get trips by parent |
| GET | `/child/:childId` | Get trips by child |
| GET | `/subscription/:subscriptionId` | Get trips by subscription |
| GET | `/driver/:driverId/from-subscriptions` | Get driver's scheduled trips |
| GET | `/parent/:parentId/from-subscriptions` | Get parent's scheduled trips |
| GET | `/driver/:driverId/today` | Get driver's today trips |
| GET | `/parent/:parentId/today` | Get parent's today trips |
| POST | `/subscription/:subscriptionId/generate` | Generate trips manually |
| GET | `/active` | Get active trips |
| GET | `/` | Get all trips (Admin only) |

## Controller Functions (trip.controller.ts)

### `startTrip`
- Line 11-50: Starts a new trip (Driver or Parent)
- Line 13: Extracts trip data from body
- Line 16-18: Drivers can only start trips for themselves
- Line 20-22: Parents can only start trips for their children
- Line 24-38: Builds trip data with status 'trip_started'
- Line 40: Creates trip via repo
- Line 42-49: Returns created trip

### `endTrip`
- Line 53-84: Ends a trip
- Line 55: Gets trip ID
- Line 57-60: Finds trip
- Line 63-64: Gets trip's driver/parent IDs
- Line 66-72: Checks permission (Driver, Parent, or Admin)
- Line 74: Updates status to 'trip_finished'
- Line 76-83: Returns success

### `startExistingTrip`
- Line 87-123: Starts an idle trip
- Line 89: Gets trip ID
- Line 91-94: Finds trip
- Line 97-99: Only idle trips can be started
- Line 102-111: Permission check
- Line 113: Updates status to 'trip_started'
- Line 115-122: Returns success

### `updateTripStatus`
- Line 126-158: Updates trip status
- Line 128-130: Gets ID and new status
- Line 132-134: Finds trip
- Line 137-146: Permission check
- Line 148: Updates status
- Line 150-157: Returns success

### `getTripById`
- Line 161-186: Gets trip by ID
- Line 163-165: Finds trip
- Line 167-168: 404 check
- Line 171-177: Permission check (Admin all, Driver own, Parent own)
- Line 179-185: Returns trip

### `getTripsByDriver`
- Line 189-225: Lists trips for a driver (paginated)
- Line 191-193: Gets driverId, optional status filter
- Line 196-198: Permission check
- Line 200-206: Queries with pagination and search
- Line 208-220: Returns paginated results

### `getTripsByParent`
- Line 228-264: Lists trips for a parent
- (Same pattern as driver)

### `getTripsByChild`
- Line 267-298: Lists trips for a child
- (Same pattern)

### `getActiveTrips`
- Line 301-339: Lists active trips
- Line 306-320: If Driver, filters by their ID; otherwise (Admin) returns all active
- Line 322-338: Returns paginated results

### `getAllTrips`
- Line 342-375: Lists all trips (Admin only)
- Line 344-346: Admin check
- Line 348-356: Queries with pagination and status filter
- Line 358-374: Returns paginated results

### `getTripsBySubscription`
- Line 378-423: Gets trips for a subscription
- Line 380-388: Finds subscription
- Line 391-397: Permission check
- Line 399-404: Queries trips by subscription
- Line 406-422: Returns paginated results

### `getDriverTripsFromSubscriptions`
- Line 426-521: Gets scheduled trips from a driver's active subscriptions
- Line 428-435: Permission check
- Line 438-442: Gets all driver subscriptions
- Line 444-445: Filters only ACCEPTED ones
- Line 447-459: Empty response if no active subs
- Line 462-478: Determines target day (via `day`, `date`, or defaults to today)
- Line 481-484: Builds date range
- Line 487: Gets subscription IDs
- Line 490-496: Queries trips for those subscriptions on the target date
- Line 498-520: Returns trips with day info and subscription count

### `getParentTripsFromSubscriptions`
- Line 524-619: Gets scheduled trips from a parent's active subscriptions
- (Same pattern as driver version)

### `generateTripsFromSubscription`
- Line 622-668: Manually generates trips
- Line 624-630: Finds subscription
- Line 632-639: Permission check
- Line 642-644: Only for ACCEPTED
- Line 646-649: Generates trips for date range
- Line 652-654: Adds trip IDs to subscription
- Line 657-667: Returns generated trips count

### `getDriverTodayTrips`
- Line 671-699: Gets today's trips for a driver
- Line 673-678: Permission check
- Line 680-689: Queries trips from today to tomorrow
- Line 691-698: Returns today's trips

### `getParentTodayTrips`
- Line 702-730: Gets today's trips for a parent
- (Same pattern as driver)

## Service: tripGenerator.service.ts

### `TripGeneratorService` class

#### `generateTripsFromSubscription(subscription, startDate?, endDate?)`
- Line 14-72: Main method to generate trips from a subscription schedule
- Line 19: Initializes empty generatedTrips array
- Line 21-22: Sets start date (default: today) to midnight
- Line 24-25: Sets end date (default: subscription expiry) to end of day
- Line 28: Extracts scheduled days of week from schedulePattern
- Line 31-69: Iterates day by day from start to end
- Line 34: Gets day of week (0=Sun, 1=Mon, ...)
- Line 37: Checks if day is in schedule
- Line 38: Finds the schedule item for that day
- Line 41-51: Generates pickup trip (home to school)
  - Line 42-48: Calls createTrip with tripType='pickup' and scheduleItem.pickupTime
  - Line 49-51: Pushes to array if created
- Line 53-63: Generates dropoff trip (school to home)
  - Line 54-60: Calls createTrip with tripType='dropoff' and scheduleItem.dropoffTime
  - Line 61-63: Pushes to array if created
- Line 68: Advances to next day
- Line 71: Returns all generated trips

#### `createTrip(subscription, scheduledDate, scheduledTime, tripType, dayOfWeek)`
- Line 77-132: Creates a single trip
- Line 84-101: Checks for duplicate trip (same subscription, date, type, time)
- Line 86-90: Builds date range for the scheduled date
- Line 93-101: Queries TripModel for existing matching trip
- Line 103-105: Returns null if trip already exists (skip)
- Line 108-110: Determines origin/destination based on tripType (pickup = origin→destination, dropoff = destination→origin)
- Line 112-124: Builds trip data object
- Line 126: Creates trip in database
- Line 127: Returns created trip
- Line 128-131: Catches and logs errors, returns null

#### `generateTripsForToday(subscription)`
- Line 137-140: Convenience method for today-only generation

#### `generateTripsForDateRange(subscription, daysAhead = 7)`
- Line 145-154: Convenience method for N days ahead generation
- Line 149-151: Creates endDate = today + daysAhead
- Line 153: Delegates to generateTripsFromSubscription
