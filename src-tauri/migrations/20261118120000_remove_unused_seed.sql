DELETE FROM Reptiles
WHERE id = 'uuid' AND name = 'noodle' AND birthday = '20-20-20'
  AND species = '' AND morph = '' AND age = '' AND status = 'healthy'
  AND tagline = '' AND about = '' AND initials = '' AND basking_temp = 0
  AND cool_temp = 0 AND humidity = 0 AND feed_in_days = 0
  AND weight_grams = 0 AND length_cm = 0 AND last_shed = '' AND notes = '[]'
  AND NOT EXISTS (SELECT 1 FROM GrowthEntries WHERE reptile_id = Reptiles.id)
  AND NOT EXISTS (SELECT 1 FROM FeedingEntries WHERE reptile_id = Reptiles.id);
