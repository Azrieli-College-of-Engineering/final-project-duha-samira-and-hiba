# Secure vs Vulnerable Comparison

This document compares the vulnerable backend implementation
with the secure backend implementation of the Memory Game project.

The purpose of this comparison is to clearly demonstrate:

- What the vulnerabilities were  
- How they were exploited  
- How they were fixed  
- Why the fixes are effective  

---

# Project Versions

This repository contains two backend branches:

## Vulnerable Version

Switch to:

    git checkout feat/backend-vuln

This branch is used only for demonstrating successful attacks.

## Secure Version

Switch to:

    git checkout feat/backend-secure

This branch contains the final protected implementation.

---

# Vulnerability Comparison Table

| Vulnerability | Vulnerable Behavior | Exploit Example | Secure Fix |
|---------------|--------------------|-----------------|------------|
| SQL Injection | SQL query built using string concatenation | `' OR 1=1 --` | Parameterized queries (`?` placeholders) |
| Broken Access Control (IDOR) | Client controls `userId` | Modify another user’s score | Use `req.session.user.id` only |
| Stored XSS | User input rendered using unsafe `innerHTML` | `<script>alert('XSS')</script>` | Render using `textContent` |

---

# 1️⃣ SQL Injection

## Vulnerable Implementation

The login endpoint builds the SQL query using direct user input:

    const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";

Because user input is directly inserted into the query,
attackers can inject malicious SQL code.

### Exploit Payload

    ' OR 1=1 --

This payload bypasses authentication and logs in without valid credentials.

## Secure Implementation

The secure version uses parameterized queries:

    db.prepare("SELECT * FROM users WHERE username = ? AND password = ?")
      .get(username, password);

### Why This Fix Works

- User input is treated strictly as data  
- The SQL structure cannot be modified  
- Injection payloads are interpreted as plain text  
- Authentication bypass is prevented  

---

# 2️⃣ Broken Access Control (IDOR)

## Vulnerable Implementation

The vulnerable version allowed clients to send:

    {
      "userId": 2,
      "score": 9999
    }

The backend trusted this `userId` without verifying ownership.

This allowed one user to modify another user’s score.

## Secure Implementation

The secure version ignores any client-provided `userId`.

Instead, it uses the authenticated session user:

    const userId = req.session.user.id;

Authentication is enforced using middleware:

    router.post("/score", requireAuth, (req, res) => {

### Why This Fix Works

- Only logged-in users can submit scores  
- The server controls identity using session data  
- Users cannot manipulate other users' records  
- Privilege escalation is prevented  

---

# 3️⃣ Stored XSS

## Vulnerable Implementation

User comments were rendered using unsafe DOM methods such as:

    element.innerHTML = comment.content;

If a user submitted:

    <script>alert('XSS')</script>

The script would execute when displayed.

### Security Impact

- Arbitrary JavaScript execution  
- Session hijacking  
- Account takeover  
- Website defacement  

## Secure Implementation

The secure version renders user content safely:

    element.textContent = comment.content;

### Why This Fix Works

- The browser treats content as plain text  
- Script tags are not executed  
- Malicious input becomes harmless text  
- Client-side execution of injected code is prevented  

---

# Validation of Fixes

After switching to:

    git checkout feat/backend-secure

Previously successful attack payloads behave as follows:

- SQL Injection → Fails  
- Score tampering → Fails  
- XSS payload → Displayed as harmless text  

This confirms that the implemented security mechanisms
effectively mitigate the demonstrated vulnerabilities.

---

# Security Principles Demonstrated

This project demonstrates the following core security principles:

- Never trust client input  
- Always validate and sanitize user data  
- Enforce server-side authorization  
- Use parameterized queries for database operations  
- Render user-generated content safely  
- Separate vulnerable demonstration code from production-ready secure code  

---

# Conclusion

The comparison between the vulnerable and secure implementations
clearly illustrates how small coding decisions can introduce
serious security risks.

By applying secure coding practices,
the same application becomes significantly more resilient
against common web attacks.

This project highlights the importance of defensive programming
and secure backend design in modern web applications.