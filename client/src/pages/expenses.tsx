import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { type Expense } from "@shared/schema";
import ExpenseForm from "@/components/forms/expense-form";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function Expenses() {
  const { toast } = useToast();
  const { user, isLoading } = useAuthContext();
  const isAuthenticated = !!user;
  const [, setLocation] = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to continue.",
        variant: "destructive",
      });

      setTimeout(() => {
        setLocation("/login");
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast, setLocation]);

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
    enabled: isAuthenticated,
  });

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory ||
      selectedCategory === "all" ||
      expense.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount || "0"),
    0,
  );

  const deductibleExpenses = filteredExpenses
    .filter((e) => e.deductible)
    .reduce((sum, expense) => sum + parseFloat(expense.amount || "0"), 0);

  const categories = Array.from(
    new Set(expenses.map((e) => e.category).filter(Boolean)),
  );

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const exportToCSV = () => {
    const csvHeaders = [
      "Date",
      "Title",
      "Category",
      "Vendor",
      "Amount",
      "Deductible",
      "Business Purpose",
    ];

    const csvData = filteredExpenses.map((expense) => [
      expense.expenseDate
        ? format(new Date(expense.expenseDate), "yyyy-MM-dd")
        : "",
      expense.title,
      expense.category,
      expense.vendor || "",
      expense.amount,
      expense.deductible ? "Yes" : "No",
      expense.businessPurpose || "",
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Business Expenses"
          subtitle="Track and manage all your business expenses with comprehensive tax calculations"
        />

        <div
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
          style={{ paddingBottom: "150px" }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="hidden">
              <h1 className="text-3xl font-bold">Business Expenses</h1>
              <p className="text-gray-600">
                Track and manage all your business expenses with tax
                calculations
              </p>
            </div>

            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="shrink-0">
                  <Plus className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Add Expense</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 md:mx-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingExpense ? "Edit Expense" : "Add New Expense"}
                  </DialogTitle>
                </DialogHeader>
                <ExpenseForm
                  expense={editingExpense}
                  onSuccess={handleFormSuccess}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalExpenses.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Per Expense
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {filteredExpenses.length > 0
                    ? (totalExpenses / filteredExpenses.length).toFixed(2)
                    : "0.00"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tax Deductible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${deductibleExpenses.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Expense Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredExpenses.length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category!}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="space-y-4">
            {filteredExpenses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">
                    No expenses found. Start tracking your business expenses!
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredExpenses.map((expense) => (
                <Card
                  key={expense.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleEdit(expense)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {expense.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {expense.description}
                            </p>
                            {expense.businessPurpose && (
                              <p className="text-sm text-gray-500 mt-1">
                                <span className="font-medium">
                                  Business Purpose:
                                </span>{" "}
                                {expense.businessPurpose}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>
                                {expense.expenseDate
                                  ? format(
                                      new Date(expense.expenseDate),
                                      "MMM d, yyyy",
                                    )
                                  : "No date"}
                              </span>
                              {expense.vendor && (
                                <span>• {expense.vendor}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              ${expense.amount}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <Badge variant="secondary">{expense.category}</Badge>
                          {expense.deductible && (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              Tax Deductible
                            </Badge>
                          )}
                          {expense.tags &&
                            expense.tags.map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
