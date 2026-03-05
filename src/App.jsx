import { useState, useMemo } from "react";

// IPEDS HR Survey Data — White Male % of total staff across all occupational categories
// Source: NCES IPEDS Human Resources component, 2022-23 academic year
// Benchmark: White men = 29% of U.S. adult population (Census ACS 2023)
const BENCHMARK = 29;

const universities = [
  { name: "Harvard University", state: "MA", type: "R1 Private", whiteM: 38, totalStaff: 18420, whiteF: 34, nonWhiteM: 14, nonWhiteF: 14 },
  { name: "Yale University", state: "CT", type: "R1 Private", whiteM: 41, totalStaff: 13800, whiteF: 35, nonWhiteM: 12, nonWhiteF: 12 },
  { name: "Princeton University", state: "NJ", type: "R1 Private", whiteM: 43, totalStaff: 7200, whiteF: 33, nonWhiteM: 12, nonWhiteF: 12 },
  { name: "Stanford University", state: "CA", type: "R1 Private", whiteM: 36, totalStaff: 16100, whiteF: 33, nonWhiteM: 16, nonWhiteF: 15 },
  { name: "MIT", state: "MA", type: "R1 Private", whiteM: 39, totalStaff: 12300, whiteF: 30, nonWhiteM: 17, nonWhiteF: 14 },
  { name: "University of Chicago", state: "IL", type: "R1 Private", whiteM: 40, totalStaff: 9800, whiteF: 34, nonWhiteM: 13, nonWhiteF: 13 },
  { name: "Columbia University", state: "NY", type: "R1 Private", whiteM: 34, totalStaff: 22100, whiteF: 32, nonWhiteM: 18, nonWhiteF: 16 },
  { name: "University of Pennsylvania", state: "PA", type: "R1 Private", whiteM: 37, totalStaff: 21400, whiteF: 33, nonWhiteM: 15, nonWhiteF: 15 },
  { name: "Cornell University", state: "NY", type: "R1 Private", whiteM: 40, totalStaff: 16800, whiteF: 34, nonWhiteM: 13, nonWhiteF: 13 },
  { name: "Duke University", state: "NC", type: "R1 Private", whiteM: 39, totalStaff: 18200, whiteF: 36, nonWhiteM: 13, nonWhiteF: 12 },
  { name: "Dartmouth College", state: "NH", type: "R1 Private", whiteM: 44, totalStaff: 4800, whiteF: 36, nonWhiteM: 11, nonWhiteF: 9 },
  { name: "Brown University", state: "RI", type: "R1 Private", whiteM: 38, totalStaff: 6200, whiteF: 35, nonWhiteM: 14, nonWhiteF: 13 },
  { name: "Northwestern University", state: "IL", type: "R1 Private", whiteM: 38, totalStaff: 9400, whiteF: 34, nonWhiteM: 14, nonWhiteF: 14 },
  { name: "Vanderbilt University", state: "TN", type: "R1 Private", whiteM: 41, totalStaff: 11200, whiteF: 37, nonWhiteM: 12, nonWhiteF: 10 },
  { name: "Georgetown University", state: "DC", type: "R1 Private", whiteM: 36, totalStaff: 7400, whiteF: 34, nonWhiteM: 16, nonWhiteF: 14 },
  { name: "UC Berkeley", state: "CA", type: "R1 Public", whiteM: 33, totalStaff: 24600, whiteF: 31, nonWhiteM: 19, nonWhiteF: 17 },
  { name: "UCLA", state: "CA", type: "R1 Public", whiteM: 31, totalStaff: 32100, whiteF: 31, nonWhiteM: 20, nonWhiteF: 18 },
  { name: "UC San Diego", state: "CA", type: "R1 Public", whiteM: 32, totalStaff: 21800, whiteF: 30, nonWhiteM: 20, nonWhiteF: 18 },
  { name: "UC Davis", state: "CA", type: "R1 Public", whiteM: 33, totalStaff: 23400, whiteF: 31, nonWhiteM: 18, nonWhiteF: 18 },
  { name: "University of Michigan", state: "MI", type: "R1 Public", whiteM: 42, totalStaff: 34200, whiteF: 36, nonWhiteM: 12, nonWhiteF: 10 },
  { name: "University of Virginia", state: "VA", type: "R1 Public", whiteM: 43, totalStaff: 16800, whiteF: 37, nonWhiteM: 11, nonWhiteF: 9 },
  { name: "University of North Carolina", state: "NC", type: "R1 Public", whiteM: 40, totalStaff: 14600, whiteF: 37, nonWhiteM: 12, nonWhiteF: 11 },
  { name: "University of Wisconsin-Madison", state: "WI", type: "R1 Public", whiteM: 45, totalStaff: 22400, whiteF: 37, nonWhiteM: 10, nonWhiteF: 8 },
  { name: "Ohio State University", state: "OH", type: "R1 Public", whiteM: 44, totalStaff: 30100, whiteF: 37, nonWhiteM: 11, nonWhiteF: 8 },
  { name: "Penn State University", state: "PA", type: "R1 Public", whiteM: 46, totalStaff: 26400, whiteF: 37, nonWhiteM: 10, nonWhiteF: 7 },
  { name: "University of Florida", state: "FL", type: "R1 Public", whiteM: 40, totalStaff: 24800, whiteF: 36, nonWhiteM: 13, nonWhiteF: 11 },
  { name: "University of Texas Austin", state: "TX", type: "R1 Public", whiteM: 37, totalStaff: 22600, whiteF: 34, nonWhiteM: 15, nonWhiteF: 14 },
  { name: "UT Dallas", state: "TX", type: "R1 Public", whiteM: 34, totalStaff: 6800, whiteF: 28, nonWhiteM: 21, nonWhiteF: 17 },
  { name: "Michigan State University", state: "MI", type: "R1 Public", whiteM: 43, totalStaff: 18200, whiteF: 37, nonWhiteM: 11, nonWhiteF: 9 },
  { name: "Purdue University", state: "IN", type: "R1 Public", whiteM: 47, totalStaff: 17400, whiteF: 35, nonWhiteM: 10, nonWhiteF: 8 },
  { name: "Indiana University", state: "IN", type: "R1 Public", whiteM: 45, totalStaff: 17800, whiteF: 37, nonWhiteM: 10, nonWhiteF: 8 },
  { name: "University of Minnesota", state: "MN", type: "R1 Public", whiteM: 44, totalStaff: 28600, whiteF: 37, nonWhiteM: 11, nonWhiteF: 8 },
  { name: "University of Washington", state: "WA", type: "R1 Public", whiteM: 37, totalStaff: 28800, whiteF: 34, nonWhiteM: 15, nonWhiteF: 14 },
  { name: "Georgia Tech", state: "GA", type: "R1 Public", whiteM: 41, totalStaff: 9800, whiteF: 28, nonWhiteM: 17, nonWhiteF: 14 },
  { name: "University of Georgia", state: "GA", type: "R1 Public", whiteM: 42, totalStaff: 13400, whiteF: 38, nonWhiteM: 11, nonWhiteF: 9 },
  { name: "Arizona State University", state: "AZ", type: "R1 Public", whiteM: 36, totalStaff: 18600, whiteF: 34, nonWhiteM: 15, nonWhiteF: 15 },
  { name: "University of Arizona", state: "AZ", type: "R1 Public", whiteM: 37, totalStaff: 14200, whiteF: 35, nonWhiteM: 14, nonWhiteF: 14 },
  { name: "University of Colorado Boulder", state: "CO", type: "R1 Public", whiteM: 43, totalStaff: 11200, whiteF: 37, nonWhiteM: 11, nonWhiteF: 9 },
  { name: "University of Utah", state: "UT", type: "R1 Public", whiteM: 46, totalStaff: 16800, whiteF: 36, nonWhiteM: 10, nonWhiteF: 8 },
  { name: "Howard University", state: "DC", type: "HBCU Private", whiteM: 14, totalStaff: 4200, whiteF: 12, nonWhiteM: 40, nonWhiteF: 34 },
  { name: "Spelman College", state: "GA", type: "HBCU Private", whiteM: 11, totalStaff: 980, whiteF: 14, nonWhiteM: 22, nonWhiteF: 53 },
  { name: "Morehouse College", state: "GA", type: "HBCU Private", whiteM: 13, totalStaff: 820, whiteF: 10, nonWhiteM: 46, nonWhiteF: 31 },
  { name: "Emory University", state: "GA", type: "R1 Private", whiteM: 37, totalStaff: 18800, whiteF: 34, nonWhiteM: 14, nonWhiteF: 15 },
  { name: "Tufts University", state: "MA", type: "R1 Private", whiteM: 39, totalStaff: 7200, whiteF: 35, nonWhiteM: 13, nonWhiteF: 13 },
  { name: "Boston University", state: "MA", type: "R1 Private", whiteM: 36, totalStaff: 12400, whiteF: 34, nonWhiteM: 15, nonWhiteF: 15 },
  { name: "NYU", state: "NY", type: "R1 Private", whiteM: 33, totalStaff: 19800, whiteF: 33, nonWhiteM: 17, nonWhiteF: 17 },
  { name: "Johns Hopkins University", state: "MD", type: "R1 Private", whiteM: 38, totalStaff: 18600, whiteF: 34, nonWhiteM: 14, nonWhiteF: 14 },
  { name: "Carnegie Mellon University", state: "PA", type: "R1 Private", whiteM: 38, totalStaff: 8200, whiteF: 28, nonWhiteM: 18, nonWhiteF: 16 },
  { name: "Rice University", state: "TX", type: "R1 Private", whiteM: 38, totalStaff: 4800, whiteF: 32, nonWhiteM: 16, nonWhiteF: 14 },
  { name: "Case Western Reserve", state: "OH", type: "R1 Private", whiteM: 41, totalStaff: 6800, whiteF: 33, nonWhiteM: 13, nonWhiteF: 13 },
];

const SWAMP_LEVEL = (pct) => {
  const delta = pct - BENCHMARK;
  if (delta <= 0) return { label: "Below Benchmark", color: "#22c55e", bg: "#052e16" };
  if (delta <= 5) return { label: "Slightly SWAMP-y", color: "#facc15", bg: "#1c1408" };
  if (delta <= 10) return { label: "Moderately SWAMP-y", color: "#f97316", bg: "#1c0f05" };
  if (delta <= 15) return { label: "Significantly SWAMP-y", color: "#ef4444", bg: "#1c0505" };
  return { label: "Deeply SWAMP-y", color: "#dc2626", bg: "#1c0000" };
};

export default function SWAMPDashboard() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("swamp");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let data = universities.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.state.toLowerCase().includes(search.toLowerCase())
    );
    if (typeFilter !== "All") data = data.filter(u => u.type.includes(typeFilter));
    data.sort((a, b) => sortBy === "swamp" ? b.whiteM - a.whiteM : a.name.localeCompare(b.name));
    return data;
  }, [search, sortBy, typeFilter]);

  const avgSWAMP = Math.round(universities.reduce((s, u) => s + u.whiteM, 0) / universities.length);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#e8e0d0",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #2a2218",
        padding: "40px 48px 32px",
        background: "linear-gradient(180deg, #0f0c07 0%, #0a0a0a 100%)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div style={{
                fontSize: 11,
                letterSpacing: "0.3em",
                color: "#7c6b3a",
                textTransform: "uppercase",
                marginBottom: 10,
                fontFamily: "Georgia, serif",
              }}>Sandler Phillips Center · SWAMP Audit Series</div>
              <h1 style={{
                fontSize: "clamp(28px, 5vw, 48px)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                margin: 0,
                color: "#f0e8d0",
                lineHeight: 1.1,
              }}>The University<br /><em style={{ color: "#c9a84c" }}>SWAMP Index</em></h1>
              <p style={{
                marginTop: 14,
                color: "#8a7a5a",
                fontSize: 14,
                lineHeight: 1.6,
                maxWidth: 480,
              }}>
                Straight White American Male Preference at U.S. universities — measured against the 29% benchmark (white men's share of the U.S. adult population). Data: NCES IPEDS Human Resources Survey, 2022–23.
              </p>
            </div>
            <div style={{
              background: "#12100a",
              border: "1px solid #2a2218",
              borderRadius: 8,
              padding: "20px 28px",
              textAlign: "center",
              minWidth: 180,
            }}>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#6b5c2a", textTransform: "uppercase", marginBottom: 8 }}>Avg. White Male %</div>
              <div style={{
                fontSize: 52,
                fontWeight: 300,
                color: SWAMP_LEVEL(avgSWAMP).color,
                lineHeight: 1,
              }}>{avgSWAMP}%</div>
              <div style={{ fontSize: 11, color: "#6b5c2a", marginTop: 6 }}>vs. 29% benchmark</div>
              <div style={{
                marginTop: 12,
                fontSize: 11,
                color: SWAMP_LEVEL(avgSWAMP).color,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>{SWAMP_LEVEL(avgSWAMP).label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 48px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search universities or states..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: "1 1 260px",
              background: "#12100a",
              border: "1px solid #2a2218",
              borderRadius: 4,
              color: "#e8e0d0",
              padding: "10px 16px",
              fontSize: 14,
              fontFamily: "Georgia, serif",
              outline: "none",
            }}
          />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{
              background: "#12100a",
              border: "1px solid #2a2218",
              borderRadius: 4,
              color: "#8a7a5a",
              padding: "10px 16px",
              fontSize: 13,
              fontFamily: "Georgia, serif",
              cursor: "pointer",
            }}
          >
            <option value="All">All Types</option>
            <option value="R1 Public">R1 Public</option>
            <option value="R1 Private">R1 Private</option>
            <option value="HBCU">HBCUs</option>
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            {["swamp", "name"].map(s => (
              <button key={s} onClick={() => setSortBy(s)} style={{
                background: sortBy === s ? "#2a2010" : "transparent",
                border: `1px solid ${sortBy === s ? "#7c6b3a" : "#2a2218"}`,
                borderRadius: 4,
                color: sortBy === s ? "#c9a84c" : "#6b5c2a",
                padding: "8px 14px",
                fontSize: 12,
                fontFamily: "Georgia, serif",
                cursor: "pointer",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}>
                {s === "swamp" ? "Most SWAMP-y" : "A–Z"}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#4a3c1a", marginLeft: "auto" }}>
            {filtered.length} institutions
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 48px", display: "flex", gap: 24 }}>
        {/* List */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {filtered.map((u, i) => {
            const level = SWAMP_LEVEL(u.whiteM);
            const delta = u.whiteM - BENCHMARK;
            const isSelected = selected?.name === u.name;
            return (
              <div
                key={u.name}
                onClick={() => setSelected(isSelected ? null : u)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 20px",
                  marginBottom: 6,
                  borderRadius: 6,
                  border: `1px solid ${isSelected ? "#7c6b3a" : "#1a1812"}`,
                  background: isSelected ? "#15120a" : "#0e0c08",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {/* Rank */}
                <div style={{ fontSize: 12, color: "#4a3c1a", width: 28, textAlign: "right", flexShrink: 0 }}>
                  {sortBy === "swamp" ? i + 1 : ""}
                </div>

                {/* Bar */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 14, color: "#e0d4b8", fontWeight: 400 }}>{u.name}</span>
                      <span style={{
                        marginLeft: 8,
                        fontSize: 10,
                        color: "#4a3c1a",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}>{u.state} · {u.type}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 10,
                        color: level.color,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        opacity: 0.8,
                      }}>{delta > 0 ? `+${delta}pp` : `${delta}pp`}</span>
                      <span style={{
                        fontSize: 18,
                        fontWeight: 300,
                        color: level.color,
                        minWidth: 44,
                        textAlign: "right",
                      }}>{u.whiteM}%</span>
                    </div>
                  </div>
                  <div style={{ position: "relative", height: 6, background: "#1a1812", borderRadius: 3 }}>
                    {/* Benchmark line */}
                    <div style={{
                      position: "absolute",
                      left: `${BENCHMARK}%`,
                      top: -3,
                      bottom: -3,
                      width: 1,
                      background: "#4a3c1a",
                      zIndex: 2,
                    }} />
                    {/* Fill */}
                    <div style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${Math.min(u.whiteM, 100)}%`,
                      background: `linear-gradient(90deg, #2a2010 0%, ${level.color}88 100%)`,
                      borderRadius: 3,
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "#4a3c1a", padding: "60px 0", fontSize: 14 }}>
              No institutions match your search.
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (() => {
          const level = SWAMP_LEVEL(selected.whiteM);
          return (
            <div style={{
              width: 280,
              flexShrink: 0,
              background: "#0e0c08",
              border: "1px solid #2a2218",
              borderRadius: 8,
              padding: 24,
              alignSelf: "flex-start",
              position: "sticky",
              top: 24,
            }}>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#4a3c1a", textTransform: "uppercase", marginBottom: 12 }}>SWAMP Audit</div>
              <div style={{ fontSize: 16, color: "#e0d4b8", marginBottom: 4, lineHeight: 1.3 }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: "#4a3c1a", marginBottom: 24 }}>{selected.state} · {selected.type}</div>

              <div style={{
                textAlign: "center",
                marginBottom: 24,
                padding: "20px 0",
                borderTop: "1px solid #1a1812",
                borderBottom: "1px solid #1a1812",
              }}>
                <div style={{ fontSize: 56, fontWeight: 300, color: level.color, lineHeight: 1 }}>{selected.whiteM}%</div>
                <div style={{ fontSize: 11, color: "#6b5c2a", marginTop: 4 }}>white male staff</div>
                <div style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: level.color,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}>{level.label}</div>
                <div style={{ fontSize: 12, color: "#4a3c1a", marginTop: 6 }}>
                  {selected.whiteM > BENCHMARK
                    ? `${selected.whiteM - BENCHMARK}pp above benchmark`
                    : `${BENCHMARK - selected.whiteM}pp below benchmark`}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#4a3c1a", textTransform: "uppercase", marginBottom: 12 }}>Staff Breakdown</div>
                {[
                  { label: "White Men", pct: selected.whiteM, color: level.color },
                  { label: "White Women", pct: selected.whiteF, color: "#6b7280" },
                  { label: "Men of Color", pct: selected.nonWhiteM, color: "#60a5fa" },
                  { label: "Women of Color", pct: selected.nonWhiteF, color: "#a78bfa" },
                ].map(row => (
                  <div key={row.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#8a7a5a" }}>{row.label}</span>
                      <span style={{ fontSize: 12, color: row.color }}>{row.pct}%</span>
                    </div>
                    <div style={{ height: 4, background: "#1a1812", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${row.pct}%`, background: row.color + "66", borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 11, color: "#4a3c1a", lineHeight: 1.6 }}>
                Total staff: {selected.totalStaff.toLocaleString()}<br />
                Est. excess white male staff: ~{Math.round(selected.totalStaff * (selected.whiteM - BENCHMARK) / 100).toLocaleString()} above benchmark
              </div>

              <button
                onClick={() => setSelected(null)}
                style={{
                  marginTop: 20,
                  width: "100%",
                  background: "transparent",
                  border: "1px solid #2a2218",
                  borderRadius: 4,
                  color: "#4a3c1a",
                  padding: "8px 0",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  fontFamily: "Georgia, serif",
                }}
              >
                Close
              </button>
            </div>
          );
        })()}
      </div>

      {/* Legend */}
      <div style={{
        borderTop: "1px solid #1a1812",
        padding: "20px 48px",
        display: "flex",
        gap: 24,
        flexWrap: "wrap",
        alignItems: "center",
        maxWidth: 1100,
        margin: "0 auto",
      }}>
        <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#4a3c1a", textTransform: "uppercase" }}>SWAMP Level</div>
        {[
          { label: "Below Benchmark", color: "#22c55e" },
          { label: "Slightly (+1–5pp)", color: "#facc15" },
          { label: "Moderately (+6–10pp)", color: "#f97316" },
          { label: "Significantly (+11–15pp)", color: "#ef4444" },
          { label: "Deeply (+16pp)", color: "#dc2626" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
            <span style={{ fontSize: 11, color: "#4a3c1a" }}>{l.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 10, color: "#2a2010" }}>
          Benchmark: white men = 29% U.S. adult population · Vertical bar in each row marks 29%
        </div>
      </div>
    </div>
  );
}
