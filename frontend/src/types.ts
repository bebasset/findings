export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";
export type Status = "Open" | "Fixed" | "Accepted Risk";

export type WstgCategory =
  | "Information Gathering"
  | "Configuration & Deployment Management"
  | "Identity Management"
  | "Authentication Testing"
  | "Authorization Testing"
  | "Session Management"
  | "Input Validation"
  | "Error Handling"
  | "Cryptography"
  | "Business Logic Testing"
  | "Client-Side Testing";

export type PocImage = {
  src: string;   // path under /public, e.g. "/poc/poc-burp-request.svg"
  caption: string;
};

export type Reference = {
  label: string;
  url?: string;
};

export type Finding = {
  id: number;
  pentester: string;
  title: string;
  date: string;              // YYYY-MM-DD
  severity: Severity;
  status: Status;
  wstgId: string;            // e.g. "WSTG-INPV-05"
  wstgCategory: WstgCategory;
  cweId?: number;
  cvss?: string;             // e.g. "9.8 (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)"
  affectedComponent?: string;
  description: string;
  impact: string;
  stepsToReproduce: string[];
  pocImages?: PocImage[];
  recommendation: string;
  references: Reference[];
};
