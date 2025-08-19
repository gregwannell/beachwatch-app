-- Import annual source aggregates with conflict resolution
CREATE TEMP TABLE temp_source_agg (
    id integer, 
    aggregate_id integer, 
    source_id integer, 
    total numeric, 
    avg_per_100m numeric, 
    presence integer
);

\COPY temp_source_agg FROM '../../data/AnnualSourceAggregate.csv' WITH CSV HEADER

INSERT INTO annual_source_aggregates (id,aggregate_id,source_id,total,avg_per_100m,presence) 
SELECT * FROM temp_source_agg 
ON CONFLICT (id) DO UPDATE SET 
    aggregate_id = EXCLUDED.aggregate_id, 
    source_id = EXCLUDED.source_id, 
    total = EXCLUDED.total, 
    avg_per_100m = EXCLUDED.avg_per_100m, 
    presence = EXCLUDED.presence;