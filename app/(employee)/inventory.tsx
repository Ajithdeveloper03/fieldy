import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  Package,
  Boxes,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Search,
  ArrowRight,
  TrendingDown,
} from "lucide-react-native";
import {
  LiquidGlassBackdrop,
  LiquidGlassCard,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

export default function InventoryScreen() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([
    {
      id: "SKU-901",
      name: "Cement bags (50kg)",
      category: "Nutrients & Soil",
      qty: 14,
      unit: "Bags",
      threshold: 5,
      reserved: 2,
      price: "₹850",
    },
    {
      id: "SKU-902",
      name: "Safety helmets (Pack of 10)",
      category: "Planting Stock",
      qty: 48,
      unit: "Bundles",
      threshold: 10,
      reserved: 12,
      price: "₹1,200",
    },
    {
      id: "SKU-903",
      name: "Digital laser distance meter",
      category: "Field Equipment",
      qty: 3,
      unit: "Units",
      threshold: 2,
      reserved: 0,
      price: "₹2,400",
    },
    {
      id: "SKU-904",
      name: "High visibility safety vests (Pack of 10)",
      category: "Pest Protection",
      qty: 6,
      unit: "Bottles",
      threshold: 5,
      reserved: 1,
      price: "₹420",
    },
    {
      id: "SKU-905",
      name: "Safety barricade kit",
      category: "Site Safety Equipment",
      qty: 2,
      unit: "Kits",
      threshold: 4,
      reserved: 0,
      price: "₹1,650",
    },
  ]);

  const handleAdjustStock = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

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
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>Field Boot Kit & Materials</Text>
          <LiquidGlassIconButton
            onPress={() => Alert.alert("Barcode Scanner", "Point camera at item QR/Barcode sticker to identify material.")}
            variant="tinted"
            tintColor="rgba(16, 185, 129, 0.28)"
            dropletColor="#10b981"
            size={42}
          >
            <QrCode size={20} color="#34d399" />
          </LiquidGlassIconButton>
        </View>

        {/* SEARCH BAR */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <LiquidGlassCard
            variant="dark"
            borderRadius={16}
            contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14 }}
          >
            <Search size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search tools, materials, fertilisers..."
              placeholderTextColor="#64748b"
              value={search}
              onChangeText={setSearch}
              style={{ flex: 1, height: 44, color: "#ffffff", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 8 }}
            />
          </LiquidGlassCard>
        </View>

        {/* SUMMARY STATS */}
        <View style={{ flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 20 }}>
          <LiquidGlassCard
            variant="dark"
            borderRadius={18}
            style={{ flex: 1 }}
            contentStyle={{ padding: 14 }}
          >
            <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 11 }}>TOTAL SKUS</Text>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 22, marginTop: 2 }}>{items.length}</Text>
          </LiquidGlassCard>
          <LiquidGlassCard
            variant="dark"
            borderRadius={18}
            dropletColor="#f59e0b"
            style={{ flex: 1 }}
            contentStyle={{ padding: 14 }}
          >
            <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 11 }}>STOCK REQUISITION</Text>
            <Text style={{ color: "#f59e0b", fontFamily: "Brandon-Bold", fontSize: 22, marginTop: 2 }}>
              {items.filter((i) => i.qty <= i.threshold).length} Low
            </Text>
          </LiquidGlassCard>
        </View>

        {/* LIST */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 12 }}>
          {filteredItems.map((item) => {
            const isLow = item.qty <= item.threshold;
            return (
              <LiquidGlassCard
                key={item.id}
                variant="dark"
                borderRadius={20}
                dropletColor={isLow ? "#f59e0b" : undefined}
                contentStyle={{ padding: 16 }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 11 }}>{item.id}</Text>
                      {isLow && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(245, 158, 11, 0.2)", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                          <AlertTriangle size={10} color="#f59e0b" />
                          <Text style={{ color: "#f59e0b", fontFamily: "Brandon-Bold", fontSize: 9 }}>REFILL NEEDED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15, marginTop: 2 }}>{item.name}</Text>
                    <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>{item.category}</Text>
                  </View>
                  <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 15 }}>{item.price}</Text>
                </View>

                {/* Stock Controls */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }}>
                  <View>
                    <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                      {item.qty} {item.unit} in Van
                    </Text>
                    <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 11 }}>{item.reserved} allocated for today&apos;s visits</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <LiquidGlassIconButton
                      onPress={() => handleAdjustStock(item.id, -1)}
                      variant="dark"
                      size={36}
                    >
                      <Minus size={16} color="#ffffff" />
                    </LiquidGlassIconButton>
                    <LiquidGlassIconButton
                      onPress={() => handleAdjustStock(item.id, 1)}
                      variant="tinted"
                      tintColor="rgba(16, 185, 129, 0.72)"
                      dropletColor="#34d399"
                      size={36}
                    >
                      <Plus size={16} color="#ffffff" />
                    </LiquidGlassIconButton>
                  </View>
                </View>
              </LiquidGlassCard>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
