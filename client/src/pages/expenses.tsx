import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { type Expense } from "@shared/schema";
import ExpenseForm from "@/components/forms/expense-form";

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTaxType, setSelectedTaxType] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || expense.category === selectedCategory;
    const matchesTaxType = !selectedTaxType || selectedTaxType === "all" || expense.taxType === selectedTaxType;
    return matchesSearch && matchesCategory && matchesTaxType;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.total || "0"), 0);
  const totalTaxAmount = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.taxAmount || "0"), 0);
  const deductibleExpenses = filteredExpenses.filter(e => e.deductible).reduce((sum, expense) => sum + parseFloat(expense.total || "0"), 0);

  const categories = Array.from(new Set(expenses.map(e => e.category)));
  const taxTypes = Array.from(new Set(expenses.map(e => e.taxType)));

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const exportToCSV = () => {
    const csvHeaders = ["Date", "Title", "Category", "Vendor", "Subtotal", "Tax Rate", "Tax Amount", "Total", "Tax Type", "Deductible", "Business Purpose"];
    const csvData = filteredExpenses.map(expense => [
      expense.expenseDate ? format(new Date(expense.expenseDate), "yyyy-MM-dd") : "",
      expense.title,
      expense.category,
      expense.vendor || "",
      expense.subtotal,
      expense.taxRate,
      expense.taxAmount,
      expense.total,
      expense.taxType,
      expense.deductible ? "Yes" : "No",
      expense.businessPurpose || ""
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading expenses...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Business Expenses</h1>
          <p className="text-gray-600">Track and manage all your business expenses with tax calculations</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
            </DialogHeader>
            <ExpenseForm expense={editingExpense} onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tax Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTaxAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tax Deductible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${deductibleExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expense Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredExpenses.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedTaxType} onValueChange={setSelectedTaxType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Tax Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tax Types</SelectItem>
            {taxTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "none" ? "No Tax" : type === "inclusive" ? "Tax Inclusive" : "Tax Exclusive"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No expenses found. Start tracking your business expenses!</p>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEdit(expense)}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{expense.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                        {expense.businessPurpose && (
                          <p className="text-sm text-gray-500 mt-1"><span className="font-medium">Business Purpose:</span> {expense.businessPurpose}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{expense.expenseDate ? format(new Date(expense.expenseDate), "MMM d, yyyy") : "No date"}</span>
                          {expense.vendor && <span>• {expense.vendor}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${expense.total}</div>
                        {expense.taxType !== "none" && (
                          <div className="text-sm text-gray-500">
                            Tax: ${expense.taxAmount} ({expense.taxRate}%)
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary">{expense.category}</Badge>
                      <Badge variant={expense.taxType === "none" ? "outline" : "default"}>
                        {expense.taxType === "none" ? "No Tax" : expense.taxType === "inclusive" ? "Tax Inclusive" : "Tax Exclusive"}
                      </Badge>
                      {expense.deductible && (
                        <Badge variant="default" className="bg-green-100 text-green-800">Tax Deductible</Badge>
                      )}
                      {expense.tags && expense.tags.map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
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
  );
}