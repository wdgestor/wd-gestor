'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const releaseGate = path.join(
  __dirname,
  'check-r115ap239abn10-release-gate.cjs'
);

const environment = process.env.VERCEL_ENV || '';

function skipBuild(reason) {
  console.log('ABN12_VERCEL_BUILD=SKIPPED');
  console.log('ABN12_REASON=' + reason);

  // Vercel Ignored Build Step: 0 cancela o build.
  // Este codigo NAO altera a semantica do verificador ABN10.
  process.exitCode = 0;
}

if (environment === 'preview' || environment === 'development') {
  console.log('ABN12_VERCEL_BUILD=ALLOWED_NON_PRODUCTION');
  console.log('ABN12_ENVIRONMENT=' + environment);

  // Vercel Ignored Build Step: 1 permite o build.
  process.exitCode = 1;
} else {
  const result = spawnSync(
    process.execPath,
    [releaseGate],
    {
      encoding: 'utf8',
      timeout: 10000,
      maxBuffer: 131072,
      windowsHide: true,
    }
  );

  const output = String(result.stdout || '');

  const confirmedBlocked =
    result.status === 2 &&
    output.includes('ABN10_CONTRACT=VALID') &&
    output.includes('ABN10_PRODUCTION_GATE=BLOCKED') &&
    output.includes('ABN10_RELEASE_AUTHORIZATION=DENIED');

  if (environment !== 'production') {
    skipBuild('ENVIRONMENT_UNKNOWN_FAIL_CLOSED');
  } else if (confirmedBlocked) {
    skipBuild('ABN10_PRODUCTION_GATE_BLOCKED');
  } else {
    // Falta de contrato, erro ou resposta inesperada
    // nunca autoriza a construcao de producao.
    skipBuild('SECURITY_GATE_UNVERIFIED_FAIL_CLOSED');
  }
}