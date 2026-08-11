// `nest build` compiles src/**/*.ts (and prisma/seed.ts) into dist/, preserving their
// path relative to the repo root. Any file that does `from 'generated/prisma'` gets that
// bare specifier rewritten by tsc into a *relative* require pointing at
// dist/generated/prisma (mirroring where `generated/prisma` sits next to `src/` at the
// repo root) -- but nothing actually puts the Prisma client there, since it isn't a .ts
// input tsc compiles. Copy it over so the compiled output can resolve it.
const fs = require('node:fs');
const path = require('node:path');

const source = path.join(__dirname, '..', 'generated', 'prisma');
const destination = path.join(__dirname, '..', 'dist', 'generated', 'prisma');

if (!fs.existsSync(source)) {
  console.error(
    `Prisma client not found at ${source}. Run "npx prisma generate" first.`,
  );
  process.exit(1);
}

fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(source, destination, { recursive: true });
console.log(`Copied generated Prisma client to ${destination}`);
