import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Enquiry from "../models/Enquiry.js";

const localFile = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../data/enquiries.json",
);

export async function saveEnquiry(value, mongoConnected) {
  if (mongoConnected) return Enquiry.create(value);
  await mkdir(dirname(localFile), { recursive: true });
  let records = [];
  try {
    records = JSON.parse(await readFile(localFile, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const record = {
    ...value,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  records.push(record);
  await writeFile(localFile, JSON.stringify(records, null, 2), "utf8");
  return record;
}
