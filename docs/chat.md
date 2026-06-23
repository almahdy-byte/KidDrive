# Chat Module

## Overview
Direct messaging between Parents and Drivers. Parents initiate chat rooms, both parties can send and receive messages.

## Endpoints (chat.routes.ts)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/room` | Create or get existing chat room (Parent only) |
| GET | `/rooms` | Get user's chat rooms (Parent & Driver) |
| GET | `/rooms/:chatRoomId/messages` | Get messages in a room (Parent & Driver) |
| POST | `/message` | Send a message (Parent & Driver) |

*All chat routes require authentication*

## Controller Functions (chat.controller.ts)

### `createOrGetChatRoom`
- Line 7-31: Creates a new chat room or returns existing one
- Line 9: Extracts driverId from body
- Line 10: Gets parentId from authenticated user
- Line 12-14: Validates authentication
- Line 16-18: Only Parents can create chat rooms
- Line 20-22: Validates driverId is provided
- Line 24: Calls repo to find or create chat room
- Line 26-30: Returns chat room data

### `getUserChatRooms`
- Line 34-56: Lists all chat rooms for a user
- Line 36: Gets userId from auth
- Line 38-46: Validates auth and role
- Line 48: Calls repo to find user's chat rooms
- Line 50-55: Returns chat rooms list

### `getChatMessages`
- Line 58-97: Gets paginated messages for a chat room
- Line 60-62: Extracts chatRoomId and pagination params
- Line 64-66: Validates ObjectId format
- Line 69-72: Finds chat room
- Line 74-79: Checks user is a participant (parent or driver)
- Line 81-83: Denies if not participant
- Line 85: Fetches paginated messages from repo
- Line 87-96: Returns messages with pagination metadata

### `sendMessage`
- Line 99-137: Sends a message in a chat room
- Line 101-103: Extracts chatRoomId, text, senderId
- Line 104-106: Validates authentication
- Line 108-110: Validates required fields
- Line 113-115: Finds chat room
- Line 118-123: Verifies user is a participant
- Line 125-127: Denies if not participant
- Line 129: Saves message via repo
- Line 131-136: Returns saved message
