import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").default("trial"), // "trial", "professional", "enterprise"
  trialEndsAt: timestamp("trial_ends_at"),
  monthlyGoal: decimal("monthly_goal", { precision: 10, scale: 2 }).default("0.00"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory items table
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  palletId: varchar("pallet_id").references(() => pallets.id), // Link to pallet for cost allocation
  title: text("title").notNull(),
  sku: varchar("sku").notNull(),
  upc: varchar("upc"), // Added UPC support
  quantity: integer("quantity").default(1), // Added quantity tracking
  platform: varchar("platform"),
  category: varchar("category"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  listedPrice: decimal("listed_price", { precision: 10, scale: 2 }).notNull(),
  soldPrice: decimal("sold_price", { precision: 10, scale: 2 }), // Added sold price tracking
  status: varchar("status").default("unlisted"), // "unlisted", "listed", "sold", "returned"
  dateAcquired: timestamp("date_acquired").notNull(),
  dateListed: timestamp("date_listed"),
  dateSold: timestamp("date_sold"),
  condition: varchar("condition"),
  notes: text("notes"),
  tags: text("tags").array(),
  images: text("images").array(),
  barcode: varchar("barcode"),
  archived: boolean("archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sales records table
export const salesRecords = pgTable("sales_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  inventoryItemId: varchar("inventory_item_id").references(() => inventoryItems.id),
  itemTitle: text("item_title").notNull(), // Denormalized for reporting
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).default("0.00"), // For profit calculation
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).default("0.00"),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0.00"),
  otherFees: decimal("other_fees", { precision: 10, scale: 2 }).default("0.00"), // Additional fees
  profit: decimal("profit", { precision: 10, scale: 2 }).notNull(), // Auto-calculated profit
  saleDate: timestamp("sale_date").notNull(),
  platform: varchar("platform"),
  buyerInfo: text("buyer_info"),
  notes: text("notes"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Advanced Reminders table with notification features
export const reminders = pgTable("reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  inventoryItemId: varchar("inventory_item_id").references(() => inventoryItems.id),
  salesRecordId: varchar("sales_record_id").references(() => salesRecords.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").default(false),
  priority: varchar("priority").default("medium"), // low, medium, high, critical
  category: varchar("category"), // inventory, sales, marketing, admin, etc.
  isRecurring: boolean("is_recurring").default(false),
  recurringType: varchar("recurring_type"), // daily, weekly, monthly, yearly
  recurringInterval: integer("recurring_interval").default(1), // every X days/weeks/months
  recurringEndDate: timestamp("recurring_end_date"),
  lastNotified: timestamp("last_notified"),
  notificationMethods: text("notification_methods").array().default(sql`ARRAY['browser']`), // browser, email
  snoozedUntil: timestamp("snoozed_until"),
  relatedItemId: varchar("related_item_id"), // generic relation to any item
  relatedItemType: varchar("related_item_type"), // inventory, sale, expense, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification settings table for user preferences
export const notificationSettings = pgTable("notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  browserNotifications: boolean("browser_notifications").default(true),
  emailNotifications: boolean("email_notifications").default(false),
  reminderLeadTime: integer("reminder_lead_time").default(60), // minutes before due date
  dailyDigest: boolean("daily_digest").default(false),
  weeklyReport: boolean("weekly_report").default(true),
  lowStockAlerts: boolean("low_stock_alerts").default(true),
  profitGoalAlerts: boolean("profit_goal_alerts").default(true),
  quietHoursStart: varchar("quiet_hours_start").default("22:00"),
  quietHoursEnd: varchar("quiet_hours_end").default("08:00"),
  timezone: varchar("timezone").default("UTC"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  inventoryItems: many(inventoryItems),
  salesRecords: many(salesRecords),
  reminders: many(reminders),
  notificationSettings: one(notificationSettings),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
  user: one(users, {
    fields: [inventoryItems.userId],
    references: [users.id],
  }),
  salesRecords: many(salesRecords),
  reminders: many(reminders),
}));

export const salesRecordsRelations = relations(salesRecords, ({ one, many }) => ({
  user: one(users, {
    fields: [salesRecords.userId],
    references: [users.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [salesRecords.inventoryItemId],
    references: [inventoryItems.id],
  }),
  reminders: many(reminders),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(users, {
    fields: [reminders.userId],
    references: [users.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [reminders.inventoryItemId],
    references: [inventoryItems.id],
  }),
  salesRecord: one(salesRecords, {
    fields: [reminders.salesRecordId],
    references: [salesRecords.id],
  }),
}));

// Expense tracking table for business expenses beyond item costs
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category").notNull(), // shipping, packaging, storage, marketing, fees, equipment, etc.
  taxType: varchar("tax_type").default("exclusive"), // inclusive, exclusive, none
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0.00"), // percentage
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"), // calculated tax
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(), // amount before tax
  total: decimal("total", { precision: 10, scale: 2 }).notNull(), // final amount including tax
  expenseDate: timestamp("expense_date").defaultNow(),
  vendor: varchar("vendor"), // who was paid
  receiptUrl: varchar("receipt_url"), // photo of receipt
  businessPurpose: text("business_purpose"), // for tax deduction documentation
  deductible: boolean("deductible").default(true),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
  user: one(users, {
    fields: [notificationSettings.userId],
    references: [users.id],
  }),
}));

// Update inventory items relations to include pallet
export const updatedInventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
  user: one(users, {
    fields: [inventoryItems.userId],
    references: [users.id],
  }),
  pallet: one(pallets, {
    fields: [inventoryItems.palletId],
    references: [pallets.id],
  }),
  salesRecords: many(salesRecords),
  reminders: many(reminders),
}));

// Update users relations to include expenses and pallets
export const updatedUsersRelations = relations(users, ({ many }) => ({
  inventoryItems: many(inventoryItems),
  salesRecords: many(salesRecords),
  reminders: many(reminders),
  expenses: many(expenses),
  pallets: many(pallets),
}));

// Insert schemas
export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSalesRecordSchema = createInsertSchema(salesRecords).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Pallets table for liquidation pallet tracking
export const pallets = pgTable("pallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  supplier: varchar("supplier"),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  totalItems: integer("total_items").notNull(),
  workingItems: integer("working_items"),
  damagedItems: integer("damaged_items"),
  status: varchar("status").notNull().default("active"), // active, depleted, archived
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPalletSchema = createInsertSchema(pallets).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export const palletsRelations = relations(pallets, ({ one, many }) => ({
  user: one(users, {
    fields: [pallets.userId],
    references: [users.id],
  }),
  inventoryItems: many(inventoryItems),
}));

export type Pallet = typeof pallets.$inferSelect;
export type InsertPallet = typeof pallets.$inferInsert;
export type InsertPalletForm = z.infer<typeof insertPalletSchema>;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertSalesRecord = z.infer<typeof insertSalesRecordSchema>;
export type SalesRecord = typeof salesRecords.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;
export type NotificationSettings = typeof notificationSettings.$inferSelect;

// Dashboard metrics types
export interface DashboardMetrics {
  totalSales: string;
  totalProfit: string;
  itemsSold: number;
  monthlyGoalProgress: number;
  recentSales: SalesRecord[];
  revenueData: Array<{ month: string; revenue: number }>;
  inventoryStats: {
    totalItems: number;
    activeListings: number;
    lowStockItems: number;
  };
  salesChange?: string;
  profitChange?: string;
  itemsSoldChange?: string;
}
