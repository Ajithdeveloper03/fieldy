/* global __dirname */
const fs = require("fs");
const path = require("path");

const filesToPatch = [
  "node_modules/react-native-css/dist/commonjs/components/index.cjs",
  "node_modules/react-native-css/dist/module/components/index.cjs",
  "node_modules/react-native-css/src/components/index.cts",
];

const target = `  get NativeAppEventEmitter() {
    return require("react-native").NativeAppEventEmitter;
  },`;

const replacement = `  get NativeAppEventEmitter() {
    return require("react-native").NativeAppEventEmitter;
  },
  get NativeComponentRegistry() {
    return require("react-native").NativeComponentRegistry;
  },`;

for (const relPath of filesToPatch) {
  const fullPath = path.join(__dirname, "..", relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf8");
    if (!content.includes("get NativeComponentRegistry()")) {
      fs.writeFileSync(fullPath, content.replace(target, replacement), "utf8");
    }
  }
}

// Fix 1: Fix TypeError: path.split is not a function when path is boolean true
const stylePaths = [
  "node_modules/react-native-css/dist/module/native/styles/index.js",
  "node_modules/react-native-css/dist/commonjs/native/styles/index.js",
];

for (const relPath of stylePaths) {
  const fullPath = path.join(__dirname, "..", relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, "utf8");
    const targetCode = 'const tokens = path.split(".");';
    const safeCode = 'const pathStr = typeof path === "string" ? path : key;\n    const tokens = pathStr.split(".");';
    if (content.includes(targetCode)) {
      content = content.replace(targetCode, safeCode);
      fs.writeFileSync(fullPath, content, "utf8");
      console.log("Patched style mapping in", relPath);
    }
  }
}

// Fix 2: Fix TextInput nativeStyleMapping textAlign: true -> textAlign: "textAlign"
const textInputPaths = [
  "node_modules/react-native-css/dist/module/components/TextInput.js",
  "node_modules/react-native-css/dist/commonjs/components/TextInput.js",
];

for (const relPath of textInputPaths) {
  const fullPath = path.join(__dirname, "..", relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, "utf8");
    if (content.includes("textAlign: true")) {
      content = content.replace("textAlign: true", 'textAlign: "textAlign"');
      fs.writeFileSync(fullPath, content, "utf8");
      console.log("Patched TextInput mapping in", relPath);
    }
  }
}
