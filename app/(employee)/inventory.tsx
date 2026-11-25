import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChevronLeft,
  Boxes,
  Plus,
  Minus,
  Search,
} from "lucide-react-native";
import { getAuthUser } from "../../services/api";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

export default function InventoryScreen() {
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("Units");
  const [storageKey, setStorageKey] = useState("@fieldy_inventory_default");
  const [items, setItems] = useState<Array<{ id: string; name: string; qty: number; unit: string }>>([]);

  useEffect(() => {
    (async () => {
      const user = await getAuthUser();
      const key = `@fieldy_inventory_${user?.id || "staff"}`;
      setStorageKey(key);
      const raw = await AsyncStorage.getItem(key);
      setItems(raw ? JSON.parse(raw) : []);
    })();
  }, []);

  const persist = async (next: typeof items) => {
    setItems(next);
    await AsyncStorage.setItem(storageKey, JSON.stringify(next));
  };

  const addItem = async () => {
    if (!newName.trim()) {
      Alert.alert("Item Name Required", "Enter a material or equipment name to track.");
      return;
    }
    const entry = {
      id: `MAT-${Date.now().toString().slice(-4)}`,
      name: newName.trim(),
      qty: 1,
      unit: newUnit.trim() || "Units",
    };
    await persist([entry, ...items]);
    setNewName("");
  };

  const adjustQty = async (id: string, delta: number) => {
    const next = items.map((item) =>
      item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
    );
    await persist(next);
  };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.trim().toLowerCase())
  );

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
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 19 }}>
            Field Kit & Materials
          </Text>
          <View style={{ width: 42 }} />
        </View>

        <View style={{ paddingHorizontal: 20, gap: 10, marginBottom: 16 }}>
          <LiquidGlassCard variant="dark" borderRadius={16} contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14 }}>
            <Search size={17} color="#94a3b8" />
            <TextInput
              placeholder="Search logged materials..."
              placeholderTextColor="#64748b"
              value={search}
              onChangeText={setSearch}
              style={{ flex: 1, height: 44, color: "#ffffff", fontFamily: "Brandon-Medium", fontSize: 14, marginLeft: 8 }}
            />
          </LiquidGlassCard>

          <LiquidGlassCard variant="dark" borderRadius={18} contentStyle={{ padding: 12, flexDirection: "row", gap: 8, alignItems: "center" }}>
            <TextInput
              placeholder="Add material / tool..."
              placeholderTextColor="#64748b"
              value={newName}
              onChangeText={setNewName}
              style={{ flex: 1, height: 40, color: "#ffffff", fontFamily: "Brandon-Medium", fontSize: 14, paddingHorizontal: 8 }}
            />
            <TextInput
              placeholder="Unit"
              placeholderTextColor="#64748b"
              value={newUnit}
              onChangeText={setNewUnit}
              style={{ width: 64, height: 40, color: "#cbd5e1", fontFamily: "Brandon-Bold", fontSize: 13, textAlign: "center" }}
            />
            <LiquidGlassButton
              onPress={addItem}
              variant="tinted"
              tintColor="rgba(16,185,129,0.8)"
              contentStyle={{ paddingHorizontal: 14, paddingVertical: 9 }}
            >
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13 }}>Add</Text>
            </LiquidGlassButton>
          </LiquidGlassCard>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 12 }}>
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <LiquidGlassCard key={item.id} variant="dark" borderRadius={20} contentStyle={{ padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 11 }}>{item.id}</Text>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16, marginTop: 2 }}>{item.name}</Text>
                  <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 2 }}>
                    {item.qty} {item.unit} on hand
                  </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <LiquidGlassIconButton variant="dark" size={36} onPress={() => adjustQty(item.id, -1)}>
                    <Minus size={16} color="#ffffff" />
                  </LiquidGlassIconButton>
                  <LiquidGlassIconButton variant="tinted" tintColor="rgba(16,185,129,0.75)" size={36} onPress={() => adjustQty(item.id, 1)}>
                    <Plus size={16} color="#ffffff" />
                  </LiquidGlassIconButton>
                </View>
              </LiquidGlassCard>
            ))
          ) : (
            <LiquidGlassCard variant="dark" borderRadius={22} contentStyle={{ padding: 28, alignItems: "center" }}>
              <Boxes size={34} color="#64748b" style={{ marginBottom: 10 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                No Kit Items Logged Yet
              </Text>
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                Add field tools or consumables above to track real stock in your vehicle.
              </Text>
            </LiquidGlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
