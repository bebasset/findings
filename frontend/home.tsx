import React from "react";

/** 
 *NavBar()
 * - A small header at the top of the page.
 * - In a real app, this could include navigation links (Home, Findings, About, etc.)
 */
function NavBar() {
    return (
        <header style={styles.navbar}>
            {/* LEFT SIDE: SITE TITLE */}
            <div>
              <div style={styles.navTitle}>finding.maltek</div>
              <div style={styles.navSubtitle}>Maltek Findings Archive</div>
            </div>

            {/* RIGHT SIDE: CONTACT INFO */}
            <div>
              <a style={styles.navLink}
        href="mailto:belizaire@malteksolutions.com">
                belizaire@malteksolutions.com 
              </a>
            </div>
        </header>
      );
}

/**
 *HomePage()
 *- This will be the static homepage
 *- No API calls on it yet
 *- This is our "foundation" we'll build onto it later (filters, table, detail view, etc.)
*/
export default function Homepage() {
    return (
        <div style={styles.container}>
            <NavBar />

            {/* Main content card */}
            <main style={styles.card}>
               <h1 style={styles.h1}>Maltek Findings Homepage</h1>
               <p style={styles.p}>
                   This site will store and display security findngs of Maltek Solutions across multiple years. 
                   The goal is to provide a clean way to browse findings by year, severity, and category. </p>

                {/* "What's coming next" section */}
                <section style={styles.section}>
                    <h2 style={styles.h2}>What this site will include</h2>
                    
