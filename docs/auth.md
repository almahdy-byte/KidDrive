# Auth Module

## Overview
Handles user authentication: registration, email verification, login, password reset, and token refresh.

## Endpoints (auth.routes.ts)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register a new parent user |
| POST | `/verify-email` | Verify email with OTP |
| POST | `/login` | Login with email/password |
| POST | `/refresh-token` | Refresh access token |
| POST | `/resend-email-otp` | Resend email verification OTP |
| POST | `/forget-password` | Send password reset OTP |
| POST | `/verify-reset-otp` | Verify password reset OTP |
| POST | `/reset-password` | Reset password with token |

## Controller Functions (auth.controller.ts)

### `register`
- Line 14-89: Handles user registration
- Line 27-29: Validates role must be "parent"
- Line 31-35: Checks if email already exists
- Line 38: Hashes the password
- Line 40-46: Generates OTP code (hashed) with 90s expiry
- Line 47-56: Builds user data object
- Line 59-64: Adds optional location data
- Line 66-78: Sends verification email with OTP
- Line 79: Creates user in database
- Line 82-87: Returns success response with userId

### `forgetPassword`
- Line 91-117: Sends password reset OTP
- Line 94-97: Finds user by email
- Line 98-103: Generates OTP with 10-minute expiry
- Line 104-109: Sends reset email
- Line 110-116: Returns success

### `verifyResetPasswordOTP`
- Line 119-143: Verifies reset OTP
- Line 122-125: Finds user
- Line 126-129: Compares OTP code, checks expiry
- Line 130-131: Clears OTP on success
- Line 132-136: Creates forget-password token
- Line 137-142: Returns token

### `resetPassword`
- Line 146-177: Resets password with token
- Line 149-152: Extracts token from Authorization header
- Line 153-155: Verifies token
- Line 157-162: Finds user
- Line 164-166: Checks credential timestamp
- Line 168-169: Hashes new password, updates change time
- Line 171-176: Returns success

### `verifyOTP`
- Line 179-218: Verifies email OTP
- Line 181-187: Finds user by email
- Line 189-191: Checks if already verified
- Line 192-195: Compares OTP, checks expiry
- Line 197-198: Marks user as verified, clears OTP
- Line 201-208: Creates auth tokens in parallel with saving user
- Line 209-218: Returns tokens

### `login`
- Line 222-259: Authenticates user
- Line 226-229: Finds user by email
- Line 231-240: Checks if verified
- Line 242-245: Compares password
- Line 247: Creates auth tokens (access + refresh)
- Line 249-258: Returns tokens

### `refreshToken`
- Line 263-304: Refreshes access token
- Line 265-268: Gets refresh token from body
- Line 269-271: Decodes and verifies
- Line 273-279: Finds user
- Line 281-291: Checks verification
- Line 293: Creates new access token
- Line 294-303: Returns new token

### `resetOtp`
- Line 309-339: Resends verification OTP
- Line 311-314: Finds user by email
- Line 316-318: Checks not already verified
- Line 319-323: Generates new OTP with 60s expiry
- Line 324: Saves user
- Line 325-330: Sends OTP email
- Line 331-338: Returns success
