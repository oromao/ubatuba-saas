#!/usr/bin/env node

import { rm, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const exec = promisify(execFile);
const root = process.cwd();

async function exists(target) {
  try {
    await access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function run(cmd, args, opts = {}) {
  await exec(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
    ...opts,
  });
}

for (const dir of ['apps/web/.next', 'apps/api/dist']) {
  if (await exists(path.join(root, dir))) {
    await rm(path.join(root, dir), { recursive: true, force: true });
  }
}

await run('npm', ['run', 'build']);
await run('npm', ['run', 'docker:dev:up']);

for (let attempt = 1; attempt <= 60; attempt += 1) {
  try {
    const response = await fetch('http://localhost:4000/health');
    if (response.ok) break;
  } catch {}
  if (attempt === 60) {
    throw new Error('API health did not become ready');
  }
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

await run('npm', ['run', 'e2e:smoke']);
