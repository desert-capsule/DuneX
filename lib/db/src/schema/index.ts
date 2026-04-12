import { pgTable, text, serial, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  department: text("department").notNull(),
  shift: text("shift").notNull().default("Morning"),
  status: text("status").notNull().default("On Duty"),
  capsules: json("capsules").$type<number[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true, createdAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;

export const booksTable = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("Available"),
  description: text("description").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookSchema = createInsertSchema(booksTable).omit({ id: true, createdAt: true });
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof booksTable.$inferSelect;

export const accountsTable = pgTable("accounts", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("Operator"),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAccountSchema = createInsertSchema(accountsTable).omit({ id: true, createdAt: true, passwordHash: true });
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accountsTable.$inferSelect;

export const reservationsTable = pgTable("reservations", {
  id: serial("id").primaryKey(),
  reservationId: text("reservation_id").notNull().unique(),
  guest: text("guest").notNull(),
  capsule: text("capsule").notNull(),
  checkin: text("checkin").notNull(),
  checkout: text("checkout").notNull(),
  status: text("status").notNull().default("Pending"),
  amount: integer("amount").notNull().default(0),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReservationSchema = createInsertSchema(reservationsTable).omit({ id: true, createdAt: true });
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservationsTable.$inferSelect;

export const maintenanceTable = pgTable("maintenance", {
  id: serial("id").primaryKey(),
  alertId: text("alert_id").notNull().unique(),
  type: text("type").notNull().default("Warning"),
  capsule: text("capsule").notNull(),
  issue: text("issue").notNull(),
  tech: text("tech").notNull(),
  status: text("status").notNull().default("Open"),
  notes: text("notes").notNull().default(""),
  reportedAt: timestamp("reported_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMaintenanceSchema = createInsertSchema(maintenanceTable).omit({ id: true, createdAt: true });
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;
export type MaintenanceAlert = typeof maintenanceTable.$inferSelect;

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  capsuleId: text("capsule_id").notNull(),
  capsuleName: text("capsule_name").notNull(),
  guestName: text("guest_name").notNull(),
  rating: integer("rating").notNull().default(5),
  comment: text("comment").notNull().default(""),
  status: text("status").notNull().default("Published"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;

export const systemSettingsTable = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SystemSetting = typeof systemSettingsTable.$inferSelect;
