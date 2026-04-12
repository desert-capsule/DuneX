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

async function seedAdmin() {
  try {
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
  } catch (e) {
    logger.warn({ err: e }, "Could not seed admin (DB may not be ready yet)");
  }
}

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.resolve(__dirname, "../../dunex/dist/public");
  if (existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get("*splat", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  }
}

app.listen(port, async (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  await seedAdmin();
});
