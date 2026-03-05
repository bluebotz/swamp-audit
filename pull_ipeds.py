"""
IPEDS SWAMP Data Puller — with staff category breakdown
Source: S2023_OC, Fall 2023
Run from inside swamp-audit folder:
    source venv/bin/activate
    python3 pull_ipeds.py
Output: src/ipeds_data.js
"""

import requests, zipfile, io, json
import pandas as pd

# ── 1. Download data ──────────────────────────────────────────────────────────
print("Downloading S2023_OC...")
r = requests.get("https://nces.ed.gov/ipeds/datacenter/data/S2023_OC.zip", timeout=120)
z = zipfile.ZipFile(io.BytesIO(r.content))
fname = [f for f in z.namelist() if f.lower().endswith(".csv")][0]
df = pd.read_csv(z.open(fname), encoding="utf-8-sig", low_memory=False)
print(f"Loaded {len(df):,} rows")

print("Downloading HD2023...")
r2 = requests.get("https://nces.ed.gov/ipeds/datacenter/data/HD2023.zip", timeout=120)
z2 = zipfile.ZipFile(io.BytesIO(r2.content))
fname2 = [f for f in z2.namelist() if f.lower().endswith(".csv")][0]
hd = pd.read_csv(z2.open(fname2), encoding="utf-8-sig", low_memory=False)
hd = hd[["UNITID", "INSTNM", "STABBR", "CONTROL", "CARNEGIE"]].copy()
print(f"Loaded {len(hd):,} institutions")

# ── 2. Define staff categories ────────────────────────────────────────────────
CATEGORIES = {
    100: "all_staff",
    300: "management",
    210: "faculty",
    220: "research",
    320: "computer_engineering_science",
    400: "graduate_assistants",
}

CATEGORY_LABELS = {
    "all_staff": "All Staff",
    "management": "Management",
    "faculty": "Faculty",
    "research": "Research",
    "computer_engineering_science": "Computer, Engineering & Science",
    "graduate_assistants": "Graduate Assistants",
}

def agg_category(df_cat):
    a = df_cat.groupby("UNITID").agg(
        white_men=("HRWHITM", "sum"),
        white_women=("HRWHITW", "sum"),
        black_men=("HRBKAAM", "sum"),
        black_women=("HRBKAAW", "sum"),
        hispanic_men=("HRHISPM", "sum"),
        hispanic_women=("HRHISPW", "sum"),
        asian_men=("HRASIAM", "sum"),
        asian_women=("HRASIAW", "sum"),
        total_men=("HRTOTLM", "sum"),
        total_women=("HRTOTLW", "sum"),
    ).reset_index()
    a["total"] = a["total_men"] + a["total_women"]
    for col, raw in [("whiteM","white_men"),("whiteF","white_women"),
                     ("blackM","black_men"),("blackF","black_women"),
                     ("hispanicM","hispanic_men"),("hispanicF","hispanic_women"),
                     ("asianM","asian_men"),("asianF","asian_women")]:
        a[col] = (a[raw] / a["total"] * 100).round(1)
    return a

# FTPT=1 = all staff (full + part time totals)
# Graduate assistants use FTPT=4
print("Aggregating by category...")
cat_data = {}
for code, name in CATEGORIES.items():
    if code == 400:
        subset = df[(df["FTPT"] == 4) & (df["OCCUPCAT"] == code)]
    else:
        subset = df[(df["FTPT"] == 1) & (df["OCCUPCAT"] == code)]
    cat_data[name] = agg_category(subset).set_index("UNITID")
    print(f"  {name}: {len(cat_data[name]):,} institutions")

# ── 3. Merge with institution info ────────────────────────────────────────────
base = cat_data["all_staff"].reset_index()
base = base[base["total"] >= 100]
base = base.merge(hd, on="UNITID", how="left")

carnegie_map = {15:"R1",16:"R2",21:"Masters",22:"Masters",23:"Masters",
                31:"Baccalaureate",32:"Baccalaureate",33:"Baccalaureate"}
control_map  = {1:"Public", 2:"Private", 3:"For-Profit"}
base["carnegie_label"] = base["CARNEGIE"].map(carnegie_map).fillna("Other")
base["control_label"]  = base["CONTROL"].map(control_map).fillna("Other")
base["type"] = base["carnegie_label"] + " " + base["control_label"]

major = base[base["CARNEGIE"].isin([15,16,21,22,23])].copy()
print(f"\nFound {len(major):,} institutions (R1/R2/Masters)")

# ── 4. Build records ──────────────────────────────────────────────────────────
pct_cols = ["whiteM","whiteF","blackM","blackF","hispanicM","hispanicF","asianM","asianF"]

records = []
for _, row in major.sort_values("whiteM", ascending=False).iterrows():
    if pd.isna(row["INSTNM"]): continue
    uid = row["UNITID"]
    rec = {
        "name": str(row["INSTNM"]),
        "state": str(row["STABBR"]),
        "type": str(row["type"]),
        "totalStaff": int(row["total"]),
        "categories": {}
    }
    for name in CATEGORIES.values():
        if uid in cat_data[name].index:
            r2 = cat_data[name].loc[uid]
            rec["categories"][name] = {
                col: round(float(r2[col]), 1) if not pd.isna(r2[col]) else 0.0
                for col in pct_cols
            }
            rec["categories"][name]["total"] = int(r2["total"]) if not pd.isna(r2["total"]) else 0

    records.append(rec)

# ── 5. Export ─────────────────────────────────────────────────────────────────
out  = "// REAL DATA: NCES IPEDS Human Resources Survey, Fall 2023\n"
out += "// Source: S2023_OC — Staff by occupational category, race/ethnicity, and gender\n"
out += "// https://nces.ed.gov/ipeds\n\n"
out += "const CATEGORY_LABELS = " + json.dumps(CATEGORY_LABELS, indent=2) + ";\n\n"
out += "const universities = " + json.dumps(records, indent=2) + ";\n\n"
out += "export { CATEGORY_LABELS };\n"
out += "export default universities;\n"

with open("src/ipeds_data.js", "w") as f:
    f.write(out)

print(f"\n✅ Wrote {len(records):,} institutions to src/ipeds_data.js")
print("\nTop 10 by Management white male %:")
mgmt_check = []
for rec in records:
    if "management" in rec["categories"] and rec["categories"]["management"]["total"] > 10:
        mgmt_check.append((rec["name"], rec["state"], rec["categories"]["management"]["whiteM"]))
mgmt_check.sort(key=lambda x: -x[2])
for name, state, pct in mgmt_check[:10]:
    print(f"  {pct}% — {name} ({state})")
