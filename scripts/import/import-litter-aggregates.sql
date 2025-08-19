-- Import annual litter aggregates with conflict resolution
CREATE TEMP TABLE temp_litter_agg (
    id integer, 
    aggregate_id integer, 
    litter_item_id integer, 
    total numeric, 
    avg_per_100m numeric, 
    presence integer
);

\COPY temp_litter_agg FROM '../../data/AnnualItemAggregate.csv' WITH CSV HEADER

INSERT INTO annual_litter_aggregates (id,aggregate_id,litter_item_id,total,avg_per_100m,presence) 
SELECT * FROM temp_litter_agg 
ON CONFLICT (id) DO UPDATE SET 
    aggregate_id = EXCLUDED.aggregate_id, 
    litter_item_id = EXCLUDED.litter_item_id, 
    total = EXCLUDED.total, 
    avg_per_100m = EXCLUDED.avg_per_100m, 
    presence = EXCLUDED.presence;