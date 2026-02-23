import React from "react";

/**
 * A simple type so our table rows are readable and consistent.
 */

/** Here we're defining our "finding row" with pentester, findings, and date as strings. 
    And Severity and status as prefixed strings of titles to define them 
    */
type FindingRow = {
  pentester: string;
  finding: string;
  date: string; // keeping this as "YYYY-MM-DD" for sorting later
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  status: "Open" | "Fixed" | "Accepted Risk";
};

/**
 * Static preview rows (replace we can replace with real data later or load from an API)
 */
const FINDINGS: FindingRow[] = [
  {
    pentester: "Belizaire Bassette II",
    finding: "Missing Security Headers (CSP / HSTS / X-Frame-Options)",
    date: "2026-02-18",
    severity: "Low",
    status: "Open",
  },
  {
    pentester: "Graham O’Donnell",
    finding: "IDOR: Arbitrary PDF Access via Predictable Identifier",
    date: "2026-02-19",
    severity: "High",
    status: "Open",
  },
  {
    pentester: "Mike Lisi",
    finding: "Outdated JavaScript Library (jQuery 1.10.2) with Known CVEs",
    date: "2026-02-20",
    severity: "Medium",
    status: "Fixed",
  },
  {
    pentester: "Belizaire Bassette II",
    finding: "Stack Trace Disclosure via Registration Error (Info Leakage)",
    date: "2026-02-03",
    severity: "Medium",
    status: "Open",
  },
];

/**
 * Helper: return a small badge style based on severity.
 * (kept simple for learning; later you can move to CSS/Tailwind)
 */
function getSeverityBadgeStyle(sev: FindingRow["severity"]): React.CSSProperties {
  switch (sev) {
    case "Critical":
      return { ...styles.badge, background: "#ef4444", borderColor: "#ef4444", color: "#0b1220" };
    case "High":
      return { ...styles.badge, background: "#f97316", borderColor: "#f97316", color: "#0b1220" };
    case "Medium":
      return { ...styles.badge, background: "#facc15", borderColor: "#facc15", color: "#0b1220" };
    case "Low":
      return { ...styles.badge, background: "#22c55e", borderColor: "#22c55e", color: "#0b1220" };
    case "Info":
    default:
      return { ...styles.badge, background: "#94a3b8", borderColor: "#94a3b8", color: "#0b1220" };
  }
}

function getStatusBadgeStyle(status: FindingRow["status"]): React.CSSProperties {
  // Maltek blue/teal accents for our status
  switch (status) {
    case "Fixed":
      return { ...styles.badgeOutline, borderColor: styles.colors.accentTeal, color: styles.colors.accentTeal };
    case "Accepted Risk":
      return { ...styles.badgeOutline, borderColor: "#94a3b8", color: "#94a3b8" };
    case "Open":
    default:
      return { ...styles.badgeOutline, borderColor: styles.colors.accentBlue, color: styles.colors.accentBlue };
  }
}

/**
 * NavBar()
 * - Top header
 * - Shows logo + site name on the left
 * - Contact on right
 */
function NavBar() {
  return (
    <header style={styles.navbar}>
      {/* LEFT: Logo + title */}
      <div style={styles.navLeft}>
        {/* Logo icon mark */}
        <img
          src="/maltek.2.png"
          alt="Maltek Solutions Logo"
          style={styles.navLogo}
        />

        <div>
          <div style={styles.navTitle}>finding.maltek</div>
          <div style={styles.navSubtitle}>Maltek Findings Archive</div>
        </div>
      </div>

      {/* RIGHT: Contact */}
      <div style={styles.navRight}>
        <a style={styles.navLink} href="mailto:belizaire@malteksolutions.com">
          belizaire@malteksolutions.com
        </a>
      </div>
    </header>
  );
}

/**
 * Homepage()
 * - Static homepage
 * - Includes a hero banner + table (columns/rows)
 */
export default function Homepage() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <NavBar />

        {/* HERO / BANNER */}
        <section style={styles.hero}>
          {/* Background image (subtle) */}
          <div style={styles.heroBgWrap}>
            <img
              src="findings/maltek.jpeg"
              alt="Maltek hero background"
              style={styles.heroBg}
            />
            <div style={styles.heroOverlay} />
          </div>

          <div style={styles.heroContent}>
            <div>
              <h1 style={styles.h1}>Maltek Findings</h1>
              <p style={styles.p}>
                A single place to review security findings across the years.
                Browse by pentester, finding title, and date — then expand later with filters and metrics.
              </p>

              <div style={styles.heroChips}>
                <span style={styles.chip}>Blue Team + Red Team Ready</span>
                <span style={styles.chip}>Year-over-Year Tracking</span>
                <span style={styles.chip}>Client-Safe Summaries</span>
              </div>
            </div>

            {/* Right side brand image */}
            <img
              src="findings/maltek.1.jpeg"
              alt="Maltek Solutions wordmark"
              style={styles.heroBrand}
            />
          </div>
        </section>

        {/* MAIN CONTENT CARD */}
        <main style={styles.card}>
          {/* Small intro strip */}
          <section style={styles.section}>
            <h2 style={styles.h2}>Latest Findings (Static Demo)</h2>
            <p style={styles.pSmall}>
              This table is static for now (great for learning + UI building).
              Later we’ll replace <code>FINDINGS</code> with data from FastAPI.
            </p>
          </section>

          {/* TABLE: Pentester, Finding, Date + helpful columns */}
          <section style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Pentester</th>
                  <th style={styles.th}>Finding</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Severity</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {FINDINGS.map((row, idx) => (
                  <tr key={`${row.pentester}-${row.date}-${idx}`} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.cellStrong}>{row.pentester}</div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.cellText}>{row.finding}</div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.cellMono}>{row.date}</div>
                    </td>

                    <td style={styles.td}>
                      <span style={getSeverityBadgeStyle(row.severity)}>{row.severity}</span>
                    </td>

                    <td style={styles.td}>
                      <span style={getStatusBadgeStyle(row.status)}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* FOOTER NOTE */}
          <section style={styles.section}>
            <h2 style={styles.h2}>Next UI upgrades (when you’re ready)</h2>
            <ul style={styles.ul}>
              <li style={styles.li}>Add a search bar to filter by pentester or finding name</li>
              <li style={styles.li}>Add year + severity filter buttons</li>
              <li style={styles.li}>Click a row to open a “Finding Details” panel</li>
              <li style={styles.li}>Connect to FastAPI: <code>GET /findings</code></li>
            </ul>
          </section>
        </main>

        {/* FOOTER */}
        <footer style={styles.footer}>
          <span>© {new Date().getFullYear()} Maltek Solutions</span>
          <span style={{ color: "#94a3b8" }}> • </span>
          <span>finding.maltek (UI prototype)</span>
        </footer>
      </div>
    </div>
  );
}

/**
 * styles
 * - Using inline styles so everything stays in one file while you learn.
 * - Later you can move to CSS modules or Tailwind.
 */
const styles: Record<string, any> = {
  colors: {
    // These approximate Maltek brand tones from your logos
    accentBlue: "#0ea5e9", // bright blue
    accentTeal: "#22c1d6", // teal/cyan
    dark: "#0b1220",
    panel: "rgba(15, 23, 42, 0.55)",
    border: "#1f2937",
    textMuted: "#cbd5e1",
  },

  page: {
    minHeight: "100vh",
    background: "#0b1220",
    color: "#e5e7eb",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },

  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "24px 16px",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #1f2937",
    background: "rgba(15, 23, 42, 0.75)",
  },

  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  navLogo: {
    width: 40,
    height: 40,
    objectFit: "contain",
    borderRadius: 10,
    border: "1px solid #1f2937",
    background: "rgba(2, 6, 23, 0.35)",
    padding: 6,
  },

  navTitle: {
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: 0.2,
  },

  navSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  navLink: {
    color: "#e5e7eb",
    textDecoration: "none",
    border: "1px solid #334155",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
  },

  hero: {
    position: "relative",
    marginTop: 16,
    borderRadius: 18,
    border: "1px solid #1f2937",
    overflow: "hidden",
    background: "rgba(15, 23, 42, 0.55)",
  },

  heroBgWrap: {
    position: "absolute",
    inset: 0,
  },

  heroBg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.35,
    filter: "contrast(1.05) saturate(1.1)",
  },

  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(11,18,32,0.92) 0%, rgba(11,18,32,0.75) 45%, rgba(11,18,32,0.92) 100%)",
  },

  heroContent: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 16,
    alignItems: "center",
    padding: 18,
  },

  heroBrand: {
    width: "100%",
    maxHeight: 90,
    objectFit: "contain",
    borderRadius: 14,
    border: "1px solid #1f2937",
    background: "rgba(2, 6, 23, 0.35)",
    padding: 10,
  },

  heroChips: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 10,
  },

  chip: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #1f2937",
    background: "rgba(2, 6, 23, 0.35)",
    color: "#cbd5e1",
  },

  card: {
    marginTop: 16,
    border: "1px solid #1f2937",
    borderRadius: 18,
    background: "rgba(15, 23, 42, 0.55)",
    padding: 18,
  },

  h1: {
    margin: 0,
    fontSize: 28,
    fontWeight: 950,
  },

  h2: {
    margin: "0 0 10px 0",
    fontSize: 16,
    fontWeight: 900,
  },

  p: {
    marginTop: 10,
    lineHeight: 1.6,
    color: "#cbd5e1",
  },

  pSmall: {
    marginTop: 6,
    lineHeight: 1.6,
    color: "#94a3b8",
    fontSize: 13,
  },

  section: {
    marginTop: 18,
    paddingTop: 12,
    borderTop: "1px solid #1f2937",
  },

  ul: {
    marginTop: 8,
    paddingLeft: 18,
    color: "#cbd5e1",
  },

  li: {
    marginTop: 6,
  },

  tableWrap: {
    marginTop: 12,
    overflowX: "auto",
    borderRadius: 14,
    border: "1px solid #1f2937",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "rgba(2, 6, 23, 0.25)",
  },

  th: {
    textAlign: "left",
    fontSize: 12,
    letterSpacing: 0.2,
    color: "#94a3b8",
    padding: "12px 14px",
    borderBottom: "1px solid #1f2937",
    background: "rgba(2, 6, 23, 0.35)",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom: "1px solid #1f2937",
  },

  td: {
    padding: "12px 14px",
    verticalAlign: "top",
  },

  cellStrong: {
    fontWeight: 800,
  },

  cellText: {
    color: "#e5e7eb",
    lineHeight: 1.4,
  },

  cellMono: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    fontSize: 12,
    color: "#cbd5e1",
  },

  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #334155",
    fontSize: 12,
    fontWeight: 800,
  },

  badgeOutline: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #334155",
    fontSize: 12,
    fontWeight: 800,
    background: "transparent",
  },

  footer: {
    marginTop: 16,
    fontSize: 12,
    color: "#cbd5e1",
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
};
