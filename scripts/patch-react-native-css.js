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

