import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  Receipt,
  Plus,
  Camera,
  Fuel,
  Utensils,
  Hotel,
  Wrench,
  CheckCircle2,
  Clock,
  Calendar,
  IndianRupee,
  X,
} from "lucide-react-native";

export default function ExpensesScreen() {
  const [activeTab, setActiveTab] = useState<"claims" | "new">("claims");
  const [expenseType, setExpenseType] = useState("Fuel & Travel");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [receiptAttached, setReceiptAttached] = useState(false);

  const [expenses, setExpenses] = useState([
    {
      id: "EXP-101",
      category: "Fuel & Travel",
      amount: "450",
      date: "Today, 11:30 AM",
      status: "Approved",
      statusColor: "#10b981",
      note: "Two-wheeler fuel for Palladam sector audit",
    },
    {
      id: "EXP-102",
      category: "Field Meals",
      amount: "180",
      date: "Yesterday",
      status: "Pending",
      statusColor: "#f59e0b",
      note: "Lunch during Pollachi farmer registrations",
    },
    {
      id: "EXP-103",
      category: "Equipment Maintenance",
      amount: "320",
      date: "12 Oct 2026",
      status: "Reimbursed",
      statusColor: "#3b82f6",
      note: "Soil moisture meter battery replacement",
    },
  ]);

  const categories = [
    { label: "Fuel & Travel", icon: Fuel, color: "#f97316" },
    { label: "Field Meals", icon: Utensils, color: "#10b981" },
    { label: "Lodging & Stay", icon: Hotel, color: "#3b82f6" },
    { label: "Tools & Equipment", icon: Wrench, color: "#8b5cf6" },
  ];

  const handleSubmitExpense = () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("Missing Amount", "Please enter a valid expense amount in Rupees.");
      return;
    }

    const newExpense = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      category: expenseType,
      amount: amount,
      date: "Just Now",
      status: "Pending Approval",
      statusColor: "#f59e0b",
      note: note || "Routine field allowance claim",
    };

    setExpenses([newExpense, ...expenses]);
    setAmount("");
    setNote("");
    setReceiptAttached(false);
    setActiveTab("claims");
    Alert.alert("Claim Submitted!", "Your expense claim has been logged and sent to your manager for approval.");
  };

  const totalClaimed = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>Field Expense Claims</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* TOP SUMMARY CARD */}
        <View style={{ marginHorizontal: 20, marginBottom: 20, padding: 20, backgroundColor: "rgba(30, 41, 59, 0.8)", borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12, letterSpacing: 1 }}>OCTOBER CLAIMS</Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 32, marginTop: 2 }}>
                ₹{totalClaimed.toLocaleString()}
              </Text>
            </View>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "rgba(16, 185, 129, 0.15)", alignItems: "center", justifyContent: "center" }}>
              <Receipt size={24} color="#10b981" />
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 12 }}>
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 10 }}>APPROVED</Text>
              <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 15, marginTop: 2 }}>₹450</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 12 }}>
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 10 }}>UNDER REVIEW</Text>
              <Text style={{ color: "#f59e0b", fontFamily: "Brandon-Bold", fontSize: 15, marginTop: 2 }}>₹180</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 12 }}>
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 10 }}>PAID OUT</Text>
              <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 15, marginTop: 2 }}>₹320</Text>
            </View>
          </View>
        </View>

        {/* TABS */}
        <View style={{ flexDirection: "row", marginHorizontal: 20, backgroundColor: "rgba(15, 23, 42, 0.6)", borderRadius: 16, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
          <TouchableOpacity
            onPress={() => setActiveTab("claims")}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: activeTab === "claims" ? "#10b981" : "transparent", alignItems: "center" }}
          >
            <Text style={{ color: activeTab === "claims" ? "#ffffff" : "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 13 }}>
              My Claims ({expenses.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("new")}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: activeTab === "new" ? "#10b981" : "transparent", alignItems: "center" }}
          >
            <Text style={{ color: activeTab === "new" ? "#ffffff" : "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 13 }}>
              + Log New Claim
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          {activeTab === "claims" ? (
            <View style={{ gap: 12 }}>
              {expenses.map((item) => (
                <View
                  key={item.id}
                  style={{ backgroundColor: "rgba(30, 41, 59, 0.7)", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>{item.category}</Text>
                        <View style={{ backgroundColor: `${item.statusColor}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ color: item.statusColor, fontFamily: "Brandon-Bold", fontSize: 10 }}>{item.status.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 4 }}>{item.date} • {item.id}</Text>
                    </div>
                    <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 18 }}>₹{item.amount}</Text>
                  </View>
                  {item.note && (
                    <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 10, backgroundColor: "rgba(255,255,255,0.03)", padding: 8, borderRadius: 8 }}>
                      {item.note}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={{ backgroundColor: "rgba(30, 41, 59, 0.8)", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", gap: 18 }}>
              {/* Category Picker */}
              <View>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, marginBottom: 10 }}>EXPENSE CATEGORY</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {categories.map((c) => {
                    const Icon = c.icon;
                    const isSelected = expenseType === c.label;
                    return (
                      <TouchableOpacity
                        key={c.label}
                        onPress={() => setExpenseType(c.label)}
                        style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: isSelected ? "#10b981" : "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: isSelected ? "#10b981" : "rgba(255,255,255,0.1)" }}
                      >
                        <Icon size={14} color={isSelected ? "#ffffff" : c.color} />
                        <Text style={{ color: isSelected ? "#ffffff" : "#cbd5e1", fontFamily: "Brandon-Bold", fontSize: 12 }}>{c.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Amount Input */}
              <View>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, marginBottom: 8 }}>AMOUNT (INR)</Text>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(15, 23, 42, 0.8)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", paddingHorizontal: 16 }}>
                  <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 20, marginRight: 8 }}>₹</Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#64748b"
                    value={amount}
                    onChangeText={setAmount}
                    style={{ flex: 1, height: 50, color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}
                  />
                </View>
              </View>

              {/* Receipt Upload simulation */}
              <View>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, marginBottom: 8 }}>PROOF OF BILL / RECEIPT</Text>
                <TouchableOpacity
                  onPress={() => setReceiptAttached(!receiptAttached)}
                  style={{ height: 90, borderRadius: 16, borderStyle: "dashed", borderWidth: 1.5, borderColor: receiptAttached ? "#10b981" : "rgba(255,255,255,0.2)", backgroundColor: receiptAttached ? "rgba(16, 185, 129, 0.1)" : "rgba(15, 23, 42, 0.5)", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  {receiptAttached ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <CheckCircle2 size={20} color="#10b981" />
                      <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 13 }}>Receipt_Bill_2026.jpg attached</Text>
                    </View>
                  ) : (
                    <>
                      <Camera size={22} color="#94a3b8" />
                      <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Medium", fontSize: 12 }}>Tap to snap bill receipt</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Remarks Input */}
              <View>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, marginBottom: 8 }}>REMARKS / PURPOSE</Text>
                <TextInput
                  placeholder="e.g. Fuel for 45 km round trip to customer sites"
                  placeholderTextColor="#64748b"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={2}
                  style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", padding: 14, color: "#ffffff", fontFamily: "Brandon-Medium", fontSize: 13, height: 70 }}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmitExpense}
                style={{ backgroundColor: "#10b981", borderRadius: 16, height: 52, alignItems: "center", justifyContent: "center", marginTop: 8 }}
              >
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Submit for Approval</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
