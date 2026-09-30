import {
  Society,
  Building,
  Unit,
  Profile,
  Membership,
  EventCategory,
  Event,
  EventForm,
  FormField,
  Registration,
  RegistrationMember,
  MediaAsset,
  Performance,
  ScheduleItem,
  Checkin,
  Volunteer,
  Judge,
  Scorecard,
  Score,
  Announcement,
  Notification,
  AuditLog,
} from '@/types/database';

export const DEMO_SOCIETY_ID = 'e7b1e4c2-8419-4a9c-9db8-123456789abc';
export const DEMO_EVENT_ID = 'f8c2e5d3-9520-5b0d-0ec9-234567890bcd';

export const DEMO_SOCIETY: Society = {
  id: DEMO_SOCIETY_ID,
  name: 'Green Valley Residency',
  slug: 'green-valley-residency',
  logo_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&auto=format&fit=crop&q=80',
  address: 'Plot 42, Harmony Boulevard, Phase 2',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560100',
  contact_phone: '+91 98765 43210',
  timezone: 'Asia/Kolkata',
  settings_json: {
    max_registrations_per_user: 3,
    allow_guests: true,
    require_guardian_consent_under_age: 18,
    media_limits_mb: {
      image: 10,
      audio: 50,
      video: 250,
      document: 20,
    },
  },
  created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_BUILDINGS: Building[] = [
  { id: 'bld-01', society_id: DEMO_SOCIETY_ID, name: 'Tower A - Aspen', code: 'TA', created_at: new Date().toISOString() },
  { id: 'bld-02', society_id: DEMO_SOCIETY_ID, name: 'Tower B - Birch', code: 'TB', created_at: new Date().toISOString() },
  { id: 'bld-03', society_id: DEMO_SOCIETY_ID, name: 'Tower C - Cedar', code: 'TC', created_at: new Date().toISOString() },
];

export const DEMO_UNITS: Unit[] = [
  { id: 'unit-ta-101', society_id: DEMO_SOCIETY_ID, building_id: 'bld-01', unit_number: 'A-101', floor: 1, created_at: new Date().toISOString() },
  { id: 'unit-ta-102', society_id: DEMO_SOCIETY_ID, building_id: 'bld-01', unit_number: 'A-102', floor: 1, created_at: new Date().toISOString() },
  { id: 'unit-ta-201', society_id: DEMO_SOCIETY_ID, building_id: 'bld-01', unit_number: 'A-201', floor: 2, created_at: new Date().toISOString() },
  { id: 'unit-ta-301', society_id: DEMO_SOCIETY_ID, building_id: 'bld-01', unit_number: 'A-301', floor: 3, created_at: new Date().toISOString() },
  { id: 'unit-ta-401', society_id: DEMO_SOCIETY_ID, building_id: 'bld-01', unit_number: 'A-401', floor: 4, created_at: new Date().toISOString() },
  { id: 'unit-ta-501', society_id: DEMO_SOCIETY_ID, building_id: 'bld-01', unit_number: 'A-501', floor: 5, created_at: new Date().toISOString() },

  { id: 'unit-tb-101', society_id: DEMO_SOCIETY_ID, building_id: 'bld-02', unit_number: 'B-101', floor: 1, created_at: new Date().toISOString() },
  { id: 'unit-tb-202', society_id: DEMO_SOCIETY_ID, building_id: 'bld-02', unit_number: 'B-202', floor: 2, created_at: new Date().toISOString() },
  { id: 'unit-tb-301', society_id: DEMO_SOCIETY_ID, building_id: 'bld-02', unit_number: 'B-301', floor: 3, created_at: new Date().toISOString() },
  { id: 'unit-tb-402', society_id: DEMO_SOCIETY_ID, building_id: 'bld-02', unit_number: 'B-402', floor: 4, created_at: new Date().toISOString() },
  { id: 'unit-tb-503', society_id: DEMO_SOCIETY_ID, building_id: 'bld-02', unit_number: 'B-503', floor: 5, created_at: new Date().toISOString() },

  { id: 'unit-tc-101', society_id: DEMO_SOCIETY_ID, building_id: 'bld-03', unit_number: 'C-101', floor: 1, created_at: new Date().toISOString() },
  { id: 'unit-tc-201', society_id: DEMO_SOCIETY_ID, building_id: 'bld-03', unit_number: 'C-201', floor: 2, created_at: new Date().toISOString() },
  { id: 'unit-tc-302', society_id: DEMO_SOCIETY_ID, building_id: 'bld-03', unit_number: 'C-302', floor: 3, created_at: new Date().toISOString() },
  { id: 'unit-tc-401', society_id: DEMO_SOCIETY_ID, building_id: 'bld-03', unit_number: 'C-401', floor: 4, created_at: new Date().toISOString() },
  { id: 'unit-tc-502', society_id: DEMO_SOCIETY_ID, building_id: 'bld-03', unit_number: 'C-502', floor: 5, created_at: new Date().toISOString() },
];

// 30+ Realistic Resident Profiles
export const DEMO_PROFILES: Profile[] = [
  { id: 'prof-admin', auth_user_id: 'auth-admin', full_name: 'Vikram Malhotra', email: 'admin@greenvalley.demo', phone: '+91 98200 11223', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', date_of_birth: '1982-05-14', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-stage', auth_user_id: 'auth-stage', full_name: 'Ananya Sharma', email: 'stage@greenvalley.demo', phone: '+91 98200 44556', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', date_of_birth: '1988-11-20', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-volunteer', auth_user_id: 'auth-vol', full_name: 'Rohan Deshmukh', email: 'volunteer@greenvalley.demo', phone: '+91 98200 77889', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', date_of_birth: '1995-03-12', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-judge', auth_user_id: 'auth-judge', full_name: 'Dr. Meenakshi Iyer', email: 'judge@greenvalley.demo', phone: '+91 98200 99001', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80', date_of_birth: '1975-08-30', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-resident', auth_user_id: 'auth-res', full_name: 'Aarav Patel', email: 'resident@greenvalley.demo', phone: '+91 98111 22334', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', date_of_birth: '1990-07-22', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'prof-06', auth_user_id: 'auth-06', full_name: 'Pooja Hegde', email: 'pooja.h@example.com', phone: '+91 98111 33445', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', date_of_birth: '1992-04-10', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-07', auth_user_id: 'auth-07', full_name: 'Kabir Verma', email: 'kabir.v@example.com', phone: '+91 98111 44556', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80', date_of_birth: '1987-12-05', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-08', auth_user_id: 'auth-08', full_name: 'Sneha Kulkarni', email: 'sneha.k@example.com', phone: '+91 98111 55667', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', date_of_birth: '1994-09-18', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-09', auth_user_id: 'auth-09', full_name: 'Rajesh Menon', email: 'rajesh.m@example.com', phone: '+91 98111 66778', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80', date_of_birth: '1980-01-25', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-10', auth_user_id: 'auth-10', full_name: 'Divya Nair', email: 'divya.n@example.com', phone: '+91 98111 77889', avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80', date_of_birth: '1996-06-15', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'prof-11', auth_user_id: 'auth-11', full_name: 'Siddharth Rao', email: 'siddharth.r@example.com', phone: '+91 98111 88990', avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80', date_of_birth: '1989-02-14', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-12', auth_user_id: 'auth-12', full_name: 'Tanvi Sen', email: 'tanvi.s@example.com', phone: '+91 98111 99001', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', date_of_birth: '1993-10-31', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-13', auth_user_id: 'auth-13', full_name: 'Arjun Singhania', email: 'arjun.s@example.com', phone: '+91 98222 11223', avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80', date_of_birth: '1985-05-19', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-14', auth_user_id: 'auth-14', full_name: 'Priyanka Ghosh', email: 'priyanka.g@example.com', phone: '+91 98222 22334', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', date_of_birth: '1991-08-08', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-15', auth_user_id: 'auth-15', full_name: 'Manish Gupta', email: 'manish.g@example.com', phone: '+91 98222 33445', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', date_of_birth: '1978-11-12', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'prof-16', auth_user_id: 'auth-16', full_name: 'Neha Chawla', email: 'neha.c@example.com', phone: '+91 98222 44556', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', date_of_birth: '1995-12-25', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-17', auth_user_id: 'auth-17', full_name: 'Gaurav Aggarwal', email: 'gaurav.a@example.com', phone: '+91 98222 55667', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', date_of_birth: '1984-07-04', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-18', auth_user_id: 'auth-18', full_name: 'Ritika Roy', email: 'ritika.r@example.com', phone: '+91 98222 66778', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', date_of_birth: '1998-03-29', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-19', auth_user_id: 'auth-19', full_name: 'Kunal Kapoor', email: 'kunal.k@example.com', phone: '+91 98222 77889', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80', date_of_birth: '1986-09-17', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-20', auth_user_id: 'auth-20', full_name: 'Isha Reddy', email: 'isha.r@example.com', phone: '+91 98222 88990', avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80', date_of_birth: '1997-01-21', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'prof-21', auth_user_id: 'auth-21', full_name: 'Sunil Joshi', email: 'sunil.j@example.com', phone: '+91 98333 11223', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80', date_of_birth: '1981-06-30', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-22', auth_user_id: 'auth-22', full_name: 'Bhavna Bhatt', email: 'bhavna.b@example.com', phone: '+91 98333 22334', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80', date_of_birth: '1983-04-18', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-23', auth_user_id: 'auth-23', full_name: 'Varun Dhawan', email: 'varun.d@example.com', phone: '+91 98333 33445', avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80', date_of_birth: '1991-03-03', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-24', auth_user_id: 'auth-24', full_name: 'Shreya Goshal', email: 'shreya.g@example.com', phone: '+91 98333 44556', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', date_of_birth: '1989-10-14', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-25', auth_user_id: 'auth-25', full_name: 'Nikhil Kashyap', email: 'nikhil.k@example.com', phone: '+91 98333 55667', avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80', date_of_birth: '1993-08-27', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'prof-26', auth_user_id: 'auth-26', full_name: 'Anu Mathur', email: 'anu.m@example.com', phone: '+91 98333 66778', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80', date_of_birth: '1990-05-09', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-27', auth_user_id: 'auth-27', full_name: 'Devendra Pandey', email: 'devendra.p@example.com', phone: '+91 98333 77889', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', date_of_birth: '1976-12-19', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-28', auth_user_id: 'auth-28', full_name: 'Swati Jain', email: 'swati.j@example.com', phone: '+91 98333 88990', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', date_of_birth: '1994-02-11', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-29', auth_user_id: 'auth-29', full_name: 'Chirag Sethi', email: 'chirag.s@example.com', phone: '+91 98444 11223', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', date_of_birth: '1988-06-22', gender: 'male', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'prof-30', auth_user_id: 'auth-30', full_name: 'Geeta Ramaswamy', email: 'geeta.r@example.com', phone: '+91 98444 22334', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80', date_of_birth: '1979-09-05', gender: 'female', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const DEMO_MEMBERSHIPS: Membership[] = [
  { id: 'mem-admin', society_id: DEMO_SOCIETY_ID, profile_id: 'prof-admin', unit_id: 'unit-ta-101', role: 'society_admin', status: 'active', joined_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mem-stage', society_id: DEMO_SOCIETY_ID, profile_id: 'prof-stage', unit_id: 'unit-ta-201', role: 'stage_manager', status: 'active', joined_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mem-vol', society_id: DEMO_SOCIETY_ID, profile_id: 'prof-volunteer', unit_id: 'unit-tb-101', role: 'volunteer', status: 'active', joined_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mem-judge', society_id: DEMO_SOCIETY_ID, profile_id: 'prof-judge', unit_id: 'unit-tc-101', role: 'judge', status: 'active', joined_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'mem-res', society_id: DEMO_SOCIETY_ID, profile_id: 'prof-resident', unit_id: 'unit-ta-102', role: 'resident', status: 'active', joined_at: new Date().toISOString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  ...DEMO_PROFILES.slice(5).map((p, idx) => ({
    id: `mem-${p.id}`,
    society_id: DEMO_SOCIETY_ID,
    profile_id: p.id,
    unit_id: DEMO_UNITS[idx % DEMO_UNITS.length].id,
    role: 'resident' as const,
    status: 'active' as const,
    joined_at: new Date(Date.now() - (60 - idx) * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })),
];

export const DEMO_CATEGORIES: EventCategory[] = [
  { id: 'cat-01', society_id: DEMO_SOCIETY_ID, name: 'Bollywood Dance', description: 'Solo and group Bollywood choreography', default_duration_seconds: 300, default_transition_seconds: 60, max_participants: 12, requires_media: true, requires_judging: true, created_at: new Date().toISOString() },
  { id: 'cat-02', society_id: DEMO_SOCIETY_ID, name: 'Kids Performance', description: 'Kids under 12 solo or duo acts', default_duration_seconds: 240, default_transition_seconds: 60, max_participants: 6, requires_media: true, requires_judging: true, created_at: new Date().toISOString() },
  { id: 'cat-03', society_id: DEMO_SOCIETY_ID, name: 'Classical Singing & Vocal', description: 'Indian Classical, Hindustani & Carnatic vocal', default_duration_seconds: 360, default_transition_seconds: 90, max_participants: 3, requires_media: false, requires_judging: true, created_at: new Date().toISOString() },
  { id: 'cat-04', society_id: DEMO_SOCIETY_ID, name: 'Instrumental Music', description: 'Guitar, Keyboard, Tabla, Flute, Violin recital', default_duration_seconds: 300, default_transition_seconds: 90, max_participants: 4, requires_media: false, requires_judging: true, created_at: new Date().toISOString() },
  { id: 'cat-05', society_id: DEMO_SOCIETY_ID, name: 'Drama & Skit', description: 'Theatrical acts and comedic society skits', default_duration_seconds: 480, default_transition_seconds: 120, max_participants: 15, requires_media: true, requires_judging: true, created_at: new Date().toISOString() },
  { id: 'cat-06', society_id: DEMO_SOCIETY_ID, name: 'Stand-up Comedy', description: 'Clean humor and observational comedy', default_duration_seconds: 240, default_transition_seconds: 45, max_participants: 1, requires_media: false, requires_judging: true, created_at: new Date().toISOString() },
  { id: 'cat-07', society_id: DEMO_SOCIETY_ID, name: 'Poetry & Shayari', description: 'Recitation of original or classical poetry', default_duration_seconds: 180, default_transition_seconds: 45, max_participants: 2, requires_media: false, requires_judging: false, created_at: new Date().toISOString() },
  { id: 'cat-08', society_id: DEMO_SOCIETY_ID, name: 'Couple Dance', description: 'Duet performances and couple salsa/waltz', default_duration_seconds: 300, default_transition_seconds: 60, max_participants: 2, requires_media: true, requires_judging: true, created_at: new Date().toISOString() },
  { id: 'cat-09', society_id: DEMO_SOCIETY_ID, name: 'Fashion Show', description: 'Traditional and fusion community ramp walk', default_duration_seconds: 420, default_transition_seconds: 90, max_participants: 20, requires_media: true, requires_judging: true, created_at: new Date().toISOString() },
  { id: 'cat-10', society_id: DEMO_SOCIETY_ID, name: 'Grand Finale Showcase', description: 'Closing collaborative mega act', default_duration_seconds: 480, default_transition_seconds: 60, max_participants: 30, requires_media: true, requires_judging: false, created_at: new Date().toISOString() },
];

export const DEMO_EVENTS: Event[] = [
  {
    id: DEMO_EVENT_ID,
    society_id: DEMO_SOCIETY_ID,
    name: 'Green Valley Cultural Night 2026',
    slug: 'green-valley-cultural-night-2026',
    description: 'The premier annual cultural extravaganza of Green Valley Residency featuring dance, music, theater, kids shows, and awards!',
    cover_image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    event_type: 'Annual Cultural Festival',
    venue: 'Society Central Amphitheatre & Clubhouse Lawn',
    start_at: new Date(Date.now() + 2 * 86400000).toISOString(),
    end_at: new Date(Date.now() + 2 * 86400000 + 4 * 3600000).toISOString(),
    registration_open_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    registration_close_at: new Date(Date.now() + 1 * 86400000).toISOString(),
    status: 'live',
    created_by: 'prof-admin',
    settings_json: {
      max_registrations_per_user: 2,
      allow_guests: true,
      require_guardian_consent_under_age: 18,
      rules_and_guidelines: '1. All participants must report backstage 20 minutes before slot.\n2. Audio tracks must be MP3 format.\n3. Keep stage props strictly eco-friendly.',
    },
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'evt-navratri-2026',
    society_id: DEMO_SOCIETY_ID,
    name: 'Navratri Dandiya & Garba Raas',
    slug: 'navratri-dandiya-garba-raas',
    description: 'Nine nights of devotion, rhythm, vibrant traditional attire and society-wide garba circles with live dhol.',
    cover_image_url: 'https://images.unsplash.com/photo-1603228254119-e6aefd84be25?w=1200&auto=format&fit=crop&q=80',
    event_type: 'Festival Celebration',
    venue: 'Clubhouse Open Courtyard',
    start_at: new Date(Date.now() + 15 * 86400000).toISOString(),
    end_at: new Date(Date.now() + 15 * 86400000 + 5 * 3600000).toISOString(),
    registration_open_at: new Date().toISOString(),
    registration_close_at: new Date(Date.now() + 12 * 86400000).toISOString(),
    status: 'registration_open',
    created_by: 'prof-admin',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'evt-diwali-2026',
    society_id: DEMO_SOCIETY_ID,
    name: 'Diwali Deepotsav & Musical Gala',
    slug: 'diwali-deepotsav-musical-gala',
    description: 'Diwali lights, rangoli contest, instrumental acoustic performances, food stalls, and acoustic music night.',
    cover_image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    event_type: 'Festival Celebration',
    venue: 'Tower A & B Central Walkway',
    start_at: new Date(Date.now() + 45 * 86400000).toISOString(),
    end_at: new Date(Date.now() + 45 * 86400000 + 4 * 3600000).toISOString(),
    registration_open_at: new Date(Date.now() + 20 * 86400000).toISOString(),
    registration_close_at: new Date(Date.now() + 40 * 86400000).toISOString(),
    status: 'published',
    created_by: 'prof-admin',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'evt-republic-2027',
    society_id: DEMO_SOCIETY_ID,
    name: 'Republic Day Parade & Patriotic Songs',
    slug: 'republic-day-parade-patriotic-songs',
    description: 'Flag hoisting ceremony followed by patriotic choir performances, children speech competition, and community breakfast.',
    cover_image_url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&auto=format&fit=crop&q=80',
    event_type: 'National Celebration',
    venue: 'Main Gate Promenade & Stage',
    start_at: new Date(Date.now() + 110 * 86400000).toISOString(),
    end_at: new Date(Date.now() + 110 * 86400000 + 3 * 3600000).toISOString(),
    registration_open_at: new Date(Date.now() + 80 * 86400000).toISOString(),
    registration_close_at: new Date(Date.now() + 105 * 86400000).toISOString(),
    status: 'draft',
    created_by: 'prof-admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// The 15 Performances specified for Green Valley Cultural Night:
// #01 Welcome Dance
// #02 Kids Solo
// #03 Classical Singing
// #04 Group Dance
// #05 Instrumental
// #06 Comedy
// #07 Bollywood Dance
// #08 Poetry
// #09 Kids Group Dance
// #10 Drama
// #11 Couple Dance
// #12 Singing
// #13 Fashion Show
// #14 Instrumental
// #15 Finale

const performanceMeta = [
  { num: 1, title: 'Welcome Dance - Ganesha Vandana', cat: 'cat-01', dur: 300, submitter: 'prof-06', status: 'completed' as const, equip: '2 Cordless Mics, Stage Fog' },
  { num: 2, title: 'Kids Solo - Twinkling Stars', cat: 'cat-02', dur: 240, submitter: 'prof-08', status: 'completed' as const, equip: 'Center Spotlight, Monitor speaker' },
  { num: 3, title: 'Classical Singing - Raag Yaman', cat: 'cat-03', dur: 360, submitter: 'prof-11', status: 'on_stage' as const, equip: 'Harmonium stand, 2 Condenser mics, Tanpura audio' },
  { num: 4, title: 'Group Dance - Retro Bollywood Dhamaka', cat: 'cat-01', dur: 300, submitter: 'prof-resident', status: 'ready' as const, equip: 'Full stage lighting, MP3 track from cue 0:00' },
  { num: 5, title: 'Instrumental - Acoustic Guitar Medley', cat: 'cat-04', dur: 300, submitter: 'prof-13', status: 'checked_in' as const, equip: 'Guitar DI Box, Vocal mic with boom stand' },
  { num: 6, title: 'Comedy - Apartment Maintenance Blues', cat: 'cat-06', dur: 240, submitter: 'prof-07', status: 'queued' as const, equip: 'Single Handheld Wireless Mic with straight stand' },
  { num: 7, title: 'Bollywood Dance - Folk Fusion Energy', cat: 'cat-01', dur: 300, submitter: 'prof-10', status: 'queued' as const, equip: 'Side fill monitors, Dynamic strobe light' },
  { num: 8, title: 'Poetry - Gulzar & Modern Musings', cat: 'cat-07', dur: 180, submitter: 'prof-15', status: 'queued' as const, equip: 'Podium Mic, Warm ambient light' },
  { num: 9, title: 'Kids Group Dance - Little Champions', cat: 'cat-02', dur: 300, submitter: 'prof-14', status: 'queued' as const, equip: 'Stage wide coverage, Volunteer assistance backstage' },
  { num: 10, title: 'Drama - Tower Troubles The Skit', cat: 'cat-05', dur: 480, submitter: 'prof-17', status: 'queued' as const, equip: '4 Headset wireless mics, 2 Chairs, 1 Coffee table' },
  { num: 11, title: 'Couple Dance - Moonlit Waltz & Salsa', cat: 'cat-08', dur: 300, submitter: 'prof-19', status: 'queued' as const, equip: 'Pin spotlight, Blue romantic backwash' },
  { num: 12, title: 'Singing - Melodies of the 90s', cat: 'cat-03', dur: 300, submitter: 'prof-21', status: 'queued' as const, equip: 'Wireless vocal mic, Karaoke track sync' },
  { num: 13, title: 'Fashion Show - Unity in Diversity Ramp Walk', cat: 'cat-09', dur: 420, submitter: 'prof-24', status: 'queued' as const, equip: 'Runway spotlight, Upbeat techno beat track' },
  { num: 14, title: 'Instrumental - Jugalbandi: Flute & Tabla', cat: 'cat-04', dur: 360, submitter: 'prof-25', status: 'queued' as const, equip: 'Stage carpet, 3 Instrument mics on low stands' },
  { num: 15, title: 'Finale - Society Anthem & Grand Flashmob', cat: 'cat-10', dur: 480, submitter: 'prof-admin', status: 'queued' as const, equip: 'Confetti cannons, Full house lights, All mics live' },
];

const demoFlats = [
  { wing: 'Wing A', flat: 'A-101' },
  { wing: 'Wing B', flat: 'B-101' },
  { wing: 'Wing C', flat: 'C-101' },
  { wing: 'Wing A', flat: 'A-102' },
  { wing: 'Wing B', flat: 'B-202' },
  { wing: 'Wing A', flat: 'A-201' },
  { wing: 'Wing A', flat: 'A-301' },
  { wing: 'Wing C', flat: 'C-201' },
  { wing: 'Wing B', flat: 'B-301' },
  { wing: 'Wing A', flat: 'A-401' },
  { wing: 'Wing C', flat: 'C-302' },
  { wing: 'Wing B', flat: 'B-402' },
  { wing: 'Wing C', flat: 'C-401' },
  { wing: 'Wing B', flat: 'B-503' },
  { wing: 'Wing A', flat: 'A-501' },
];

export const DEMO_REGISTRATIONS: Registration[] = performanceMeta.map((p, idx) => ({
  id: `reg-${String(idx + 1).padStart(2, '0')}`,
  event_id: DEMO_EVENT_ID,
  category_id: p.cat,
  submitted_by: p.submitter,
  title: p.title,
  wing: demoFlats[idx % demoFlats.length].wing,
  flat_number: demoFlats[idx % demoFlats.length].flat,
  status: 'approved' as const,
  duration_seconds: p.dur,
  special_requirements: p.equip,
  admin_notes: 'Approved after audition video review. Lineup verified.',
  submitted_at: new Date(Date.now() - (10 - idx * 0.5) * 86400000).toISOString(),
  reviewed_at: new Date(Date.now() - (5 - idx * 0.2) * 86400000).toISOString(),
  reviewed_by: 'prof-admin',
  created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
}));

export const DEMO_REGISTRATION_MEMBERS: RegistrationMember[] = [
  // Welcome Dance
  { id: 'rm-01-1', registration_id: 'reg-01', profile_id: 'prof-06', display_name: 'Pooja Hegde', age: 31, role_in_performance: 'Lead Classical Dancer', guardian_consent: false, created_at: new Date().toISOString() },
  { id: 'rm-01-2', registration_id: 'reg-01', profile_id: 'prof-10', display_name: 'Divya Nair', age: 27, role_in_performance: 'Supporting Dancer', guardian_consent: false, created_at: new Date().toISOString() },

  // Kids Solo
  { id: 'rm-02-1', registration_id: 'reg-02', profile_id: null, display_name: 'Anaya Kulkarni', age: 8, role_in_performance: 'Solo Performer', guardian_profile_id: 'prof-08', guardian_consent: true, created_at: new Date().toISOString() },

  // Classical Singing
  { id: 'rm-03-1', registration_id: 'reg-03', profile_id: 'prof-11', display_name: 'Siddharth Rao', age: 34, role_in_performance: 'Lead Vocalist', guardian_consent: false, created_at: new Date().toISOString() },

  // Group Dance (Resident user registration)
  { id: 'rm-04-1', registration_id: 'reg-04', profile_id: 'prof-resident', display_name: 'Aarav Patel', age: 33, role_in_performance: 'Choreographer & Lead', guardian_consent: false, created_at: new Date().toISOString() },
  { id: 'rm-04-2', registration_id: 'reg-04', profile_id: 'prof-07', display_name: 'Kabir Verma', age: 36, role_in_performance: 'Dancer', guardian_consent: false, created_at: new Date().toISOString() },
  { id: 'rm-04-3', registration_id: 'reg-04', profile_id: 'prof-12', display_name: 'Tanvi Sen', age: 30, role_in_performance: 'Dancer', guardian_consent: false, created_at: new Date().toISOString() },

  // Add sample members for other performances
  ...performanceMeta.slice(4).map((p, idx) => ({
    id: `rm-${String(idx + 5).padStart(2, '0')}-1`,
    registration_id: `reg-${String(idx + 5).padStart(2, '0')}`,
    profile_id: p.submitter,
    display_name: DEMO_PROFILES.find((pr) => pr.id === p.submitter)?.full_name || 'Participant',
    age: 32,
    role_in_performance: 'Performer',
    guardian_consent: false,
    created_at: new Date().toISOString(),
  })),
];

export const DEMO_MEDIA: MediaAsset[] = [
  {
    id: 'med-01',
    society_id: DEMO_SOCIETY_ID,
    event_id: DEMO_EVENT_ID,
    registration_id: 'reg-04',
    uploaded_by: 'prof-resident',
    media_type: 'audio',
    file_name: 'retro_bollywood_mix_final.mp3',
    storage_path: 'performance-audio/retro_bollywood_mix_final.mp3',
    mime_type: 'audio/mpeg',
    file_size: 7850000,
    duration_seconds: 300,
    visibility: 'event_admins',
    created_at: new Date().toISOString(),
    // Royalty-free demo sample stream
    public_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=bollywood-groove-112194.mp3',
  },
  {
    id: 'med-02',
    society_id: DEMO_SOCIETY_ID,
    event_id: DEMO_EVENT_ID,
    registration_id: 'reg-01',
    uploaded_by: 'prof-06',
    media_type: 'audio',
    file_name: 'ganesha_vandana_classical.mp3',
    storage_path: 'performance-audio/ganesha_vandana_classical.mp3',
    mime_type: 'audio/mpeg',
    file_size: 8900000,
    duration_seconds: 300,
    visibility: 'event_admins',
    created_at: new Date().toISOString(),
    public_url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=indian-meditation-flute-10360.mp3',
  },
  {
    id: 'med-03',
    society_id: DEMO_SOCIETY_ID,
    event_id: DEMO_EVENT_ID,
    registration_id: 'reg-04',
    uploaded_by: 'prof-resident',
    media_type: 'image',
    file_name: 'troupe_costume_photo.jpg',
    storage_path: 'participant-photos/troupe_costume_photo.jpg',
    mime_type: 'image/jpeg',
    file_size: 2150000,
    visibility: 'event_admins',
    created_at: new Date().toISOString(),
    public_url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop&q=80',
  },
];

// Base start time for live schedule calculations (Event day 18:00 IST)
const eventStartBase = new Date(Date.now() - 30 * 60000); // Live event started 30 mins ago

export const DEMO_PERFORMANCES: Performance[] = performanceMeta.map((p, idx) => {
  const perfStart = new Date(eventStartBase.getTime() + idx * 360000); // 6 mins per item
  const perfEnd = new Date(perfStart.getTime() + p.dur * 1000);

  let actualStart = null;
  let actualEnd = null;

  if (p.status === 'completed') {
    actualStart = perfStart.toISOString();
    actualEnd = perfEnd.toISOString();
  } else if (p.status === 'on_stage') {
    actualStart = new Date(Date.now() - 120000).toISOString(); // 2 mins into performance
  }

  return {
    id: `perf-${String(idx + 1).padStart(2, '0')}`,
    event_id: DEMO_EVENT_ID,
    registration_id: `reg-${String(idx + 1).padStart(2, '0')}`,
    performance_number: p.num,
    title: p.title,
    category_id: p.cat,
    duration_seconds: p.dur,
    transition_seconds: 60,
    equipment_notes: p.equip,
    stage_notes: `Cue technician: verify stage monitors for #${p.num}`,
    status: p.status,
    scheduled_start_at: perfStart.toISOString(),
    scheduled_end_at: perfEnd.toISOString(),
    actual_start_at: actualStart,
    actual_end_at: actualEnd,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };
});

export const DEMO_SCHEDULE_ITEMS: ScheduleItem[] = DEMO_PERFORMANCES.map((perf, idx) => ({
  id: `sched-${perf.id}`,
  event_id: DEMO_EVENT_ID,
  performance_id: perf.id,
  sequence_number: idx + 1,
  scheduled_start_at: perf.scheduled_start_at!,
  scheduled_end_at: perf.scheduled_end_at!,
  buffer_seconds: 60,
  notes: `Position ${idx + 1} in official lineup`,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

export const DEMO_CHECKINS: Checkin[] = [
  { id: 'chk-01', event_id: DEMO_EVENT_ID, performance_id: 'perf-01', checked_in_by: 'prof-volunteer', checked_in_at: new Date(Date.now() - 45 * 60000).toISOString(), status: 'present', notes: 'All costume props verified' },
  { id: 'chk-02', event_id: DEMO_EVENT_ID, performance_id: 'perf-02', checked_in_by: 'prof-volunteer', checked_in_at: new Date(Date.now() - 40 * 60000).toISOString(), status: 'present', notes: 'Parent present backstage' },
  { id: 'chk-03', event_id: DEMO_EVENT_ID, performance_id: 'perf-03', checked_in_by: 'prof-volunteer', checked_in_at: new Date(Date.now() - 35 * 60000).toISOString(), status: 'present', notes: 'Harmonium tuned' },
  { id: 'chk-04', event_id: DEMO_EVENT_ID, performance_id: 'perf-04', checked_in_by: 'prof-volunteer', checked_in_at: new Date(Date.now() - 25 * 60000).toISOString(), status: 'present', notes: 'All 3 members ready in Green Room 1' },
  { id: 'chk-05', event_id: DEMO_EVENT_ID, performance_id: 'perf-05', checked_in_by: 'prof-volunteer', checked_in_at: new Date(Date.now() - 15 * 60000).toISOString(), status: 'present', notes: 'Guitar tested on soundboard' },
];

export const DEMO_VOLUNTEERS: Volunteer[] = [
  { id: 'vol-01', event_id: DEMO_EVENT_ID, profile_id: 'prof-volunteer', responsibility: 'Backstage & Green Room Coordination', area: 'Green Room Wing B', status: 'active', notes: 'Managing lineup cues 1-8' },
  { id: 'vol-02', event_id: DEMO_EVENT_ID, profile_id: 'prof-18', responsibility: 'Resident & Participant Check-in Gate', area: 'Amphitheatre Gate 1', status: 'active', notes: 'Scanning QR & manual roster checking' },
  { id: 'vol-03', event_id: DEMO_EVENT_ID, profile_id: 'prof-23', responsibility: 'Sound & Audio Track Cueing', area: 'Main AV Console', status: 'active', notes: 'Syncing with Stage Manager' },
  { id: 'vol-04', event_id: DEMO_EVENT_ID, profile_id: 'prof-28', responsibility: 'Kids Care & Green Room Attendant', area: 'Clubhouse Activity Room', status: 'active', notes: 'Assisting parents & little performers' },
];

export const DEMO_JUDGES: Judge[] = [
  { id: 'jdg-01', event_id: DEMO_EVENT_ID, profile_id: 'prof-judge', assigned_categories: ['cat-01', 'cat-02', 'cat-03', 'cat-04', 'cat-05', 'cat-06', 'cat-08', 'cat-09'], created_at: new Date().toISOString() },
  { id: 'jdg-02', event_id: DEMO_EVENT_ID, profile_id: 'prof-09', assigned_categories: ['cat-01', 'cat-03', 'cat-04'], created_at: new Date().toISOString() },
];

export const DEMO_SCORECARDS: Scorecard[] = [
  {
    id: 'sc-dance',
    event_id: DEMO_EVENT_ID,
    category_id: 'cat-01',
    name: 'Dance Evaluation Rubric',
    criteria_json: [
      { id: 'crit-sync', name: 'Rhythm & Synchronization', max_score: 30, description: 'Coordination, beat precision, timing' },
      { id: 'crit-expr', name: 'Stage Presence & Expressions', max_score: 30, description: 'Energy, eye contact, storytelling' },
      { id: 'crit-choreo', name: 'Choreography & Creativity', max_score: 25, description: 'Formations, originality, novelty' },
      { id: 'crit-costume', name: 'Costume & Presentation', max_score: 15, description: 'Neatness, visual impact' },
    ],
    max_score: 100,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sc-vocal',
    event_id: DEMO_EVENT_ID,
    category_id: 'cat-03',
    name: 'Vocal Performance Rubric',
    criteria_json: [
      { id: 'crit-pitch', name: 'Pitch & Sur (Accuracy)', max_score: 40, description: 'Tuning, pitch clarity' },
      { id: 'crit-taal', name: 'Rhythm & Taal', max_score: 30, description: 'Tempo adherence and flow' },
      { id: 'crit-feel', name: 'Bhava & Expression', max_score: 20, description: 'Soulfulness and depth' },
      { id: 'crit-clarity', name: 'Diction & Pronunciation', max_score: 10, description: 'Lyrics clarity' },
    ],
    max_score: 100,
    created_at: new Date().toISOString(),
  },
];

export const DEMO_SCORES: Score[] = [
  {
    id: 'score-01',
    event_id: DEMO_EVENT_ID,
    performance_id: 'perf-01',
    judge_id: 'prof-judge',
    scorecard_id: 'sc-dance',
    score_json: { 'crit-sync': 28, 'crit-expr': 29, 'crit-choreo': 23, 'crit-costume': 14 },
    total_score: 94,
    comments: 'Spectacular invocation dance! Superb synchronization and traditional authentic attire.',
    submitted_at: new Date(Date.now() - 22 * 60000).toISOString(),
  },
];

export const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-01',
    event_id: DEMO_EVENT_ID,
    created_by: 'prof-admin',
    title: 'Welcome to Green Valley Cultural Night!',
    message: 'Food counters are open in Zone C. Please keep the center aisle clear for stage performers.',
    announcement_type: 'general',
    sent_at: new Date(Date.now() - 35 * 60000).toISOString(),
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    id: 'ann-02',
    event_id: DEMO_EVENT_ID,
    created_by: 'prof-stage',
    title: 'Stage Call: #04 Retro Bollywood Troupe',
    message: 'Performers for Act #04 please report to the Left Stage Wing immediately for mic briefing.',
    announcement_type: 'stage_call',
    sent_at: new Date(Date.now() - 5 * 60000).toISOString(),
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-01',
    society_id: DEMO_SOCIETY_ID,
    event_id: DEMO_EVENT_ID,
    recipient_profile_id: 'prof-resident',
    type: 'registration_approved',
    title: 'Registration Approved! 🎉',
    body: 'Your performance "Retro Bollywood Dhamaka" has been approved and placed at slot #04 in the official lineup.',
    data_json: { performance_id: 'perf-04', performance_number: 4 },
    read_at: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'notif-02',
    society_id: DEMO_SOCIETY_ID,
    event_id: DEMO_EVENT_ID,
    recipient_profile_id: 'prof-resident',
    type: 'lineup_published',
    title: 'Official Lineup Published 📅',
    body: 'The schedule for Green Valley Cultural Night is now live. Please review your performance slot.',
    data_json: { event_id: DEMO_EVENT_ID },
    read_at: new Date(Date.now() - 40000000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const DEMO_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-01',
    society_id: DEMO_SOCIETY_ID,
    actor_profile_id: 'prof-admin',
    action: 'event_published',
    entity_type: 'events',
    entity_id: DEMO_EVENT_ID,
    before_json: { status: 'draft' },
    after_json: { status: 'live' },
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'audit-02',
    society_id: DEMO_SOCIETY_ID,
    actor_profile_id: 'prof-admin',
    action: 'registration_approved',
    entity_type: 'registrations',
    entity_id: 'reg-04',
    before_json: { status: 'submitted' },
    after_json: { status: 'approved' },
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'audit-03',
    society_id: DEMO_SOCIETY_ID,
    actor_profile_id: 'prof-stage',
    action: 'live_performance_started',
    entity_type: 'performances',
    entity_id: 'perf-03',
    before_json: { status: 'ready' },
    after_json: { status: 'on_stage' },
    created_at: new Date(Date.now() - 120000).toISOString(),
  },
];
