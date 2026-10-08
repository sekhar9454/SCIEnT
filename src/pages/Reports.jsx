import React from "react";
import { ArrowUpRight, FileText } from "lucide-react";
import Footer from "../components/footer";
import "./Reports.css";

const REPORTS_BASE_URL =
  "https://firebasestorage.googleapis.com/v0/b/scient-website-f2fbe.firebasestorage.app/o/Annual%20Reports%2F";

// Years without a `url` render as "coming soon" cards
const reports = [
  { year: "2025–26", url: `${REPORTS_BASE_URL}SCIEnT_Annual_Report%202025-26.pdf?alt=media&token=f55d4cf4-9fbd-4725-aa17-4e16640348a8` },
  { year: "2024–25", url: `${REPORTS_BASE_URL}Annual%20Day%20SCIEnT%2024-25.pdf?alt=media&token=739303b5-d2e2-4396-9d07-1ebe2a8bffd2` },
  { year: "2023–24" },
  { year: "2022–23" },
  { year: "2021–22" },
  { year: "2020–21" },
  { year: "2019–20" },
  { year: "2018–19", url: `${REPORTS_BASE_URL}Annual%20Report%202018-19.pdf?alt=media&token=67bd8d1e-f574-4736-815a-2335d6ad2e89` },
  { year: "2017–18", url: `${REPORTS_BASE_URL}SCIEnT%20Report%2017-18.pdf?alt=media&token=d4785e0c-c342-4b39-b4a6-91ad7f28bd25` },
  { year: "2016–17" },
];

const Reports = () => {
  return (
    <div className="reports-page">
      <main className="reports-content">
        <div className="reports-ambient-glow reports-ambient-glow-top" />
        <div className="reports-ambient-glow reports-ambient-glow-bottom" />

        <header className="reports-hero">
          <FileText aria-hidden="true" className="reports-hero-icon" />
          <h1>REPORTS</h1>
          <p>Updates and reports from SCIEnT</p>
          <span>Student Centre for Innovation in Engineering and Technology</span>
        </header>

        <section className="reports-years" aria-label="Annual reports">
          {reports.map(({ year, url }) => {
            const cardContent = (
              <>
                <FileText aria-hidden="true" className="reports-card-icon" />
                <span className="reports-year-label">Annual Report</span>
                <h2>{year}</h2>
                <span className="reports-view-link">
                  {url ? (
                    <>
                      View report <ArrowUpRight aria-hidden="true" size={16} />
                    </>
                  ) : (
                    "Coming soon"
                  )}
                </span>
              </>
            );

            return url ? (
              <a
                className="reports-year-card"
                href={url}
                key={year}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${year} annual report (PDF, opens in a new tab)`}
              >
                {cardContent}
              </a>
            ) : (
              <div className="reports-year-card reports-year-card-unavailable" key={year}>
                {cardContent}
              </div>
            );
          })}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Reports;
