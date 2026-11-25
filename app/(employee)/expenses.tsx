import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  Receipt,
  Camera,
  Fuel,
  Utensils,
  Hotel,
  Wrench,
  CheckCircle2,
} from "lucide-react-native";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../components/LiquidGlass";

export default function ExpensesScreen() {
  const [activeTab, setActiveTab] = useState<"claims" | "new">("claims");
  const [expenseType, setExpenseType] = useState("Fuel & Travel");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [receiptAttached, setReceiptAttached] = useState(false);

  const [expenses, setExpenses] = useState<any[]>([]);

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
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
          <LiquidGlassIconButton
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
            variant="dark"
            size={42}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>Field Expense Claims</Text>
          <View style={{ width: 42 }} />
        </View>

        {/* TOP SUMMARY CARD */}
        <LiquidGlassCard
          variant="dark"
          borderRadius={24}
          dropletColor="#10b981"
          style={{ marginHorizontal: 20, marginBottom: 20 }}
          contentStyle={{ padding: 20 }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12, letterSpacing: 1 }}>OCTOBER CLAIMS</Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 32, marginTop: 2 }}>
                ₹{totalClaimed.toLocaleString()}
              </Text>
            </View>
            <LiquidGlassIconBadge size={48} borderRadius={16} variant="dark" tintColor="#10b981">
              <Receipt size={24} color="#10b981" />
            </LiquidGlassIconBadge>
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 10, borderRadius: 12 }}>
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 10 }}>APPROVED</Text>
              <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 15, marginTop: 2 }}>₹450</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 10, borderRadius: 12 }}>
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 10 }}>UNDER REVIEW</Text>
              <Text style={{ color: "#f59e0b", fontFamily: "Brandon-Bold", fontSize: 15, marginTop: 2 }}>₹180</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", padding: 10, borderRadius: 12 }}>
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 10 }}>PAID OUT</Text>
              <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 15, marginTop: 2 }}>₹320</Text>
            </View>
          </View>
        </LiquidGlassCard>

        {/* TABS */}
        <View style={{ flexDirection: "row", marginHorizontal: 20, marginBottom: 20, gap: 10 }}>
          <LiquidGlassPill
            variant="dark"
            active={activeTab === "claims"}
            tintColor="rgba(16, 185, 129, 0.72)"
            onPress={() => setActiveTab("claims")}
            style={{ flex: 1 }}
            contentStyle={{ paddingVertical: 11, paddingHorizontal: 14 }}
          >
            <Text style={{ color: activeTab === "claims" ? "#ffffff" : "#cbd5e1", fontFamily: "Brandon-Bold", fontSize: 13 }}>
              My Claims ({expenses.length})
            </Text>
          </LiquidGlassPill>
          <LiquidGlassPill
            variant="dark"
            active={activeTab === "new"}
            tintColor="rgba(16, 185, 129, 0.72)"
            onPress={() => setActiveTab("new")}
            style={{ flex: 1 }}
            contentStyle={{ paddingVertical: 11, paddingHorizontal: 14 }}
          >
            <Text style={{ color: activeTab === "new" ? "#ffffff" : "#cbd5e1", fontFamily: "Brandon-Bold", fontSize: 13 }}>
              + Log New Claim
            </Text>
          </LiquidGlassPill>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          {activeTab === "claims" ? (
            <View style={{ gap: 12 }}>
              {expenses.map((item) => (
                <LiquidGlassCard
                  key={item.id}
                  variant="dark"
                  borderRadius={20}
                  dropletColor={item.statusColor}
                  contentStyle={{ padding: 16 }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>{item.category}</Text>
                        <View style={{ backgroundColor: `${item.statusColor}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ color: item.statusColor, fontFamily: "Brandon-Bold", fontSize: 10 }}>{item.status.toUpperCase()}</Text>
                        </View>
                      </View>
                      <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 4 }}>{item.date} • {item.id}</Text>
                    </View>
                    <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 18 }}>₹{item.amount}</Text>
                  </View>
                  {item.note && (
                    <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 10, backgroundColor: "rgba(255,255,255,0.06)", padding: 8, borderRadius: 8 }}>
                      {item.note}
                    </Text>
                  )}
                </LiquidGlassCard>
              ))}
            </View>
          ) : (
            <LiquidGlassCard
              variant="dark"
              borderRadius={24}
              contentStyle={{ padding: 20, gap: 18 }}
            >
              {/* Category Picker */}
              <View>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, marginBottom: 10 }}>EXPENSE CATEGORY</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {categories.map((c) => {
                    const Icon = c.icon;
                    const isSelected = expenseType === c.label;
                    return (
                      <LiquidGlassPill
                        key={c.label}
                        variant="dark"
                        active={isSelected}
                        tintColor="rgba(16, 185, 129, 0.72)"
                        onPress={() => setExpenseType(c.label)}
                        contentStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
                      >
                        <Icon size={14} color={isSelected ? "#ffffff" : c.color} style={{ marginRight: 6 }} />
                        <Text style={{ color: isSelected ? "#ffffff" : "#cbd5e1", fontFamily: "Brandon-Bold", fontSize: 12 }}>{c.label}</Text>
                      </LiquidGlassPill>
                    );
                  })}
                </View>
              </View>

              {/* Amount Input */}
              <View>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, marginBottom: 8 }}>AMOUNT (INR)</Text>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.06)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", paddingHorizontal: 16 }}>
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
                  style={{ height: 90, borderRadius: 16, borderStyle: "dashed", borderWidth: 1.5, borderColor: receiptAttached ? "#10b981" : "rgba(255,255,255,0.24)", backgroundColor: receiptAttached ? "rgba(16, 185, 129, 0.14)" : "rgba(255, 255, 255, 0.05)", alignItems: "center", justifyContent: "center", gap: 6 }}
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
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.06)", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", padding: 14, color: "#ffffff", fontFamily: "Brandon-Medium", fontSize: 13, height: 70 }}
                />
              </View>

              {/* Submit Button */}
              <LiquidGlassButton
                onPress={handleSubmitExpense}
                variant="tinted"
                tintColor="rgba(16, 185, 129, 0.78)"
                dropletColor="#34D399"
                style={{ marginTop: 8 }}
                contentStyle={{ paddingVertical: 15 }}
              >
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Submit for Approval</Text>
              </LiquidGlassButton>
            </LiquidGlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
