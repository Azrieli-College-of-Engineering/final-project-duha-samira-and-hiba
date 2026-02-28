# Limitations and Future Work

Although the secure version significantly improves the application’s security,
some limitations still exist. This section explains what is currently missing
and what could be improved in a real production environment.

---

# Current Limitations

## 1️⃣ No HTTPS (Local Development Only)

The application runs locally without HTTPS encryption.

Impact:
- Data is transmitted in plain text.
- In a real production environment, HTTPS would be mandatory.

---

## 2️⃣ No CSRF Protection

The project uses session-based authentication but does not implement CSRF tokens.

Impact:
- A malicious website could potentially trigger authenticated requests
  if additional protections are not added.

Future improvement:
- Implement CSRF tokens for all state-changing requests.

---

## 3️⃣ Basic Password Handling

If passwords are stored in plain text (depending on implementation),
this is not secure.

Impact:
- If the database is leaked, all passwords are exposed.

Future improvement:
- Use bcrypt for hashing passwords.
- Enforce stronger password policies.

---

## 4️⃣ No Rate Limiting

The login endpoint does not implement brute-force protection.

Impact:
- An attacker could attempt multiple login attempts rapidly.

Future improvement:
- Add rate limiting middleware.
- Implement account lockout after multiple failed attempts.

---

## 5️⃣ Minimal Security Headers

The application does not include advanced security headers such as:

- Content Security Policy (CSP)
- Strict-Transport-Security (HSTS)
- X-Frame-Options

Future improvement:
- Use helmet.js to configure proper security headers.

---

## 6️⃣ Limited Input Validation

Basic validation exists, but it is minimal.

Future improvement:
- Use a validation library (e.g., Joi or express-validator)
- Apply centralized validation for all endpoints.

---

# Future Improvements Summary

To make this application production-ready, the following should be implemented:

- HTTPS with secure cookies
- CSRF protection
- Strong password hashing (bcrypt)
- Rate limiting and brute-force protection
- Security headers configuration
- Centralized input validation
- Logging and monitoring system
- Automated security testing

---

# Conclusion

This project demonstrates how common web vulnerabilities
can be introduced and how they can be effectively mitigated.

While the secure version significantly improves protection,
additional security layers would be required in a real-world deployment.

The project highlights the importance of:

- Secure coding practices
- Proper authentication and authorization
- Safe handling of user input
- Defense-in-depth security strategy