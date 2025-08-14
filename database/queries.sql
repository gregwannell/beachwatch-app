-- Common queries for the Beachwatch Data Explorer

-- Query 1: Get all regions with data availability
SELECT 
    r.id,
    r.region,
    r.level,
    r.ons_code,
    r.has_data,
    COALESCE(parent.region, '') as parent_region
FROM regions r
LEFT JOIN regions parent ON r.parent_region_id = parent.id
ORDER BY r.level, r.region;

-- Query 2: Get annual summary for a specific region and year
SELECT 
    r.region,
    r.level,
    ara.year,
    ara.total_surveys,
    ara.total_volunteers,
    ara.total_length_m,
    ara.total_litter,
    ara.avg_per_100m
FROM annual_region_aggregates ara
JOIN regions r ON ara.region_id = r.id
WHERE r.ons_code = 'E06000052' AND ara.year = '2023';

-- Query 3: Get top 5 litter items for a region and year
SELECT 
    li.item_name,
    li.short_name,
    ala.total,
    ala.avg_per_100m,
    ala.presence,
    ROUND((ala.total / ara.total_litter * 100)::numeric, 2) as percentage
FROM annual_litter_aggregates ala
JOIN litter_items li ON ala.litter_item_id = li.id
JOIN annual_region_aggregates ara ON ala.region_aggregate_id = ara.id
JOIN regions r ON ara.region_id = r.id
WHERE r.ons_code = 'E06000052' AND ara.year = '2023'
ORDER BY ala.total DESC
LIMIT 5;

-- Query 4: Get material breakdown for a region and year
SELECT 
    m.material,
    ama.total,
    ama.avg_per_100m,
    ama.presence,
    ROUND((ama.total / ara.total_litter * 100)::numeric, 2) as percentage
FROM annual_material_aggregates ama
JOIN materials m ON ama.material_id = m.id
JOIN annual_region_aggregates ara ON ama.region_aggregate_id = ara.id
JOIN regions r ON ara.region_id = r.id
WHERE r.ons_code = 'E06000052' AND ara.year = '2023'
ORDER BY ama.total DESC;

-- Query 5: Get source breakdown for a region and year
SELECT 
    s.source,
    asa.total,
    asa.avg_per_100m,
    asa.presence,
    ROUND((asa.total / ara.total_litter * 100)::numeric, 2) as percentage
FROM annual_source_aggregates asa
JOIN sources s ON asa.source_id = s.id
JOIN annual_region_aggregates ara ON asa.region_aggregate_id = ara.id
JOIN regions r ON ara.region_id = r.id
WHERE r.ons_code = 'E06000052' AND ara.year = '2023'
ORDER BY asa.total DESC;

-- Query 6: Get historical trend for a region (multiple years)
SELECT 
    ara.year,
    ara.total_surveys,
    ara.total_volunteers,
    ara.avg_per_100m,
    LAG(ara.avg_per_100m) OVER (ORDER BY ara.year) as prev_year_avg,
    CASE 
        WHEN LAG(ara.avg_per_100m) OVER (ORDER BY ara.year) IS NOT NULL 
        THEN ROUND(((ara.avg_per_100m - LAG(ara.avg_per_100m) OVER (ORDER BY ara.year)) / LAG(ara.avg_per_100m) OVER (ORDER BY ara.year) * 100)::numeric, 2)
        ELSE NULL
    END as yoy_change_percent
FROM annual_region_aggregates ara
JOIN regions r ON ara.region_id = r.id
WHERE r.ons_code = 'E06000052'
ORDER BY ara.year;

-- Query 7: Get all regions with survey data for a specific year
SELECT 
    r.id,
    r.region,
    r.level,
    r.ons_code,
    ara.total_surveys,
    ara.total_volunteers,
    ara.avg_per_100m
FROM regions r
JOIN annual_region_aggregates ara ON r.id = ara.region_id
WHERE ara.year = '2023'
ORDER BY r.level, r.region;

-- Query 8: Get engagement stats for filtered data
-- This would be used with dynamic WHERE clauses based on user filters
SELECT 
    SUM(ara.total_surveys) as total_surveys,
    SUM(ara.total_volunteers) as total_volunteers,
    SUM(ara.total_length_m) as total_length_m
FROM annual_region_aggregates ara
JOIN regions r ON ara.region_id = r.id
WHERE ara.year = '2023'
AND r.level = 'unitary_authority'; -- Example filter

-- Query 9: Check data availability by region level and year
SELECT 
    r.level,
    ara.year,
    COUNT(*) as regions_with_data,
    SUM(ara.total_surveys) as total_surveys,
    AVG(ara.avg_per_100m) as avg_litter_per_100m
FROM regions r
JOIN annual_region_aggregates ara ON r.id = ara.region_id
GROUP BY r.level, ara.year
ORDER BY ara.year DESC, r.level;

-- Query 10: Get regions with boundaries for mapping
SELECT 
    r.id,
    r.region,
    r.level,
    r.ons_code,
    r.has_data,
    r.boundaries
FROM regions r
WHERE r.boundaries IS NOT NULL
ORDER BY r.level, r.region;