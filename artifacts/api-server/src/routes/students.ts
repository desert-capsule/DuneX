import { Router } from "express";
import { db, studentsTable, insertStudentSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/students", async (_req, res) => {
  try {
    const students = await db.select().from(studentsTable).orderBy(studentsTable.createdAt);
    res.json(students);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

router.post("/students", async (req, res) => {
  try {
    const parsed = insertStudentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [student] = await db.insert(studentsTable).values(parsed.data).returning();
    res.status(201).json(student);
  } catch (e: any) {
    if (e?.code === "23505") {
      res.status(409).json({ error: "Student ID already exists" });
    } else {
      res.status(500).json({ error: "Failed to create student" });
    }
  }
});

router.put("/students/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const parsed = insertStudentSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [student] = await db.update(studentsTable).set(parsed.data).where(eq(studentsTable.id, id)).returning();
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    res.json(student);
  } catch (e) {
    res.status(500).json({ error: "Failed to update student" });
  }
});

router.delete("/students/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(studentsTable).where(eq(studentsTable.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete student" });
  }
});

export default router;
