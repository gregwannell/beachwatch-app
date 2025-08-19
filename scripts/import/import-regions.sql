-- Special handling for Regions table with JSONB geometry and boolean conversion
CREATE TEMP TABLE temp_regions (
    id integer,
    name text,
    parent_id integer,
    type text,
    code text,
    geometry text,
    has_data text
);

-- Import to temp table first
\COPY temp_regions FROM '../../data/Region.csv' WITH CSV HEADER

-- Insert with proper type conversion (excluding timestamp columns to use defaults)
INSERT INTO regions (id, name, parent_id, type, code, geometry, has_data)
SELECT 
    id,
    name,
    parent_id,
    type,
    code,
    CASE 
        WHEN geometry IS NOT NULL AND geometry != '' 
        THEN geometry::jsonb 
        ELSE NULL 
    END,
    CASE 
        WHEN has_data = 'True' OR has_data = 'TRUE' OR has_data = 'true' 
        THEN true 
        ELSE false 
    END
FROM temp_regions
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    parent_id = EXCLUDED.parent_id,
    type = EXCLUDED.type,
    code = EXCLUDED.code,
    geometry = EXCLUDED.geometry,
    has_data = EXCLUDED.has_data,
    updated_at = now();