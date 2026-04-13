import path from "node:path";
import { existsSync } from "node:fs";
import express from "express";
import app from "./app";
import { logger } from "./lib/logger";
import { db, accountsTable } from "@workspace/db";
import bcrypt from "bcrypt";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function ensureAdminSeed() {
  // Create all tables if they don't exist
  await db.execute(`CREATE TABLE IF NOT EXISTS accounts (
    id serial primary key,
    username text not null unique,
    email text not null unique,
    role text not null default 'Operator',
    password_hash text not null,
    created_at timestamp not null default now()
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS students (
    id serial primary key,
    student_id text not null unique,
    name text not null,
    role text not null,
    department text not null,
    shift text not null default 'Morning',
    status text not null default 'On Duty',
    capsules json not null default '[]',
    created_at timestamp not null default now()
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS books (
    id serial primary key,
    title text not null,
    author text not null,
    category text not null,
    status text not null default 'Available',
    description text not null default '',
    cover_url text not null default '',
    created_at timestamp not null default now()
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS reservations (
    id serial primary key,
    reservation_id text not null unique,
    guest text not null,
    capsule text not null,
    checkin text not null,
    checkout text not null,
    status text not null default 'Pending',
    amount integer not null default 0,
    notes text not null default '',
    created_at timestamp not null default now()
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS maintenance (
    id serial primary key,
    alert_id text not null unique,
    type text not null default 'Warning',
    capsule text not null,
    issue text not null,
    tech text not null,
    status text not null default 'Open',
    notes text not null default '',
    reported_at timestamp not null default now(),
    created_at timestamp not null default now()
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS reviews (
    id serial primary key,
    capsule_id text not null,
    capsule_name text not null,
    guest_name text not null,
    rating integer not null default 5,
    comment text not null default '',
    status text not null default 'Published',
    created_at timestamp not null default now()
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS system_settings (
    id serial primary key,
    key text not null unique,
    value text not null default '',
    updated_at timestamp not null default now()
  )`);

  // Seed default admin if no accounts exist
  const existing = await db.select().from(accountsTable).limit(1);
  if (existing.length === 0) {
    const passwordHash = await bcrypt.hash("dunex@2026", 10);
    await db.insert(accountsTable).values({
      username: "admin",
      email: "admin@dunex.com",
      role: "Admin",
      passwordHash,
    });
    logger.info("Default admin account created — username: admin, password: dunex@2026");
  }
}

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.resolve(__dirname, "../../dunex/dist/public");
  if (existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.use((req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  }
}

app.listen(port, "0.0.0.0", async () => {
  try {
    await ensureAdminSeed();
    logger.info({ port }, "Server listening");
  } catch (err) {
    logger.error({ err }, "Failed to initialize database");
    process.exit(1);
  }
});
