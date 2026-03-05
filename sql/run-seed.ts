import { readFileSync } from "fs";
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: "prefer" });
const seedSQL = readFileSync(new URL("./seed-materias.sql", import.meta.url), "utf-8");

async function main() {
  console.log("Connected to database");

  try {
    await sql.unsafe(seedSQL);
    console.log("Seed executed successfully!");

    const subjects = await sql`SELECT count(*) FROM subjects`;
    const courses = await sql`SELECT count(*) FROM courses`;
    const units = await sql`SELECT count(*) FROM units`;
    console.log(`Subjects: ${subjects[0].count}`);
    console.log(`Courses: ${courses[0].count}`);
    console.log(`Units: ${units[0].count}`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
  }
}

main();
