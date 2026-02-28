# Memory Game Security Project (Track C)

## Project Goal
The goal of this project is to build a simple web-based memory game and demonstrate common web security vulnerabilities, followed by secure implementations that prevent them.

The project includes both a vulnerable version and a secure version in order to clearly compare insecure and secure backend practices.

---

## Technology Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript  
- **Backend:** Node.js, Express  
- **Database:** SQLite (better-sqlite3)  
- **Authentication:** express-session (cookie-based session management)

---

## Security Vulnerabilities Demonstrated

### Vulnerable Version

The following security issues were intentionally implemented in the vulnerable version:

- **SQL Injection** – Login bypass using crafted input  
- **Broken Access Control (IDOR)** – Score tampering by manipulating userId  
- **Stored Cross-Site Scripting (XSS)** – Injecting malicious scripts into comments  

---

### Secure Version

The secure version fixes all vulnerabilities using proper backend validation and secure coding practices:

- **Prepared Statements** – Prevent SQL injection  
- **Session-based Authorization** – Ignore userId from client, use authenticated session  
- **Safe Rendering (Output Encoding)** – Use `textContent` instead of `innerHTML`  
- **Basic Hardening** – Cookie flags, input validation, and minimal trust in client data  

---

## Repository Structure

- `frontend/` – Game UI and client-side logic  
- `backend/` – Express API, routes, authentication, and database logic  
- `docs/` – Attack demonstrations, screenshots, and secure vs vulnerable comparison  