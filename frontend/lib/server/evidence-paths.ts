import path from "path";

export const UPLOAD_DIR = path.resolve(
  process.env.COPILOT_UPLOAD_DIR || path.join(process.cwd(), ".uploads", "documents")
);
export const DEMO_DATA_DIR = path.resolve(
  process.env.COPILOT_DEMO_DATA_DIR || path.join(process.cwd(), "..", "demo-data")
);

