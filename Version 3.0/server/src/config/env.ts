import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(currentDir, "../..");
const versionRoot = path.resolve(serverRoot, "..");

dotenv.config({ path: path.join(versionRoot, ".env") });
dotenv.config({ path: path.join(serverRoot, ".env"), override: true });
