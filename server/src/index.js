import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import products from "../../shared/products.json" with { type: "json" };
import { validateEnquiry } from "./middleware/validateEnquiry.js";
import { saveEnquiry } from "./services/enquiryStore.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const origins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());
let mongoConnected = false;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origins.includes("*") || origins.includes(origin))
        return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS."));
    },
  }),
);
app.use(express.json({ limit: "20kb" }));

// Small in-memory IP throttle for this prototype. Use a shared limiter for multi-instance production.
const windows = new Map();
app.use("/api/enquiries", (req, res, next) => {
  const now = Date.now();
  const key = req.ip;
  const window = windows.get(key) || { start: now, count: 0 };
  if (now - window.start > 60_000) {
    window.start = now;
    window.count = 0;
  }
  window.count += 1;
  windows.set(key, window);
  if (window.count > 8)
    return res
      .status(429)
      .json({
        success: false,
        message: "Too many enquiries. Please wait a minute and try again.",
      });
  next();
});

app.get("/api/health", (_req, res) =>
  res.json({
    success: true,
    status: "ok",
    storage: mongoConnected ? "mongodb" : "local-json",
    message: mongoConnected
      ? "MongoDB is connected."
      : "Development file storage is active; records are stored locally on this server.",
  }),
);
app.get("/api/categories", (_req, res) =>
  res.json({
    success: true,
    data: [...new Set(products.map((product) => product.category))],
  }),
);
app.get("/api/products", (_req, res) => {
  const { category, search } = reqQuery(_req.query);
  const data = products.filter(
    (product) =>
      (!category ||
        product.category.toLowerCase() === category.toLowerCase()) &&
      (!search ||
        `${product.name} ${product.category}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  res.json({ success: true, data });
});
app.get("/api/products/:id", (req, res) => {
  const product = products.find(
    (item) => item.id.toLowerCase() === req.params.id.toLowerCase(),
  );
  if (!product)
    return res
      .status(404)
      .json({ success: false, message: "Product not found." });
  res.json({ success: true, data: product });
});
app.post("/api/enquiries", async (req, res, next) => {
  const { value, errors } = validateEnquiry(req.body);
  if (Object.keys(errors).length)
    return res
      .status(400)
      .json({
        success: false,
        message: "Please correct the highlighted fields.",
        errors,
      });
  try {
    await saveEnquiry(value, mongoConnected);
    res
      .status(201)
      .json({
        success: true,
        message: "Thank you. Your enquiry has been received.",
      });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.type === "entity.parse.failed")
    return res
      .status(400)
      .json({ success: false, message: "Request body must be valid JSON." });
  if (error.message?.includes("CORS"))
    return res
      .status(403)
      .json({ success: false, message: "This origin is not allowed." });
  res
    .status(500)
    .json({
      success: false,
      message: "The server could not complete this request.",
    });
});

function reqQuery(query) {
  return {
    category:
      typeof query.category === "string" ? query.category.slice(0, 60) : "",
    search: typeof query.search === "string" ? query.search.slice(0, 100) : "",
  };
}

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      mongoConnected = true;
      console.log("MongoDB connected.");
    } catch (error) {
      console.error(
        "MongoDB connection failed; using local JSON storage:",
        error.message,
      );
    }
  } else
    console.log("MONGODB_URI not set; using local JSON development storage.");
  app.listen(port, "0.0.0.0", () =>
    console.log(`INDKAN API listening on port ${port}`),
  );
}

start();
