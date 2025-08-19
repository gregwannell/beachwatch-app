-- Import materials with conflict resolution
CREATE TEMP TABLE temp_materials (
    id integer, 
    material varchar
);

\COPY temp_materials FROM '../../data/Material.csv' WITH CSV HEADER

INSERT INTO materials (id, material) 
SELECT id, material FROM temp_materials 
ON CONFLICT (id) DO UPDATE SET 
    material = EXCLUDED.material;