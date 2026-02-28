# Application Logical Flow

This document describes the logical flow and architecture of the Memory Game Security Project.

The goal is to clearly explain how the application operates,
how data flows between components,
and how the vulnerable and secure versions differ in behavior.

---

# 1️⃣ High-Level Architecture

The application consists of three main components:

- Frontend (HTML, CSS, Vanilla JS)
- Backend (Node.js + Express)
- Database (SQLite)

Communication flow:

User → Browser (Frontend) → Express API → SQLite Database  
Database → Express → JSON Response → Frontend Rendering

---

# 2️⃣ Authentication Flow

## Login Process

1. User submits username and password via frontend.
2. Frontend sends POST request to:

    POST /api/login

3. Backend verifies credentials against database.
4. If valid:
   - A session is created using express-session.
   - Session cookie is sent to the browser.
5. Browser stores session cookie.
6. Subsequent requests include session automatically.

### Secure Difference

- Vulnerable version: SQL query built via string concatenation.
- Secure version: Parameterized queries prevent SQL injection.

---

# 3️⃣ Score Submission Flow

## Vulnerable Version

1. Logged-in user submits score.
2. Frontend sends:

    POST /api/score

3. Client includes `userId` in request body.
4. Backend trusts client-provided userId.
5. Score is inserted into database.

⚠ This allows IDOR (Broken Access Control).

## Secure Version

1. Logged-in user submits score.
2. Backend uses:

    req.session.user.id

3. Any client-provided userId is ignored.
4. Middleware `requireAuth` ensures user is authenticated.

✔ Prevents privilege escalation.

---

# 4️⃣ Comments Flow (Stored XSS)

## Vulnerable Version

1. User submits comment via:

    POST /api/comment

2. Comment stored in database.
3. Frontend retrieves comments via:

    GET /api/comments

4. Comments rendered using:

    element.innerHTML

⚠ If comment contains malicious script, it executes.

## Secure Version

1. Comment stored as before.
2. Frontend renders using:

    element.textContent

✔ Script tags are displayed as plain text.
✔ Prevents script execution.

---

# 5️⃣ Leaderboard Flow

1. Backend retrieves top scores from database.
2. Data returned as JSON.
3. Frontend renders leaderboard table.

In vulnerable version:
- Scores may contain manipulated entries.

In secure version:
- Scores are tied strictly to authenticated users.

---

# 6️⃣ Session Management Flow

- Sessions are managed using express-session.
- Cookies configured with:
  - httpOnly: true
  - sameSite: "lax"
  - secure: false (local development only)

Secure branch enforces:
- Session-based identity validation
- Authorization middleware on protected routes

---

# 7️⃣ Vulnerable vs Secure Flow Summary

| Component | Vulnerable Behavior | Secure Behavior |
|------------|--------------------|----------------|
| Login | SQL injection possible | Parameterized queries |
| Score Saving | Client controls userId | Server controls identity |
| Comments Rendering | innerHTML execution | Safe text rendering |
| Authorization | Partial / missing | Middleware enforced |

---

# 8️⃣ Security Model Summary

The secure version follows these principles:

- Server controls identity
- Client input is never trusted
- Database queries are parameterized
- User-generated content is safely rendered
- Authentication and authorization are enforced at the backend

---

# Conclusion

The logical flow analysis demonstrates how vulnerabilities
can emerge from trusting client input and unsafe rendering practices.

By restructuring the control flow and enforcing server-side validation,
the secure implementation significantly reduces the attack surface
and aligns with secure web application design principles.