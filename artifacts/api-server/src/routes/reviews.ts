import { Router } from "express";
import { db, reviewsTable, insertReviewSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/reviews", async (_req, res) => {
  try {
    const reviews = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
    res.json(reviews);
  } catch {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.get("/reviews/capsule/:capsuleId", async (req, res) => {
  try {
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.capsuleId, req.params.capsuleId))
      .orderBy(desc(reviewsTable.createdAt));
    res.json(reviews);
  } catch {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.post("/reviews", async (req, res) => {
  try {
    const parsed = insertReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [review] = await db.insert(reviewsTable).values(parsed.data).returning();
    res.status(201).json(review);
  } catch {
    res.status(500).json({ error: "Failed to create review" });
  }
});

router.patch("/reviews/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!["Published", "Hidden"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    const [review] = await db
      .update(reviewsTable)
      .set({ status })
      .where(eq(reviewsTable.id, id))
      .returning();
    if (!review) { res.status(404).json({ error: "Review not found" }); return; }
    res.json(review);
  } catch {
    res.status(500).json({ error: "Failed to update review" });
  }
});

router.delete("/reviews/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(reviewsTable).where(eq(reviewsTable.id, id)).returning();
    if (!deleted) { res.status(404).json({ error: "Review not found" }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
