/**
 * API service — tries VITE_API_URL (Railway backend) if set,
 * falls back to the static hardcoded data so the site works standalone.
 */
import { FINDINGS } from "../data/findings";
import type { Finding } from "../types";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");

export async function getFindings(): Promise<Finding[]> {
  if (!API_URL) return FINDINGS;
  try {
    const res = await fetch(`${API_URL}/findings`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] getFindings failed, using static data:", err);
    return FINDINGS;
  }
}

export async function getFinding(id: number): Promise<Finding | undefined> {
  if (!API_URL) return FINDINGS.find((f) => f.id === id);
  try {
    const res = await fetch(`${API_URL}/findings/${id}`);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[api] getFinding failed, using static data:", err);
    return FINDINGS.find((f) => f.id === id);
  }
}
