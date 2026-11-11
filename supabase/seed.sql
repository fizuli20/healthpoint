-- Demo Access Points Seed Data for Baku, Azerbaijan
-- All records explicitly marked is_demo = true ("Demo Location - Not a Verified Healthcare Facility")

insert into public.access_points (
  name, description, neighborhood, latitude, longitude, address,
  operational_status, equipment, wheelchair_accessible, audio_guided, open_24_7,
  opening_hours, image_url, is_demo, usage_count
) values
(
  'HealthPoint — Baku Boulevard',
  'Demonstration public health access station near the central waterfront promenade with basic vital-signs monitoring and SOS call unit.',
  'Sabail / Boulevard',
  40.3665, 49.8398,
  'Neftchilar Ave 73, Baku Boulevard Promenade',
  'operational',
  array['Blood pressure monitor','Heart rate monitor','Pulse oximeter','First-aid kit','SOS communication button','AED'],
  true, true, true,
  '24/7',
  null, true, 412
),
(
  'HealthPoint — Fountain Square',
  'Pedestrian plaza demonstration access station with rapid vital check module and multilingual audio guide.',
  'Fountain Square',
  40.3706, 49.8371,
  'Nigara Rafibeyli St 12, Fountain Square',
  'operational',
  array['Blood pressure monitor','Heart rate monitor','Pulse oximeter','First-aid kit','SOS communication button'],
  true, true, true,
  '24/7',
  null, true, 368
),
(
  'HealthPoint — Icherisheher',
  'Accessible compact health support point near the Old City metro entrance tailored for elderly visitors and tourists.',
  'Icherisheher',
  40.3661, 49.8318,
  'Istiglaliyyat St 19, near Icherisheher Metro',
  'operational',
  array['Heart rate monitor','Pulse oximeter','First-aid kit','SOS communication button'],
  true, true, false,
  '07:00 - 23:00',
  null, true, 245
),
(
  'HealthPoint — 28 May Metro',
  'High-footfall transit hub station located outside the main 28 May commuter exit with defibrillator cabinet.',
  '28 May',
  40.3792, 49.8489,
  'Fuzuli St 65, 28 May Metro Exit',
  'operational',
  array['Blood pressure monitor','Heart rate monitor','Pulse oximeter','First-aid kit','SOS communication button','AED'],
  true, true, true,
  '24/7',
  null, true, 529
),
(
  'HealthPoint — Ganjlik Mall',
  'Step-free indoor corridor demonstration kiosk adjacent to public transport drop-off bay.',
  'Ganjlik',
  40.4004, 49.8524,
  'Fatali Khan Khoyski Ave 38, Ganjlik',
  'limited',
  array['Heart rate monitor','First-aid kit','SOS communication button'],
  true, false, false,
  '09:00 - 22:00',
  null, true, 194
),
(
  'HealthPoint — Heydar Aliyev Center',
  'Park promenade health access demo unit with unobstructed ramp approach and outdoor emergency intercom.',
  'Narimanov',
  40.3958, 49.8678,
  'Heydar Aliyev Ave 1, Park Entrance',
  'operational',
  array['Blood pressure monitor','Heart rate monitor','Pulse oximeter','First-aid kit','SOS communication button','AED'],
  true, true, false,
  '08:00 - 22:00',
  null, true, 281
),
(
  'HealthPoint — Nizami Street',
  'Central pedestrian street demo access station optimized for low-height wheelchair reach.',
  'Sabail / Torgovaya',
  40.3728, 49.8423,
  'Nizami St 58, Central Promenade',
  'limited',
  array['Blood pressure monitor','Pulse oximeter','SOS communication button'],
  true, true, false,
  '08:00 - 23:00',
  null, true, 163
),
(
  'HealthPoint — Sahil Metro',
  'Public transit access station currently flagged unavailable for routine calibration in demo mode.',
  'Sahil',
  40.3712, 49.8473,
  'Bulbul Ave 14, Sahil Metro Square',
  'unavailable',
  array['Heart rate monitor','First-aid kit','SOS communication button'],
  false, false, false,
  '07:00 - 22:00',
  null, true, 92
);
