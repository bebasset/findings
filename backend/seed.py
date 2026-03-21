"""
Seed the findings database with the initial set of templates.

Usage:
    cd backend
    python seed.py

Safe to re-run — checks for existing IDs before inserting.
"""

import os
from dotenv import load_dotenv
from sqlmodel import Session, select, create_engine, SQLModel

load_dotenv()


def _build_db_url() -> str:
    url = os.getenv("DATABASE_URL", "")
    if url:
        return url.replace("postgres://", "postgresql://", 1)
    host     = os.getenv("DB_HOST", "127.0.0.1")
    port     = os.getenv("DB_PORT", "5432")
    user     = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "")
    name     = os.getenv("DB_NAME", "findings")
    return f"postgresql://{user}:{password}@{host}:{port}/{name}"


# Import after env is loaded
from api import Finding, engine  # noqa: E402


SEED_FINDINGS = [
    {
        "id": 1,
        "pentester": "Belizaire Bassette II",
        "title": "SQL Injection via Search Parameter",
        "date": "2026-02-05",
        "severity": "Critical",
        "status": "Open",
        "wstg_id": "WSTG-INPV-05",
        "wstg_category": "Input Validation",
        "cwe_id": 89,
        "cvss": "9.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)",
        "affected_component": "/api/search?q=",
        "description": (
            "A SQL injection vulnerability was identified in the application's search endpoint. "
            "User-supplied input passed to the `q` parameter is concatenated directly into a SQL query "
            "without sanitization or parameterization. An unauthenticated attacker can exploit this "
            "to read arbitrary data from the database, bypass authentication, or (depending on database "
            "permissions) write or delete data."
        ),
        "impact": (
            "Full read access to all database tables including user credentials, PII, and application data. "
            "Potential for authentication bypass, data exfiltration, and — where the DB account has write "
            "permissions — data manipulation or destruction. This directly violates confidentiality and "
            "integrity requirements under most compliance frameworks (SOC 2, PCI-DSS, HIPAA)."
        ),
        "recommendation": (
            "Replace all dynamic SQL string concatenation with parameterized queries (prepared statements) "
            "or a trusted ORM. Apply a whitelist of acceptable characters for the search parameter. "
            "Implement a WAF rule as a defense-in-depth control. Conduct a full audit of all query-building "
            "code paths and review database account privileges."
        ),
        "steps_to_reproduce": [
            "Navigate to the application's search functionality.",
            "In the search field, enter a single quote: `'` and submit.",
            "Observe that the application returns a SQL error or behaves differently (error-based injection).",
            "Confirm by submitting `' OR '1'='1` — note the response includes all records.",
            "Use a UNION-based payload to extract table names from information_schema.",
        ],
        "poc_images": [
            {"src": "/poc/poc-burp-request.svg", "caption": "Figure 1 — Injected request captured in proxy. Sensitive host and session identifiers have been redacted."},
            {"src": "/poc/poc-burp-response.svg", "caption": "Figure 2 — Application response confirming successful UNION injection. Database version and table list visible."},
        ],
        "references": [
            {"label": "OWASP WSTG-INPV-05: Testing for SQL Injection", "url": "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection"},
            {"label": "CWE-89: Improper Neutralization of Special Elements Used in an SQL Command", "url": "https://cwe.mitre.org/data/definitions/89.html"},
            {"label": "OWASP SQL Injection Prevention Cheat Sheet", "url": "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"},
        ],
    },
    {
        "id": 2,
        "pentester": "Graham O'Donnell",
        "title": "Stored Cross-Site Scripting (XSS) in Notes Field",
        "date": "2026-02-10",
        "severity": "High",
        "status": "Open",
        "wstg_id": "WSTG-INPV-02",
        "wstg_category": "Input Validation",
        "cwe_id": 79,
        "cvss": "8.2 (AV:N/AC:L/PR:L/UI:R/S:C/C:H/I:L/A:N)",
        "affected_component": "/dashboard/notes — POST body `content` field",
        "description": (
            "A stored cross-site scripting vulnerability exists in the notes/comment feature of the "
            "application dashboard. HTML and JavaScript submitted in the `content` field are persisted "
            "to the database and rendered unsanitized to other users who view that note."
        ),
        "impact": (
            "A stored XSS payload executes on every page load for every user who views the affected note. "
            "This enables session hijacking (theft of session cookies or tokens), credential harvesting via "
            "fake login overlays, keylogging, and lateral movement within the application."
        ),
        "recommendation": (
            "Apply context-aware output encoding to all user-supplied content rendered in HTML (use a "
            "library such as DOMPurify client-side and server-side escaping). Implement a Content Security "
            "Policy (CSP) header that prohibits inline script execution and restricts script sources."
        ),
        "steps_to_reproduce": [
            "Log in to the application with a standard user account.",
            "Navigate to the Notes section and create a new note.",
            "In the content field, submit the payload: <script>alert(document.domain)</script>",
            "Save the note and observe the alert fires immediately (reflected).",
            "Log out, log in as a different user, and navigate to the shared notes view.",
            "Observe the alert fires again — confirming the payload is stored and executes for all viewers.",
        ],
        "poc_images": [
            {"src": "/poc/poc-browser.svg", "caption": "Figure 1 — Browser rendering the stored XSS payload. Domain name and user identifiers have been redacted."},
            {"src": "/poc/poc-burp-request.svg", "caption": "Figure 2 — Malicious POST request with XSS payload in the `content` field. Session token redacted."},
        ],
        "references": [
            {"label": "OWASP WSTG-INPV-02: Testing for Stored Cross-Site Scripting", "url": "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/02-Testing_for_Stored_Cross_Site_Scripting"},
            {"label": "CWE-79: Improper Neutralization of Input During Web Page Generation", "url": "https://cwe.mitre.org/data/definitions/79.html"},
            {"label": "OWASP XSS Prevention Cheat Sheet", "url": "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"},
        ],
    },
    {
        "id": 3,
        "pentester": "Graham O'Donnell",
        "title": "IDOR: Arbitrary PDF Access via Predictable Identifier",
        "date": "2026-02-19",
        "severity": "High",
        "status": "Open",
        "wstg_id": "WSTG-ATHZ-01",
        "wstg_category": "Authorization Testing",
        "cwe_id": 639,
        "cvss": "7.5 (AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N)",
        "affected_component": "/api/documents/:id/download",
        "description": (
            "The document download endpoint accepts a sequential integer as the document identifier. "
            "No server-side authorization check is performed to verify that the authenticated user owns "
            "or has permission to access the requested document. An attacker can enumerate document IDs "
            "in sequence to download files belonging to other users."
        ),
        "impact": (
            "An authenticated user can access documents belonging to any other user in the system. "
            "Depending on the sensitivity of stored documents (contracts, invoices, PII-bearing reports), "
            "this could constitute a data breach and trigger regulatory notification obligations under "
            "GDPR, CCPA, or HIPAA."
        ),
        "recommendation": (
            "Enforce object-level authorization on every document retrieval endpoint: verify the requesting "
            "user's session identity against the document's owner field before serving any data. Consider "
            "replacing sequential integer IDs with non-guessable UUIDs as an additional defense-in-depth measure."
        ),
        "steps_to_reproduce": [
            "Log in as User A and upload a test document. Note the document ID returned — e.g., `id=204`.",
            "Log out and log in as User B (a separate account with no permissions to User A's documents).",
            "Issue GET /api/documents/204/download while authenticated as User B.",
            "Observe that User A's document is returned without authorization error.",
            "Increment the ID (205, 206, …) and repeat — confirming unrestricted enumeration.",
        ],
        "poc_images": [
            {"src": "/poc/poc-burp-request.svg", "caption": "Figure 1 — Request issued by User B referencing User A's document ID. Session cookie redacted."},
            {"src": "/poc/poc-burp-response.svg", "caption": "Figure 2 — HTTP 200 response returning document content without authorization check. Filename and content redacted."},
        ],
        "references": [
            {"label": "OWASP WSTG-ATHZ-01: Testing for Insecure Direct Object References", "url": "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/01-Testing_Directory_Traversal_File_Include"},
            {"label": "CWE-639: Authorization Bypass Through User-Controlled Key", "url": "https://cwe.mitre.org/data/definitions/639.html"},
            {"label": "OWASP Broken Access Control", "url": "https://owasp.org/Top10/A01_2021-Broken_Access_Control/"},
        ],
    },
    {
        "id": 4,
        "pentester": "Belizaire Bassette II",
        "title": "Session Token Not Invalidated on Server-Side Logout",
        "date": "2026-02-12",
        "severity": "High",
        "status": "Open",
        "wstg_id": "WSTG-SESS-06",
        "wstg_category": "Session Management",
        "cwe_id": 613,
        "cvss": "7.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:N)",
        "affected_component": "POST /auth/logout — session invalidation logic",
        "description": (
            "When a user logs out, the application clears the session cookie client-side but does not "
            "invalidate the session token on the server. A token captured prior to logout remains valid "
            "indefinitely. An attacker in possession of a prior token can reuse it to authenticate as the "
            "victim after the victim believes they have ended their session."
        ),
        "impact": (
            "Pre-logout session tokens remain permanently valid. This significantly extends the attack "
            "window for session hijacking attacks, particularly relevant in shared-device or kiosk scenarios."
        ),
        "recommendation": (
            "On every logout request, invalidate the session on the server side by removing the session "
            "record from the session store (or blacklisting JWTs if stateless tokens are used). "
            "Enforce an absolute session expiry independent of activity. "
            "If JWTs are in use, implement a token revocation list or reduce token TTL significantly."
        ),
        "steps_to_reproduce": [
            "Log in and capture the session cookie value from the browser or proxy.",
            "Navigate to a protected resource (e.g., /dashboard) and confirm access.",
            "Log out using the application's logout button.",
            "Restore the captured cookie using browser DevTools or a proxy intercept rule.",
            "Reissue the GET /dashboard request with the old cookie.",
            "Observe the server returns a 200 response, confirming the session remains active.",
        ],
        "poc_images": [
            {"src": "/poc/poc-burp-request.svg", "caption": "Figure 1 — Request using pre-logout session token after client-side logout. Cookie value redacted."},
            {"src": "/poc/poc-burp-response.svg", "caption": "Figure 2 — Server returns 200 OK with authenticated content, confirming token was not invalidated."},
        ],
        "references": [
            {"label": "OWASP WSTG-SESS-06: Testing for Logout Functionality", "url": "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/06-Testing_for_Logout_Functionality"},
            {"label": "CWE-613: Insufficient Session Expiration", "url": "https://cwe.mitre.org/data/definitions/613.html"},
            {"label": "OWASP Session Management Cheat Sheet", "url": "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html"},
        ],
    },
    {
        "id": 5,
        "pentester": "Belizaire Bassette II",
        "title": "Missing HTTP Security Headers (CSP / HSTS / X-Frame-Options)",
        "date": "2026-02-18",
        "severity": "Low",
        "status": "Open",
        "wstg_id": "WSTG-CONF-07",
        "wstg_category": "Configuration & Deployment Management",
        "cwe_id": 693,
        "cvss": "3.1 (AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N)",
        "affected_component": "All application responses",
        "description": (
            "HTTP responses from the application are missing several security-relevant headers: "
            "Content-Security-Policy (CSP), HTTP Strict-Transport-Security (HSTS), X-Frame-Options, "
            "X-Content-Type-Options, and Referrer-Policy."
        ),
        "impact": (
            "Absence of CSP increases the severity of any XSS findings. Missing HSTS allows SSL-stripping "
            "attacks on the first connection. Missing X-Frame-Options enables clickjacking."
        ),
        "recommendation": (
            "Configure the web server or reverse proxy to append: "
            "`Content-Security-Policy: default-src 'self'`, "
            "`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`, "
            "`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, "
            "`Referrer-Policy: strict-origin-when-cross-origin`. Validate with Mozilla Observatory."
        ),
        "steps_to_reproduce": [
            "Navigate to the application's root URL in a browser proxy.",
            "Inspect the HTTP response headers in Burp Suite or browser DevTools.",
            "Confirm the absence of: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.",
            "Alternatively, run the Mozilla Observatory scanner against the application host.",
        ],
        "poc_images": [
            {"src": "/poc/poc-burp-response.svg", "caption": "Figure 1 — HTTP response headers from root endpoint. Security headers absent. Host redacted."},
        ],
        "references": [
            {"label": "OWASP WSTG-CONF-07: Test HTTP Strict Transport Security", "url": "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/02-Configuration_and_Deployment_Management_Testing/07-Test_HTTP_Strict_Transport_Security"},
            {"label": "OWASP Secure Headers Project", "url": "https://owasp.org/www-project-secure-headers/"},
            {"label": "CWE-693: Protection Mechanism Failure", "url": "https://cwe.mitre.org/data/definitions/693.html"},
        ],
    },
    {
        "id": 6,
        "pentester": "Mike Lisi",
        "title": "Insufficient Password Complexity Requirements",
        "date": "2026-02-14",
        "severity": "Medium",
        "status": "Open",
        "wstg_id": "WSTG-ATHN-07",
        "wstg_category": "Authentication Testing",
        "cwe_id": 521,
        "cvss": "5.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N)",
        "affected_component": "POST /auth/register — password field validation",
        "description": (
            "The application's registration and password-change flows accept passwords as short as one "
            "character with no character-class requirements. There is no enforcement of minimum length, "
            "no dictionary word check, and no breach-password screening."
        ),
        "impact": (
            "Accounts protected by weak passwords are highly susceptible to credential stuffing using "
            "leaked credential lists and to online brute-force attacks if rate-limiting is absent or bypassable."
        ),
        "recommendation": (
            "Enforce a minimum password length of 12 characters (per NIST SP 800-63B). "
            "Screen new passwords against the HaveIBeenPwned API (k-anonymity model) to reject known breached passwords. "
            "Implement account lockout or progressive delays after repeated failed authentication attempts."
        ),
        "steps_to_reproduce": [
            "Navigate to the registration endpoint.",
            'Submit a POST /auth/register with password: "a" (one character).',
            "Observe that the account is created successfully — no validation error returned.",
            "Repeat with passwords: '123', 'password', 'admin' — all accepted.",
        ],
        "poc_images": [
            {"src": "/poc/poc-burp-request.svg", "caption": "Figure 1 — Registration request with single-character password accepted. Email and username redacted."},
            {"src": "/poc/poc-burp-response.svg", "caption": "Figure 2 — HTTP 201 Created response confirming weak password was accepted without validation error."},
        ],
        "references": [
            {"label": "OWASP WSTG-ATHN-07: Testing for Weak Password Policy", "url": "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/04-Authentication_Testing/07-Testing_for_Weak_Password_Policy"},
            {"label": "CWE-521: Weak Password Requirements", "url": "https://cwe.mitre.org/data/definitions/521.html"},
            {"label": "NIST SP 800-63B", "url": "https://pages.nist.gov/800-63-3/sp800-63b.html"},
        ],
    },
    {
        "id": 7,
        "pentester": "Belizaire Bassette II",
        "title": "Stack Trace Disclosure via Registration Error (Information Leakage)",
        "date": "2026-02-03",
        "severity": "Medium",
        "status": "Open",
        "wstg_id": "WSTG-ERRH-01",
        "wstg_category": "Error Handling",
        "cwe_id": 209,
        "cvss": "5.3 (AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N)",
        "affected_component": "POST /auth/register — duplicate-email error path",
        "description": (
            "When a registration request is submitted with an email address that already exists, "
            "the application returns a verbose error response containing a full server-side stack trace "
            "disclosing the framework version, file system paths, internal function names, and the ORM query."
        ),
        "impact": (
            "Leaked stack traces reduce attacker reconnaissance effort and allow exploitation to be "
            "specifically tailored to the disclosed framework and library versions."
        ),
        "recommendation": (
            "Configure the framework to return generic error messages in all non-development environments. "
            "Disable debug mode in production. Log full error details server-side only, "
            "returning a generic message and correlation ID to the client."
        ),
        "steps_to_reproduce": [
            "Register an account with a valid email address.",
            "Issue a second POST /auth/register with the same email address.",
            "Observe that the HTTP 500 response body contains a full stack trace.",
            "Note the framework, version, file paths, and ORM query disclosed in the response.",
        ],
        "poc_images": [
            {"src": "/poc/poc-burp-response.svg", "caption": "Figure 1 — HTTP 500 response body showing stack trace. Framework name, version, and file paths have been redacted."},
        ],
        "references": [
            {"label": "OWASP WSTG-ERRH-01: Testing for Improper Error Handling", "url": "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/08-Testing_for_Error_Handling/01-Testing_For_Improper_Error_Handling"},
            {"label": "CWE-209: Generation of Error Message Containing Sensitive Information", "url": "https://cwe.mitre.org/data/definitions/209.html"},
            {"label": "OWASP Error Handling Cheat Sheet", "url": "https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html"},
        ],
    },
    {
        "id": 8,
        "pentester": "Mike Lisi",
        "title": "Outdated JavaScript Library (jQuery 1.10.2) with Known CVEs",
        "date": "2026-02-20",
        "severity": "Medium",
        "status": "Fixed",
        "wstg_id": "WSTG-CONF-01",
        "wstg_category": "Configuration & Deployment Management",
        "cwe_id": 1104,
        "cvss": "6.1 (AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N)",
        "affected_component": "Frontend — /static/js/jquery-1.10.2.min.js",
        "description": (
            "The application includes jQuery version 1.10.2, which has multiple publicly known "
            "vulnerabilities (CVE-2020-11022, CVE-2020-11023) describing XSS vulnerabilities in "
            "jQuery's HTML manipulation methods when operating on untrusted HTML strings."
        ),
        "impact": (
            "If any application code passes user-controlled content through the affected jQuery APIs, "
            "XSS exploitation is possible. Presence of known-vulnerable components is also a PCI-DSS finding."
        ),
        "recommendation": (
            "Upgrade to the latest stable jQuery release (3.x) or migrate to vanilla JS. "
            "Integrate a software composition analysis (SCA) tool such as Retire.js or OWASP "
            "Dependency-Check into CI/CD to automatically flag vulnerable dependencies on every build."
        ),
        "steps_to_reproduce": [
            "View the application's page source or intercept responses in a proxy.",
            "Identify the jQuery script tag: `<script src='/static/js/jquery-1.10.2.min.js'>`.",
            "Cross-reference the version against the NVD or Retire.js database.",
            "Confirm CVE-2020-11022 and CVE-2020-11023 apply to version 1.10.2.",
        ],
        "poc_images": [
            {"src": "/poc/poc-browser.svg", "caption": "Figure 1 — Browser DevTools Network tab showing jQuery 1.10.2 loaded. Host redacted."},
            {"src": "/poc/poc-terminal.svg", "caption": "Figure 2 — Retire.js CLI output confirming known vulnerabilities. Path redacted."},
        ],
        "references": [
            {"label": "CWE-1104: Use of Unmaintained Third Party Components", "url": "https://cwe.mitre.org/data/definitions/1104.html"},
            {"label": "CVE-2020-11022", "url": "https://nvd.nist.gov/vuln/detail/CVE-2020-11022"},
            {"label": "CVE-2020-11023", "url": "https://nvd.nist.gov/vuln/detail/CVE-2020-11023"},
            {"label": "Retire.js", "url": "https://retirejs.github.io/retire.js/"},
        ],
    },
]


def seed():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        existing_ids = set(session.exec(select(Finding.id)).all())
        inserted = 0
        for data in SEED_FINDINGS:
            if data["id"] in existing_ids:
                print(f"  skip  id={data['id']} (already exists)")
                continue
            finding = Finding(**data)
            session.add(finding)
            inserted += 1
            print(f"  insert id={data['id']} — {data['title']}")
        session.commit()
        print(f"\nDone. {inserted} finding(s) inserted.")


if __name__ == "__main__":
    seed()
