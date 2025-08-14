-- Sample data for testing the Beachwatch database
-- This includes example UK regions and sample survey data

-- Insert UK regions (hierarchical structure)
-- Countries
INSERT INTO regions (region, level, parent_region_id, ons_code, has_data) VALUES
('England', 'country', NULL, 'E92000001', true),
('Wales', 'country', NULL, 'W92000004', true),
('Scotland', 'country', NULL, 'S92000003', true),
('Northern Ireland', 'country', NULL, 'N92000002', false);

-- Counties/Unitary Authorities for England
INSERT INTO regions (region, level, parent_region_id, ons_code, has_data) VALUES
('Cornwall', 'unitary_authority', 1, 'E06000052', true),
('Devon', 'county', 1, 'E10000008', true),
('Dorset', 'unitary_authority', 1, 'E06000059', true),
('Norfolk', 'county', 1, 'E10000020', true),
('Kent', 'county', 1, 'E10000016', true);

-- Welsh regions
INSERT INTO regions (region, level, parent_region_id, ons_code, has_data) VALUES
('Gwynedd', 'unitary_authority', 2, 'W06000002', true),
('Pembrokeshire', 'unitary_authority', 2, 'W06000009', true);

-- Scottish regions
INSERT INTO regions (region, level, parent_region_id, ons_code, has_data) VALUES
('Highland', 'unitary_authority', 3, 'S12000017', true),
('Argyll and Bute', 'unitary_authority', 3, 'S12000035', true);

-- Insert sample litter items
INSERT INTO litter_items (item_name, short_name, material, source) VALUES
('Plastic bottles', 'Bottles', 'Plastic', 'Public'),
('Cigarette butts', 'Cig butts', 'Other', 'Public'),
('Food packaging', 'Food pack', 'Plastic', 'Public'),
('Fishing net pieces', 'Net pieces', 'Plastic', 'Fishing'),
('Glass bottles', 'Glass bottles', 'Glass', 'Public'),
('Bottle tops/lids plastic', 'Bottle lids', 'Plastic', 'Public'),
('Crisp packets', 'Crisp packs', 'Plastic', 'Public'),
('Cotton bud sticks', 'Cotton buds', 'Plastic', 'Sewage Related Debris'),
('Fishing line', 'Fish line', 'Plastic', 'Fishing'),
('Metal cans', 'Metal cans', 'Metal', 'Public');

-- Insert sample annual region aggregates for Cornwall (2023)
INSERT INTO annual_region_aggregates (region_id, year, total_surveys, total_volunteers, total_volunteer_min, total_length_m, total_litter, avg_per_100m) VALUES
(5, '2023', 45, 234, 1560.5, 12500, 8945.0, 71.56),
(5, '2022', 42, 218, 1440.0, 11800, 9234.0, 78.25),
(5, '2021', 38, 198, 1320.0, 10900, 7823.0, 71.77);

-- Insert sample annual region aggregates for Devon (2023)
INSERT INTO annual_region_aggregates (region_id, year, total_surveys, total_volunteers, total_volunteer_min, total_length_m, total_litter, avg_per_100m) VALUES
(6, '2023', 67, 345, 2340.0, 18700, 13456.0, 71.97),
(6, '2022', 63, 321, 2180.0, 17500, 14123.0, 80.66),
(6, '2021', 58, 298, 2010.0, 16200, 12234.0, 75.52);

-- Insert sample material aggregates for Cornwall 2023
INSERT INTO annual_material_aggregates (region_aggregate_id, material_id, total, avg_per_100m, presence) VALUES
(1, 1, 4567.0, 36.54, 42), -- Plastic
(1, 2, 234.0, 1.87, 18),   -- Metal
(1, 3, 678.0, 5.42, 25),   -- Glass
(1, 8, 1466.0, 11.73, 35); -- Other

-- Insert sample source aggregates for Cornwall 2023
INSERT INTO annual_source_aggregates (region_aggregate_id, source_id, total, avg_per_100m, presence) VALUES
(1, 1, 6234.0, 49.87, 45), -- Public
(1, 2, 1456.0, 11.65, 28), -- Fishing
(1, 3, 567.0, 4.54, 15),   -- Sewage Related Debris
(1, 5, 345.0, 2.76, 12);   -- Shipping

-- Insert sample litter item aggregates for Cornwall 2023 (top 5 items)
INSERT INTO annual_litter_aggregates (region_aggregate_id, litter_item_id, total, avg_per_100m, presence) VALUES
(1, 1, 1234.0, 9.87, 38),  -- Plastic bottles
(1, 2, 2345.0, 18.76, 42), -- Cigarette butts
(1, 3, 987.0, 7.90, 35),   -- Food packaging
(1, 6, 765.0, 6.12, 28),   -- Bottle lids
(1, 7, 543.0, 4.34, 22);   -- Crisp packets

-- Update regions to mark which have data
UPDATE regions SET has_data = true WHERE id IN (
    SELECT DISTINCT r.id 
    FROM regions r 
    JOIN annual_region_aggregates ara ON r.id = ara.region_id
);

-- Add some sample GeoJSON boundaries (simplified examples)
UPDATE regions SET boundaries = '{
  "type": "Polygon",
  "coordinates": [[
    [-5.7, 50.0], [-5.0, 50.0], [-5.0, 50.8], [-5.7, 50.8], [-5.7, 50.0]
  ]]
}'::jsonb WHERE region = 'Cornwall';

UPDATE regions SET boundaries = '{
  "type": "Polygon", 
  "coordinates": [[
    [-4.5, 50.2], [-3.0, 50.2], [-3.0, 51.2], [-4.5, 51.2], [-4.5, 50.2]
  ]]
}'::jsonb WHERE region = 'Devon';