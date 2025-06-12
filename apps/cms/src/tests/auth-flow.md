# Authentication Flow Testing Guide

This document outlines the steps to test the authentication flow in the CMS application. It includes testing scenarios for both authentication and authorization using the layout-based authentication system.

## Prerequisites

1. Ensure both API and CMS applications are running:

   - API server is running at http://localhost:3001/api
   - CMS application is running at http://localhost:5173

2. Make sure you have a user account with admin team membership in Appwrite.
3. Make sure you have a user account without admin team membership in Appwrite for testing unauthorized access.
4. Clear browser storage before testing (localStorage, sessionStorage, and cookies) to ensure a clean state.
5. Open Developer Tools in your browser to monitor network requests and storage changes.

## Test Cases

### 1. Login Flow

- [ ] Navigate to `/login` and enter valid admin credentials
- [ ] Verify you are redirected to `/dashboard`
- [ ] Check that API requests now include the JWT token (check network tab)
- [ ] Verify admin access by accessing a protected route like `/dashboard` or `/settings`

### 2. Logout Flow

- [ ] Click on the logout button in the UI
- [ ] Verify that you're redirected to the login page
- [ ] Try to access a protected route directly (e.g. `/dashboard`)
- [ ] Verify that you're redirected back to the login page

### 3. Protected Routes

- [ ] Try to access `/dashboard` without being logged in
- [ ] Verify you're redirected to the login page
- [ ] Log in and verify you can now access `/dashboard`

### 4. Unauthorized Access

- [ ] Log in with a non-admin account
- [ ] Try to access `/dashboard` (admin-only area)
- [ ] Verify you're redirected to the `/unauthorized` page
- [ ] Verify the unauthorized page shows helpful information

### 5. Session Persistence

- [ ] Log in with valid credentials
- [ ] Refresh the page
- [ ] Verify you remain logged in and can still access protected routes
- [ ] Close the browser and reopen it
- [ ] Verify if the session persists based on the intended behavior

### 6. JWT Token Validation

- [ ] Log in to obtain a JWT token
- [ ] Use browser dev tools to examine network requests to the API
- [ ] Verify that the Authorization header includes a Bearer token
- [ ] Verify that API requests to protected endpoints succeed

### 7. Error Handling

- [ ] Enter invalid credentials at login
- [ ] Verify an appropriate error message is displayed
- [ ] Attempt to access API endpoints directly with an invalid token
- [ ] Verify proper error responses are returned (401/403)

## Troubleshooting

If any test fails, check:

1. Browser console for JavaScript errors
2. Network tab for API response status codes
3. API server logs for backend errors
4. Environment variables for proper configuration:
   - `VITE_APPWRITE_ENDPOINT`
   - `VITE_APPWRITE_PROJECT_ID`
   - `VITE_APPWRITE_ADMIN_TEAM_ID`
   - `VITE_API_URL`
