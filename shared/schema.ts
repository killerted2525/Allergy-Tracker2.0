import { pgTable, text, serial, integer, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  instructions: text("instructions").notNull(),
  color: text("color").notNull(),
  frequency: text("frequency").notNull(), // Custom frequency like "every 2 days", "3 times per week", etc.
  startDate: date("start_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  mealType: text("meal_type", { enum: ["breakfast", "lunch", "dinner", "snack", "any"] }).default("any"),
  // Dose progression settings
  startingAmount: text("starting_amount"),
  targetAmount: text("target_amount"),
  progressionType: text("progression_type"), // 'buildup', 'static', 'reduction', 'custom'
  progressionDuration: integer("progression_duration"), // days to reach target
  // Time scheduling settings
  startTime: text("start_time"), // HH:MM format
  endTime: text("end_time"), // HH:MM format
  timeProgression: text("time_progression"), // 'later', 'earlier', 'static'
  timeProgressionAmount: integer("time_progression_amount"), // minutes to adjust per occurrence
});

export const scheduleEntries = pgTable("schedule_entries", {
  id: serial("id").primaryKey(),
  foodId: integer("food_id").notNull().references(() => foods.id),
  date: date("date").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: text("completed_at"), // ISO timestamp when completed
  // Calculated values for this specific entry
  calculatedAmount: text("calculated_amount"), // Amount for this specific day/occurrence
  calculatedTime: text("calculated_time"), // Time for this specific day/occurrence (HH:MM)
  occurrenceNumber: integer("occurrence_number"), // Which occurrence this is (for progression calculations)
});

export const insertFoodSchema = createInsertSchema(foods).omit({
  id: true,
  isActive: true,
});

export const insertScheduleEntrySchema = createInsertSchema(scheduleEntries).omit({
  id: true,
});

export type InsertFood = z.infer<typeof insertFoodSchema>;
export type Food = typeof foods.$inferSelect;
export type InsertScheduleEntry = z.infer<typeof insertScheduleEntrySchema>;
export type ScheduleEntry = typeof scheduleEntries.$inferSelect;