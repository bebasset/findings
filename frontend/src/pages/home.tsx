import React, { useMemo, useState } from "react";

type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";
type Status = "Open" | "Fixed" | "Accepted Risk";

type FindingRow = {
  id: number;
  pentester: string;
  finding: string;
  date: string; // YYYY-MM-DD
  severity: Severity;
  status: Status;

  // “details” fields (still static for now)
  summary: string;
  impact: string;
  recommendation: string;
  references?: string[];
};

const FINDINGS: FindingRow[] = [
  {
    id: 1,
    pentester: "Belizaire Bassette II",
    finding: "Missing Security Headers (CSP / HSTS / X-Frame-Options)",
    date: "2026-02-18",
    severity: "Low",
    status: "Open",
    summary: "Response headers are missing common browser protections.",
    impact: "Increases risk from clickjacking, downgrade issues, and content injection scenarios.",
    recommendation: "Add CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.",
    references: ["OWASP Secure Headers Project", "OWASP ASVS (V14)"],
  },
  {
    id: 2,
    pentester: "Graham O’Donnell",
    finding: "IDOR: Arbitrary PDF Access via Predictable Identifier",
    date: "2026-02-19",
    severity: "High",
    status: "Open",
    summary: "Direct object references allow access to documents without proper authorization.",
    impact: "Exposure of sensitive documents and potential regulatory impact.",
    recommendation: "Enforce authorization checks server-side for every document request.",
    references: ["OWASP Broken Access Control"],
  },
  {
    id: 3,
    pentester: "Mike Lisi",
    finding: "Outdated JavaScript Library (jQuery 1.10.2) with Known CVEs",
    date: "2026-02-20",
    severity: "Medium",
    status: "Fixed",
    summary: "Client-side dependency is outdated and has known vulnerabilities.",
    impact: "Potential XSS vectors depending on usage patterns.",
    recommendation: "Upgrade to a supported version and run dependency scanning in CI.",
    references: ["CVE-2020-11022", "CVE-2020-11023"],
  },
  {
    id: 4,
    pentester: "Belizaire Bassette II",
    finding: "Stack Trace Disclosure via Registration Error (Info Leakage)",
    date: "2026-02-03",
    severity: "Medium",
    status: "Open",
    summary: "Application errors expose stack traces and internal implementation details.",
    impact: "Helps attackers map code paths, libraries, and data structures.",
    recommendation: "Return generic error messages; log details server-side only.",
    references: ["OWASP Error Handling Cheat Sheet"],
  },
];

const SEVERITIES: Severity[] = ["Critical", "High", "Medium", "Low", "Info"];

/** ---------- Small helpers ---------- */
function severityStyle(sev: Severity): React.CSSProperties {
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

function statusStyle(status: Status): React.CSSProperties {
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

function NavBar() {
  return (
    <header style={styles.navbar}>
      <div style={styles.navLeft}>
        {/* Logo (served from frontend/public/findings/) */}
        <img
          src="/maltek.2.png"
          alt="Maltek Solutions Logo"
          style={styles.navLogo}
        />
        <div>
          <div style={styles.navTitle}>findings.maltek</div>
          <div style={styles.navSubtitle}>Maltek Findings Archive</div>
        </div>
      </div>
    </header>
  );
}

export default function Homepage() {
  // UI state for filtering/searching
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<number | "All">("All");
  const [severityFilter, setSeverityFilter] = useState<Severity | "All">("All");
  const [selected, setSelected] = useState<FindingRow | null>(null);

  const years = useMemo(() => {
    const ys = Array.from(new Set(FINDINGS.map(f => Number(f.date.slice(0, 4)))));
    ys.sort((a, b) => b - a);
    return ys;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return FINDINGS.filter((f) => {
      const year = Number(f.date.slice(0, 4));
      const matchesYear = yearFilter === "All" ? true : year === yearFilter;
      const matchesSeverity = severityFilter === "All" ? true : f.severity === severityFilter;

      const matchesQuery =
        q.length === 0
          ? true
          : `${f.pentester} ${f.finding} ${f.severity} ${f.status} ${f.date}`
              .toLowerCase()
              .includes(q);

      return matchesYear && matchesSeverity && matchesQuery;
    });
  }, [query, yearFilter, severityFilter]);

  // KPIs (counts by severity)
  const kpis = useMemo(() => {
    const counts: Record<Severity, number> = { Critical: 0, High: 0, Medium: 0, Low: 0, Info: 0 };
    for (const f of filtered) counts[f.severity] += 1;
    return counts;
  }, [filtered]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <NavBar />

        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.heroBgWrap}>
            <img
              src="/maltek.jpeg"
              alt="Maltek hero background"
              style={styles.heroBg}
            />
            <div style={styles.heroOverlay} />
          </div>

          <div style={styles.heroContent}>
            <div>
              <h1 style={styles.h1}>Maltek Findings</h1>
              <p style={styles.p}>
                A single place to review security findings across the years. Search and filter by
                pentester, severity, and year.
              </p>

              {/* KPI row */}
              <div style={styles.kpiRow}>
                {SEVERITIES.map((s) => (
                  <div key={s} style={styles.kpiCard}>
                    <div style={styles.kpiLabel}>{s}</div>
                    <div style={styles.kpiValue}>{kpis[s]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wordmark */}
            <img
              src="/maltek.1.jpeg"
              alt="Maltek Solutions wordmark"
              style={styles.heroBrand}
            />
          </div>
        </section>

        {/* MAIN CARD */}
        <main style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.h2}>Findings Archive</h2>
              <p style={styles.pSmall}>
                
        /** We still need to connect FastAPI <code>GET findings/</code>**/

                /**Also this is just a preview of what the findings archive would like**/

              </p>
            </div>
          </div>

          {/* Controls */}
          <section style={styles.controls}>
            {/* Search */}
            <div style={styles.controlBlock}>
              <label style={styles.label}>Search</label>
              <input
                style={styles.input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by pentester, finding, date, severity..."
              />
            </div>

            {/* Year filter */}
            <div style={styles.controlBlock}>
              <label style={styles.label}>Year</label>
              <select
                style={styles.select}
                value={yearFilter}
                onChange={(e) => {
                  const v = e.target.value;
                  setYearFilter(v === "All" ? "All" : Number(v));
                }}
              >
                <option value="All">All</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity filter */}
            <div style={styles.controlBlock}>
              <label style={styles.label}>Severity</label>
              <select
                style={styles.select}
                value={severityFilter}
                onChange={(e) => {
                  const v = e.target.value as Severity | "All";
                  setSeverityFilter(v);
                }}
              >
                <option value="All">All</option>
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset */}
            <div style={styles.controlBlock}>
              <label style={styles.label}>Actions</label>
              <button
                style={styles.button}
                onClick={() => {
                  setQuery("");
                  setYearFilter("All");
                  setSeverityFilter("All");
                }}
              >
                Reset
              </button>
            </div>
          </section>

          {/* Table */}
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
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    style={styles.trClickable}
                    onClick={() => setSelected(row)}
                    title="Click to view details"
                  >
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
                      <span style={severityStyle(row.severity)}>{row.severity}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={statusStyle(row.status)}>{row.status}</span>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={5}>
                      <span style={{ color: "#94a3b8" }}>No results match your filters.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* About */}
          <section style={styles.section}>
            <h2 style={styles.h2}>About</h2>
            <p style={styles.p}>
              This portal will track findings across time for reporting, trend analysis, and internal learning.
              We still need to connect this UI to our FastAPI backend and store our findings in Postgres.
            </p>
          </section>
        </main>

        <footer style={styles.footer}>
          <span>© {new Date().getFullYear()} Maltek Solutions</span>
          <span style={{ color: "#94a3b8" }}> • </span>
          <span>finding.maltek (UI prototype)</span>
        </footer>
      </div>

      {/* DETAILS MODAL (click a row) */}
      {selected && (
        <div style={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{selected.finding}</div>
                <div style={styles.modalMetaRow}>
                  <span style={styles.badgeOutline}>{selected.pentester}</span>
                  <span style={styles.badgeOutline}>{selected.date}</span>
                  <span style={severityStyle(selected.severity)}>{selected.severity}</span>
                  <span style={statusStyle(selected.status)}>{selected.status}</span>
                </div>
              </div>
              <button style={styles.button} onClick={() => setSelected(null)}>
                Close
              </button>
            </div>

            <div style={styles.modalBody}>
              <DetailBlock title="Summary" text={selected.summary} />
              <DetailBlock title="Impact" text={selected.impact} />
              <DetailBlock title="Recommendation" text={selected.recommendation} />

              {selected.references?.length ? (
                <div style={{ marginTop: 14 }}>
                  <div style={styles.detailTitle}>References</div>
                  <ul style={styles.ul}>
                    {selected.references.map((r) => (
                      <li key={r} style={styles.li}>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailBlock({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={styles.detailTitle}>{title}</div>
      <div style={styles.detailText}>{text}</div>
    </div>
  );
}

/** ---------- Styles (keep in one file for learning) ---------- */
const styles: Record<string, any> = {
  colors: {
    accentBlue: "#0ea5e9",
    accentTeal: "#22c1d6",
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

  navLeft: { display: "flex", alignItems: "center", gap: 12 },
  navRight: { display: "flex", alignItems: "center", gap: 10 },

  navLogo: {
    width: 40,
    height: 40,
    objectFit: "contain",
    borderRadius: 10,
    border: "1px solid #1f2937",
    background: "rgba(2, 6, 23, 0.35)",
    padding: 6,
  },

  navTitle: { fontSize: 18, fontWeight: 900 },
  navSubtitle: { fontSize: 12, color: "#94a3b8", marginTop: 2 },

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

  heroBgWrap: { position: "absolute", inset: 0 },
  heroBg: { width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, rgba(11,18,32,0.92) 0%, rgba(11,18,32,0.75) 45%, rgba(11,18,32,0.92) 100%)",
  },

  heroContent: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1.25fr 0.75fr",
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

  h1: { margin: 0, fontSize: 28, fontWeight: 950 },
  h2: { margin: "0 0 8px 0", fontSize: 16, fontWeight: 900 },

  p: { marginTop: 10, lineHeight: 1.6, color: "#cbd5e1" },
  pSmall: { marginTop: 6, lineHeight: 1.6, color: "#94a3b8", fontSize: 13 },

  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 10,
    marginTop: 12,
  },

  kpiCard: {
    border: "1px solid #1f2937",
    borderRadius: 14,
    padding: 12,
    background: "rgba(2, 6, 23, 0.35)",
  },

  kpiLabel: { fontSize: 12, color: "#94a3b8", fontWeight: 800 },
  kpiValue: { fontSize: 20, fontWeight: 950, marginTop: 6 },

  card: {
    marginTop: 16,
    border: "1px solid #1f2937",
    borderRadius: 18,
    background: "rgba(15, 23, 42, 0.55)",
    padding: 18,
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },

  controls: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "1.4fr 0.6fr 0.6fr 0.4fr",
    gap: 12,
  },

  controlBlock: { display: "flex", flexDirection: "column", gap: 6 },

  label: { fontSize: 12, color: "#94a3b8", fontWeight: 800 },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #334155",
    background: "#0b1220",
    color: "#e5e7eb",
    outline: "none",
  },

  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #334155",
    background: "#0b1220",
    color: "#e5e7eb",
    outline: "none",
  },

  button: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #334155",
    background: "transparent",
    color: "#e5e7eb",
    cursor: "pointer",
    height: 42,
  },

  tableWrap: {
    marginTop: 14,
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

  td: { padding: "12px 14px", verticalAlign: "top" },

  trClickable: {
    borderBottom: "1px solid #1f2937",
    cursor: "pointer",
  },

  cellStrong: { fontWeight: 900 },
  cellText: { color: "#e5e7eb", lineHeight: 1.4 },
  cellMono: {
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    fontSize: 12,
    color: "#cbd5e1",
  },

  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #334155",
    fontSize: 12,
    fontWeight: 900,
  },

  badgeOutline: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #334155",
    fontSize: 12,
    fontWeight: 900,
    background: "transparent",
  },

  section: { marginTop: 18, paddingTop: 12, borderTop: "1px solid #1f2937" },

  ul: { marginTop: 8, paddingLeft: 18, color: "#cbd5e1" },
  li: { marginTop: 6 },

  footer: {
    marginTop: 16,
    fontSize: 12,
    color: "#cbd5e1",
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 18,
  },

  modal: {
    width: "min(920px, 100%)",
    marginTop: 30,
    border: "1px solid #1f2937",
    borderRadius: 16,
    background: "#0b1220",
    overflow: "hidden",
  },

  modalHeader: {
    padding: "12px 14px",
    borderBottom: "1px solid #1f2937",
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },

  modalMetaRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },

  modalBody: { padding: 14 },

  detailTitle: { fontSize: 12, color: "#94a3b8", fontWeight: 900, textTransform: "uppercase" },
  detailText: { marginTop: 6, color: "#e5e7eb", lineHeight: 1.6 },
};
