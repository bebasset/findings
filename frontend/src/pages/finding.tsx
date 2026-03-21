import { useParams, Link } from "react-router-dom";
import { FINDINGS } from "../data/findings";
import type { Finding, Severity, Status } from "../types";

// ─── helpers ────────────────────────────────────────────────────────────────

function severityColors(sev: Severity) {
  switch (sev) {
    case "Critical": return { bg: "#ef4444", text: "#0b1220" };
    case "High":     return { bg: "#f97316", text: "#0b1220" };
    case "Medium":   return { bg: "#facc15", text: "#0b1220" };
    case "Low":      return { bg: "#22c55e", text: "#0b1220" };
    default:         return { bg: "#94a3b8", text: "#0b1220" };
  }
}

function severityBadge(sev: Severity) {
  const c = severityColors(sev);
  return { ...S.badge, background: c.bg, borderColor: c.bg, color: c.text };
}

function statusBadge(status: Status) {
  switch (status) {
    case "Fixed":         return { ...S.badgeOutline, borderColor: "#22c1d6", color: "#22c1d6" };
    case "Accepted Risk": return { ...S.badgeOutline, borderColor: "#94a3b8", color: "#94a3b8" };
    default:              return { ...S.badgeOutline, borderColor: "#0ea5e9", color: "#0ea5e9" };
  }
}

// ─── section wrapper ─────────────────────────────────────────────────────────

function Section({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={S.section}>
      <div style={S.sectionHeader}>
        <span style={S.sectionNum}>{num}</span>
        <h2 style={S.sectionTitle}>{title}</h2>
      </div>
      <div style={S.sectionBody}>{children}</div>
    </section>
  );
}

// ─── metadata row ────────────────────────────────────────────────────────────

function MetaGrid({ finding }: { finding: Finding }) {
  const cells: [string, React.ReactNode][] = [
    ["Pentester", finding.pentester],
    ["Date Identified", finding.date],
    ["WSTG Reference", <code style={S.mono}>{finding.wstgId}</code>],
    ["WSTG Category", finding.wstgCategory],
    ...(finding.cweId ? [["CWE", <a href={`https://cwe.mitre.org/data/definitions/${finding.cweId}.html`} target="_blank" rel="noopener noreferrer" style={S.link}>CWE-{finding.cweId}</a>] as [string, React.ReactNode]] : []),
    ...(finding.cvss ? [["CVSS Score", <code style={{ ...S.mono, color: "#f97316" }}>{finding.cvss}</code>] as [string, React.ReactNode]] : []),
    ...(finding.affectedComponent ? [["Affected Component", <code style={S.mono}>{finding.affectedComponent}</code>] as [string, React.ReactNode]] : []),
    ["Status", <span style={statusBadge(finding.status)}>{finding.status}</span>],
  ];

  return (
    <div style={S.metaGrid}>
      {cells.map(([label, value]) => (
        <div key={label as string} style={S.metaCell}>
          <div style={S.metaLabel}>{label as string}</div>
          <div style={S.metaValue}>{value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function FindingPage() {
  const { id } = useParams<{ id: string }>();
  const finding = FINDINGS.find((f) => f.id === Number(id));

  if (!finding) {
    return (
      <div style={S.page}>
        <div style={S.container}>
          <NavBar />
          <main style={S.card}>
            <p style={{ color: "#94a3b8", padding: 24 }}>
              Finding not found.{" "}
              <Link to="/" style={S.link}>
                ← Back to archive
              </Link>
            </p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.container}>
        <NavBar />

        {/* ── BREADCRUMB ── */}
        <div style={S.breadcrumb}>
          <Link to="/" style={S.breadcrumbLink}>
            ← Findings Archive
          </Link>
          <span style={{ color: "#334155" }}> / </span>
          <span style={{ color: "#94a3b8" }}>{finding.wstgId}</span>
        </div>

        {/* ── FINDING HEADER ── */}
        <header style={S.findingHeader}>
          <div style={S.headerTop}>
            <div style={S.headerBadges}>
              <span style={severityBadge(finding.severity)}>{finding.severity}</span>
              <span style={statusBadge(finding.status)}>{finding.status}</span>
              <span style={S.wstgPill}>{finding.wstgId}</span>
              {finding.cweId && (
                <span style={S.cwePill}>CWE-{finding.cweId}</span>
              )}
            </div>
          </div>
          <h1 style={S.findingTitle}>{finding.title}</h1>
          <div style={S.headerRule} />
        </header>

        <main style={S.card}>

          {/* ── 00. METADATA ── */}
          <section style={{ marginBottom: 8 }}>
            <div style={S.sectionHeader}>
              <span style={S.sectionNum}>00</span>
              <h2 style={S.sectionTitle}>Overview</h2>
            </div>
            <MetaGrid finding={finding} />
          </section>

          {/* ── 01. DESCRIPTION ── */}
          <Section num="01" title="Description">
            <p style={S.prose}>{finding.description}</p>
          </Section>

          {/* ── 02. RISK & IMPACT ── */}
          <Section num="02" title="Risk &amp; Impact">
            <p style={S.prose}>{finding.impact}</p>
          </Section>

          {/* ── 03. PROOF OF CONCEPT ── */}
          <Section num="03" title="Proof of Concept">
            <div style={S.stepsHeader}>Steps to Reproduce</div>
            <ol style={S.ol}>
              {finding.stepsToReproduce.map((step, i) => (
                <li key={i} style={S.li}>
                  {step}
                </li>
              ))}
            </ol>

            {finding.pocImages && finding.pocImages.length > 0 && (
              <div style={S.evidenceSection}>
                <div style={S.stepsHeader}>Evidence</div>
                <div style={S.evidenceGrid}>
                  {finding.pocImages.map((img, i) => (
                    <figure key={i} style={S.figure}>
                      <div style={S.imgWrap}>
                        <img
                          src={img.src}
                          alt={img.caption}
                          style={S.pocImg}
                        />
                        <div style={S.imgOverlayHint}>
                          Click to view full size · Replace with actual screenshot
                        </div>
                      </div>
                      <figcaption style={S.figcaption}>{img.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* ── 04. REMEDIATION ── */}
          <Section num="04" title="Remediation">
            <p style={S.prose}>{finding.recommendation}</p>
          </Section>

          {/* ── 05. REFERENCES ── */}
          <Section num="05" title="References">
            <ul style={S.refList}>
              {finding.references.map((ref, i) => (
                <li key={i} style={S.refItem}>
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={S.link}
                    >
                      {ref.label}
                    </a>
                  ) : (
                    <span style={{ color: "#cbd5e1" }}>{ref.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </Section>

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

// ─── shared nav ──────────────────────────────────────────────────────────────

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

// ─── styles ──────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0b1220",
    color: "#e5e7eb",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },
  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "24px 16px 40px",
  },

  // Navbar
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #1f2937",
    background: "rgba(15, 23, 42, 0.75)",
    marginBottom: 0,
  },
  navLeft:    { display: "flex", alignItems: "center", gap: 12 },
  navLogo:    { width: 40, height: 40, objectFit: "contain", borderRadius: 10, border: "1px solid #1f2937", background: "rgba(2,6,23,0.35)", padding: 6 },
  navTitle:   { fontSize: 18, fontWeight: 900 },
  navSubtitle:{ fontSize: 12, color: "#94a3b8", marginTop: 2 },

  // Breadcrumb
  breadcrumb: {
    margin: "14px 0 10px",
    fontSize: 13,
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  breadcrumbLink: {
    color: "#0ea5e9",
    textDecoration: "none",
    fontWeight: 700,
  },

  // Finding header (above card)
  findingHeader: {
    marginBottom: 0,
    paddingBottom: 0,
  },
  headerTop: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    flexWrap: "wrap" as const,
    marginBottom: 10,
    marginTop: 14,
  },
  headerBadges: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
    alignItems: "center",
  },
  findingTitle: {
    margin: "0 0 14px",
    fontSize: 26,
    fontWeight: 950,
    lineHeight: 1.25,
    letterSpacing: -0.3,
  },
  headerRule: {
    height: 2,
    background: "linear-gradient(90deg, #0ea5e9 0%, #22c1d6 50%, transparent 100%)",
    borderRadius: 2,
    marginBottom: 0,
  },

  // Card (main content wrapper)
  card: {
    marginTop: 14,
    border: "1px solid #1f2937",
    borderRadius: 18,
    background: "rgba(15, 23, 42, 0.55)",
    padding: "20px 24px",
  },

  // Section
  section: {
    marginTop: 0,
    paddingTop: 20,
    borderTop: "1px solid #1f2937",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionNum: {
    fontSize: 10,
    fontWeight: 900,
    color: "#0ea5e9",
    letterSpacing: 1,
    fontFamily: "ui-monospace, monospace",
    border: "1px solid #0ea5e930",
    padding: "2px 6px",
    borderRadius: 4,
    background: "rgba(14,165,233,0.08)",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase" as const,
    letterSpacing: 1.2,
    color: "#94a3b8",
  },
  sectionBody: {},

  // Metadata grid
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 12,
    padding: "12px 0",
    borderTop: "1px solid #1f2937",
  },
  metaCell: {
    background: "rgba(2,6,23,0.35)",
    border: "1px solid #1f2937",
    borderRadius: 10,
    padding: "10px 14px",
  },
  metaLabel: { fontSize: 10, color: "#94a3b8", fontWeight: 900, textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 6 },
  metaValue: { fontSize: 13, color: "#e5e7eb", fontWeight: 600 },

  // Prose
  prose: {
    margin: 0,
    lineHeight: 1.7,
    color: "#cbd5e1",
    fontSize: 14,
  },

  // Steps to reproduce
  stepsHeader: {
    fontSize: 11,
    fontWeight: 900,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 0,
  },
  ol: {
    margin: "0 0 0 0",
    paddingLeft: 22,
    color: "#cbd5e1",
    lineHeight: 1.7,
    fontSize: 14,
  },
  li: { marginBottom: 8 },

  // Evidence / PoC images
  evidenceSection: {
    marginTop: 22,
  },
  evidenceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 16,
  },
  figure: {
    margin: 0,
    border: "1px solid #1f2937",
    borderRadius: 12,
    overflow: "hidden",
    background: "rgba(2,6,23,0.45)",
  },
  imgWrap: {
    position: "relative" as const,
    overflow: "hidden",
  },
  pocImg: {
    width: "100%",
    display: "block",
    borderBottom: "1px solid #1f2937",
  },
  imgOverlayHint: {
    position: "absolute" as const,
    bottom: 8,
    right: 8,
    fontSize: 10,
    color: "#0ea5e9",
    background: "rgba(11,18,32,0.85)",
    padding: "3px 8px",
    borderRadius: 4,
    fontFamily: "system-ui, sans-serif",
  },
  figcaption: {
    padding: "10px 14px",
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 1.5,
    fontStyle: "italic",
  },

  // References
  refList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  },
  refItem: {
    paddingLeft: 16,
    position: "relative" as const,
    fontSize: 13,
    lineHeight: 1.5,
  },

  // Badges
  badge: {
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: 999,
    border: "1px solid #334155",
    fontSize: 12,
    fontWeight: 900,
  },
  badgeOutline: {
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: 999,
    border: "1px solid #334155",
    fontSize: 12,
    fontWeight: 900,
    background: "transparent",
  },
  wstgPill: {
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: 999,
    border: "1px solid #0ea5e940",
    fontSize: 11,
    fontWeight: 900,
    color: "#0ea5e9",
    background: "rgba(14,165,233,0.1)",
    fontFamily: "ui-monospace, monospace",
  },
  cwePill: {
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: 999,
    border: "1px solid #a78bfa40",
    fontSize: 11,
    fontWeight: 900,
    color: "#a78bfa",
    background: "rgba(167,139,250,0.1)",
    fontFamily: "ui-monospace, monospace",
  },

  // Links
  link: {
    color: "#0ea5e9",
    textDecoration: "none",
    fontWeight: 600,
  },

  // Mono
  mono: {
    fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
    fontSize: 12,
    color: "#22c1d6",
    background: "rgba(34,193,214,0.08)",
    padding: "2px 6px",
    borderRadius: 4,
  },

  // Footer
  footer: {
    marginTop: 20,
    fontSize: 12,
    color: "#cbd5e1",
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
    justifyContent: "center",
  },
};
