import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { checkTrialExpired } from "./trialMiddleware";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import {
  insertInventoryItemSchema,
  insertSalesRecordSchema,
  insertReminderSchema,
  insertExpenseSchema,
  insertPalletSchema,
  insertNotificationSettingsSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes  
  app.get('/api/auth/user', async (req: any, res) => {
    console.log("Auth check - session ID:", req.sessionID);
    console.log("Auth check - isAuthenticated:", req.isAuthenticated());
    console.log("Auth check - user:", req.user);
    
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      console.log("Returning user:", user);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/metrics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const metrics = await storage.getDashboardMetrics(userId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { archived, search, limit } = req.query;
      
      let items;
      if (search) {
        items = await storage.searchInventoryItems(userId, search as string);
      } else {
        items = await storage.getInventoryItems(userId, archived === "true");
      }
      
      // Apply limit if specified
      if (limit && !isNaN(parseInt(limit as string))) {
        const limitNum = parseInt(limit as string);
        items = items.slice(0, limitNum);
      }
      
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  // Generate SKU endpoint
  app.get("/api/inventory/generate-sku", isAuthenticated, async (req: any, res) => {
    try {
      const { category } = req.query;
      
      // Create category prefix (first 3 letters uppercase, or "ITM" as default)
      let prefix = "ITM";
      if (category && typeof category === "string") {
        prefix = category.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
        if (prefix.length < 3) {
          prefix = prefix.padEnd(3, 'X');
        }
      }
      
      // Create date suffix (YYYYMMDD)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateSuffix = `${year}${month}${day}`;
      
      // Create random 3-digit number for uniqueness
      const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      
      // Combine: CAT-YYYYMMDD-XXX
      const sku = `${prefix}-${dateSuffix}-${randomNum}`;
      
      res.json({ sku });
    } catch (error) {
      console.error("Error generating SKU:", error);
      res.status(500).json({ message: "Failed to generate SKU" });
    }
  });

  // Barcode search endpoint
  app.get("/api/inventory/search", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { barcode } = req.query;
      
      if (!barcode) {
        return res.status(400).json({ message: "Barcode parameter is required" });
      }
      
      const items = await storage.searchInventoryByBarcode(userId, barcode as string);
      res.json(items);
    } catch (error) {
      console.error("Error searching inventory by barcode:", error);
      res.status(500).json({ message: "Failed to search inventory by barcode" });
    }
  });

  app.get("/api/inventory/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const item = await storage.getInventoryItem(req.params.id, userId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      res.status(500).json({ message: "Failed to fetch inventory item" });
    }
  });

  app.post("/api/inventory", isAuthenticated, checkTrialExpired, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Convert date strings to Date objects if needed
      if (req.body.dateAcquired && typeof req.body.dateAcquired === 'string') {
        req.body.dateAcquired = new Date(req.body.dateAcquired);
      }
      if (req.body.dateListed && typeof req.body.dateListed === 'string') {
        req.body.dateListed = new Date(req.body.dateListed);
      }
      if (req.body.dateSold && typeof req.body.dateSold === 'string') {
        req.body.dateSold = new Date(req.body.dateSold);
      }
      
      const validatedData = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem({ ...validatedData, userId });
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Inventory validation error:", JSON.stringify(error.errors, null, 2));
        console.error("Request body:", JSON.stringify(req.body, null, 2));
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating inventory item:", error);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.put("/api/inventory/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      console.log("Inventory update request:", {
        itemId: req.params.id,
        userId,
        body: req.body
      });
      
      // Convert date strings to Date objects if needed
      if (req.body.dateAcquired && typeof req.body.dateAcquired === 'string') {
        req.body.dateAcquired = new Date(req.body.dateAcquired);
      }
      if (req.body.dateListed && typeof req.body.dateListed === 'string') {
        req.body.dateListed = new Date(req.body.dateListed);
      }
      if (req.body.dateSold && typeof req.body.dateSold === 'string') {
        req.body.dateSold = new Date(req.body.dateSold);
      }
      
      const validatedData = insertInventoryItemSchema.partial().parse(req.body);
      console.log("Validated inventory data:", validatedData);
      
      const item = await storage.updateInventoryItem(req.params.id, userId, validatedData);
      if (!item) {
        console.log("Inventory item not found for update:", req.params.id);
        return res.status(404).json({ message: "Item not found" });
      }
      
      console.log("Inventory item updated successfully:", item);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Inventory update validation error:", JSON.stringify(error.errors, null, 2));
        console.error("Request body:", JSON.stringify(req.body, null, 2));
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating inventory item:", error);
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete("/api/inventory/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deleteInventoryItem(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Sales routes
  app.get("/api/sales", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sales = await storage.getSalesRecords(userId);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sale = await storage.getSalesRecord(req.params.id, userId);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      console.error("Error fetching sale:", error);
      res.status(500).json({ message: "Failed to fetch sale" });
    }
  });

  app.post("/api/sales", isAuthenticated, checkTrialExpired, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Convert saleDate string to Date object if needed
      if (req.body.saleDate && typeof req.body.saleDate === 'string') {
        req.body.saleDate = new Date(req.body.saleDate);
      }
      
      const validatedData = insertSalesRecordSchema.parse(req.body);
      const sale = await storage.createSalesRecord({ ...validatedData, userId });
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Sales validation error:", JSON.stringify(error.errors, null, 2));
        console.error("Request body:", JSON.stringify(req.body, null, 2));
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  app.put("/api/sales/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      console.log("Sales update request:", {
        saleId: req.params.id,
        userId,
        body: req.body
      });
      
      // Convert saleDate string to Date object if needed
      if (req.body.saleDate && typeof req.body.saleDate === 'string') {
        req.body.saleDate = new Date(req.body.saleDate);
      }
      
      const validatedData = insertSalesRecordSchema.partial().parse(req.body);
      console.log("Validated data:", validatedData);
      
      const sale = await storage.updateSalesRecord(req.params.id, userId, validatedData);
      if (!sale) {
        console.log("Sale not found for update:", req.params.id);
        return res.status(404).json({ message: "Sale not found" });
      }
      
      console.log("Sale updated successfully:", sale);
      res.json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Sales update validation error:", JSON.stringify(error.errors, null, 2));
        console.error("Request body:", JSON.stringify(req.body, null, 2));
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating sale:", error);
      res.status(500).json({ message: "Failed to update sale" });
    }
  });

  app.delete("/api/sales/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deleteSalesRecord(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting sale:", error);
      res.status(500).json({ message: "Failed to delete sale" });
    }
  });

  // Advanced Reminders routes
  app.get("/api/reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { overdue, due } = req.query;
      
      let reminders;
      if (overdue === "true") {
        reminders = await storage.getOverdueReminders(userId);
      } else if (due === "true") {
        const settings = await storage.getNotificationSettings(userId);
        const leadTime = settings?.reminderLeadTime || 60;
        reminders = await storage.getDueReminders(userId, leadTime);
      } else {
        reminders = await storage.getReminders(userId);
      }
      
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.get("/api/reminders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reminder = await storage.getReminder(req.params.id, userId);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.json(reminder);
    } catch (error) {
      console.error("Error fetching reminder:", error);
      res.status(500).json({ message: "Failed to fetch reminder" });
    }
  });

  app.post("/api/reminders", isAuthenticated, checkTrialExpired, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder({ ...validatedData, userId });
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating reminder:", error);
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  app.put("/api/reminders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertReminderSchema.partial().parse(req.body);
      const reminder = await storage.updateReminder(req.params.id, userId, validatedData);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating reminder:", error);
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });

  app.delete("/api/reminders/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deleteReminder(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  // Expense routes
  app.get("/api/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expenses = await storage.getExpenses(userId);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expense = await storage.getExpense(req.params.id, userId);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      console.error("Error fetching expense:", error);
      res.status(500).json({ message: "Failed to fetch expense" });
    }
  });

  app.post("/api/expenses", isAuthenticated, checkTrialExpired, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Convert date strings to Date objects if needed
      if (req.body.expenseDate && typeof req.body.expenseDate === 'string') {
        req.body.expenseDate = new Date(req.body.expenseDate);
      }
      
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense({ ...validatedData, userId });
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Expense validation error:", JSON.stringify(error.errors, null, 2));
        console.error("Request body:", JSON.stringify(req.body, null, 2));
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.put("/api/expenses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(req.params.id, userId, validatedData);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating expense:", error);
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.deleteExpense(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Snooze reminder route
  app.post("/api/reminders/:id/snooze", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { minutes } = req.body;
      const reminder = await storage.snoozeReminder(req.params.id, userId, minutes || 15);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      res.json(reminder);
    } catch (error) {
      console.error("Error snoozing reminder:", error);
      res.status(500).json({ message: "Failed to snooze reminder" });
    }
  });

  // Notification settings routes
  app.get("/api/notification-settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getNotificationSettings(userId);
      // Return default settings if none exist
      const defaultSettings = {
        browserNotifications: true,
        emailNotifications: false,
        reminderLeadTime: 60,
        dailyDigest: false,
        weeklyReport: true,
        lowStockAlerts: true,
        profitGoalAlerts: true,
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00",
        timezone: "UTC",
      };
      res.json(settings || defaultSettings);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.put("/api/notification-settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertNotificationSettingsSchema.parse(req.body);
      const settings = await storage.upsertNotificationSettings({ ...validatedData, userId });
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  // Reports routes
  app.get('/api/reports/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { dateRange, startDate, endDate, platform, category } = req.query;
      
      // Calculate date range
      let fromDate: Date;
      let toDate: Date = new Date();
      
      switch (dateRange) {
        case '7d':
          fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3m':
          fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          fromDate = new Date(new Date().getFullYear(), 0, 1);
          break;
        case 'month':
          fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          break;
        default:
          fromDate = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          toDate = endDate ? new Date(endDate as string) : new Date();
      }

      const userSales = await storage.getSalesByUserId(userId);
      const userInventory = await storage.getInventoryByUserId(userId);
      
      // Filter sales by date range and other criteria
      const filteredSales = userSales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        const dateInRange = saleDate >= fromDate && saleDate <= toDate;
        const platformMatch = !platform || platform === 'all' || sale.platform === platform;
        const categoryMatch = !category || category === 'all' || userInventory.find(item => item.title === sale.itemTitle)?.category === category;
        return dateInRange && platformMatch && categoryMatch;
      });

      // Calculate metrics
      const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.salePrice), 0);
      
      // Calculate profit dynamically using the same method as dashboard
      const totalProfit = filteredSales.reduce((sum, sale) => {
        const profit = parseFloat(sale.salePrice || "0") - 
                      parseFloat(sale.purchasePrice || "0") - 
                      parseFloat(sale.platformFee || "0") - 
                      parseFloat(sale.shippingCost || "0");
        return sum + profit;
      }, 0);
      const totalSales = filteredSales.length;
      const averageProfit = totalSales > 0 ? totalProfit / totalSales : 0;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      // Top selling items
      const itemSales = new Map<string, { quantity: number, revenue: number, profit: number }>();
      filteredSales.forEach(sale => {
        const current = itemSales.get(sale.itemTitle) || { quantity: 0, revenue: 0, profit: 0 };
        const profit = parseFloat(sale.salePrice || "0") - 
                      parseFloat(sale.purchasePrice || "0") - 
                      parseFloat(sale.platformFee || "0") - 
                      parseFloat(sale.shippingCost || "0");
        itemSales.set(sale.itemTitle, {
          quantity: current.quantity + 1,
          revenue: current.revenue + parseFloat(sale.salePrice),
          profit: current.profit + profit
        });
      });

      const topSellingItems = Array.from(itemSales.entries())
        .map(([title, data]) => ({
          title,
          quantity: data.quantity,
          revenue: data.revenue.toFixed(2),
          profit: data.profit.toFixed(2)
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Sales by platform
      const platformSales = new Map<string, { count: number, revenue: number }>();
      filteredSales.forEach(sale => {
        const platform = sale.platform || "Unknown";
        const current = platformSales.get(platform) || { count: 0, revenue: 0 };
        platformSales.set(platform, {
          count: current.count + 1,
          revenue: current.revenue + parseFloat(sale.salePrice)
        });
      });

      const salesByPlatform = Array.from(platformSales.entries())
        .map(([platform, data]) => ({
          platform,
          count: data.count,
          revenue: data.revenue.toFixed(2)
        }))
        .sort((a, b) => b.count - a.count);

      // Monthly trends (last 12 months)
      const monthlyData = new Map<string, { sales: number, profit: number }>();
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date;
      }).reverse();

      last12Months.forEach(month => {
        const monthKey = month.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        const monthSales = filteredSales.filter(sale => {
          const saleDate = new Date(sale.saleDate);
          return saleDate.getMonth() === month.getMonth() && saleDate.getFullYear() === month.getFullYear();
        });
        
        monthlyData.set(monthKey, {
          sales: monthSales.length,
          profit: monthSales.reduce((sum, sale) => sum + parseFloat(sale.profit), 0)
        });
      });

      const monthlyTrends = Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        sales: data.sales,
        profit: data.profit.toFixed(2)
      }));

      const metrics = {
        totalRevenue: totalRevenue.toFixed(2),
        totalProfit: totalProfit.toFixed(2),
        totalSales,
        averageProfit: averageProfit.toFixed(2),
        profitMargin: profitMargin.toFixed(1),
        topSellingItems,
        salesByPlatform,
        monthlyTrends
      };

      res.json(metrics);
    } catch (error) {
      console.error('Error generating report metrics:', error);
      res.status(500).json({ message: 'Failed to generate report metrics' });
    }
  });

  app.get('/api/reports/export', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { format } = req.query;
      
      if (format === 'csv') {
        const userSales = await storage.getSalesByUserId(userId);
        const csvHeader = 'Date,Item,Platform,Sale Price,Purchase Price,Profit,Buyer\n';
        const csvRows = userSales.map(sale => 
          `${sale.saleDate},${sale.itemTitle},${sale.platform},${sale.salePrice},${sale.purchasePrice || '0'},${sale.profit},${sale.buyerInfo || ''}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="sales-report.csv"');
        res.send(csvHeader + csvRows);
      } else {
        res.status(400).json({ message: 'Unsupported export format' });
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      res.status(500).json({ message: 'Failed to export report' });
    }
  });

  // User settings routes
  app.put("/api/user/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { monthlyGoal, salesTaxRate, taxInclusiveSales } = req.body;
      
      console.log("Settings update request:", {
        userId,
        monthlyGoal,
        salesTaxRate,
        taxInclusiveSales
      });
      
      const user = await storage.getUser(userId);
      if (!user) {
        console.log("User not found:", userId);
        return res.status(404).json({ message: "User not found" });
      }

      const updateData: any = { ...user };
      if (monthlyGoal !== undefined) updateData.monthlyGoal = monthlyGoal?.toString();
      if (salesTaxRate !== undefined) updateData.salesTaxRate = salesTaxRate?.toString();
      if (taxInclusiveSales !== undefined) updateData.taxInclusiveSales = taxInclusiveSales;

      console.log("Update data:", updateData);

      const updatedUser = await storage.upsertUser(updateData);
      
      console.log("Updated user result:", updatedUser);

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });



  // Pallets routes
  app.get("/api/pallets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pallets = await storage.getPallets(userId);
      res.json(pallets);
    } catch (error) {
      console.error("Error fetching pallets:", error);
      res.status(500).json({ message: "Failed to fetch pallets" });
    }
  });

  app.get("/api/pallets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const pallet = await storage.getPallet(id, userId);
      
      if (!pallet) {
        return res.status(404).json({ message: "Pallet not found" });
      }
      
      res.json(pallet);
    } catch (error) {
      console.error("Error fetching pallet:", error);
      res.status(500).json({ message: "Failed to fetch pallet" });
    }
  });

  app.post("/api/pallets", isAuthenticated, checkTrialExpired, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Convert date strings to Date objects
      if (req.body.purchaseDate && typeof req.body.purchaseDate === 'string') {
        req.body.purchaseDate = new Date(req.body.purchaseDate);
      }
      
      const palletData = insertPalletSchema.parse(req.body);
      
      const pallet = await storage.createPallet({
        ...palletData,
        userId,
      });
      
      res.status(201).json(pallet);
    } catch (error) {
      console.error("Error creating pallet:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pallet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pallet" });
    }
  });

  app.put("/api/pallets/:id", isAuthenticated, checkTrialExpired, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Convert date strings to Date objects
      if (req.body.purchaseDate && typeof req.body.purchaseDate === 'string') {
        req.body.purchaseDate = new Date(req.body.purchaseDate);
      }
      
      const palletData = insertPalletSchema.partial().parse(req.body);
      
      const pallet = await storage.updatePallet(id, userId, palletData);
      
      if (!pallet) {
        return res.status(404).json({ message: "Pallet not found" });
      }
      
      res.json(pallet);
    } catch (error) {
      console.error("Error updating pallet:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pallet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update pallet" });
    }
  });

  app.delete("/api/pallets/:id", isAuthenticated, checkTrialExpired, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const deleted = await storage.deletePallet(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Pallet not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting pallet:", error);
      res.status(500).json({ message: "Failed to delete pallet" });
    }
  });

  // Object storage routes for receipt uploads
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub || "";
    const { ObjectStorageService } = await import("./objectStorage");
    const objectStorageService = new ObjectStorageService();
    
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof Error && error.name === "ObjectNotFoundError") {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req: any, res) => {
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/receipt-images", isAuthenticated, async (req: any, res) => {
    if (!req.body.receiptImageURL) {
      return res.status(400).json({ error: "receiptImageURL is required" });
    }

    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.receiptImageURL,
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting receipt image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // OCR endpoint to analyze receipt images
  app.post("/api/analyze-receipt", isAuthenticated, async (req: any, res) => {
    if (!req.body.imageData) {
      return res.status(400).json({ error: "imageData is required" });
    }

    try {
      const { aiService } = await import("./aiService");
      
      // Remove data URL prefix if present (data:image/jpeg;base64,)
      const base64Data = req.body.imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const receiptData = await aiService.analyzeReceiptImage(base64Data);
      
      res.json(receiptData);
    } catch (error) {
      console.error("Error analyzing receipt:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to analyze receipt" });
    }
  });

  // Barcode lookup endpoint - calls external APIs server-side for security
  app.post("/api/barcode-lookup", isAuthenticated, async (req, res) => {
    try {
      const { upc } = req.body;
      
      if (!upc) {
        return res.status(400).json({ error: "UPC is required" });
      }

      let productData = null;
      
      // Try UPCItemDB (free trial, good retail coverage including Home Depot)
      try {
        const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`);
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const item = data.items[0];
            productData = {
              title: item.title,
              brand: item.brand,
              description: item.description,
              category: item.category,
              source: 'UPCItemDB',
              retailer: item.brand?.toLowerCase().includes('depot') ? 'Home Depot' : undefined
            };
          }
        }
      } catch (e) {
        console.log('UPCItemDB failed, trying Barcode Lookup');
      }

      // Fallback to Barcode Lookup (demo key, good Home Depot coverage)
      if (!productData) {
        try {
          const response = await fetch(`https://api.barcodelookup.com/v3/products?barcode=${upc}&formatted=y&key=demo`);
          if (response.ok) {
            const data = await response.json();
            if (data.products && data.products.length > 0) {
              const product = data.products[0];
              productData = {
                title: product.product_name || product.title,
                brand: product.brand,
                description: product.description,
                category: product.category,
                source: 'Barcode Lookup',
                retailer: product.brand?.toLowerCase().includes('depot') ? 'Home Depot' : undefined
              };
            }
          }
        } catch (e) {
          console.log('Barcode Lookup failed, trying Go-UPC');
        }
      }

      // Third fallback - Go-UPC (public API, 1 billion products, excellent Home Depot coverage)
      if (!productData) {
        try {
          const response = await fetch(`https://go-upc.com/api/v1/code/${upc}`);
          if (response.ok) {
            const data = await response.json();
            if (data.product) {
              productData = {
                title: data.product.name,
                brand: data.product.brand,
                description: data.product.description,
                category: data.product.category,
                source: 'Go-UPC',
                retailer: data.product.brand?.toLowerCase().includes('depot') ? 'Home Depot' : undefined
              };
            }
          }
        } catch (e) {
          console.log('Go-UPC failed - all APIs exhausted');
        }
      }

      if (productData) {
        res.json(productData);
      } else {
        res.status(404).json({ error: "Product not found in any database" });
      }
    } catch (error) {
      console.error("Error in barcode lookup:", error);
      res.status(500).json({ error: "Failed to lookup product" });
    }
  });

  // Stale inventory analysis endpoint
  app.get("/api/inventory/stale-analysis", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const staleItems = await storage.getStaleInventoryAnalysis(userId);
      res.json(staleItems);
    } catch (error) {
      console.error("Error fetching stale inventory:", error);
      res.status(500).json({ error: "Failed to analyze stale inventory" });
    }
  });

  // PayPal routes
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  const httpServer = createServer(app);
  return httpServer;
}
