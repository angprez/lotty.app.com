import("./dist/index.cjs");
// server.js (root)
// Hostinger wants a .js entry file. Your compiled server is dist/index.cjs

const path = require("path");

// Optional: some platforms set PORT, we ensure it exists.
process.env.PORT = process.env.PORT || "3000";

// Load the compiled server bundle
require(path.join(__dirname, "dist", "index.cjs"));

