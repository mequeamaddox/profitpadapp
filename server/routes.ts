import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { checkTrialExpired } from "./trialMiddleware";
import {
  insertInventoryItemSchema,
  insertSalesRecordSchema,
  insertReminderSchema,
  insertExpenseSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
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
      const validatedData = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem({ ...validatedData, userId });
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating inventory item:", error);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.put("/api/inventory/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertInventoryItemSchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(req.params.id, userId, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
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
      const validatedData = insertSalesRecordSchema.parse(req.body);
      const sale = await storage.createSalesRecord({ ...validatedData, userId });
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  app.put("/api/sales/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertSalesRecordSchema.partial().parse(req.body);
      const sale = await storage.updateSalesRecord(req.params.id, userId, validatedData);
      if (!sale) {
        return res.status(404).json({ message: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
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

  // Reminder routes
  app.get("/api/reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { overdue } = req.query;
      
      let reminders;
      if (overdue === "true") {
        reminders = await storage.getOverdueReminders(userId);
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
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense({ ...validatedData, userId });
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
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
      const totalProfit = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.profit), 0);
      const totalSales = filteredSales.length;
      const averageProfit = totalSales > 0 ? totalProfit / totalSales : 0;
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      // Top selling items
      const itemSales = new Map<string, { quantity: number, revenue: number, profit: number }>();
      filteredSales.forEach(sale => {
        const current = itemSales.get(sale.itemTitle) || { quantity: 0, revenue: 0, profit: 0 };
        itemSales.set(sale.itemTitle, {
          quantity: current.quantity + 1,
          revenue: current.revenue + parseFloat(sale.salePrice),
          profit: current.profit + parseFloat(sale.profit)
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
        const current = platformSales.get(sale.platform) || { count: 0, revenue: 0 };
        platformSales.set(sale.platform, {
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
      const { monthlyGoal } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.upsertUser({
        ...user,
        monthlyGoal: monthlyGoal?.toString(),
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
