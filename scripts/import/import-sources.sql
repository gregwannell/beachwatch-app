-- Import sources with conflict resolution
CREATE TEMP TABLE temp_sources (
    id integer, 
    source varchar
);

\COPY temp_sources FROM '../../data/Source.csv' WITH CSV HEADER

INSERT INTO sources (id, source) 
SELECT id, source FROM temp_sources 
ON CONFLICT (id) DO UPDATE SET 
    source = EXCLUDED.source;