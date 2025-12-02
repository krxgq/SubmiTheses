// Test script to verify backend authorization
// Run this with: curl commands or use Postman

// Test 1: Try to access users list as teacher (should fail with 403)
curl -H "Authorization: Bearer <teacher_jwt>" http://localhost:5000/api/users

// Test 2: Try to access users list as admin (should succeed)  
curl -H "Authorization: Bearer <admin_jwt>" http://localhost:5000/api/users

// Test 3: Try to access grades as student (should fail with 403)
curl -H "Authorization: Bearer <student_jwt>" http://localhost:5000/api/projects/123/grades

// Test 4: Try to access grades as teacher (should succeed)
curl -H "Authorization: Bearer <teacher_jwt>" http://localhost:5000/api/projects/123/grades

// Expected Results:
// Test 1: 403 Forbidden with message about insufficient permissions
// Test 2: 200 OK with users list
// Test 3: 403 Forbidden  
// Test 4: 200 OK with grades list