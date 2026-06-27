"use client";

import { useSearchParams } from "next/navigation";
import { useAdminAuth } from "@/components/admin/UseAdminAuth";
import ModerationList from "@/components/admin/ModerationList";
import type { TypeConfig, ModerationType, Submission } from "@/types/moderation";

function mockClinics(): Submission[] {
  return [
    { id: "c1", title: "Grace Medical Centre", description: "Excellent postpartum care in Lagos Island. Staff are very empathetic and experienced with PPD cases.", email: "grace@example.com", location: "Lagos, Nigeria", link: "https://gracemedical.ng", image_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&q=60", status: "pending", submittedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: "c2", title: "Safe Haven Clinic", description: "Specialist postpartum mental health clinic in Abuja. Offers both in-person and virtual sessions.", email: "info@safehaven.ng", location: "Abuja, Nigeria", link: "https://safehaven.ng", image_url: null, status: "pending", submittedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: "c3", title: "Bloom Wellness Ibadan", description: "Community-based wellness centre with a dedicated mothers unit.", email: null, location: "Ibadan, Nigeria", link: null, image_url: null, status: "approved", submittedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  ];
}

function mockSpecialists(): Submission[] {
  return [
    { id: "s1", title: "Dr. Funmi Adeyemi", description: "Perinatal psychiatrist with 12 years experience. Based in Lagos. Available for in-person and virtual consultations.", email: "funmi@example.com", speciality: "Perinatal Psychiatry", image_url: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=60", status: "pending", submittedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: "s2", title: "Dr. Chidi Nwosu", description: "Clinical psychologist specialising in maternal mental health and CBT for postpartum anxiety.", email: "chidi@example.com", speciality: "Clinical Psychology", image_url: null, status: "pending", submittedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: "s3", title: "Dr. Amaka Okafor", description: "Obstetrician with a strong focus on mental health screening during and after pregnancy.", email: null, speciality: "Obstetrics", image_url: null, status: "rejected", submittedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  ];
}

function mockMedia(): Submission[] {
  return [
    { id: "m1", title: "Motherhood Unfiltered — Ep. 12", description: "Podcast episode covering lived experiences of PPD in West Africa. Very raw and relatable.", email: "nkechi@example.com", link: "https://spotify.com/motherhood", image_url: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&q=60", mediaType: "Podcast", status: "pending", submittedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: "m2", title: "The Invisible Weight — Article", description: "Long-form article on postpartum depression stigma in Nigerian culture published in The Guardian Nigeria.", email: null, link: "https://guardian.ng/invisible-weight", image_url: null, mediaType: "Article", status: "pending", submittedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: "m3", title: "After Baby — Documentary", description: "Short documentary following four mothers through their PPD journeys. Beautifully made.", email: "tolu@example.com", link: "https://youtube.com/afterbaby", image_url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&q=60", mediaType: "Video", status: "approved", submittedAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  ];
}

function mockRequests(): Submission[] {
  return [
    { id: "r1", title: "Partnership — Postpartum Support International", description: "We are a global NGO supporting mothers with PPD. We would love to partner with Bloom After to expand our reach in West Africa.", email: "admin@ppsi.org", status: "pending", submittedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: "r2", title: "Resource submission — Peer support guide", description: "I have written a practical guide for peer supporters working with PPD mothers. Happy to share it freely.", email: "ada@example.com", status: "pending", submittedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: "r3", title: "Speaking request", description: "Requesting that Bloom After participate in our maternal health conference in Accra, November 2026.", email: "events@maternalhealth.org", status: "approved", submittedAt: new Date(Date.now() - 6 * 86400000).toISOString() },
  ];
}

const TYPE_CONFIG: Record<ModerationType, TypeConfig> = {
  clinic: {
    label: "Clinics",
    singular: "Clinic",
    subtitle: "Review and moderate clinic recommendations submitted by the community.",
    activePageId: "moderation-clinics",
    editPage: "/admin/clinic/edit",
    apiEndpoint: "/api/v1/admin/clinics",
    hasImage: true,
    hasLink: true,
    mockItems: mockClinics(),
  },
  specialist: {
    label: "Specialist Onboarding",
    singular: "Specialist",
    subtitle: "Review specialists submitted for listing on the platform.",
    activePageId: "specialists-onboarding",
    editPage: "/admin/specialist/edit",
    apiEndpoint: "/api/v1/admin/specialists",
    hasImage: true,
    hasLink: false,
    mockItems: mockSpecialists(),
  },
  media: {
    label: "Media Suggestions",
    singular: "Media",
    subtitle: "Review podcasts, articles, and media resources suggested by the community.",
    activePageId: "media-suggestions",
    editPage: "/admin/media/edit",
    apiEndpoint: "/api/v1/admin/media",
    hasImage: true,
    hasLink: true,
    mockItems: mockMedia(),
  },
  request: {
    label: "Other Requests",
    singular: "Request",
    subtitle: "Review partnership requests, resource submissions, and other enquiries.",
    activePageId: "moderation-other",
    editPage: "/admin/moderation?type=request",
    apiEndpoint: "/api/v1/admin/requests",
    hasImage: false,
    hasLink: false,
    mockItems: mockRequests(),
  },
};

export default function ModerationClient() {
  const { user, loading: authLoading } = useAdminAuth();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") || "clinic") as ModerationType;
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.clinic;

  if (authLoading) {
    return (
      <div className="admin-auth-loader visible" id="admin-auth-loader">
        <div
          className="admin-auth-loader-box"
          role="status"
          aria-live="polite"
          aria-label="Checking admin access"
        >
          <span className="admin-auth-loader-spinner" aria-hidden="true" />
          <p>Checking admin access…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="admin-layout">
      <div id="sidebar-root"></div>

      <div className="admin-main">
        <div id="topbar-root"></div>

        <main className="dashboard-content" id="main-content">
          <ModerationList cfg={cfg} />
        </main>
      </div>

      <div id="footer-root"></div>
    </div>
  );
}