export const ngos = [
  {
    id: 1,
    name: "Postpartum Support Network Africa",
    cover_image: "https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=600&q=80",
    mission: "Educating mothers and eradicating the stigma surrounding postpartum depression across Africa.",
    focus_areas: "PPD Education, Stigma",
    services: ["Support Groups", "Helpline"],
    geographic_coverage: "National (Nigeria)",
    coverage_type: "national",
    contact: { phone: "+234 800 000 0000", email: "hello@psnaf.org" },
    website: "https://example.com/psnaf"
  },
  {
    id: 2,
    name: "Mentally Aware Nigeria Initiative (MANI)",
    cover_image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80",
    mission: "Providing accessible mental health care and crisis intervention for young adults and new mothers.",
    focus_areas: "Crisis Intervention",
    services: ["Therapy Funds", "24/7 Helpline"],
    geographic_coverage: "Lagos & Abuja",
    coverage_type: "regional",
    contact: { phone: "+234 809 111 6264", email: "info@mentallyaware.org" },
    website: "https://example.com/mani"
  },
  {
    id: 3,
    name: "The Maternal Village",
    cover_image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&q=80",
    mission: "A grassroots community supporting low-income mothers with essential baby supplies and peer support.",
    focus_areas: "Maternal Welfare",
    services: ["Supply Drives", "Meetups"],
    geographic_coverage: "Ibadan",
    coverage_type: "local",
    contact: { phone: "+234 803 222 3333", email: "village@example.org" },
    website: "https://example.com/village"
  },
  {
    id: 4,
    name: "Mums In Need Foundation",
    cover_image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80",
    mission: "Offering financial assistance and free therapy sessions to mothers diagnosed with severe PPD.",
    focus_areas: "Financial Aid, Therapy",
    services: ["Grants", "Counselling"],
    geographic_coverage: "National (Nigeria)",
    coverage_type: "national",
    contact: { phone: "+234 811 444 5555", email: "aid@mumsinneed.org" },
    website: "https://example.com/mumsinneed"
  },
  {
    id: 5,
    name: "Safe Haven Enugu",
    cover_image: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=600&q=80",
    mission: "Creating safe physical spaces for mothers experiencing postpartum psychosis or severe trauma.",
    focus_areas: "Crisis Intervention, Housing",
    services: ["Shelter", "Psychiatric Care"],
    geographic_coverage: "Enugu",
    coverage_type: "local",
    contact: { phone: "+234 805 666 7777", email: "help@safehavenenugu.ng" },
    website: "https://example.com/safehaven"
  },
  {
    id: 6,
    name: "Arewa Maternal Health Initiative",
    cover_image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=80",
    mission: "Bridging the gap in maternal mental health education in Northern Nigeria through community outreach.",
    focus_areas: "Education, Outreach",
    services: ["Workshops", "Translations"],
    geographic_coverage: "Northern Nigeria",
    coverage_type: "regional",
    contact: { phone: "+234 806 888 9999", email: "contact@arewamaternal.org" },
    website: "https://example.com/arewamaternal"
  },
  {
    id: 7,
    name: "Lagos Working Mothers Network",
    cover_image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80",
    mission: "A professional network offering group therapy and career transition support for returning mothers.",
    focus_areas: "Career, Maternal Welfare",
    services: ["Group Therapy", "Mentorship"],
    geographic_coverage: "Lagos",
    coverage_type: "local",
    contact: { phone: "+234 810 123 4567", email: "hello@lwmn.ng" },
    website: "https://example.com/lwmn"
  }
];

export async function fetchNGOs() {
  await new Promise(resolve => setTimeout(resolve, 500));
  return ngos;
}