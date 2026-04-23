import { Router } from "express";
import { db, reservationsTable, insertReservationSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/reservations", async (_req, res) => {
  try {
    const reservations = await db.select().from(reservationsTable).orderBy(reservationsTable.createdAt);
    res.json(reservations);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
});

router.post("/reservations", async (req, res) => {
  try {
    const parsed = insertReservationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [reservation] = await db.insert(reservationsTable).values(parsed.data).returning();
    res.status(201).json(reservation);
  } catch (e: any) {
    if (e?.code === "23505") {
      res.status(409).json({ error: "Reservation ID already exists" });
    } else {
      res.status(500).json({ error: "Failed to create reservation" });
    }
  }
});

router.put("/reservations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const parsed = insertReservationSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [reservation] = await db
      .update(reservationsTable)
      .set(parsed.data)
      .where(eq(reservationsTable.id, id))
      .returning();
    if (!reservation) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }
    res.json(reservation);
  } catch (e: any) {
    if (e?.code === "23505") {
      res.status(409).json({ error: "Reservation ID already exists" });
    } else {
      res.status(500).json({ error: "Failed to update reservation" });
    }
  }
});

router.delete("/reservations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(reservationsTable).where(eq(reservationsTable.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete reservation" });
  }
});

export default router;
