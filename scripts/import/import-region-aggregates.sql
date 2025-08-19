-- Import annual region aggregates with conflict resolution
CREATE TEMP TABLE temp_region_agg (
    id integer, 
    name_id integer, 
    year varchar, 
    total_surveys integer, 
    total_volunteers integer, 
    total_volunteer_min numeric, 
    total_length_m integer, 
    additional_area_cleaned_m integer, 
    total_bags numeric, 
    total_weight_kg numeric, 
    total_litter numeric, 
    avg_per_100m numeric,
    updated_at timestamp with time zone
);

\COPY temp_region_agg FROM '../../data/AnnualRegionAggregate.csv' WITH CSV HEADER

INSERT INTO annual_region_aggregates (id,name_id,year,total_surveys,total_volunteers,total_volunteer_min,total_length_m,additional_area_cleaned_m,total_bags,total_weight_kg,total_litter,avg_per_100m,updated_at) 
SELECT * FROM temp_region_agg 
ON CONFLICT (id) DO UPDATE SET 
    name_id = EXCLUDED.name_id, 
    year = EXCLUDED.year, 
    total_surveys = EXCLUDED.total_surveys, 
    total_volunteers = EXCLUDED.total_volunteers, 
    total_volunteer_min = EXCLUDED.total_volunteer_min, 
    total_length_m = EXCLUDED.total_length_m, 
    additional_area_cleaned_m = EXCLUDED.additional_area_cleaned_m, 
    total_bags = EXCLUDED.total_bags, 
    total_weight_kg = EXCLUDED.total_weight_kg, 
    total_litter = EXCLUDED.total_litter, 
    avg_per_100m = EXCLUDED.avg_per_100m, 
    updated_at = EXCLUDED.updated_at;