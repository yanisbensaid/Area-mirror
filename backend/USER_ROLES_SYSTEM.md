# 🔐 User Roles & Permissions System

This system provides role-based access control with **Admin** and **Regular User** roles.

## 🎭 User Roles

### **Regular User (`user`)**
- Default role for new registrations
- Can access basic application features
- Cannot manage other users or admin functions

### **Admin (`admin`)**
- Full access to all application features
- Can manage users (promote, demote, delete)
- Can manage services, actions, and reactions
- Access to admin-only endpoints

## 📊 Database Structure

### Users Table Fields:
- `role` - ENUM('user', 'admin') DEFAULT 'user'
- `role_assigned_at` - Timestamp when role was last changed

## 🛡️ Middleware Protection

### **AdminMiddleware**
Protects admin-only routes by checking:
1. User is authenticated
2. User has admin role

Usage in routes:
```php
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Admin-only routes
});
```

## 🔗 API Endpoints

### **Authentication (Updated)**
Login and register now return role information:
```json
{
    "token": "...",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "is_admin": true
    }
}
```

### **User Management (Admin Only)**

#### Get All Users
`GET /api/users`
```json
{
    "message": "Users retrieved successfully",
    "users": {
        "data": [...],
        "current_page": 1,
        "total": 10
    }
}
```

#### Get Current User Info
`GET /api/me`
```json
{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "is_admin": true,
        "role_assigned_at": "2025-09-29T10:30:00Z",
        "created_at": "2025-09-29T10:00:00Z"
    }
}
```

#### Make User Admin
`POST /api/users/make-admin`
```json
{
    "user_id": 2
}
```

#### Remove Admin Role
`POST /api/users/remove-admin`
```json
{
    "user_id": 2
}
```

#### Get User Statistics
`GET /api/users/stats`
```json
{
    "stats": {
        "total_users": 25,
        "total_admins": 3,
        "total_regular_users": 22,
        "recent_users_last_7_days": 5
    }
}
```

#### Delete User
`DELETE /api/users/{userId}`

## 🧰 User Model Methods

```php
// Check roles
$user->isAdmin()        // Returns true if admin
$user->isUser()         // Returns true if regular user

// Assign roles
$user->makeAdmin()      // Promote to admin
$user->makeUser()       // Demote to regular user

// Query by role
User::admins()          // Get all admin users
User::regularUsers()    // Get all regular users

// Constants
User::ROLE_ADMIN        // 'admin'
User::ROLE_USER         // 'user'
```

## 🏗️ Protected Routes Structure

```
/api/
├── Public routes
│   ├── /register
│   ├── /login
│   └── /mail/test
├── Authenticated routes (auth:sanctum)
│   ├── /logout
│   ├── /me
│   └── /mail/* (protected mail endpoints)
└── Admin routes (auth:sanctum + admin)
    ├── /users/*
    └── /services/* (CRUD operations)
```

## 👨‍💼 Default Admin Account

**Email:** `admin@area.com`  
**Password:** `admin123`  
**⚠️ Change this password after first login!**

## 🎯 Usage Examples

### **Login as Admin**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@area.com",
    "password": "admin123"
  }'
```

### **Get All Users (Admin)**
```bash
curl -X GET http://localhost:8000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### **Promote User to Admin**
```bash
curl -X POST http://localhost:8000/api/users/make-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"user_id": 2}'
```

### **Check Your Role**
```bash
curl -X GET http://localhost:8000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔒 Security Features

- ✅ **Role-based access control**
- ✅ **Middleware protection**
- ✅ **Self-protection** (users can't delete themselves or remove their own admin role)
- ✅ **Token-based authentication**
- ✅ **Automatic role assignment** (new users = 'user' role)

## 🚀 Frontend Integration

In your frontend, check user role from login response:
```javascript
// After login
const { user } = loginResponse.data;

if (user.is_admin) {
    // Show admin interface
    showAdminPanel();
} else {
    // Show regular user interface
    showUserDashboard();
}
```

## 🧪 Testing the System

1. **Register a new user** → Gets 'user' role
2. **Login as admin** → Use admin@area.com / admin123
3. **Promote user to admin** → Use `/api/users/make-admin`
4. **Test admin endpoints** → Should work with admin token
5. **Test with regular user** → Should get 403 Forbidden

Your permission system is now fully functional! 🎉
