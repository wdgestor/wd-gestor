'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');

const contractPath = path.join(
  root,
  'docs',
  'security',
  'R115-AP239ABN10-release-contract.md'
);

function main() {
  let contract;

  try {
    contract = fs.readFileSync(contractPath, 'utf8');
  } catch (error) {
    console.error('ABN10_CONTRACT_UNAVAILABLE');
    process.exitCode = 3;
    return;
  }

  const requiredEvidence = [
    'PRODUCTION_GATE=BLOCKED',
    'RISK_ACCEPTANCE=NOT_GRANTED',
    'IMMEDIATE_GLOBAL_REVOCATION=NOT_PROVEN',
    'UNCONFIRMED_LOGOUT_HTTP=503',
    'STALE_COOKIE_REPLAY_AFTER_ALL_WRITES_FAIL=200',
    'ABN10_RELEASE_AUTHORIZATION=DENIED',
  ];

  const missing = requiredEvidence.filter(
    item => !contract.includes(item)
  );

  if (missing.length > 0) {
    console.error('ABN10_CONTRACT_EVIDENCE_INVALID');

    for (const item of missing) {
      console.error('MISSING=' + item);
    }

    process.exitCode = 3;
    return;
  }

  console.log('ABN10_CONTRACT=VALID');
  console.log('ABN10_RISK_ACCEPTANCE=NOT_GRANTED');
  console.log('ABN10_PRODUCTION_GATE=BLOCKED');
  console.log('ABN10_RELEASE_AUTHORIZATION=DENIED');

  // Codigo 2 significa bloqueio intencional.
  // Nunca converter essa condicao automaticamente em exit 0.
  process.exitCode = 2;
}

main();