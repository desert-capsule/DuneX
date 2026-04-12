import { Router } from "express";
import { db, accountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const router = Router();

router.get("/accounts", async (_req, res) => {
  try {
    const accounts = await db.select({
      id: accountsTable.id,
      username: accountsTable.username,
      email: accountsTable.email,
      role: accountsTable.role,
      createdAt: accountsTable.createdAt,
    }).from(accountsTable).orderBy(accountsTable.createdAt);
    res.json(accounts);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

router.post("/accounts", async (req, res) => {
  try {
    const { username, email, role, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ error: "username, email, and password are required" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [account] = await db.insert(accountsTable).values({
      username,
      email,
      role: role || "Operator",
      passwordHash,
    }).returning({
      id: accountsTable.id,
      username: accountsTable.username,
      email: accountsTable.email,
      role: accountsTable.role,
      createdAt: accountsTable.createdAt,
    });
    res.status(201).json(account);
  } catch (e: any) {
    if (e?.code === "23505") {
      res.status(409).json({ error: "Username or email already exists" });
    } else {
      res.status(500).json({ error: "Failed to create account" });
    }
  }
});

router.put("/accounts/:id/password", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "currentPassword and newPassword are required" });
      return;
    }
    const [account] = await db.select().from(accountsTable).where(eq(accountsTable.id, id));
    if (!account) {
      res.status(404).json({ error: "Account not found" });
      return;
    }
    const valid = await bcrypt.compare(currentPassword, account.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.update(accountsTable).set({ passwordHash }).where(eq(accountsTable.id, id));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to change password" });
  }
});

router.put("/accounts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { username, email, role } = req.body;
    const [account] = await db.update(accountsTable)
      .set({ ...(username && { username }), ...(email && { email }), ...(role && { role }) })
      .where(eq(accountsTable.id, id))
      .returning({
        id: accountsTable.id,
        username: accountsTable.username,
        email: accountsTable.email,
        role: accountsTable.role,
        createdAt: accountsTable.createdAt,
      });
    if (!account) {
      res.status(404).json({ error: "Account not found" });
      return;
    }
    res.json(account);
  } catch (e: any) {
    if (e?.code === "23505") {
      res.status(409).json({ error: "Username or email already exists" });
    } else {
      res.status(500).json({ error: "Failed to update account" });
    }
  }
});

router.delete("/accounts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(accountsTable).where(eq(accountsTable.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Account not found" });
      return;
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
