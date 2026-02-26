Recommended Approach: Supabase Dashboard (SQL + CSV Import)
Best for a one-time replacement. No code changes needed.

Step 1 — Back up existing data (optional but recommended)
In the Supabase Dashboard → SQL Editor, run:


-- Export to check row counts before clearing
SELECT 'regions' as table_name, count(*) FROM regions
UNION ALL SELECT 'materials', count(*) FROM materials
UNION ALL SELECT 'sources', count(*) FROM sources
UNION ALL SELECT 'litter_items', count(*) FROM litter_items
UNION ALL SELECT 'region_geometries', count(*) FROM region_geometries
UNION ALL SELECT 'annual_region_aggregates', count(*) FROM annual_region_aggregates
UNION ALL SELECT 'annual_material_aggregates', count(*) FROM annual_material_aggregates
UNION ALL SELECT 'annual_source_aggregates', count(*) FROM annual_source_aggregates
UNION ALL SELECT 'annual_litter_aggregates', count(*) FROM annual_litter_aggregates;
Step 2 — Truncate all tables (reverse dependency order)
In SQL Editor, run in one block:


TRUNCATE TABLE
  annual_litter_aggregates,
  annual_material_aggregates,
  annual_source_aggregates,
  annual_region_aggregates,
  region_geometries,
  litter_items,
  sources,
  materials,
  regions
CASCADE;

Step 3 — Import CSVs in correct order (Table Editor → Import)
Go to Table Editor → select each table → click Import data from CSV.

Import in this order:

regions
materials
sources
litter_items
region_geometries
annual_region_aggregates
annual_material_aggregates
annual_source_aggregates
annual_litter_aggregates
Important: The id columns must match exactly between CSVs — e.g. region_id values in region_geometries.csv must match id values in regions.csv.

Step 4 — Run post-load sync
After import, run this in SQL Editor to ensure the has_data flag is correct on the regions table:


SELECT sync_has_data_flags();
Then verify row counts match expectations (re-run the query from Step 1).