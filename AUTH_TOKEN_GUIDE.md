# 🔐 Authentication & Token Management

## 📦 Token Storage

### **Zustand Persist**
Token được lưu trong `localStorage` với key: `auth-storage`

```json
{
  "state": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "email": "admin@example.com",
      "name": "Admin User",
      "isAdmin": true,
      "isInstructor": false
    },
    "isAuthenticated": true
  },
  "version": 0
}
```

---

## 🛠️ Helper Functions

### **1. `getAuthHeaders()` - Get Headers with Token**
Location: `src/lib/api.ts`

```typescript
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      if (parsed.state?.token) {
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${parsed.state.token}`,
        };
      }
    } catch (e) {
      console.error('Failed to parse auth token:', e);
    }
  }
  return {
    'Content-Type': 'application/json',
  };
};
```

**Usage:**
```typescript
const headers = getAuthHeaders();
fetch('/api/some-endpoint', { headers });
```

---

### **2. `authFetch()` - Fetch with Auto Token**
Location: `src/lib/api.ts`

```typescript
const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = getAuthHeaders();
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
};
```

**Usage:**
```typescript
// Automatically includes token
const response = await authFetch('/api/protected-endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

---

### **3. `createAuthAxios()` - Axios with Token**
Location: `src/lib/api/admin.ts`

```typescript
const createAuthAxios = () => {
  const authStorage = localStorage.getItem('auth-storage');
  let token = '';
  
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      token = parsed.state?.token || '';
    } catch (e) {
      console.error('Failed to parse auth token:', e);
    }
  }
  
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};
```

**Usage:**
```typescript
const api = createAuthAxios();
const response = await api.get('/admin/dashboard');
```

---

## 🔄 Token Flow

### **1. Login**
```typescript
// User logs in
const response = await authApi.login({ email, password });

// Zustand store saves token
set({
  isAuthenticated: true,
  user: response.user,
  token: response.token, // ← Saved to localStorage
});
```

### **2. API Calls**
```typescript
// Option A: Using authFetch
const data = await authFetch('/api/courses');

// Option B: Using createAuthAxios
const api = createAuthAxios();
const data = await api.get('/admin/dashboard');

// Option C: Manual
const headers = getAuthHeaders();
fetch('/api/endpoint', { headers });
```

### **3. Logout**
```typescript
logout(); // Clears token from localStorage
```

---

## ✅ Best Practices

### **DO:**
✅ Use `authFetch()` for fetch-based APIs  
✅ Use `createAuthAxios()` for axios-based APIs  
✅ Always check token expiry on backend  
✅ Handle 401 errors (token expired)  

### **DON'T:**
❌ Store token in plain `localStorage.getItem('token')`  
❌ Hardcode token in code  
❌ Forget to include Authorization header  
❌ Send token in URL params  

---

## 🔍 Debugging

### **Check if token exists:**
```javascript
// Open Console (F12)
const auth = localStorage.getItem('auth-storage');
console.log(JSON.parse(auth));
```

### **Check token in request:**
```javascript
// Network tab → Headers → Request Headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Clear token:**
```javascript
localStorage.removeItem('auth-storage');
// or
localStorage.clear();
```

---

## 🚨 Common Issues

### **Issue 1: "Unauthorized" error**
**Cause:** Token not sent or expired  
**Fix:**
```typescript
// Check if using correct helper
const api = createAuthAxios(); // ✅ Correct
// vs
const token = localStorage.getItem('token'); // ❌ Wrong key
```

### **Issue 2: Token not found**
**Cause:** Using wrong localStorage key  
**Fix:**
```typescript
// ❌ Wrong
localStorage.getItem('token')

// ✅ Correct
localStorage.getItem('auth-storage')
```

### **Issue 3: Token format error**
**Cause:** Not parsing JSON  
**Fix:**
```typescript
// ❌ Wrong
const token = localStorage.getItem('auth-storage');

// ✅ Correct
const authStorage = localStorage.getItem('auth-storage');
const parsed = JSON.parse(authStorage);
const token = parsed.state?.token;
```

---

## 📝 Summary

| Method | Use Case | Location |
|--------|----------|----------|
| `getAuthHeaders()` | Get headers only | `lib/api.ts` |
| `authFetch()` | Fetch with auto token | `lib/api.ts` |
| `createAuthAxios()` | Axios with auto token | `lib/api/admin.ts` |

**Token Storage:** `localStorage['auth-storage'].state.token`

**All helpers automatically read from Zustand persist storage!** ✅
