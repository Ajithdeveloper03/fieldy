import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  ShieldCheck,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  LockKeyhole,
  FileCheck2
} from "lucide-react-native";
import { useService } from "../../context/ServiceContext";

export default function SiteContactDocumentsScreen() {
  const { serviceConfig } = useService();

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="light-content" />

      {/* SECURE VAULT HEADER */}
      <View style={{ width: "100%", height: 260, backgroundColor: "#064e3b", borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        {/* Geometric secure pattern overlay */}
        <View style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.05)" }} />
        <View style={{ position: "absolute", bottom: -20, left: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(255,255,255,0.05)" }} />

        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 10 }}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(site-contact)/dashboard")} style={{ padding: 10, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16 }}>
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={{ padding: 10, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16 }}>
              <LockKeyhole size={20} color="#ffffff" />
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 32, lineHeight: 38 }}>
              {serviceConfig.label} Vault
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
              <ShieldCheck size={16} color="#4ade80" style={{ marginRight: 6 }} />
              <Text style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Brandon-Medium", fontSize: 15 }}>
                256-bit encrypted & Compliance Verified
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150, paddingTop: 24 }}>
        
        {/* PRIMARY DOCUMENTS - CAROUSEL */}
        <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>
          Identity & {serviceConfig.vocab.entitySingular} Deeds
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, paddingHorizontal: 24, paddingBottom: 24 }}>
          
          {/* Identity Card */}
          <View style={{ width: 260, backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginRight: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 5, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" }}>
                <FileText size={24} color={serviceConfig.color} />
              </View>
              <View style={{ backgroundColor: "#dcfce7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexDirection: "row", alignItems: "center" }}>
                <CheckCircle2 size={12} color="#16a34a" style={{ marginRight: 4 }} />
                <Text style={{ color: "#16a34a", fontFamily: "Brandon-Bold", fontSize: 11 }}>VERIFIED</Text>
              </View>
            </View>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 4 }}>
              {serviceConfig.vocab.customerRole} Credential
            </Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, marginBottom: 20 }}>XXXX-XXXX-8942</Text>
            
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: "#f8fafc", paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <Eye size={16} color="#0f172a" style={{ marginRight: 6 }} />
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 13 }}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                <Download size={18} color="#0f172a" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Site Blueprint / Deed Card */}
          <View style={{ width: 260, backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginRight: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 5, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "#fffbeb", alignItems: "center", justifyContent: "center" }}>
                <FileCheck2 size={24} color="#f59e0b" />
              </View>
              <View style={{ backgroundColor: "#dcfce7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexDirection: "row", alignItems: "center" }}>
                <CheckCircle2 size={12} color="#16a34a" style={{ marginRight: 4 }} />
                <Text style={{ color: "#16a34a", fontFamily: "Brandon-Bold", fontSize: 11 }}>VERIFIED</Text>
              </View>
            </View>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 4 }}>
              {serviceConfig.vocab.entitySingular} Blueprint
            </Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, marginBottom: 20 }}>Doc No: 4921/2026</Text>
            
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: "#f8fafc", paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <Eye size={16} color="#0f172a" style={{ marginRight: 6 }} />
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 13 }}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                <Download size={18} color="#0f172a" />
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>

        {/* COMPLIANCE & CERTIFICATIONS - VERTICAL LIST */}
        <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>
          {serviceConfig.label} Accreditations & Audits
        </Text>
        
        <View style={{ gap: 16 }}>
          {/* Cert 1 */}
          <TouchableOpacity style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
              <ShieldCheck size={28} color="#10b981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 2 }}>ISO 9001 / Safety Compliance</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>Valid till: Dec 2027</Text>
            </View>
            <TouchableOpacity style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 12 }}>
              <Eye size={20} color="#0f172a" />
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Cert 2 */}
          <TouchableOpacity style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: `${serviceConfig.color}15`, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
              <FileCheck2 size={28} color={serviceConfig.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 2 }}>
                {serviceConfig.label} SLA Audit Certificate
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>Audited: Oct 2026</Text>
            </View>
            <TouchableOpacity style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 12 }}>
              <Eye size={20} color="#0f172a" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}