import { Router } from "express";
import { db, booksTable, insertBookSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/books", async (_req, res) => {
  try {
    const books = await db.select().from(booksTable).orderBy(booksTable.createdAt);
    res.json(books);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

router.post("/books", async (req, res) => {
  try {
    const parsed = insertBookSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [book] = await db.insert(booksTable).values(parsed.data).returning();
    res.status(201).json(book);
  } catch (e) {
    res.status(500).json({ error: "Failed to create book" });
  }
});

router.put("/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const parsed = insertBookSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [book] = await db.update(booksTable).set(parsed.data).where(eq(booksTable.id, id)).returning();
    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    res.json(book);
  } catch (e) {
    res.status(500).json({ error: "Failed to update book" });
  }
});

router.delete("/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(booksTable).where(eq(booksTable.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Book not found" });
      return;
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete book" });
  }
});

export default router;
