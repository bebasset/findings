import React, { useEffect, useMemo, useState } from "react";

/** --------- Types --------- */
type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";
type FindingStatus = "Open" | "Fixed" | "Accepted Risk" | "Unknown";
type Finding = {
    id: number;
    name: string;


    //optional feilds here. (won't break if backend doesn't have them yet)
    year?: number;
    severity?: Severity;
    category?: string;
    status?: FindingStatus;
    summary?: string;
    impact?: string;
    recommendation?: string;
    tags?: string[];
};

const SERVERITIES: Severity[] = ["Critical", "High", "Medium", "Low", "Info"];
const STATUS: FindingStatus[] = ["Open", "Fixed", "Accepted Risk", "Unknown"];

/** --------- Styling helpers --------- */ 
const styles: Record<string, React.CSSProperties> = { page: { minHeight:"100vh", background: "#0b1220", color: "#e5e7eb", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" },
                                                     container: { macWidth: 1100, margin: "0 auto", padding: "24px, 16px" },
                                                     nav: { display: "flex", alignItems: "center", justifyContent: "spacce-between", gap: 12, padding: "14px 16px", border: "1px solid #1f2937", borderRadius: 16, background: "rgba(15, 23, 42, 0.7)" },
                                                     brand:
                                                     
