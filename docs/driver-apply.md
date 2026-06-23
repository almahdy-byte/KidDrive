# Driver Apply Endpoint

## POST /driver/apply

Submit a driver application to join the KidDrive platform.

**Auth:** Public (No token required)

**Content-Type:** `multipart/form-data`

---

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `userName` | string | Driver's full name |
| `email` | string | Email address |
| `password` | string | Account password |
| `phone` | string | Phone number |
| `nationalId` | string | National ID number |
| `carModel` | string | Vehicle model (e.g., "Toyota Camry 2022") |
| `plateNumber` | string | License plate number |
| `carColor` | string | Vehicle color |
| `city` | string | City of operation |
| `department` | string | District/area |
| `licenseImage` | file | Driver's license image |
| `nationalIdImage` | file | National ID image |
| `governmentDocuments` | file | Vehicle government documents |

## Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `latitude` | number | Location latitude |
| `longitude` | number | Location longitude |
| `address` | string | Full address |

---

## How to Send the Request

Send a **POST** request to `/driver/apply` with `multipart/form-data` body containing the fields above as form fields and the 3 files attached.

### Example using curl

```bash
curl -X POST http://localhost:3000/driver/apply \
  -F "userName=Omar Driver" \
  -F "email=omar.driver@example.com" \
  -F "password=password123" \
  -F "phone=01001234569" \
  -F "nationalId=12345678901234" \
  -F "carModel=Toyota Camry 2022" \
  -F "plateNumber=ABC 1234" \
  -F "carColor=Silver" \
  -F "city=Cairo" \
  -F "department=Nasr City" \
  -F "latitude=30.0330" \
  -F "longitude=31.2230" \
  -F "address=789 Driver Street" \
  -F "licenseImage=@/path/to/license.jpg" \
  -F "nationalIdImage=@/path/to/national-id.jpg" \
  -F "governmentDocuments=@/path/to/vehicle-doc.pdf"
```

### Example using Postman

1. Method: **POST**
2. URL: `http://localhost:3000/driver/apply`
3. Body: **form-data**
4. Add each field as a key-value pair (text for strings, file for documents)
5. Send

---

## Response

### Success (201 Created)

```json
{
  "message": "Application submitted successfully",
  "success": true,
  "status": "success",
  "data": {
    "application": {
      "_id": "app_id",
      "driver": "driver_id",
      "vehicle": "vehicle_id",
      "status": "pending"
    },
    "driver": {
      "_id": "driver_id",
      "userName": "Omar Driver",
      "email": "omar.driver@example.com",
      "nationalId": "12345678901234",
      "phone": "01001234569",
      "isApproved": false,
      "location": {
        "city": "Cairo",
        "department": "Nasr City"
      }
    },
    "vehicle": {
      "_id": "vehicle_id",
      "driver": "driver_id",
      "carModel": "Toyota Camry 2022",
      "plateNumber": "ABC 1234",
      "carColor": "Silver",
      "isApproved": false
    }
  }
}
```

### Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Duplicate national ID / existing application / missing fields |
| 500 | Server / Cloudinary configuration error |

---

## After Submission

1. Application status is set to `pending`
2. Admin can approve via `PATCH /driver/application/:applicationId/approve`
3. Once approved, driver can log in at `POST /driver/login`
