-- Seed data matching the current logistics mock screens.
-- Run after schema.sql (Dashboard → SQL → New query).
--
-- Create demo users first in Authentication → Users, then optionally:
--   update public.profiles
--   set full_name = 'Olateju Oyetoke', role = 'logistics'
--   where id = '<user-uuid>';

insert into public.loading_tickets (
  id, customer, truck_type, truck_number, product, quantity, destination, status,
  terminal, requested_amount, marketer, representative, phone
) values
  ('24989001', 'BOVAS', 'Internal', 'BDJ590XA', 'PMS', 45000, 'Akobo 3, 45,000 Litres', 'approved',
   'Terminal 1', '45,000 Litres', 'Feasible Path LTD', 'Opeyemi Fadenipo', '08104205202'),
  ('24989002', 'Fatgbems', 'Industrial', 'BDJ590XA', 'PMS', 33000, 'Babatunde Ishola Filling Station', 'rejected',
   'Terminal 1', '45,000 Litres', 'Feasible Path LTD', 'Opeyemi Fadenipo', '08104205202'),
  ('24989003', 'Connoil', 'Industrial', 'BDJ590XA', 'PMS', 45000, 'Akobo 4, 45,000 Litres', 'pending',
   'Terminal 1', '45,000 Litres', 'Feasible Path LTD', 'Opeyemi Fadenipo', '08104205202'),
  ('24989004', 'BOVAS', 'Internal', 'BDJ590XA', 'PMS', 45000, 'Local', 'approved',
   null, null, null, null, null),
  ('24989005', 'MRS', 'Industrial', 'T245-YA', 'PMS', 30000, 'Babatunde Ishola Filling Station', 'pending',
   null, null, null, null, null),
  ('24989006', 'BOVAS', 'Internal', 'BDJ590XA', 'PMS', 45000, 'Akobo 4, 45,000 Litres', 'approved',
   null, null, null, null, null),
  ('24989007', 'Hill Crest', 'Marketer', 'BDJ590XA', 'PMS', 45000, 'Babatunde Ishola Filling Station', 'approved',
   null, null, null, null, null),
  ('24989008', 'Feasible Path', 'Marketer', 'BDJ590XA', 'PMS', 45000, 'Babatunde Ishola Filling Station', 'approved',
   null, null, null, null, null),
  ('24989009', 'Jots M', 'Marketer', 'BDJ590XA', 'PMS', 45000, 'Babatunde Ishola Filling Station', 'approved',
   null, null, null, null, null),
  ('24989010', 'Fatgbems', 'Industrial', 'BDJ590XA', 'PMS', 45000, 'Babatunde Ishola Filling Station', 'rejected',
   null, null, null, null, null)
on conflict (id) do nothing;

insert into public.ticket_destinations (ticket_id, station, amount, address) values
  (
    '24989001',
    'BOVAS Filling Station, Akobo 4',
    '45,000 Litres',
    'Km 45, Lagos-Badagry Expressway, Satellite Town, Ojo Navy Barracks, Lagos state.'
  ),
  (
    '24989002',
    'BOVAS Filling Station, Akobo 4',
    '45,000 Litres',
    'Km 45, Lagos-Badagry Expressway, Satellite Town, Ojo Navy Barracks, Lagos state.'
  ),
  (
    '24989003',
    'BOVAS Filling Station, Akobo 4',
    '30,000 Litres',
    'Km 45, Lagos-Badagry Expressway, Satellite Town, Ojo Navy Barracks, Lagos state.'
  ),
  (
    '24989003',
    'BOVAS Filling Station, Akobo 3',
    '15,000 Litres',
    'Km 45, Lagos-Badagry Expressway, Satellite Town, Ojo Navy Barracks, Lagos state.'
  );

insert into public.marketer_stats (marketer, trucks, quantity_requested, recorded_on) values
  ('BOVAS', 70, 74, current_date),
  ('FATGBEMS', 48, 50, current_date),
  ('TEPATH', 55, 38, current_date),
  ('B/TUNDE', 42, 46, current_date),
  ('JOJO M', 50, 52, current_date),
  ('JOTS M', 12, 14, current_date),
  ('TECHNO', 18, 20, current_date),
  ('HCREST', 30, 33, current_date)
on conflict (marketer, recorded_on) do update
set trucks = excluded.trucks,
    quantity_requested = excluded.quantity_requested;
