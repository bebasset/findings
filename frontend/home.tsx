import React, { useEffect, useMemo, useState } from "react";

/** --------- Types --------- */
type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";
type FindingStatus = "Open" | "Fixed" | "Accepted Risk" | "Unknown";
type Finding = {
    id: number;
    name: string;


    //optional feilds here. (won't break if backend doesn't have them yet)
    year?: number;
    see
