#!/usr/bin/env node
// Verifies that generated Supabase types contain the tables and RPCs the app
// depends on. Fails CI early with a clear message if a required contract is
// missing so we do not ship a build against a schema that has drifted.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const TYPES_PATH = resolve(process.cwd(), 'src/integrations/supabase/types.ts')

const REQUIRED_TABLES = [
  'project_attribution',
  'project_outcomes',
  'lead_refund_requests',
]

const REQUIRED_RPCS = [
  'save_project_attribution',
  'report_project_outcome',
  'request_lead_refund',
  'review_lead_refund_request',
]

let source
try {
  source = readFileSync(TYPES_PATH, 'utf8')
} catch (error) {
  console.error(`[schema-contract] Could not read ${TYPES_PATH}: ${error.message}`)
  process.exit(1)
}

const tablesMatch = source.match(/Tables:\s*{([\s\S]*?)\n\s{4}}\n/)
const functionsMatch = source.match(/Functions:\s*{([\s\S]*?)\n\s{4}}\n/)

if (!tablesMatch) {
  console.error('[schema-contract] Could not locate the `Tables:` block in types.ts.')
  process.exit(1)
}
if (!functionsMatch) {
  console.error('[schema-contract] Could not locate the `Functions:` block in types.ts.')
  process.exit(1)
}

const tablesBlock = tablesMatch[1]
const functionsBlock = functionsMatch[1]

const missingTables = REQUIRED_TABLES.filter(
  name => !new RegExp(`^\\s{6}${name}:\\s*{`, 'm').test(tablesBlock),
)
const missingRpcs = REQUIRED_RPCS.filter(
  name => !new RegExp(`^\\s{6}${name}:\\s*{`, 'm').test(functionsBlock),
)

const failures = []
if (missingTables.length) {
  failures.push(`Missing tables in generated types: ${missingTables.join(', ')}`)
}
if (missingRpcs.length) {
  failures.push(`Missing RPCs in generated types: ${missingRpcs.join(', ')}`)
}

if (failures.length) {
  console.error('[schema-contract] Contract check failed:')
  for (const msg of failures) console.error(`  - ${msg}`)
  console.error(
    '\nRegenerate src/integrations/supabase/types.ts against the current database' +
      ' before merging.',
  )
  process.exit(1)
}

console.log(
  `[schema-contract] OK — ${REQUIRED_TABLES.length} tables and ${REQUIRED_RPCS.length} RPCs present.`,
)
