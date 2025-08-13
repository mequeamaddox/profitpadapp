import {
  users,
  inventoryItems,
  salesRecords,
  reminders,
  expenses,
  notificationSettings,
  pallets,
  type User,
  type UpsertUser,
  type InventoryItem,
  type InsertInventoryItem,
  type SalesRecord,
  type InsertSalesRecord,
  type Reminder,
  type InsertReminder,
  type Expense,
  type InsertExpense,
  type NotificationSettings,
  type InsertNotificationSettings,
  type Pallet,
  type InsertPallet,
  type DashboardMetrics,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, count, sum, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Inventory operations
  getInventoryItems(userId: string, archived?: boolean): Promise<InventoryItem[]>;
  getInventoryItem(id: string, userId: string): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem & { userId: string }): Promise<InventoryItem>;
  updateInventoryItem(id: string, userId: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: string, userId: string): Promise<boolean>;
  searchInventoryItems(userId: string, query: string): Promise<InventoryItem[]>;

  // Sales operations
  getSalesRecords(userId: string): Promise<SalesRecord[]>;
  getSalesRecord(id: string, userId: string): Promise<SalesRecord | undefined>;
  createSalesRecord(record: InsertSalesRecord & { userId: string }): Promise<SalesRecord>;
  updateSalesRecord(id: string, userId: string, record: Partial<InsertSalesRecord>): Promise<SalesRecord | undefined>;
  deleteSalesRecord(id: string, userId: string): Promise<boolean>;

  // Reminders operations
  getReminders(userId: string): Promise<Reminder[]>;
  getReminder(id: string, userId: string): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder & { userId: string }): Promise<Reminder>;
  updateReminder(id: string, userId: string, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: string, userId: string): Promise<boolean>;
  getOverdueReminders(userId: string): Promise<Reminder[]>;

  // Expense operations
  getExpenses(userId: string): Promise<Expense[]>;
  getExpense(id: string, userId: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense & { userId: string }): Promise<Expense>;
  updateExpense(id: string, userId: string, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string, userId: string): Promise<boolean>;

  // Notification settings operations
  getNotificationSettings(userId: string): Promise<NotificationSettings | undefined>;
  upsertNotificationSettings(settings: InsertNotificationSettings & { userId: string }): Promise<NotificationSettings>;

  // Pallet operations
  getPallets(userId: string): Promise<Pallet[]>;
  getPallet(id: string, userId: string): Promise<Pallet | undefined>;
  createPallet(pallet: InsertPallet & { userId: string }): Promise<Pallet>;
  updatePallet(id: string, userId: string, pallet: Partial<InsertPallet>): Promise<Pallet | undefined>;
  deletePallet(id: string, userId: string): Promise<boolean>;

  // Advanced reminder operations
  getDueReminders(userId: string, leadTimeMinutes?: number): Promise<Reminder[]>;
  createRecurringReminder(reminder: InsertReminder & { userId: string }): Promise<Reminder>;
  snoozeReminder(id: string, userId: string, minutes: number): Promise<Reminder | undefined>;

  searchInventoryByBarcode(userId: string, barcode: string): Promise<InventoryItem[]>;
  
  // Analytics operations
  getDashboardMetrics(userId: string): Promise<{
    totalSales: string;
    totalProfit: string;
    itemsSold: number;
    monthlyGoalProgress: number;
    recentSales: any[];
    revenueData: any[];
    inventoryStats: any;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getInventoryCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(inventoryItems)
      .where(eq(inventoryItems.userId, userId));
    return result[0]?.count || 0;
  }

  async getSalesCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(salesRecords)
      .where(eq(salesRecords.userId, userId));
    return result[0]?.count || 0;
  }

  async getRemindersCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(reminders)
      .where(eq(reminders.userId, userId));
    return result[0]?.count || 0;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Set trial end date for new users (3 days from now)
    const trialEndsAt = userData.trialEndsAt || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        trialEndsAt,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
          // Don't update trialEndsAt for existing users
        },
      })
      .returning();
    return user;
  }

  async getInventoryItems(userId: string, archived?: boolean): Promise<InventoryItem[]> {
    const conditions = [eq(inventoryItems.userId, userId)];
    if (archived !== undefined) {
      conditions.push(eq(inventoryItems.archived, archived));
    }
    
    return await db
      .select()
      .from(inventoryItems)
      .where(and(...conditions))
      .orderBy(desc(inventoryItems.createdAt));
  }

  async getInventoryItem(id: string, userId: string): Promise<InventoryItem | undefined> {
    const [item] = await db
      .select()
      .from(inventoryItems)
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.userId, userId)));
    return item;
  }

  async createInventoryItem(item: InsertInventoryItem & { userId: string }): Promise<InventoryItem> {
    const [newItem] = await db
      .insert(inventoryItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateInventoryItem(id: string, userId: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [updatedItem] = await db
      .update(inventoryItems)
      .set({ ...item, updatedAt: new Date() })
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.userId, userId)))
      .returning();
    return updatedItem;
  }

  async deleteInventoryItem(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(inventoryItems)
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async searchInventoryItems(userId: string, query: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.userId, userId),
          sql`(
            ${inventoryItems.title} ILIKE ${`%${query}%`} OR
            ${inventoryItems.sku} ILIKE ${`%${query}%`} OR
            ${inventoryItems.notes} ILIKE ${`%${query}%`} OR
            ${inventoryItems.barcode} = ${query}
          )`
        )
      )
      .orderBy(desc(inventoryItems.createdAt));
  }



  async getSalesRecords(userId: string): Promise<SalesRecord[]> {
    return await db
      .select()
      .from(salesRecords)
      .where(eq(salesRecords.userId, userId))
      .orderBy(desc(salesRecords.saleDate));
  }

  async getSalesByUserId(userId: string): Promise<SalesRecord[]> {
    return await db
      .select()
      .from(salesRecords)
      .where(eq(salesRecords.userId, userId))
      .orderBy(desc(salesRecords.saleDate));
  }

  async getInventoryByUserId(userId: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.userId, userId))
      .orderBy(desc(inventoryItems.createdAt));
  }

  async getSalesRecord(id: string, userId: string): Promise<SalesRecord | undefined> {
    const [record] = await db
      .select()
      .from(salesRecords)
      .where(and(eq(salesRecords.id, id), eq(salesRecords.userId, userId)));
    return record;
  }

  async createSalesRecord(record: InsertSalesRecord & { userId: string }): Promise<SalesRecord> {
    const [newRecord] = await db
      .insert(salesRecords)
      .values(record)
      .returning();
    return newRecord;
  }

  async updateSalesRecord(id: string, userId: string, record: Partial<InsertSalesRecord>): Promise<SalesRecord | undefined> {
    const [updatedRecord] = await db
      .update(salesRecords)
      .set({ ...record, updatedAt: new Date() })
      .where(and(eq(salesRecords.id, id), eq(salesRecords.userId, userId)))
      .returning();
    return updatedRecord;
  }

  async deleteSalesRecord(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(salesRecords)
      .where(and(eq(salesRecords.id, id), eq(salesRecords.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getReminders(userId: string): Promise<Reminder[]> {
    return await db
      .select()
      .from(reminders)
      .where(eq(reminders.userId, userId))
      .orderBy(desc(reminders.dueDate));
  }

  async getReminder(id: string, userId: string): Promise<Reminder | undefined> {
    const [reminder] = await db
      .select()
      .from(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
    return reminder;
  }

  async createReminder(reminder: InsertReminder & { userId: string }): Promise<Reminder> {
    const [newReminder] = await db
      .insert(reminders)
      .values(reminder)
      .returning();
    return newReminder;
  }

  async updateReminder(id: string, userId: string, reminder: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const [updatedReminder] = await db
      .update(reminders)
      .set({ ...reminder, updatedAt: new Date() })
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();
    return updatedReminder;
  }

  async deleteReminder(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(reminders)
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getOverdueReminders(userId: string): Promise<Reminder[]> {
    const now = new Date();
    return await db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.userId, userId),
          eq(reminders.completed, false),
          lte(reminders.dueDate, now)
        )
      )
      .orderBy(desc(reminders.dueDate));
  }

  // Expense operations
  async getExpenses(userId: string): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.expenseDate));
  }

  async getExpense(id: string, userId: string): Promise<Expense | undefined> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    return expense;
  }

  async createExpense(expense: InsertExpense & { userId: string }): Promise<Expense> {
    const [created] = await db.insert(expenses).values(expense).returning();
    return created;
  }

  async updateExpense(id: string, userId: string, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updated] = await db
      .update(expenses)
      .set(expense)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return updated;
  }

  async deleteExpense(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
    // Get current month start/end and previous month for comparison
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total sales amount
    const [totalSalesResult] = await db
      .select({ total: sum(salesRecords.salePrice) })
      .from(salesRecords)
      .where(eq(salesRecords.userId, userId));

    // Total profit calculation - use stored profit values (same as reports)
    const allSales = await db
      .select({ profit: salesRecords.profit })
      .from(salesRecords)
      .where(eq(salesRecords.userId, userId));

    const totalProfit = allSales.reduce((acc, sale) => {
      return acc + parseFloat(sale.profit || "0");
    }, 0);

    // Items sold count
    const [itemsSoldResult] = await db
      .select({ count: count() })
      .from(salesRecords)
      .where(eq(salesRecords.userId, userId));

    // Previous month calculations for comparison
    const [prevMonthSalesResult] = await db
      .select({ total: sum(salesRecords.salePrice) })
      .from(salesRecords)
      .where(
        and(
          eq(salesRecords.userId, userId),
          gte(salesRecords.saleDate, prevMonthStart),
          lte(salesRecords.saleDate, prevMonthEnd)
        )
      );

    const prevMonthSales = await db
      .select({ profit: salesRecords.profit })
      .from(salesRecords)
      .where(
        and(
          eq(salesRecords.userId, userId),
          gte(salesRecords.saleDate, prevMonthStart),
          lte(salesRecords.saleDate, prevMonthEnd)
        )
      );

    const prevMonthProfit = prevMonthSales.reduce((acc, sale) => {
      return acc + parseFloat(sale.profit || "0");
    }, 0);

    const [prevMonthItemsSoldResult] = await db
      .select({ count: count() })
      .from(salesRecords)
      .where(
        and(
          eq(salesRecords.userId, userId),
          gte(salesRecords.saleDate, prevMonthStart),
          lte(salesRecords.saleDate, prevMonthEnd)
        )
      );

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): string => {
      if (previous === 0) return current > 0 ? "+100%" : "";
      const change = ((current - previous) / previous) * 100;
      return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
    };

    const currentSales = parseFloat(totalSalesResult?.total || "0");
    const prevSales = parseFloat(prevMonthSalesResult?.total || "0");
    const salesChange = calculateChange(currentSales, prevSales);

    const profitChange = calculateChange(totalProfit, prevMonthProfit);

    const currentItemsSold = itemsSoldResult?.count || 0;
    const prevItemsSold = prevMonthItemsSoldResult?.count || 0;
    const itemsSoldChange = calculateChange(currentItemsSold, prevItemsSold);

    // Monthly goal progress
    const [userResult] = await db
      .select({ monthlyGoal: users.monthlyGoal })
      .from(users)
      .where(eq(users.id, userId));

    const [monthlyProfitResult] = await db
      .select({ total: sum(salesRecords.profit) })
      .from(salesRecords)
      .where(
        and(
          eq(salesRecords.userId, userId),
          gte(salesRecords.saleDate, monthStart),
          lte(salesRecords.saleDate, monthEnd)
        )
      );

    const monthlyGoal = parseFloat(userResult?.monthlyGoal || "0");
    const currentMonthProfit = parseFloat(monthlyProfitResult?.total || "0");
    const monthlyProgress = monthlyGoal > 0 ? 
      Math.min(100, Math.round((currentMonthProfit / monthlyGoal) * 100)) : 0;
      
    console.log("Monthly Goal Debug:", {
      userResult: userResult?.monthlyGoal,
      monthlyGoal,
      currentMonthProfit,
      monthlyProgress,
      userId
    });

    // Recent sales with inventory details
    const recentSales = await db
      .select({
        id: salesRecords.id,
        salePrice: salesRecords.salePrice,
        platform: salesRecords.platform,
        saleDate: salesRecords.saleDate,
        itemTitle: inventoryItems.title,
        itemSku: inventoryItems.sku,
        itemImages: inventoryItems.images,
      })
      .from(salesRecords)
      .leftJoin(inventoryItems, eq(salesRecords.inventoryItemId, inventoryItems.id))
      .where(eq(salesRecords.userId, userId))
      .orderBy(desc(salesRecords.saleDate))
      .limit(5);

    // Revenue data for the last 12 months
    const revenueData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const [monthlyRevenue] = await db
        .select({ total: sum(salesRecords.salePrice) })
        .from(salesRecords)
        .where(
          and(
            eq(salesRecords.userId, userId),
            gte(salesRecords.saleDate, date),
            lte(salesRecords.saleDate, nextDate)
          )
        );

      revenueData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: parseFloat(monthlyRevenue?.total || "0"),
      });
    }

    // Inventory stats
    const [totalItemsResult] = await db
      .select({ count: count() })
      .from(inventoryItems)
      .where(and(eq(inventoryItems.userId, userId), eq(inventoryItems.archived, false)));

    const [activeListingsResult] = await db
      .select({ count: count() })
      .from(inventoryItems)
      .leftJoin(salesRecords, eq(inventoryItems.id, salesRecords.inventoryItemId))
      .where(
        and(
          eq(inventoryItems.userId, userId),
          eq(inventoryItems.archived, false),
          sql`${salesRecords.id} IS NULL`
        )
      );

    // Calculate inventory resell value potential
    const activeInventory = await db
      .select({
        purchasePrice: inventoryItems.purchasePrice,
        listedPrice: inventoryItems.listedPrice,
        quantity: inventoryItems.quantity,
      })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.userId, userId),
          eq(inventoryItems.archived, false),
          sql`${salesRecords.id} IS NULL` // Not sold yet
        )
      )
      .leftJoin(salesRecords, eq(inventoryItems.id, salesRecords.inventoryItemId));

    const inventoryValue = activeInventory.reduce((acc, item) => {
      const purchasePrice = parseFloat(item.purchasePrice || "0");
      const quantity = item.quantity || 1;
      return acc + (purchasePrice * quantity);
    }, 0);

    const potentialRevenue = activeInventory.reduce((acc, item) => {
      const listedPrice = parseFloat(item.listedPrice || "0");
      const quantity = item.quantity || 1;
      return acc + (listedPrice * quantity);
    }, 0);

    const potentialProfit = potentialRevenue - inventoryValue;

    return {
      totalSales: totalSalesResult?.total || "0",
      totalProfit: totalProfit.toFixed(2),
      itemsSold: itemsSoldResult?.count || 0,
      monthlyGoalProgress: monthlyProgress,
      recentSales: recentSales as any[],
      revenueData,
      inventoryStats: {
        totalItems: totalItemsResult?.count || 0,
        activeListings: activeListingsResult?.count || 0,
        lowStock: 0, // Could be calculated based on quantity if we add that field
      },
      inventoryValue: {
        totalInvestment: inventoryValue.toFixed(2),
        potentialRevenue: potentialRevenue.toFixed(2),
        potentialProfit: potentialProfit.toFixed(2),
        itemCount: activeInventory.length,
      },
      salesChange,
      profitChange,
      itemsSoldChange,
    };
  }

  // Notification settings operations
  async getNotificationSettings(userId: string): Promise<NotificationSettings | undefined> {
    const [settings] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId));
    return settings;
  }

  async upsertNotificationSettings(settings: InsertNotificationSettings & { userId: string }): Promise<NotificationSettings> {
    const [result] = await db
      .insert(notificationSettings)
      .values(settings)
      .onConflictDoUpdate({
        target: notificationSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // Stale inventory analysis
  async getStaleInventoryAnalysis(userId: string): Promise<any[]> {
    const activeItems = await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.userId, userId),
          eq(inventoryItems.archived, false)
        )
      )
      .leftJoin(salesRecords, eq(inventoryItems.id, salesRecords.inventoryItemId));

    // Filter items that haven't been sold and calculate staleness
    const staleItems = activeItems
      .filter(item => !item.sales_records) // Not sold
      .map(item => {
        const listingDate = item.inventory_items.dateListed || item.inventory_items.dateAcquired;
        const daysListed = Math.floor((Date.now() - new Date(listingDate).getTime()) / (1000 * 60 * 60 * 24));
        
        let staleness: "Warning" | "Stale" | "Critical";
        let suggestedAction: string;
        
        if (daysListed >= 90) {
          staleness = "Critical";
          suggestedAction = "Consider 30% price reduction or bundle with other items";
        } else if (daysListed >= 60) {
          staleness = "Stale";
          suggestedAction = "Reduce price by 15-20% or try different platform";
        } else if (daysListed >= 30) {
          staleness = "Warning";
          suggestedAction = "Monitor closely, consider minor price adjustment";
        } else {
          return null; // Not stale yet
        }

        const potentialLoss = parseFloat(item.inventory_items.purchasePrice || "0");

        return {
          ...item.inventory_items,
          daysListed,
          staleness,
          suggestedAction,
          potentialLoss
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => (b?.daysListed || 0) - (a?.daysListed || 0)); // Sort by most stale first

    return staleItems;
  }

  // Pallet operations
  async getPallets(userId: string): Promise<Pallet[]> {
    return await db
      .select()
      .from(pallets)
      .where(eq(pallets.userId, userId))
      .orderBy(desc(pallets.createdAt));
  }

  async getPallet(id: string, userId: string): Promise<Pallet | undefined> {
    const [pallet] = await db
      .select()
      .from(pallets)
      .where(and(eq(pallets.id, id), eq(pallets.userId, userId)));
    return pallet;
  }

  async createPallet(pallet: InsertPallet & { userId: string }): Promise<Pallet> {
    const [result] = await db
      .insert(pallets)
      .values(pallet)
      .returning();
    return result;
  }

  async updatePallet(id: string, userId: string, pallet: Partial<InsertPallet>): Promise<Pallet | undefined> {
    const [result] = await db
      .update(pallets)
      .set({ ...pallet, updatedAt: new Date() })
      .where(and(eq(pallets.id, id), eq(pallets.userId, userId)))
      .returning();
    return result;
  }

  async deletePallet(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(pallets)
      .where(and(eq(pallets.id, id), eq(pallets.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Advanced reminder operations
  async getDueReminders(userId: string, leadTimeMinutes: number = 60): Promise<Reminder[]> {
    const now = new Date();
    const leadTime = new Date(now.getTime() + leadTimeMinutes * 60000);
    
    return await db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.userId, userId),
          eq(reminders.completed, false),
          lte(reminders.dueDate, leadTime),
          sql`(${reminders.snoozedUntil} IS NULL OR ${reminders.snoozedUntil} <= ${now})`
        )
      )
      .orderBy(reminders.dueDate);
  }

  async createRecurringReminder(reminder: InsertReminder & { userId: string }): Promise<Reminder> {
    const [result] = await db
      .insert(reminders)
      .values(reminder)
      .returning();
    return result;
  }

  async snoozeReminder(id: string, userId: string, minutes: number): Promise<Reminder | undefined> {
    const snoozeUntil = new Date(Date.now() + minutes * 60000);
    
    const [result] = await db
      .update(reminders)
      .set({ 
        snoozedUntil: snoozeUntil,
        updatedAt: new Date()
      })
      .where(and(eq(reminders.id, id), eq(reminders.userId, userId)))
      .returning();
    
    return result;
  }

  async searchInventoryByBarcode(userId: string, barcode: string): Promise<InventoryItem[]> {
    return await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.userId, userId),
          eq(inventoryItems.barcode, barcode),
          eq(inventoryItems.archived, false)
        )
      );
  }
}

export const storage = new DatabaseStorage();
