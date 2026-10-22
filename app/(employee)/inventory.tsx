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

export default function InventoryScreen() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([
    {
      id: "SKU-901",
      name: "Organic Bio-Fertilizer (50kg)",
      category: "Nutrients & Soil",
      qty: 14,
      unit: "Bags",
      threshold: 5,
      reserved: 2,
      price: "₹850",
    },
    {
      id: "SKU-902",
      name: "Premium Vetiver Slips (Pack of 100)",
      category: "Planting Stock",
      qty: 48,
      unit: "Bundles",
      threshold: 10,
      reserved: 12,
      price: "₹1,200",
    },
    {
      id: "SKU-903",
      name: "Digital Soil pH & Moisture Meter",
      category: "Field Equipment",
      qty: 3,
      unit: "Units",
      threshold: 2,
      reserved: 0,
      price: "₹2,400",
    },
    {
      id: "SKU-904",
      name: "Neem Seed Oil Extract (1L)",
      category: "Pest Protection",
      qty: 6,
      unit: "Bottles",
      threshold: 5,
      reserved: 1,
      price: "₹420",
    },
    {
      id: "SKU-905",
      name: "Drip Irrigation Micro-Nozzle Kits",
      category: "Irrigation Hardware",
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
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>Field Boot Kit & Materials</Text>
          <TouchableOpacity
            onPress={() => Alert.alert("Barcode Scanner", "Point camera at item QR/Barcode sticker to identify material.")}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(16, 185, 129, 0.2)", alignItems: "center", justifyContent: "center" }}
          >
            <QrCode size={20} color="#10b981" />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(30, 41, 59, 0.8)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", paddingHorizontal: 14 }}>
            <Search size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search tools, materials, fertilisers..."
              placeholderTextColor="#64748b"
              value={search}
              onChangeText={setSearch}
              style={{ flex: 1, height: 44, color: "#ffffff", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 8 }}
            />
          </View>
        </View>

        {/* SUMMARY STATS */}
        <View style={{ flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: "rgba(30, 41, 59, 0.8)", padding: 14, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 11 }}>TOTAL SKUS</Text>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 22, marginTop: 2 }}>{items.length}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "rgba(30, 41, 59, 0.8)", padding: 14, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 11 }}>STOCK REQUISITION</Text>
            <Text style={{ color: "#f59e0b", fontFamily: "Brandon-Bold", fontSize: 22, marginTop: 2 }}>
              {items.filter((i) => i.qty <= i.threshold).length} Low
            </Text>
          </View>
        </View>

        {/* LIST */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 12 }}>
          {filteredItems.map((item) => {
            const isLow = item.qty <= item.threshold;
            return (
              <View
                key={item.id}
                style={{ backgroundColor: "rgba(30, 41, 59, 0.7)", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: isLow ? "rgba(245, 158, 11, 0.3)" : "rgba(255,255,255,0.08)" }}
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
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" }}>
                  <View>
                    <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                      {item.qty} {item.unit} in Van
                    </Text>
                    <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 11 }}>{item.reserved} allocated for today's visits</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleAdjustStock(item.id, -1)}
                      style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}
                    >
                      <Minus size={16} color="#ffffff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleAdjustStock(item.id, 1)}
                      style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#10b981", alignItems: "center", justifyContent: "center" }}
                    >
                      <Plus size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
