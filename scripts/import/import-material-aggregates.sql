-- Import annual material aggregates with conflict resolution
CREATE TEMP TABLE temp_material_agg (
    id integer, 
    aggregate_id integer, 
    material_id integer, 
    total numeric, 
    avg_per_100m numeric, 
    presence integer
);

\COPY temp_material_agg FROM '../../data/AnnualMaterialAggregate.csv' WITH CSV HEADER

INSERT INTO annual_material_aggregates (id,aggregate_id,material_id,total,avg_per_100m,presence) 
SELECT * FROM temp_material_agg 
ON CONFLICT (id) DO UPDATE SET 
    aggregate_id = EXCLUDED.aggregate_id, 
    material_id = EXCLUDED.material_id, 
    total = EXCLUDED.total, 
    avg_per_100m = EXCLUDED.avg_per_100m, 
    presence = EXCLUDED.presence;