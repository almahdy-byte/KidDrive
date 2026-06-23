# Subscription Module

## Overview
Subscription management: parents create subscriptions with schedules, drivers accept/reject, trips are auto-generated from schedules.

## Endpoints (subscription.routes.ts)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create subscription (Parent) |
| GET | `/my` | Get current user's subscriptions |
| GET | `/:id` | Get subscription by ID |
| GET | `/driver/:driverId` | Get subscriptions by driver |
| GET | `/driver/:driverId/subscriptions` | Get driver subscriptions with status filter |
| GET | `/parent/:parentId` | Get subscriptions by parent |
| GET | `/child/:childId` | Get subscriptions by child |
| POST | `/:id/generate-trips` | Generate trips for subscription |
| PATCH | `/:id/status` | Update subscription status (Driver accept/reject) |
| GET | `/` | Get all subscriptions (Admin only) |
| GET | `/pending/all` | Get pending subscriptions |

## Controller Functions (subscription.controller.ts)

### `createSubscription`
- Line 10-70: Creates a subscription and auto-generates trips
- Line 12: Extracts subscription data from body
- Line 15-17: Validates parent role
- Line 19-22: Only Parents/Admins can create
- Line 25-31: Auto-sets expiry to 1 month if not provided
- Line 33-44: Builds subscription data (status: PENDING)
- Line 46: Creates subscription
- Line 48-60: If created, auto-generates 30 days of trips via tripGeneratorService
- Line 56-58: Adds trip IDs to subscription schedule
- Line 62-69: Returns subscription with generated trips

### `getSubscriptionById`
- Line 73-91: Gets subscription by ID (populated)
- Line 75-76: Finds with populate
- Line 78-80: 404 check
- Line 84-89: Returns subscription

### `getSubscriptionsByDriver`
- Line 94-121: Lists subscriptions for a driver
- Line 96: Gets driverId
- Line 100-102: Permission check
- Line 104-109: Queries with pagination
- Line 111-115: Returns paginated results

### `getSubscriptionsByParent`
- Line 124-151: Lists subscriptions for a parent
- (Same pattern as driver)

### `getSubscriptionsByChild`
- Line 154-176: Lists subscriptions for a child
- (Same pattern)

### `updateSubscriptionStatus`
- Line 179-254: Updates subscription status (accept/reject by driver)
- Line 181-187: Finds subscription
- Line 190-192: Validates driver's permission
- Line 195-197: Drivers can only accept/reject
- Line 199-204: Maps status strings
- Line 205: Updates status
- Line 208-244: If ACCEPTED, auto-generates 30 days of trips
- Line 211-213: Generates trips
- Line 217-219: Adds trip IDs to schedule
- Line 222-223: Re-fetches with populated schedule
- Line 225-243: Returns subscription with generated trips count
- Line 246-253: Returns status update success

### `getAllSubscriptions`
- Line 257-280: Lists all subscriptions (Admin only)
- Line 259-261: Admin check
- Line 263-268: Queries with pagination
- Line 270-279: Returns paginated results

### `getPendingSubscriptions`
- Line 283-311: Lists pending subscriptions
- Line 285-291: Queries pending subs with pagination
- Line 294-299: Filters by role (driver sees own, parent sees children's)
- Line 301-310: Returns filtered results

### `getMySubscriptions`
- Line 314-337: Gets current user's subscriptions
- Line 319-325: Routes by role (Parent or Driver)
- Line 327-336: Returns paginated results

### `getDriverSubscriptions`
- Line 340-389: Gets driver subscriptions with optional status filter
- Line 342-349: Permission check
- Line 354-377: Routes by status: 'active'/'accepted', 'pending', or all
- Line 379-388: Returns paginated results

### `generateTripsFromSubscription`
- Line 392-438: Manually triggers trip generation
- Line 394-400: Finds subscription
- Line 402-409: Permission check (Admin, Driver, Parent)
- Line 412-414: Only for ACCEPTED subscriptions
- Line 416-419: Generates trips for the specified days ahead
- Line 422-425: Adds trip IDs to schedule
- Line 427-437: Returns generated trips count
