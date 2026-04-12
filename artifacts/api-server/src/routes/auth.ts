import { Router } from "express";
import { db, accountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const router = Router();

router.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    const [account] = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.username, username));

    if (!account) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    const valid = await bcrypt.compare(password, account.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    req.session.userId = account.id;
    req.session.username = account.username;
    req.session.role = account.role;

    res.json({ id: account.id, username: account.username, role: account.role });
  } catch (e) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/auth/me", (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({
    id: req.session.userId,
    username: req.session.username,
    role: req.session.role,
  });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

export default router;
