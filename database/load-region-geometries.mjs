/**
 * Loads region_geometries from CSV into Supabase.
 *
 * Usage:
 *   node --env-file=.env.local database/load-region-geometries.mjs
 *
 * CSV file expected at: database/region_geometries.csv
 * Required columns: id, region_id, geometry
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   <- Supabase Dashboard -> Project Settings -> API -> service_role key
 */

import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, 'region_geometries.csv')
const BATCH_SIZE = 25

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
  console.log(`Reading: ${DATA_FILE}`)
  const csv = readFileSync(DATA_FILE, 'utf8')

  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_quotes: true,
  })
  console.log(`Parsed ${records.length} rows from CSV`)

  const rows = []
  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    const id = parseInt(r.id)
    const region_id = parseInt(r.region_id)

    if (!region_id) {
      console.warn(`  Skipping row ${i + 1} (id=${id}): missing region_id`)
      continue
    }

    let geometry = null
    if (r.geometry && r.geometry.trim() !== '') {
      try {
        geometry = JSON.parse(r.geometry)
      } catch {
        console.warn(`  Row ${i + 1} (id=${id}): could not parse geometry as JSON — storing as null`)
      }
    }

    rows.push({ id, region_id, geometry })
  }

  console.log(`Importing ${rows.length} rows in batches of ${BATCH_SIZE}...`)

  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('region_geometries')
      .upsert(batch, { onConflict: 'id' })

    if (error) {
      console.error(`Error on rows ${i + 1}-${i + batch.length}:`, error.message)
      process.exit(1)
    }

    inserted += batch.length
    console.log(`  ${inserted}/${rows.length} rows inserted`)
  }

  console.log(`\nDone! ${inserted} rows loaded into region_geometries.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
