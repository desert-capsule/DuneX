import { Router } from "express";
import { db } from "@workspace/db";
import { maintenanceTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

/* GET all */
router.get("/", async (_req, res) => {
  try {
    const items = await db.select().from(maintenanceTable).orderBy(maintenanceTable.reportedAt);
    res.json(items);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

/* POST create */
router.post("/", async (req, res) => {
  try {
    const { type, capsule, issue, tech, status, notes, reportedAt } = req.body;
    if (!capsule || !issue || !tech) {
      res.status(400).json({ error: "capsule, issue, and tech are required" });
      return;
    }
    const count = await db.select().from(maintenanceTable);
    const alertId = `MNT-${String(count.length + 1).padStart(3, "0")}`;
    const [row] = await db.insert(maintenanceTable).values({
      alertId,
      type: type || "Warning",
      capsule,
      issue,
      tech,
      status: status || "Open",
      notes: notes || "",
      reportedAt: reportedAt ? new Date(reportedAt) : new Date(),
    }).returning();
    res.status(201).json(row);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

/* PUT update */
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { type, capsule, issue, tech, status, notes, reportedAt } = req.body;
    const [row] = await db.update(maintenanceTable).set({
      ...(type !== undefined && { type }),
      ...(capsule !== undefined && { capsule }),
      ...(issue !== undefined && { issue }),
      ...(tech !== undefined && { tech }),
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
      ...(reportedAt !== undefined && { reportedAt: new Date(reportedAt) }),
    }).where(eq(maintenanceTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

/* DELETE */
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(maintenanceTable).where(eq(maintenanceTable.id, id));
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
