# Backend API Configuration

This document explains how to configure the backend API URL for the frontend application.

## Environment Variables

The frontend uses Vite's environment variable system to configure the backend API URL.

### Setup

1. **Create `.env` file** (if not already exists):
   ```bash
   cp .env.example .env
   ```

2. **Configure the backend URL** in `.env`:
   ```env
   # For local development
   VITE_API_BASE_URL=http://localhost:8000

   # For production
   # VITE_API_BASE_URL=https://school-bos-backend.onrender.com
   ```

3. **Restart the development server** after changing `.env`:
   ```bash
   npm run dev
   ```

## API Configuration Module

The centralized API configuration is located at `src/config/api.ts`. This module:

- Reads the `VITE_API_BASE_URL` environment variable
- Provides organized API endpoints
- Includes helper functions for building URLs

### Usage Examples

#### Import the configuration:
```typescript
import { API_ENDPOINTS, buildApiUrl, getMediaUrl } from '../config/api';
```

#### Use predefined endpoints:
```typescript
// Login
const res = await fetch(API_ENDPOINTS.account.login, {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// Get students list
const res = await fetch(API_ENDPOINTS.account.students);

// Get classes
const res = await fetch(API_ENDPOINTS.school.classes);
```

#### Build dynamic URLs:
```typescript
// Get specific student
const studentUrl = buildApiUrl(API_ENDPOINTS.account.students, studentId);

// Update teacher
const updateUrl = buildApiUrl(API_ENDPOINTS.account.teachers, teacherId, 'update');
```

#### Handle media URLs:
```typescript
// Convert relative media path to full URL
const imageUrl = getMediaUrl('/media/profile/student.jpg');
```

## Available Endpoints

### Account Management (`API_ENDPOINTS.account`)
- `login` - User login
- `register` - User registration
- `students` - Student CRUD operations
- `teachers` - Teacher CRUD operations

### School Features (`API_ENDPOINTS.school`)
- `classes` - Class management
- `notices` - Notice board
- `books` - Library books
- `issued` - Issued books
- `issue` - Issue book
- `return` - Return book
- `homeworks` - Homework management
- `fee` - Fee management
- `buses` - Transport/bus management
- `teacherAttendance` - Teacher attendance
- `markTeacher` - Mark teacher attendance

## Migration Status

### ✅ Completed
- `src/config/api.ts` - Centralized configuration
- `src/api/notices.ts` - Notice API
- `src/pages/Login.tsx` - Login page
- `src/pages/Signup.tsx` - Signup page
- `src/pages/Student/StudentList.tsx` - Student list
- `src/pages/Student/AddStudent.tsx` - Add/Edit student
- `src/pages/Teacher/TeacherList.tsx` - Teacher list

### 🔄 Remaining Files (Need Manual Update)
The following files still contain hardcoded URLs and need to be updated:

#### Teacher Module
- `src/pages/Teacher/AddTeacher.tsx`

#### Homework Module
- `src/pages/Homework/Homework.tsx`
- `src/pages/Homework/HomeworkDetails.tsx`

#### Library Module
- `src/pages/Library/AddBook.tsx`
- `src/pages/Library/IssueBook.tsx`
- `src/pages/Library/IssuedBooks.tsx`
- `src/pages/Library/LibraryDashboard.tsx`
- `src/pages/Library/ReturnBook.tsx`
- `src/pages/Library/ViewBooks.tsx`

#### Fees Module
- `src/pages/Fees/FeesMain.tsx`
- `src/pages/Fees/FeesStudentList.tsx`

#### Transport Module
- `src/pages/Transport/AddBus.tsx`
- `src/pages/Transport/BusRouteDetail.tsx`
- `src/pages/Transport/TransportMain.tsx`

#### Attendance Module
- `src/pages/Attendance/TeacherList.tsx`

#### Timetable Module
- `src/pages/Timetable/TimetableMain.tsx`

#### Notice Module
- `src/pages/Notice/AddNotice.tsx` (partially done - uses API_BASE from api/notices.ts)

### Migration Pattern

For each file, follow this pattern:

1. **Add import**:
   ```typescript
   import { API_ENDPOINTS, buildApiUrl, getMediaUrl } from '../../config/api';
   ```

2. **Remove hardcoded URLs**:
   ```typescript
   // ❌ Old way
   const API_BASE = "https://school-bos-backend.onrender.com";
   fetch(`${API_BASE}/Account/students/`)
   
   // ✅ New way
   fetch(API_ENDPOINTS.account.students)
   ```

3. **Use helper functions for dynamic URLs**:
   ```typescript
   // ❌ Old way
   fetch(`${API_BASE}/Account/students/${id}/update/`)
   
   // ✅ New way
   fetch(buildApiUrl(API_ENDPOINTS.account.students, id, 'update'))
   ```

4. **Use getMediaUrl for media files**:
   ```typescript
   // ❌ Old way
   const imageUrl = `${API_BASE}${relativePath}`;
   
   // ✅ New way
   const imageUrl = getMediaUrl(relativePath);
   ```

## Troubleshooting

### Environment variable not loading
- Ensure the `.env` file is in the project root (same level as `package.json`)
- Restart the development server after changing `.env`
- Environment variables must start with `VITE_` to be exposed to the client

### API calls failing
- Check that `VITE_API_BASE_URL` is set correctly in `.env`
- Verify the backend server is running
- Check browser console for CORS errors
- Ensure no trailing slashes in the base URL

### Mixed content errors (HTTP/HTTPS)
- If frontend is HTTPS, backend must also be HTTPS
- For local development, use HTTP for both

## Best Practices

1. **Never commit `.env`** - It's already in `.gitignore`
2. **Always use `.env.example`** - Document required variables
3. **Use centralized endpoints** - Don't hardcode URLs in components
4. **Test with different backends** - Verify switching between local and production works
5. **Update API_ENDPOINTS** - When adding new backend endpoints, add them to `src/config/api.ts`

## Support

If you encounter issues:
1. Check this README
2. Verify `.env` configuration
3. Check browser console for errors
4. Ensure backend server is accessible
