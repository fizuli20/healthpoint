-- Demo Access Points Seed Data for Baku, Azerbaijan (15-Point Citywide Pilot Grid)
-- All records explicitly marked is_demo = true ("Demo Location - Not a Verified Healthcare Facility")

insert into public.access_points (
  name, description, neighborhood, latitude, longitude, address,
  operational_status, equipment, wheelchair_accessible, audio_guided, open_24_7,
  opening_hours, image_url, is_demo, usage_count
) values
(
  'OpenCarePoint — Baku Boulevard',
  'Waterfront smart access point along Baku Boulevard with wheelchair-height sensor console, voice prompts, and public SOS call button.',
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
  'OpenCarePoint — Fountain Square',
  'Central pedestrian plaza unit offering rapid blood-pressure and pulse checks with multilingual audio instructions.',
  'Fountain Square',
  40.3706, 49.8371,
  'Nigar Rafibeyli St 12, Fountain Square',
  'operational',
  array['Blood pressure monitor','Heart rate monitor','Pulse oximeter','First-aid kit','SOS communication button'],
  true, true, true,
  '24/7',
  null, true, 368
),
(
  'OpenCarePoint — Icherisheher',
  'Compact step-free station outside Icherisheher Metro serving older residents, pedestrians, and tourists.',
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
  'OpenCarePoint — 28 May Metro',
  'High-traffic transit hub access point directly beside 28 May Metro and bus terminal with AED cabinet.',
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
  'OpenCarePoint — Ganjlik Mall',
  'Transit corridor kiosk adjacent to Ganjlik Metro bus bay. Pulse oximeter currently under inspection (limited service).',
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
  'OpenCarePoint — Heydar Aliyev Center',
  'Park entrance accessible unit with wide paved ramp, AED unit, and high-visibility emergency assistance panel.',
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
  'OpenCarePoint — Nizami Street',
  'Pedestrian street kiosk positioned at wheelchair reach height with basic cardiac & blood-pressure telemetry.',
  'Sabail / Nizami',
  40.3728, 49.8423,
  'Nizami St 58, Central Promenade',
  'limited',
  array['Blood pressure monitor','Pulse oximeter','SOS communication button'],
  true, true, false,
  '08:00 - 23:00',
  null, true, 163
),
(
  'OpenCarePoint — Sahil Metro',
  'Station temporarily offline for sensor calibration and ramp lighting upgrade in demo status.',
  'Sahil',
  40.3712, 49.8473,
  'Bulbul Ave 14, Sahil Metro Square',
  'unavailable',
  array['Heart rate monitor','First-aid kit','SOS communication button'],
  false, false, false,
  '07:00 - 22:00',
  null, true, 92
),
(
  'OpenCarePoint — Koroglu Hub',
  'Eastern gateway metro and suburban bus terminal kiosk built for rapid commuter heart-rate, blood-pressure, and AED response.',
  'Nizami / Koroglu',
  40.4209, 49.9182,
  'Heydar Aliyev Ave 115, Koroglu Transport Hub',
  'operational',
  array['Blood pressure monitor','Heart rate monitor','Pulse oximeter','First-aid kit','SOS communication button','AED'],
  true, true, true,
  '24/7',
  null, true, 486
),
(
  'OpenCarePoint — Narimanov Park',
  'Neighborhood park and metro access point tailored for senior residents needing routine blood-pressure and pulse checks.',
  'Narimanov',
  40.4029, 49.8706,
  'Tabriz St 44, Narimanov Metro & Park',
  'operational',
  array['Blood pressure monitor','Heart rate monitor','Pulse oximeter','First-aid kit','SOS communication button'],
  true, true, false,
  '07:00 - 23:00',
  null, true, 319
),
(
  'OpenCarePoint — Elmlar Academy',
  'University corridor station serving Baku State University and Academy campuses with full vital sensors and AED unit.',
  'Yasamal / Elmlar',
  40.3754, 49.8152,
  'Zahid Khalilov St 23, Elmlar Academy Metro',
  'operational',
  array['Blood pressure monitor','Heart rate monitor','Pulse oximeter','First-aid kit','SOS communication button','AED'],
  true, true, false,
  '07:00 - 23:00',
  null, true, 404
),
(
  'OpenCarePoint — Memar Ajami',
  '24/7 northwestern dual-line metro interchange station extending cardiac and trauma support across Nasimi micro-districts.',
  'Nasimi / 3rd Microdistrict',
  40.4114, 49.8136,
  'Javadkhan St 18, Memar Ajami Metro',
  'operational',
  array['Blood pressure monitor','Heart rate monitor','Pulse oximeter','First-aid kit','SOS communication button','AED'],
  true, true, true,
  '24/7',
  null, true, 352
),
(
  'OpenCarePoint — Baku White City',
  'Eastern waterfront promenade kiosk along White City Boulevard with sports recovery SpO2, heart-rate, and AED access.',
  'Khatai / White City',
  40.3768, 49.8934,
  'Suleyman Vazirov St 11, White City Park',
  'operational',
  array['Heart rate monitor','Pulse oximeter','First-aid kit','SOS communication button','AED'],
  true, true, true,
  '24/7',
  null, true, 297
),
(
  'OpenCarePoint — Ahmadli Metro',
  '24/7 high-density residential metro plaza kiosk providing free pulse checks, blood pressure cuffs, and SOS dispatch.',
  'Khatai / Ahmadli',
  40.3855, 49.9542,
  'Mahammad Hadi St 51, Ahmadli Metro Exit',
  'operational',
  array['Blood pressure monitor','Heart rate monitor','First-aid kit','SOS communication button'],
  true, true, true,
  '24/7',
  null, true, 278
),
(
  'OpenCarePoint — Port Baku',
  'Corporate and seafront wellness kiosk near Port Baku Towers. Blood pressure cuff scheduled for calibration (limited service).',
  'Nasimi / Port Baku',
  40.3782, 49.8608,
  'Uzeyir Hajibeyli St 62, Port Baku Entrance',
  'limited',
  array['Heart rate monitor','Pulse oximeter','First-aid kit','SOS communication button','AED'],
  true, true, false,
  '07:00 - 23:00',
  null, true, 215
);
