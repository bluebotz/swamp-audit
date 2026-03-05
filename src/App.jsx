import { useState, useMemo } from "react";
import universities, { CATEGORY_LABELS } from "./ipeds_data.js";

const BENCHMARK = 29;

const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS);

const SWAMP_LEVEL = (pct) => {
  const delta = pct - BENCHMARK;
  if (delta <= 0) return { label: "Below Benchmark", color: "#22c55e" };
  if (delta <= 5) return { label: "Slightly SWAMP-y", color: "#facc15" };
  if (delta <= 10) return { label: "Moderately SWAMP-y", color: "#f97316" };
  if (delta <= 15) return { label: "Significantly SWAMP-y", color: "#ef4444" };
  return { label: "Deeply SWAMP-y", color: "#dc2626" };
};

export default function SWAMPDashboard() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("swamp");
  const [typeFilter, setTypeFilter] = useState("All");
  const [category, setCategory] = useState("all_staff");
  const [selected, setSelected] = useState(null);

  const getWhiteM = (u) => u.categories?.[category]?.whiteM ?? u.categories?.all_staff?.whiteM ?? 0;
  const filtered = useMemo(() => {
  const seen = new Set();
  let data = universities.filter(u => {
    if (seen.has(u.name)) return false;
    seen.add(u.name);
    return true;
  });
  data = data.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.state.toLowerCase().includes(search.toLowerCase())
  );
  if (typeFilter !== "All") data = data.filter(u => u.type.includes(typeFilter));
  data = data.filter(u => (u.categories?.[category]?.total ?? 0) > 0);
  data.sort((a, b) => sortBy === "swamp"
    ? (b.categories?.[category]?.whiteM ?? 0) - (a.categories?.[category]?.whiteM ?? 0)
    : a.name.localeCompare(b.name));
  return data;
}, [search, sortBy, typeFilter, category]);

  const avgSWAMP = filtered.length > 0
  ? (filtered.reduce((s, u) => {
      const cat = u.categories?.[category];
      return s + (cat?.whiteM ?? 0) * (cat?.total ?? 0);
    }, 0) / filtered.reduce((s, u) => s + (u.categories?.[category]?.total ?? 0), 0)).toFixed(1)
  : 0;

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
                Straight White American Male Preference at U.S. universities — measured against the 29% benchmark (white men's share of the U.S. adult population). Data: NCES IPEDS Human Resources Survey, Fall 2023.
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
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#6b5c2a", textTransform: "uppercase", marginBottom: 8 }}>
                Avg. White Male %
              </div>
              <div style={{
                fontSize: 52,
                fontWeight: 300,
                color: SWAMP_LEVEL(parseFloat(avgSWAMP)).color,
                lineHeight: 1,
              }}>{avgSWAMP}%</div>
              <div style={{ fontSize: 11, color: "#6b5c2a", marginTop: 6 }}>vs. 29% benchmark</div>
              <div style={{
                marginTop: 12,
                fontSize: 11,
                color: SWAMP_LEVEL(parseFloat(avgSWAMP)).color,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>{SWAMP_LEVEL(parseFloat(avgSWAMP)).label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Toggle */}
      <div style={{ borderBottom: "1px solid #1a1812", background: "#0d0b07" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px", display: "flex", gap: 0, overflowX: "auto" }}>
          {CATEGORY_KEYS.map(key => (
            <button key={key} onClick={() => setCategory(key)} style={{
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${category === key ? "#c9a84c" : "transparent"}`,
              color: category === key ? "#c9a84c" : "#4a3c1a",
              padding: "14px 18px",
              fontSize: 12,
              fontFamily: "Georgia, serif",
              cursor: "pointer",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}>
              {CATEGORY_LABELS[key]}
            </button>
          ))}
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
            <option value="R2 Public">R2 Public</option>
            <option value="R2 Private">R2 Private</option>
            <option value="Masters Public">Masters Public</option>
            <option value="Masters Private">Masters Private</option>
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
            const whiteM = u.categories?.[category]?.whiteM ?? 0;
            const level = SWAMP_LEVEL(whiteM);
            const delta = (whiteM - BENCHMARK).toFixed(1);
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
                <div style={{ fontSize: 12, color: "#4a3c1a", width: 28, textAlign: "right", flexShrink: 0 }}>
                  {sortBy === "swamp" ? i + 1 : ""}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 14, color: "#e0d4b8" }}>{u.name}</span>
                      <span style={{ marginLeft: 8, fontSize: 10, color: "#4a3c1a", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        {u.state} · {u.type}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: level.color, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.8 }}>
                        {delta > 0 ? `+${delta}pp` : `${delta}pp`}
                      </span>
                      <span style={{ fontSize: 18, fontWeight: 300, color: level.color, minWidth: 44, textAlign: "right" }}>
                        {whiteM.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div style={{ position: "relative", height: 6, background: "#1a1812", borderRadius: 3 }}>
                    <div style={{
                      position: "absolute",
                      left: `${BENCHMARK}%`,
                      top: -3, bottom: -3,
                      width: 1,
                      background: "#4a3c1a",
                      zIndex: 2,
                    }} />
                    <div style={{
                      position: "absolute",
                      left: 0, top: 0, bottom: 0,
                      width: `${Math.min(whiteM, 100)}%`,
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
              No institutions match your search or have data for this category.
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && selected.categories && (() => {
          const whiteM = selected.categories?.[category]?.whiteM ?? 0;
          const level = SWAMP_LEVEL(whiteM);
          const catData = selected.categories?.[category] || {};
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
              <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#4a3c1a", textTransform: "uppercase", marginBottom: 12 }}>
                SWAMP Audit · {CATEGORY_LABELS[category]}
              </div>
              <div style={{ fontSize: 16, color: "#e0d4b8", marginBottom: 4, lineHeight: 1.3 }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: "#4a3c1a", marginBottom: 24 }}>{selected.state} · {selected.type}</div>

              <div style={{ textAlign: "center", marginBottom: 24, padding: "20px 0", borderTop: "1px solid #1a1812", borderBottom: "1px solid #1a1812" }}>
                <div style={{ fontSize: 56, fontWeight: 300, color: level.color, lineHeight: 1 }}>{whiteM.toFixed(1)}%</div>
                <div style={{ fontSize: 11, color: "#6b5c2a", marginTop: 4 }}>white male — {CATEGORY_LABELS[category].toLowerCase()}</div>
                <div style={{ marginTop: 12, fontSize: 11, color: level.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {level.label}
                </div>
                <div style={{ fontSize: 12, color: "#4a3c1a", marginTop: 6 }}>
                  {whiteM > BENCHMARK
                    ? `${(whiteM - BENCHMARK).toFixed(1)}pp above benchmark`
                    : `${(BENCHMARK - whiteM).toFixed(1)}pp below benchmark`}
                </div>
              </div>

              {/* All categories mini summary */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#4a3c1a", textTransform: "uppercase", marginBottom: 12 }}>
                  White Male % Across Categories
                </div>
                {CATEGORY_KEYS.map(key => {
                  const pct = selected.categories?.[key]?.whiteM;
                  if (!pct) return null;
                  const lv = SWAMP_LEVEL(pct);
                  return (
                    <div key={key} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: key === category ? "#c9a84c" : "#6b5c2a" }}>
                          {CATEGORY_LABELS[key]}
                        </span>
                        <span style={{ fontSize: 11, color: lv.color }}>{pct.toFixed(1)}%</span>
                      </div>
                      <div style={{ height: 3, background: "#1a1812", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: lv.color + "66", borderRadius: 2 }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ fontSize: 11, color: "#4a3c1a", lineHeight: 1.8 }}>
                Total staff (all): {selected.totalStaff.toLocaleString()}<br />
                {category !== "all_staff" && catData.total ? `${CATEGORY_LABELS[category]}: ${catData.total.toLocaleString()}` : ""}
              </div>

              <button onClick={() => setSelected(null)} style={{
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
              }}>Close</button>
            </div>
          );
        })()}
      </div>

      {/* Legend + data note */}
      <div style={{ borderTop: "1px solid #1a1812", padding: "20px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
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
        </div>
        <div style={{ fontSize: 11, color: "#2a2010", lineHeight: 1.6 }}>
          Benchmark: white men = 29% of U.S. adult population (Census ACS 2023) · Vertical bar in each row marks 29% ·
          Source: NCES IPEDS Human Resources Survey, Fall 2023 (S2023_OC) · Includes R1, R2, and Masters-level institutions
        </div>
      </div>
    </div>
  );
}