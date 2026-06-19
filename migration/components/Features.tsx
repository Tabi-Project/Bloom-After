import Link from "next/link";
import {
  BookOpen,
  MapPin,
  Users,
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface FeatureCard {
  icon: LucideIcon;
  heading: string;
  desc: string;
  linkText: string;
  linkUrl: string;
}

interface TrustItem {
  icon: LucideIcon;
  text: string;
}

const featuresData: FeatureCard[] = [
  {
    icon: BookOpen,
    heading: "Learn",
    desc: "Understand the signs with bite-sized, clinically vetted articles.",
    linkText: "Explore Resources",
    linkUrl: "/resources",
  },
  {
    icon: MapPin,
    heading: "Find Care",
    desc: "Locate vetted clinics, hospitals, and specialists near you.",
    linkText: "Search Directory",
    linkUrl: "/clinics",
  },
  {
    icon: Users,
    heading: "Connect",
    desc: "Read moderated, real stories from other mothers who have been there.",
    linkText: "Read Stories",
    linkUrl: "/stories",
  },
];

const trustData: TrustItem[] = [
  {
    icon: CheckCircle2,
    text: "Everything here has been reviewed by a qualified health professional.",
  },
  {
    icon: ShieldCheck,
    text: "Your privacy is absolute. Nothing is shared, sold, or tracked.",
  },
  {
    icon: HeartHandshake,
    text: "This is a space to understand, not to compare.",
  },
];

export function FeaturesCards() {
  return (
    <>
      {featuresData.map((item) => {
        const Icon = item.icon;
        return (
          <article className="features-card" key={item.heading}>
            <div className="features-card-icon" aria-hidden="true">
              <Icon strokeWidth={2} />
            </div>
            <h3 className="features-card-heading">{item.heading}</h3>
            <p className="features-card-desc">{item.desc}</p>
            <Link href={item.linkUrl} className="features-link">
              {item.linkText}
              <span className="features-link-icon" aria-hidden="true">
                <ArrowRight strokeWidth={2} />
              </span>
            </Link>
          </article>
        );
      })}
    </>
  );
}

export function TrustBanner() {
  return (
    <ul className="grid-3 trust-grid">
      {trustData.map((item) => {
        const Icon = item.icon;
        return (
          <li className="trust-item" key={item.text}>
            <div className="trust-icon" aria-hidden="true">
              <Icon strokeWidth={2} />
            </div>
            <p className="trust-desc">{item.text}</p>
          </li>
        );
      })}
    </ul>
  );
}
