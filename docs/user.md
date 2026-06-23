# User Module

## Overview
Basic user profile management — get and update the authenticated user's profile.

## Endpoints (user.routes.ts)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/profile` | Get authenticated user's profile |
| PATCH | `/profile` | Update authenticated user's profile |

## Controller Functions (user.controller.ts)

### `getProfile`
- Line 7-20: Returns the authenticated user's data
- Line 9: Gets user from request (set by auth middleware)
- Line 10-12: Checks user exists
- Line 13-19: Returns user object

### `updateProfile`
- Line 23-55: Updates the authenticated user's profile
- Line 25: Gets user from request
- Line 26-28: Validates authentication
- Line 30-32: Updates firstName, lastName, phone from body
- Line 35: Saves user document
- Line 36-54: Returns updated profile data (decrypts phone for response)
