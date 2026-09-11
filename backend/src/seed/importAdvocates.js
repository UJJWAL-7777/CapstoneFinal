/**
 * Imports an advocate directory CSV (e.g. the "All India Advocate List"
 * from data.gov.in, or the bundled sample_advocates.csv) into MongoDB,
 * enriching each record with the marketplace fields (tier, rating,
 * specialization, etc.) that a real regulatory dataset won't contain.
 *
 * Usage:
 *   node src/seed/importAdvocates.js                  -> uses sample_advocates.csv
 *   node src/seed/importAdvocates.js path/to/real.csv  -> uses your downloaded file
 *
 * Expected CSV columns (rename your columns to match, or edit the
 * `mapRow` function below): enrollment_number, name, address, district,
 * state, date_of_enrollment
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import { connectDB } from "../config/db.js";
import Provider from "../models/Provider.js";
import { computeTier } from "../utils/tier.js";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SPECIALIZATIONS = ["Civil", "Criminal", "Family", "Corporate", "Property", "Labour"];
const LANGUAGES = ["English", "Hindi", "Punjabi", "Marathi", "Tamil", "Bengali", "Gujarati"];

function randomFrom(arr, n = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// Map one CSV row -> a Provider document. Edit this if your column
// headers differ from the data.gov.in export.
function mapRow(row) {
  const engagementsCount = Math.floor(Math.random() * 140);
  const rating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
  const responseTimeHours = Math.round((0.5 + Math.random() * 6) * 10) / 10;

  const provider = {
    name: row.name?.trim(),
    providerType: "advocate",
    specialization: randomFrom(SPECIALIZATIONS, 1 + Math.floor(Math.random() * 2)),
    enrollmentNumber: row.enrollment_number?.trim(),
    dateOfEnrollment: row.date_of_enrollment ? new Date(row.date_of_enrollment) : undefined,
    location: {
      state: row.state?.trim(),
      district: row.district?.trim(),
    },
    languages: randomFrom(LANGUAGES, 2),
    verified: true, // treat regulatory-listed advocates as credential-verified
    engagementsCount,
    rating,
    responseTimeHours,
    disputeRate: Math.round(Math.random() * 5) / 100,
    referralCount: Math.floor(Math.random() * 6),
    underservedGeography: Math.random() < 0.2,
    proBonoCases: Math.floor(Math.random() * 4),
  };

  provider.tier = computeTier(provider);
  return provider;
}

async function run() {
  const csvArg = process.argv[2];
  const csvPath = csvArg
    ? path.resolve(process.cwd(), csvArg)
    : path.join(__dirname, "sample_advocates.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found at ${csvPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, "utf-8");
  const rows = parse(raw, { columns: true, skip_empty_lines: true, trim: true });

  await connectDB();

  const docs = rows.map(mapRow).filter((d) => d.name);
  await Provider.deleteMany({}); // clean slate for demo purposes
  const inserted = await Provider.insertMany(docs);

  console.log(`[seed] imported ${inserted.length} providers from ${path.basename(csvPath)}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
