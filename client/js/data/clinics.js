export const clinics = [
  {
    id: 1,
    name: "LUTH Mental Health Unit",
    provider_type: "clinic",
    city: "Idi-Araba",
    state: "Lagos",
    coordinates: [6.5204, 3.3490],
    fee_range: "₦5,000 - ₦15,000",
    cost_type: "subsidised",
    is_open_247: true,
    opening_hours: "Open 24/7",
    consultation_mode: "both",
    focus_areas: ["perinatal_anxiety", "psychiatric_medication"],
    accepting_new_patients: true,
    contact: {
      phone: "0800 111 2222",
      email: "psych@luth.gov.ng",
      address: "Ishaga Road, Idi-Araba, Lagos"
    },
    services: ["Therapy / Counselling", "Medication Management"]
  },
  {
    id: 2,
    name: "Mentally Aware Nigeria Initiative (MANI)",
    provider_type: "support_group",
    city: "Ikeja",
    state: "Lagos",
    coordinates: [6.5965, 3.3421],
    fee_range: "Free",
    cost_type: "free",
    is_open_247: false,
    opening_hours: "Mon-Fri: 9 AM - 5 PM",
    consultation_mode: "remote",
    focus_areas: ["perinatal_anxiety", "relationship_support"],
    accepting_new_patients: true,
    contact: {
      phone: "0809 111 6264",
      email: "help@mentallyaware.org",
      address: "Ikeja GRA, Lagos"
    },
    services: ["Therapy / Counselling", "Crisis Intervention", "Support Groups"]
  },
  {
    id: 3,
    name: "Dr. Amaka Osei",
    provider_type: "psychiatrist",
    city: "Yaba",
    state: "Lagos",
    coordinates: [6.5165, 3.3745],
    fee_range: "₦15,000 - ₦25,000",
    cost_type: "private",
    is_open_247: false,
    opening_hours: "Mon-Sat: 10 AM - 4 PM",
    consultation_mode: "both",
    focus_areas: ["psychiatric_medication", "birth_trauma"],
    accepting_new_patients: true,
    credentials: "BSc Psychology, MSc Clinical Psychiatry",
    languages: ["English", "Igbo", "Pidgin"],
    contact: {
      phone: "0810 222 3333",
      email: "contact@dramaka.com",
      address: "Yaba, Lagos"
    },
    services: ["Medication Management", "Psychiatric Evaluation"]
  },
  {
    id: 4,
    name: "MindCare Nigeria Therapy Centre",
    provider_type: "therapist",
    city: "Victoria Island",
    state: "Lagos",
    coordinates: [6.4281, 3.4219],
    fee_range: "₦20,000 - ₦40,000",
    cost_type: "private",
    is_open_247: false,
    opening_hours: "Mon-Fri: 8 AM - 6 PM",
    consultation_mode: "in_person",
    focus_areas: ["pregnancy_loss", "birth_trauma", "relationship_support"],
    accepting_new_patients: false,
    contact: {
      phone: "0800 000 1111",
      email: "hello@mindcare.ng",
      address: "VI, Lagos"
    },
    services: ["Cognitive Behavioral Therapy", "Couples Counselling"]
  },
  {
    id: 5,
    name: "The Retreat Healthcare",
    provider_type: "clinic",
    city: "Ikorodu",
    state: "Lagos",
    coordinates: [6.6194, 3.5105],
    fee_range: "₦20,000 - ₦40,000",
    cost_type: "private",
    is_open_247: true,
    opening_hours: "Open 24/7",
    consultation_mode: "both",
    focus_areas: ["psychiatric_medication"],
    accepting_new_patients: true,
    contact: {
      phone: "0800 999 8888",
      email: "care@theretreat.com",
      address: "Ikorodu, Lagos"
    },
    services: ["Inpatient Care", "Therapy / Counselling"]
  },
  {
    id: 6,
    name: "National Hospital Abuja - Psychiatry",
    provider_type: "clinic",
    city: "Abuja",
    state: "FCT",
    coordinates: [9.0479, 7.4764],
    fee_range: "₦4,000 - ₦12,000",
    cost_type: "subsidised",
    is_open_247: true,
    opening_hours: "Open 24/7",
    consultation_mode: "both",
    focus_areas: ["psychiatric_medication", "perinatal_anxiety"],
    accepting_new_patients: true,
    contact: {
      phone: "09 290 3222",
      email: "info@nationalhospital.gov.ng",
      address: "Central Business District, Abuja"
    },
    services: ["Medication Management", "Therapy / Counselling"]
  },
  {
    id: 7,
    name: "Synapse Services",
    provider_type: "clinic",
    city: "Abuja",
    state: "FCT",
    coordinates: [9.0765, 7.4951],
    fee_range: "₦25,000 - ₦45,000",
    cost_type: "private",
    is_open_247: true,
    opening_hours: "Open 24/7",
    consultation_mode: "both",
    focus_areas: ["perinatal_anxiety", "relationship_support"],
    accepting_new_patients: true,
    contact: {
      phone: "0815 288 8888",
      email: "info@synapseservices.org",
      address: "Maitama, Abuja"
    },
    services: ["Therapy / Counselling", "Support Groups", "Medication Management"]
  },
  {
    id: 8,
    name: "Abuja Maternal Support Group",
    provider_type: "support_group",
    city: "Karu",
    state: "FCT",
    coordinates: [9.0135, 7.5615],
    fee_range: "Free",
    cost_type: "free",
    is_open_247: false,
    opening_hours: "Sat: 10 AM - 12 PM",
    consultation_mode: "in_person",
    focus_areas: ["pregnancy_loss", "perinatal_anxiety"],
    accepting_new_patients: true,
    contact: {
      phone: "09 291 0000",
      email: "hello@amsg.org",
      address: "Karu Site, Abuja"
    },
    services: ["Peer Support", "Group Therapy"]
  },
  {
    id: 9,
    name: "University College Hospital (UCH)",
    provider_type: "clinic",
    city: "Ibadan",
    state: "Oyo",
    coordinates: [7.4018, 3.9002],
    fee_range: "₦3,000 - ₦10,000",
    cost_type: "subsidised",
    is_open_247: true,
    opening_hours: "Open 24/7",
    consultation_mode: "both",
    focus_areas: ["psychiatric_medication", "perinatal_anxiety"],
    accepting_new_patients: true,
    contact: {
      phone: "0810 000 0000",
      email: "info@uch-ibadan.org.ng",
      address: "Oritamefa, Ibadan"
    },
    services: ["Medication Management", "Inpatient Care", "Therapy / Counselling"]
  },
  {
    id: 10,
    name: "Dr. Femi Peters",
    provider_type: "therapist",
    city: "Ibadan",
    state: "Oyo",
    coordinates: [7.3524, 3.8686],
    fee_range: "₦10,000 - ₦15,000",
    cost_type: "private",
    is_open_247: false,
    opening_hours: "Mon-Fri: 9 AM - 5 PM",
    consultation_mode: "remote",
    focus_areas: ["relationship_support", "perinatal_anxiety"],
    accepting_new_patients: true,
    credentials: "BSc Psychology, Certified Cognitive Therapist",
    languages: ["English", "Yoruba"],
    contact: {
      phone: "0803 111 2222",
      email: "contact@fpmind.com",
      address: "Ring Road, Ibadan"
    },
    services: ["Cognitive Behavioral Therapy"]
  },
  {
    id: 11,
    name: "UPTH Psychiatry Dept",
    provider_type: "clinic",
    city: "Port Harcourt",
    state: "Rivers",
    coordinates: [4.9038, 6.9248],
    fee_range: "₦4,000 - ₦12,000",
    cost_type: "subsidised",
    is_open_247: true,
    opening_hours: "Open 24/7",
    consultation_mode: "both",
    focus_areas: ["psychiatric_medication"],
    accepting_new_patients: true,
    contact: {
      phone: "0800 777 6666",
      email: "info@upth.org",
      address: "Choba, Port Harcourt"
    },
    services: ["Medication Management", "Therapy / Counselling"]
  },
  {
    id: 12,
    name: "Federal Neuropsychiatric Hospital",
    provider_type: "clinic",
    city: "Port Harcourt",
    state: "Rivers",
    coordinates: [4.8468, 6.9698],
    fee_range: "₦2,000 - ₦7,000",
    cost_type: "subsidised",
    is_open_247: true,
    opening_hours: "Open 24/7",
    consultation_mode: "both",
    focus_areas: ["psychiatric_medication"],
    accepting_new_patients: true,
    contact: {
      phone: "0802 222 1111",
      email: "fnphrumuigbo@gov.ng",
      address: "Rumuigbo, Port Harcourt"
    },
    services: ["Inpatient Care", "Medication Management"]
  },
  {
    id: 13,
    name: "Federal Neuropsychiatric Hospital",
    provider_type: "clinic",
    city: "Enugu",
    state: "Enugu",
    coordinates: [6.4398, 7.5052],
    fee_range: "₦2,000 - ₦8,000",
    cost_type: "subsidised",
    is_open_247: true,
    opening_hours: "Open 24/7",
    consultation_mode: "both",
    focus_areas: ["perinatal_anxiety", "relationship_support"],
    accepting_new_patients: true,
    contact: {
      phone: "0804 444 5555",
      email: "info@fnphenugu.gov.ng",
      address: "New Haven, Enugu"
    },
    services: ["Therapy / Counselling", "Medication Management", "Support Groups"]
  },
  {
    id: 14,
    name: "Enugu Postpartum Network",
    provider_type: "support_group",
    city: "Enugu",
    state: "Enugu",
    coordinates: [6.3090, 7.4570],
    fee_range: "Free",
    cost_type: "free",
    is_open_247: false,
    opening_hours: "Wed: 4 PM - 6 PM",
    consultation_mode: "remote",
    focus_areas: ["birth_trauma", "perinatal_anxiety"],
    accepting_new_patients: true,
    contact: {
      phone: "0805 555 6666",
      email: "contact@epn.org.ng",
      address: "Remote"
    },
    services: ["Support Groups"]
  },
  {
    id: 15,
    name: "Aminu Kano Teaching Hospital",
    provider_type: "clinic",
    city: "Kano",
    state: "Kano",
    coordinates: [11.9790, 8.5283],
    fee_range: "₦2,000 - ₦8,000",
    cost_type: "subsidised",
    is_open_247: true,
    opening_hours: "Open 24/7",
    consultation_mode: "both",
    focus_areas: ["psychiatric_medication", "perinatal_anxiety"],
    accepting_new_patients: true,
    contact: {
      phone: "0806 666 7777",
      email: "info@akth.gov.ng",
      address: "Zaria Road, Kano"
    },
    services: ["Therapy / Counselling", "Medication Management"]
  }
];

export async function fetchClinics() {
  await new Promise(resolve => setTimeout(resolve, 600)); 
  return clinics;
}