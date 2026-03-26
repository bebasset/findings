import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FINDINGS, SEVERITIES, WSTG_CATEGORIES } from "../data/findings";
import { getFindings } from "../services/api";
import type { Finding, Severity, WstgCategory } from "../types";

// ─── badge helpers ───────────────────────────────────────────────────────────

function severityStyle(sev: Severity): React.CSSProperties {
  const base = S.badge;
  switch (sev) {
    case "Critical": return { ...base, background: "#ef4444", borderColor: "#ef4444", color: "#0b1220" };
    case "High":     return { ...base, background: "#f97316", borderColor: "#f97316", color: "#0b1220" };
    case "Medium":   return { ...base, background: "#facc15", borderColor: "#facc15", color: "#0b1220" };
    case "Low":      return { ...base, background: "#22c55e", borderColor: "#22c55e", color: "#0b1220" };
    default:         return { ...base, background: "#94a3b8", borderColor: "#94a3b8", color: "#0b1220" };
  }
}

// ─── nav ─────────────────────────────────────────────────────────────────────

function NavBar() {
  return (
    <header style={S.navbar}>
      <div style={S.navLeft}>
        <img src="/maltek.2.png" alt="Maltek Solutions Logo" style={S.navLogo} />
        <div>
          <div style={S.navTitle}>findings.maltek</div>
          <div style={S.navSubtitle}>Maltek Findings Archive</div>
        </div>
      </div>
    </header>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function Homepage() {
  const [findings,       setFindings]       = useState<Finding[]>(FINDINGS);
  const [query,          setQuery]          = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<WstgCategory | "All">("All");

  useEffect(() => {
    getFindings().then(setFindings);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return findings.filter((f) => {
      if (severityFilter !== "All" && f.severity !== severityFilter) return false;
      if (categoryFilter !== "All" && f.wstgCategory !== categoryFilter) return false;
      if (q.length > 0) {
        const haystack = `${f.title} ${f.severity} ${f.wstgId} ${f.wstgCategory}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [findings, query, severityFilter, categoryFilter]);

  const kpis = useMemo(() => {
    const counts: Record<Severity, number> = { Critical: 0, High: 0, Medium: 0, Low: 0, Info: 0 };
    for (const f of filtered) counts[f.severity] += 1;
    return counts;
  }, [filtered]);

  function reset() {
    setQuery("");
    setSeverityFilter("All");
    setCategoryFilter("All");
  }

  return (
    <div style={S.page}>
      <div style={S.container}>
        <NavBar />

        {/* HERO */}
        <section style={S.hero}>
          <div style={S.heroBgWrap}>
            <img src="/maltek.jpeg" alt="" style={S.heroBg} />
            <div style={S.heroOverlay} />
          </div>
          <div style={S.heroContent}>
            <div>
              <h1 style={S.h1}>Maltek Findings</h1>
              <p style={S.p}>
                Internal wiki of pentest finding templates, aligned to the OWASP Web Security
                Testing Guide. Each finding includes description, impact, PoC steps, and remediation
                guidance ready to drop into an engagement report.
              </p>
              {/* KPI row */}
              <div style={S.kpiRow}>
                {SEVERITIES.map((s) => (
                  <div key={s} style={S.kpiCard}>
                    <div style={S.kpiLabel}>{s}</div>
                    <div style={S.kpiValue}>{kpis[s]}</div>
                  </div>
                ))}
              </div>
            </div>
            <img src="/maltek.1.jpeg" alt="Maltek Solutions wordmark" style={S.heroBrand} />
          </div>
        </section>

        {/* MAIN CARD */}
        <main style={S.card}>
          <div style={S.cardHeader}>
            <div>
              <h2 style={S.h2}>Findings Archive</h2>
              <p style={S.pSmall}>
                OWASP WSTG-aligned finding templates · Click a row to open the full write-up
              </p>
            </div>
          </div>

          {/* Controls */}
          <section style={S.controls}>
            <div style={S.controlBlock}>
              <label style={S.label}>Search</label>
              <input
                style={S.input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, WSTG ID, severity…"
              />
            </div>

            <div style={S.controlBlock}>
              <label style={S.label}>WSTG Category</label>
              <select
                style={S.select}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as WstgCategory | "All")}
              >
                <option value="All">All Categories</option>
                {WSTG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={S.controlBlock}>
              <label style={S.label}>Severity</label>
              <select
                style={S.select}
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as Severity | "All")}
              >
                <option value="All">All</option>
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={S.controlBlock}>
              <label style={S.label}>Actions</label>
              <button style={S.button} onClick={reset}>Reset</button>
            </div>
          </section>

          {/* Table */}
          <section style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Finding</th>
                  <th style={S.th}>WSTG ID</th>
                  <th style={S.th}>Classification</th>
                  <th style={S.th}>Severity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} style={S.trClickable}>
                    <td style={S.td}>
                      <Link to={`/finding/${row.id}`} style={S.findingLink}>
                        {row.title}
                      </Link>
                    </td>
                    <td style={S.td}>
                      <Link to={`/finding/${row.id}`} style={S.wstgLink}>
                        {row.wstgId}
                      </Link>
                    </td>
                    <td style={S.td}><div style={S.cellMono}>{row.wstgCategory}</div></td>
                    <td style={S.td}><span style={severityStyle(row.severity)}>{row.severity}</span></td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td style={S.td} colSpan={4}>
                      <span style={{ color: "#94a3b8" }}>No findings match the current filters.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          {/* About */}
          <section style={S.section}>
            <h2 style={S.h2}>About</h2>
            <p style={S.p}>
              This wiki contains Maltek Solutions' internal finding templates, each aligned to a
              specific OWASP WSTG test case. Templates include a sanitized proof-of-concept,
              remediation guidance, and references ready for use in client-facing reports.
              PoC placeholder images can be replaced with sanitized screenshots from actual
              engagements.
            </p>
          </section>
        </main>

        <footer style={S.footer}>
          <span>© {new Date().getFullYear()} Maltek Solutions</span>
          <span style={{ color: "#94a3b8" }}> · </span>
          <span style={{ color: "#94a3b8" }}>findings.maltek</span>
          <span style={{ color: "#94a3b8" }}> · </span>
          <span style={{ color: "#334155" }}>Internal Use Only</span>
        </footer>
      </div>
    </div>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const S: Record<string, any> = {
  colors: { accentBlue: "#0ea5e9", accentTeal: "#22c1d6" },

  page: {
    minHeight: "100vh",
    background: "#0b1220",
    color: "#e5e7eb",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  container: { maxWidth: 1400, margin: "0 auto", padding: "24px 24px" },

  navbar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    gap: 12, padding: "14px 16px", borderRadius: 16, border: "1px solid #1f2937",
    background: "rgba(15, 23, 42, 0.75)",
  },
  navLeft:    { display: "flex", alignItems: "center", gap: 12 },
  navLogo:    { width: 40, height: 40, objectFit: "contain", borderRadius: 10, border: "1px solid #1f2937", background: "rgba(2,6,23,0.35)", padding: 6 },
  navTitle:   { fontSize: 18, fontWeight: 900 },
  navSubtitle:{ fontSize: 12, color: "#94a3b8", marginTop: 2 },

  hero: {
    position: "relative", marginTop: 16, borderRadius: 18,
    border: "1px solid #1f2937", overflow: "hidden", background: "rgba(15, 23, 42, 0.55)",
  },
  heroBgWrap: { position: "absolute", inset: 0 },
  heroBg:     { width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 },
  heroOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(90deg, rgba(11,18,32,0.92) 0%, rgba(11,18,32,0.75) 45%, rgba(11,18,32,0.92) 100%)",
  },
  heroContent: {
    position: "relative", display: "grid", gridTemplateColumns: "1.25fr 0.75fr",
    gap: 16, alignItems: "center", padding: 18,
  },
  heroBrand: {
    width: "100%", maxHeight: 90, objectFit: "contain", borderRadius: 14,
    border: "1px solid #1f2937", background: "rgba(2,6,23,0.35)", padding: 10,
  },

  h1:     { margin: 0, fontSize: 28, fontWeight: 950 },
  h2:     { margin: "0 0 8px 0", fontSize: 16, fontWeight: 900 },
  p:      { marginTop: 10, lineHeight: 1.6, color: "#cbd5e1" },
  pSmall: { marginTop: 6, lineHeight: 1.6, color: "#94a3b8", fontSize: 13 },

  kpiRow: {
    display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 10, marginTop: 12,
  },
  kpiCard:  { border: "1px solid #1f2937", borderRadius: 14, padding: 12, background: "rgba(2,6,23,0.35)" },
  kpiLabel: { fontSize: 12, color: "#94a3b8", fontWeight: 800 },
  kpiValue: { fontSize: 20, fontWeight: 950, marginTop: 6 },

  card: {
    marginTop: 16, border: "1px solid #1f2937", borderRadius: 18,
    background: "rgba(15, 23, 42, 0.55)", padding: 18,
  },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" },

  controls: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr 0.55fr 0.3fr",
    gap: 12,
  },
  controlBlock: { display: "flex", flexDirection: "column", gap: 6 },
  label:  { fontSize: 12, color: "#94a3b8", fontWeight: 800 },
  input:  { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #334155", background: "#0b1220", color: "#e5e7eb", outline: "none", boxSizing: "border-box" },
  select: { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #334155", background: "#0b1220", color: "#e5e7eb", outline: "none" },
  button: { padding: "10px 12px", borderRadius: 12, border: "1px solid #334155", background: "transparent", color: "#e5e7eb", cursor: "pointer", height: 42 },

  tableWrap: { marginTop: 14, overflowX: "auto", borderRadius: 14, border: "1px solid #1f2937" },
  table: { width: "100%", borderCollapse: "collapse", background: "rgba(2,6,23,0.25)" },
  th: {
    textAlign: "left", fontSize: 12, letterSpacing: 0.2, color: "#94a3b8",
    padding: "12px 14px", borderBottom: "1px solid #1f2937",
    background: "rgba(2,6,23,0.35)", whiteSpace: "nowrap",
  },
  td: { padding: "12px 14px", verticalAlign: "top" },
  trClickable: { borderBottom: "1px solid #1f2937" },

  cellStrong: { fontWeight: 900 },
  cellMono: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 12, color: "#cbd5e1",
  },

  findingLink: {
    color: "#e5e7eb", textDecoration: "none", lineHeight: 1.4,
    fontWeight: 600,
  },
  wstgLink: {
    fontFamily: "ui-monospace, monospace",
    fontSize: 12, color: "#0ea5e9",
    textDecoration: "none", fontWeight: 700,
  },

  badge: {
    display: "inline-block", padding: "6px 10px", borderRadius: 999,
    border: "1px solid #334155", fontSize: 12, fontWeight: 900,
  },
  badgeOutline: {
    display: "inline-block", padding: "6px 10px", borderRadius: 999,
    border: "1px solid #334155", fontSize: 12, fontWeight: 900, background: "transparent",
  },

  section: { marginTop: 18, paddingTop: 12, borderTop: "1px solid #1f2937" },

  footer: {
    marginTop: 16, fontSize: 12, color: "#cbd5e1",
    display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center",
  },
};
