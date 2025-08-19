-- Import litter items with conflict resolution
CREATE TEMP TABLE temp_litter_items (
    id integer, 
    item_name varchar, 
    short_name varchar, 
    material varchar, 
    source varchar
);

\COPY temp_litter_items FROM '../../data/LitterItem.csv' WITH CSV HEADER

INSERT INTO litter_items (id, item_name, short_name, material, source) 
SELECT id, item_name, short_name, material, source FROM temp_litter_items 
ON CONFLICT (id) DO UPDATE SET 
    item_name = EXCLUDED.item_name, 
    short_name = EXCLUDED.short_name, 
    material = EXCLUDED.material, 
    source = EXCLUDED.source;