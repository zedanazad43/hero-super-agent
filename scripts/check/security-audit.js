#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { extname } from "node:path";

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const sourceExtensions = new Set([".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".json", ".yaml", ".yml", ".toml", ".env"]);
const ignoredNames = new Set(["package-lock.json", "pnpm-lock.yaml", "yarn.lock"]);
const findings = [];

const patterns = [
  { name: "private key", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "AWS access key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "OpenAI-style key", regex: /\bsk-[A-Za-z0-9]{24,}\b/ },
  { name: "GitHub token", regex: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/ },
  { name: "Slack token", regex: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
  {
    name: "hard-coded secret assignment",
    regex: /(?:API_KEY|API_SECRET|ACCESS_TOKEN|AUTH_TOKEN|CLIENT_SECRET|PASSWORD|PRIVATE_KEY|SECRET)\s*[:=]\s*["'][^"'${]{12,}["']/i,
  },
];

for (const file of tracked) {
  if (ignoredNames.has(file) || file.startsWith(".github/") || file.includes("/node_modules/") || !sourceExtensions.has(extname(file))) continue;
  const text = readFileSync(file, "utf8");
  for (const pattern of patterns) {
    if (pattern.regex.test(text)) findings.push(`${file}: ${pattern.name}`);
  }
}

if (findings.length) {
  console.error("Potential committed secrets detected:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Security audit passed: scanned ${tracked.length} tracked files; no committed credential patterns found.`);
