# Campus Cleanliness Monitoring System - API Documentation

## Overview
Complete API endpoints for the campus cleanliness monitoring system with QR-based reporting, intelligent urgency scoring, task assignment, and analytics.

---

## Authentication
All endpoints require authentication via NextAuth session. Include session cookie in requests.

---

## Issues API

### Create Issue Report
**POST** `/api/issues`

Creates a new cleanliness issue report with automatic priority and urgency scoring.

**Body:**
```json
{
  "title": "Overflow in Block A Washroom",
  "description": "The washroom on the 2nd floor has an overflow issue requiring immediate attention",
  "category": "WASHROOM",
  "locationId": "clxxx...",
  "isAnonymous": false,
  "photoUrls": ["https://...photo1.jpg", "https://...photo2.jpg"]
}
```

**Categories:** `WASHROOM`, `CLASSROOM`, `HOSTEL`, `CANTEEN`, `CORRIDOR`, `LAB`, `OUTDOOR`, `OTHER`

**Response:** Issue object with auto-calculated priority and urgency score

---

### List Issues
**GET** `/api/issues?status=PENDING&page=1&limit=20&sortBy=urgencyScore`

**Query Parameters:**
- `status`: PENDING | ASSIGNED | IN_PROGRESS | RESOLVED | REJECTED
- `category`: Issue category
- `priority`: LOW | MEDIUM | HIGH | CRITICAL
- `locationId`: Filter by location
- `reporterId`: Filter by reporter
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sortBy`: createdAt | urgencyScore | priority | updatedAt
- `sortOrder`: asc | desc

**Features:**
- Role-based filtering (students see only their reports)
- Pagination support
- Includes vote count, assignment status

---

### Get Single Issue
**GET** `/api/issues/[id]`

Returns full issue details including:
- Location hierarchy
- Reporter info (if not anonymous)
- All photos (before/after)
- Assignment history
- Status change history
- Vote count and user's vote status

---

### Update Issue
**PATCH** `/api/issues/[id]`

**Body:**
```json
{
  "status": "RESOLVED",
  "priority": "HIGH",
  "description": "Updated description"
}
```

**Permissions:**
- Reporters: Can edit title/description
- Staff/Admin: Can edit everything including status and priority

**Auto-features:**
- Recalculates urgency score on priority change
- Creates status history entries
- Sends notifications on status changes

---

### Vote on Issue
**POST** `/api/issues/[id]/vote`

Toggle vote on an issue. High vote counts increase urgency score and can trigger escalation.

**Features:**
- Auto-escalates issues with 5+ votes
- Recalculates urgency score with new vote count
- Notifies stakeholders on escalation

---

## Locations API

### List Locations
**GET** `/api/locations?type=BUILDING`

**Query Parameters:**
- `type`: CAMPUS | BUILDING | BLOCK | FLOOR | ROOM | AREA
- `parentId`: Filter by parent location

**Response:** Hierarchical location data with issue counts

---

### QR Code Lookup
**GET** `/api/locations/qr/[code]`

**Unique Feature:** Scan QR code to instantly get location details for reporting.

**Response:**
```json
{
  "location": {
    "id": "...",
    "name": "Block A - Floor 2 - Washroom",
    "fullPath": [
      {"name": "Main Campus", "type": "CAMPUS"},
      {"name": "Block A", "type": "BUILDING"},
      {"name": "Floor 2", "type": "FLOOR"}
    ],
    "issues": [...], // Active issues at this location
    "_count": { "issues": 12 }
  }
}
```

---

### Create Location (Admin)
**POST** `/api/locations`

**Body:**
```json
{
  "name": "Block A - Floor 2",
  "type": "FLOOR",
  "parentId": "clxxx...",
  "qrCode": "BLK-A-F2-01",
  "gpsLat": 28.6139,
  "gpsLng": 77.2090,
  "metadata": {
    "capacity": 50,
    "facilities": ["washroom", "water"]
  }
}
```

---

## Assignments API

### Create Assignment
**POST** `/api/assignments`

**Body:**
```json
{
  "issueId": "clxxx...",
  "staffId": "clxxx...",
  "note": "Urgent - handle within 2 hours"
}
```

**Auto-features:**
- Updates issue status to ASSIGNED
- Creates status history
- Notifies assigned staff
- Notifies reporter

**Permissions:** STAFF and ADMIN only

---

### List Assignments
**GET** `/api/assignments?status=active&staffId=clxxx...`

**Query Parameters:**
- `staffId`: Filter by staff member (Admin only)
- `status`: active | completed

**Role behavior:**
- Staff: See only their assignments
- Admin: See all assignments

---

### Start Assignment
**POST** `/api/assignments/[id]/start`

Marks assignment as started and updates issue status to IN_PROGRESS.

**Permissions:** Only assigned staff member

---

### Complete Assignment
**POST** `/api/assignments/[id]/complete`

**Body:**
```json
{
  "completionNote": "Cleaned and sanitized. Fixed leaking pipe. Area inspected.",
  "completionPhotoUrl": "https://...after-photo.jpg"
}
```

**Auto-features:**
- Marks issue as RESOLVED
- Adds AFTER photo
- Creates status history
- Notifies reporter with completion details
- Awards reputation points to staff (+10)

**Unique Feature:** Requires photo proof of completion

---

## Analytics API

### Dashboard Statistics
**GET** `/api/analytics/dashboard?timeframe=7d`

**Query Parameters:**
- `timeframe`: 7d | 30d | 90d

**Response:**
```json
{
  "overview": {
    "cleanlinessScore": 87,
    "totalIssues": 156,
    "pendingIssues": 8,
    "resolvedIssues": 142,
    "resolutionRate": 91,
    "avgResolutionTime": 18.5
  },
  "staff": {
    "totalStaff": 12,
    "activeAssignments": 8,
    "utilization": 67
  },
  "categoryBreakdown": [...],
  "urgentIssues": [...]
}
```

**Unique Features:**
- Live cleanliness score (0-100)
- Resolution time tracking
- Staff utilization metrics

---

### Heatmap Data
**GET** `/api/analytics/heatmap?timeframe=7d&type=BUILDING`

**Response:**
```json
{
  "heatmap": [
    {
      "locationId": "...",
      "locationName": "Block A",
      "riskScore": 85,
      "riskLevel": "HIGH",
      "activeIssues": 12,
      "criticalIssues": 3,
      "categoryBreakdown": {"WASHROOM": 5, "CORRIDOR": 7}
    }
  ],
  "hotspots": [...], // Top 10 high-risk locations
  "summary": {
    "criticalLocations": 3,
    "highRiskLocations": 8
  }
}
```

**Unique Features:**
- Risk scoring algorithm
- GPS coordinates for mapping
- Category breakdown per location
- Automatic hotspot detection

---

### Trends Data
**GET** `/api/analytics/trends?period=weekly`

**Query Parameters:**
- `period`: weekly | monthly

**Response:**
```json
{
  "trends": [
    {
      "date": "2026-02-20",
      "day": "Mon",
      "reported": 5,
      "resolved": 8,
      "cleanlinessScore": 89
    }
  ],
  "summary": {
    "currentScore": 87,
    "trendPercentage": 12,
    "avgScore": 85
  }
}
```

---

## Notifications API

### List Notifications
**GET** `/api/notifications?unreadOnly=true&page=1&limit=20`

**Query Parameters:**
- `unreadOnly`: true | false
- `page`: Page number
- `limit`: Items per page

**Response:** Notifications with issue details and pagination

---

### Mark Notification Read
**PATCH** `/api/notifications/[id]`

---

### Mark All Read
**PATCH** `/api/notifications/mark-all-read`

---

### Delete Notification
**DELETE** `/api/notifications/[id]`

---

## Unique Features Summary

1. **Intelligent Urgency Scoring**: Auto-calculated based on category, priority, age, votes, and escalation level
2. **QR Code Location Tagging**: Instant location lookup for fast reporting
3. **Photo Proof Requirements**: Before photos mandatory for reporting, after photos for completion
4. **Auto-Priority Detection**: AI-powered initial priority based on keywords
5. **Escalation System**: Automatic escalation based on vote count
6. **Reputation System**: Staff earn points for completing tasks
7. **Risk-Based Heatmap**: Location risk scoring for proactive maintenance
8. **Real-time Cleanliness Score**: Campus-wide health metric (0-100)
9. **Role-Based Access Control**: Different permissions for students, staff, and admins
10. **Comprehensive Audit Trail**: Status history and notifications for full transparency

---

## Error Handling

All endpoints return standard HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `500`: Server error

**Error Response Format:**
```json
{
  "error": "Error message",
  "details": [/* Validation errors if applicable */]
}
```
