import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { apiClient } from "../api/client";

export interface LocalMediaAsset {
  uri: string;
  name: string;
  mimeType: string;
  category: "image" | "video" | "document";
  durationMs?: number | null;
  fileSize?: number | null;
}

export interface ServerMediaFile {
  id: number;
  category: "image" | "video" | "document";
  title: string;
  original_name: string;
  mime_type?: string | null;
  size_bytes: number;
  size_human: string;
  visit_id?: number | null;
  task_id?: number | null;
  farmer_id?: number | null;
  uploader_name: string;
  preview_url: string;
  download_url: string;
  created_at?: string | null;
  date_label: string;
}

const guessFilename = (uri: string, fallbackExt: string, prefix: string): string => {
  const raw = uri.split("/").pop()?.split("?")[0] || "";
  if (raw && raw.includes(".")) return raw;
  return `${prefix}-${Date.now()}.${fallbackExt}`;
};

export async function pickImageAsset(
  source: "camera" | "library" = "library"
): Promise<LocalMediaAsset | null> {
  if (source === "camera") {
    const camPerm = await ImagePicker.requestCameraPermissionsAsync();
    if (!camPerm.granted) {
      return pickImageAsset("library");
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.45,
      exif: false,
    });
    if (res.canceled || !res.assets?.[0]?.uri) return null;
    const asset = res.assets[0];
    return {
      uri: asset.uri,
      name: asset.fileName || guessFilename(asset.uri, "jpg", "photo"),
      mimeType: asset.mimeType || "image/jpeg",
      category: "image",
      fileSize: asset.fileSize ?? null,
    };
  }

  const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!libPerm.granted) return null;

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.45,
    exif: false,
  });
  if (res.canceled || !res.assets?.[0]?.uri) return null;
  const asset = res.assets[0];
  return {
    uri: asset.uri,
    name: asset.fileName || guessFilename(asset.uri, "jpg", "photo"),
    mimeType: asset.mimeType || "image/jpeg",
    category: "image",
    fileSize: asset.fileSize ?? null,
  };
}

export async function pickVideoAsset(
  source: "camera" | "library" = "library"
): Promise<LocalMediaAsset | null> {
  if (source === "camera") {
    const camPerm = await ImagePicker.requestCameraPermissionsAsync();
    if (!camPerm.granted) {
      return pickVideoAsset("library");
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ["videos"],
      videoMaxDuration: 60,
      quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });
    if (res.canceled || !res.assets?.[0]?.uri) return null;
    const asset = res.assets[0];
    return {
      uri: asset.uri,
      name: asset.fileName || guessFilename(asset.uri, "mp4", "video"),
      mimeType: asset.mimeType || "video/mp4",
      category: "video",
      durationMs: asset.duration ?? null,
      fileSize: asset.fileSize ?? null,
    };
  }

  const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!libPerm.granted) return null;

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["videos"],
    videoMaxDuration: 120,
    quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
  });
  if (res.canceled || !res.assets?.[0]?.uri) return null;
  const asset = res.assets[0];
  return {
    uri: asset.uri,
    name: asset.fileName || guessFilename(asset.uri, "mp4", "video"),
    mimeType: asset.mimeType || "video/mp4",
    category: "video",
    durationMs: asset.duration ?? null,
    fileSize: asset.fileSize ?? null,
  };
}

export async function uploadMediaAsset(params: {
  asset: LocalMediaAsset;
  title?: string;
  visitId?: number | string | null;
  taskId?: number | string | null;
  farmerId?: number | string | null;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<ServerMediaFile> {
  const { asset, title, visitId, taskId, farmerId, latitude, longitude } = params;
  const formData = new FormData();

  if (Platform.OS === "web") {
    const resp = await fetch(asset.uri);
    const blob = await resp.blob();
    formData.append("file", blob, asset.name);
  } else {
    const normalizedUri =
      Platform.OS === "android" &&
      !asset.uri.startsWith("file://") &&
      !asset.uri.startsWith("content://")
        ? `file://${asset.uri}`
        : asset.uri;
    formData.append("file", {
      uri: normalizedUri,
      name: asset.name || guessFilename(normalizedUri, asset.category === "video" ? "mp4" : "jpg", asset.category),
      type: asset.mimeType || (asset.category === "video" ? "video/mp4" : "image/jpeg"),
    } as any);
  }

  formData.append("category", asset.category);
  if (title) formData.append("title", title);
  if (visitId && /^\d+$/.test(String(visitId))) formData.append("visit_id", String(visitId));
  if (taskId && /^\d+$/.test(String(taskId))) formData.append("task_id", String(taskId));
  if (farmerId && /^\d+$/.test(String(farmerId))) formData.append("farmer_id", String(farmerId));
  if (latitude != null && !Number.isNaN(latitude)) formData.append("captured_latitude", String(latitude));
  if (longitude != null && !Number.isNaN(longitude)) formData.append("captured_longitude", String(longitude));

  const res = await apiClient.upload("/employee/media/upload", formData);
  const uploaded: ServerMediaFile | undefined = res?.file || res?.files?.[0];
  if (!uploaded) {
    throw new Error("Server did not return uploaded file metadata.");
  }
  return uploaded;
}

export async function fetchMediaFiles(filters?: {
  visitId?: number | string;
  taskId?: number | string;
  farmerId?: number | string;
  category?: "image" | "video" | "document";
}): Promise<ServerMediaFile[]> {
  const qs = new URLSearchParams();
  if (filters?.visitId && /^\d+$/.test(String(filters.visitId))) {
    qs.set("visit_id", String(filters.visitId));
  }
  if (filters?.taskId && /^\d+$/.test(String(filters.taskId))) {
    qs.set("task_id", String(filters.taskId));
  }
  if (filters?.farmerId && /^\d+$/.test(String(filters.farmerId))) {
    qs.set("farmer_id", String(filters.farmerId));
  }
  if (filters?.category) {
    qs.set("category", filters.category);
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await apiClient.get(`/employee/media${suffix}`);
  return Array.isArray(res?.files) ? res.files : [];
}

export async function downloadRemoteFile(url: string, filename?: string): Promise<boolean> {
  if (!url || !/^https?:\/\//i.test(url)) {
    return false;
  }

  if (Platform.OS === "web" && typeof document !== "undefined") {
    const a = document.createElement("a");
    a.href = url;
    if (filename) a.download = filename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
  } catch {
    // fallback to expo-web-browser
  }

  try {
    await WebBrowser.openBrowserAsync(url);
    return true;
  } catch {
    return false;
  }
}

export async function downloadVisitDossierToDevice(
  visitId: string | number,
  signedDossierUrl?: string | null
): Promise<boolean> {
  if (signedDossierUrl && /^https?:\/\//i.test(signedDossierUrl)) {
    return downloadRemoteFile(signedDossierUrl, `visit-${visitId}-dossier.txt`);
  }
  try {
    const res = await apiClient.get("/employee/visits");
    const match = (Array.isArray(res?.visits) ? res.visits : []).find(
      (v: any) => String(v.id) === String(visitId)
    );
    if (match?.dossier_url) {
      return downloadRemoteFile(match.dossier_url, `visit-${visitId}-dossier.txt`);
    }
  } catch {
    // Fallback false
  }
  return false;
}
