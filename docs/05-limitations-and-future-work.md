# Limitations and Future Work

Although the secure version significantly improves the application's security,
some limitations still exist.  

This section explains what is currently missing and what would be required
to make this system production-ready in a real-world deployment.

---

# Current Limitations

## 1️⃣ No HTTPS (Local Development Only)

The application runs locally over HTTP without TLS encryption.

### Impact
- Data is transmitted in plain text.
- Session cookies are not protected against network interception.
- Man-in-the-Middle (MITM) attacks would be possible in a public network.

### Future Improvement
- Deploy using HTTPS with TLS certificates.
- Enable `secure: true` for session cookies in production.

---

## 2️⃣ No CSRF Protection

The project uses session-based authentication but does not implement CSRF tokens.

### Impact
- A malicious website could potentially trigger authenticated requests
  from a logged-in user.
- State-changing operations (e.g., saving scores) could be abused.

### Future Improvement
- Implement CSRF tokens for all state-changing requests.
- Use libraries such as `csurf`.

---

## 3️⃣ Basic Password Handling

If passwords are stored in plain text (depending on implementation),
this is not secure.

### Impact
- If the database is leaked, all user passwords are exposed.
- Password reuse across other services increases damage risk.

### Future Improvement
- Use `bcrypt` for password hashing.
- Apply salting and proper hashing cost factor.
- Enforce stronger password policies (length, complexity).

---

## 4️⃣ No Rate Limiting

The login endpoint does not implement brute-force protection.

### Impact
- Attackers could attempt multiple login attempts rapidly.
- Credential stuffing attacks become possible.

### Future Improvement
- Add rate limiting middleware (e.g., express-rate-limit).
- Implement temporary account lockout after repeated failures.

---

## 5️⃣ Minimal Security Headers

The application does not include advanced HTTP security headers such as:

- Content Security Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options

### Impact
- Increased exposure to clickjacking and content injection risks.
- Reduced browser-side protection mechanisms.

### Future Improvement
- Use `helmet.js` to configure proper security headers.
- Define a strict Content Security Policy.

---

## 6️⃣ Limited Input Validation

Basic validation exists, but it is minimal and not centralized.

### Impact
- Inconsistent validation logic.
- Increased risk of future vulnerabilities when adding new endpoints.

### Future Improvement
- Use a validation library (e.g., Joi or express-validator).
- Apply centralized validation middleware.
- Implement schema-based request validation.

---

# Additional Production Improvements

To make this application production-ready, the following should also be implemented:

- HTTPS with secure cookie configuration
- CSRF protection
- Strong password hashing (bcrypt)
- Rate limiting and brute-force detection
- Security headers configuration
- Centralized input validation
- Logging and monitoring system
- Automated security testing (SAST/DAST)
- Proper error handling without leaking internal details

---

# Security Principles Demonstrated

This project reinforces important security principles:

- Never trust client input  
- Always enforce server-side authorization  
- Treat user input as untrusted data  
- Use parameterized queries  
- Apply defense-in-depth strategies  

---

# Conclusion

This project demonstrates how common web vulnerabilities
can be introduced through small implementation mistakes,
and how they can be effectively mitigated using secure coding practices.

While the secure version significantly improves protection,
a real-world production deployment would require additional
layers of security and operational safeguards.

The project highlights the importance of:

- Secure backend design  
- Proper authentication and authorization  
- Safe handling of user-generated content  
- Continuous security improvement  