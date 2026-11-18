// Run once with "npm run seed": creates an admin and a few demo students and groups.
import bcrypt from "bcryptjs";
import { db } from "./db.js";

const passwordHash = await bcrypt.hash("Password123", 10);

async function addUser(name, email, program, year, role = "student") {
  const [result] = await db.query(
    "INSERT IGNORE INTO users (name, email, password_hash, program, year_of_study, role) VALUES (?, ?, ?, ?, ?, ?)",
    [name, email, passwordHash, program, year, role],
  );
  if (result.insertId) return result.insertId;
  const [[existing]] = await db.query("SELECT id FROM users WHERE email = ?", [
    email,
  ]);
  return existing.id;
}

await addUser(
  "Muhereza Daniel",
  "muhereza@ucu.ac.ug",
  "Administration",
  1,
  "admin",
);
const user1 = await addUser(
  "Ayebare Daphine",
  "daphine@ucu.ac.ug",
  "BSc Information Technology",
  2,
);
const user2 = await addUser(
  "Titus Bashir",
  "titus@ucu.ac.ug",
  "BSc Computer Science",
  3,
);
const user3 = await addUser(
  "Ruth Atuhaire",
  "ruth@ucu.ac.ug",
  "Bachelor of Business Administration",
  1,
);

const [[{ groupCount }]] = await db.query(
  "SELECT COUNT(*) AS groupCount FROM study_groups",
);
if (groupCount === 0) {
  const demoGroups = [
    [
      "Database code camp",
      "Database Systems",
      "BIT2201",
      "Engineering, Design and Technology",
      "Weekly Sequel and ERD practice before tests.",
      "Library, LibLab",
      user1,
    ],
    [
      "Web Developers",
      "Web Application Development",
      "BIT2301",
      "Engineering, Design and Technology",
      "We build small React and Node projects together.",
      "Google Meet",
      user2,
    ],
    [
      "Accounting Academics",
      "Fundamentals of Accounting",
      "BBA1102",
      "Business and Administration",
      "Revision of journals, ledgers and trial balances.",
      "Multipurpose side, Room 12",
      user3,
    ],
  ];
  for (const [
    name,
    courseName,
    courseCode,
    faculty,
    description,
    meetingLocation,
    leaderId,
  ] of demoGroups) {
    const [result] = await db.query(
      `INSERT INTO study_groups (name, course_name, course_code, faculty, description, meeting_location, leader_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        courseName,
        courseCode,
        faculty,
        description,
        meetingLocation,
        leaderId,
      ],
    );
    await db.query(
      "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'leader')",
      [result.insertId, leaderId],
    );
  }
}

console.log("Everything is setup and we are good to go!");
process.exit(0);
