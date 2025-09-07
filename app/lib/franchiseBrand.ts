// app/lib/franchiseBrand.ts
// Bizarro League branding: names from MFL + per-franchise logo & color.
// Put 32 PNGs in /public/assets/logos/bizarro/{FRANCHISE_ID}.png
// Example: /public/assets/logos/bizarro/0001.png

export type FranchiseBrand = {
  name: string;       // Display name
  logo: string;       // /public path to image
  color?: string;     // Accent (win bar, badges). Optional
};

export const FRANCHISE_BRAND: Record<string, FranchiseBrand> = {
  "0001": { name: "Cardinals",      logo: "/assets/logos/bizarro/0001.png", color: "#97233F" },
  "0002": { name: "Falcons",        logo: "/assets/logos/bizarro/0002.png", color: "#A71930" },
  "0003": { name: "Ravens",         logo: "/assets/logos/bizarro/0003.png", color: "#241773" },
  "0004": { name: "Bills",          logo: "/assets/logos/bizarro/0004.png", color: "#00338D" },
  "0005": { name: "Panthers",       logo: "/assets/logos/bizarro/0005.png", color: "#0085CA" },
  "0006": { name: "Bears",          logo: "/assets/logos/bizarro/0006.png", color: "#0B162A" },
  "0007": { name: "Bengals",        logo: "/assets/logos/bizarro/0007.png", color: "#FB4F14" },
  "0008": { name: "Browns",         logo: "/assets/logos/bizarro/0008.png", color: "#311D00" },
  "0009": { name: "Cowboys",        logo: "/assets/logos/bizarro/0009.png", color: "#041E42" },
  "0010": { name: "Broncos",        logo: "/assets/logos/bizarro/0010.png", color: "#FB4F14" },
  "0011": { name: "Lions",          logo: "/assets/logos/bizarro/0011.png", color: "#0076B6" },
  "0012": { name: "Packers",        logo: "/assets/logos/bizarro/0012.png", color: "#203731" },
  "0013": { name: "Texans",         logo: "/assets/logos/bizarro/0013.png", color: "#03202F" },
  "0014": { name: "Colts",          logo: "/assets/logos/bizarro/0014.png", color: "#002C5F" },
  "0015": { name: "Jaguars",        logo: "/assets/logos/bizarro/0015.png", color: "#006778" },
  "0016": { name: "Chargers",       logo: "/assets/logos/bizarro/0016.png", color: "#0080C6" },
  "0017": { name: "Chiefs",         logo: "/assets/logos/bizarro/0017.png", color: "#E31837" },
  "0018": { name: "Rams",           logo: "/assets/logos/bizarro/0018.png", color: "#003594" },
  "0019": { name: "Dolphins",       logo: "/assets/logos/bizarro/0019.png", color: "#008E97" },
  "0020": { name: "Vikings",        logo: "/assets/logos/bizarro/0020.png", color: "#4F2683" },
  "0021": { name: "Patriots",       logo: "/assets/logos/bizarro/0021.png", color: "#002244" },
  "0022": { name: "Saints",         logo: "/assets/logos/bizarro/0022.png", color: "#D3BC8D" },
  "0023": { name: "Giants",         logo: "/assets/logos/bizarro/0023.png", color: "#0B2265" },
  "0024": { name: "Jets",           logo: "/assets/logos/bizarro/0024.png", color: "#125740" },
  "0025": { name: "Raiders",        logo: "/assets/logos/bizarro/0025.png", color: "#000000" },
  "0026": { name: "Eagles",         logo: "/assets/logos/bizarro/0026.png", color: "#004C54" },
  "0027": { name: "Steelers",       logo: "/assets/logos/bizarro/0027.png", color: "#FFB612" },
  "0028": { name: "49ers",          logo: "/assets/logos/bizarro/0028.png", color: "#AA0000" },
  "0029": { name: "Seahawks",       logo: "/assets/logos/bizarro/0029.png", color: "#002244" },
  "0030": { name: "Buccaneers",     logo: "/assets/logos/bizarro/0030.png", color: "#D50A0A" },
  "0031": { name: "Titans",         logo: "/assets/logos/bizarro/0031.png", color: "#0C2340" },
  "0032": { name: "Commanders",     logo: "/assets/logos/bizarro/0032.png", color: "#5A1414" },
};
