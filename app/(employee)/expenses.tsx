import React, { useEffect, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { getAuthUser } from "../../services/api";
import { pickImageAsset, uploadMediaAsset } from "../../services/media";
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
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const [storageKey, setStorageKey] = useState("@fieldy_expenses_default");
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const user = await getAuthUser();
      const key = `@fieldy_expenses_${user?.id || "staff"}`;
      setStorageKey(key);
      const raw = await AsyncStorage.getItem(key);
      setExpenses(raw ? JSON.parse(raw) : []);
    })();
  }, []);

  const categories = [
    { label: "Fuel & Travel", icon: Fuel, color: "#f97316" },
    { label: "Field Meals", icon: Utensils, color: "#10b981" },
    { label: "Lodging & Stay", icon: Hotel, color: "#3b82f6" },
    { label: "Tools & Equipment", icon: Wrench, color: "#8b5cf6" },
  ];

  const attachReceipt = async () => {
    try {
      const picked = await pickImageAsset("library");
      if (!picked) return;
      setReceiptName(picked.name);
      await uploadMediaAsset({ asset: picked, title: `Expense Receipt - ${expenseType}` }).catch(() => {});
    } catch {
      // Ignore picker cancel
    }
  };

  const handleSubmitExpense = async () => {
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Missing Amount", "Please enter a valid expense amount in Rupees.");
      return;
    }

    const newExpense = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      category: expenseType,
      amount: String(Number(amount)),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "Submitted",
      statusColor: "#f59e0b",
      note: note.trim() || `${expenseType} claim`,
    };

    const next = [newExpense, ...expenses];
    setExpenses(next);
    await AsyncStorage.setItem(storageKey, JSON.stringify(next));
    setAmount("");
    setNote("");
    setReceiptName(null);
    setActiveTab("claims");
    Alert.alert("Claim Logged", "Your field expense entry has been recorded.");
  };

  const totalClaimed = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
          <LiquidGlassIconButton
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
            variant="dark"
            size={42}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 19 }}>Field Expense Claims</Text>
          <View style={{ width: 42 }} />
        </View>

        <LiquidGlassCard
          variant="dark"
          borderRadius={24}
          dropletColor="#10b981"
          style={{ marginHorizontal: 20, marginBottom: 18 }}
          contentStyle={{ padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <View>
            <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 11, letterSpacing: 1 }}>
              TOTAL LOGGED CLAIMS
            </Text>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 30, marginTop: 4 }}>
              ₹{totalClaimed.toLocaleString()}
            </Text>
          </View>
          <LiquidGlassIconBadge size={48} borderRadius={16} variant="dark" tintColor="#10b981">
            <Receipt size={24} color="#10b981" />
          </LiquidGlassIconBadge>
        </LiquidGlassCard>

        <View style={{ flexDirection: "row", marginHorizontal: 20, marginBottom: 18, gap: 10 }}>
          <LiquidGlassPill
            variant="dark"
            active={activeTab === "claims"}
            tintColor="rgba(16, 185, 129, 0.72)"
            onPress={() => setActiveTab("claims")}
            style={{ flex: 1 }}
            contentStyle={{ paddingVertical: 11 }}
          >
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13 }}>
              My Claims ({expenses.length})
            </Text>
          </LiquidGlassPill>
          <LiquidGlassPill
            variant="dark"
            active={activeTab === "new"}
            tintColor="rgba(16, 185, 129, 0.72)"
            onPress={() => setActiveTab("new")}
            style={{ flex: 1 }}
            contentStyle={{ paddingVertical: 11 }}
          >
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13 }}>
              + Log New Claim
            </Text>
          </LiquidGlassPill>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          {activeTab === "claims" ? (
            expenses.length > 0 ? (
              <View style={{ gap: 12 }}>
                {expenses.map((item) => (
                  <LiquidGlassCard key={item.id} variant="dark" borderRadius={20} contentStyle={{ padding: 16 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View>
                        <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>{item.category}</Text>
                        <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                          {item.date} • {item.id}
                        </Text>
                      </View>
                      <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 18 }}>₹{item.amount}</Text>
                    </View>
                    {item.note ? (
                      <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 8 }}>
                        {item.note}
                      </Text>
                    ) : null}
                  </LiquidGlassCard>
                ))}
              </View>
            ) : (
              <LiquidGlassCard variant="dark" borderRadius={22} contentStyle={{ padding: 26, alignItems: "center" }}>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                  No Expense Claims Logged Yet
                </Text>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                  Tap + Log New Claim above to record field travel or material expenses.
                </Text>
              </LiquidGlassCard>
            )
          ) : (
            <LiquidGlassCard variant="dark" borderRadius={24} contentStyle={{ padding: 20, gap: 16 }}>
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
                      <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 12 }}>{c.label}</Text>
                    </LiquidGlassPill>
                  );
                })}
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14, paddingHorizontal: 16 }}>
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

              <TouchableOpacity
                onPress={attachReceipt}
                style={{ height: 76, borderRadius: 14, borderStyle: "dashed", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.24)", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}
              >
                {receiptName ? (
                  <>
                    <CheckCircle2 size={18} color="#10b981" />
                    <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 13 }}>{receiptName}</Text>
                  </>
                ) : (
                  <>
                    <Camera size={18} color="#94a3b8" />
                    <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Medium", fontSize: 13 }}>Attach Bill / Receipt Photo</Text>
                  </>
                )}
              </TouchableOpacity>

              <TextInput
                placeholder="Purpose / trip remarks"
                placeholderTextColor="#64748b"
                value={note}
                onChangeText={setNote}
                multiline
                style={{ backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 14, color: "#ffffff", fontFamily: "Brandon-Medium", fontSize: 14, height: 72 }}
              />

              <LiquidGlassButton
                onPress={handleSubmitExpense}
                variant="tinted"
                tintColor="rgba(16, 185, 129, 0.82)"
                dropletColor="#34D399"
                contentStyle={{ paddingVertical: 15 }}
              >
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Submit Claim</Text>
              </LiquidGlassButton>
            </LiquidGlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
