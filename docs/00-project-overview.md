# Memory Game Security Project (Track C)

## Goal
Build a simple web-based memory game and demonstrate web security vulnerabilities and their fixes.

## Tech Stack
- Frontend: HTML + CSS + Vanilla JS
- Backend: Node.js + Express
- DB: SQLite
- Auth: Session cookies (express-session)

## What we demonstrate
### Vulnerable version
- SQL Injection (login bypass)
- Broken Access Control / IDOR (score tampering)
- Stored XSS (comments)

### Secure version
- Prepared statements (SQLi fix)
- Authorization enforced via session user
- Safe rendering (textContent / output encoding)
- Basic hardening (cookie flags + validation)

## Repository Structure
- frontend/ : UI + game logic
- backend/  : API + DB
- docs/     : documentation + attack steps + comparison