import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ShieldAlert,
  Heart,
  Frown,
  Brain,
  Baby,
  HandHeart,
  HeartCrack,
  Stethoscope,
} from "lucide-react";

export type Severity = "critical" | "urgent" | "distress";

export interface CrisisStep {
  text: string;
}

export interface CrisisScenario {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  severity: Severity;
  ctaLabel: string;
  modalTag: string;
  modalTagColor: string;
  modalTagBg: string;
  steps: CrisisStep[];
}

export interface CrisisSection {
  title: string;
  scenarios: CrisisScenario[];
}

export const crisisSections: CrisisSection[] = [
  {
    title: "Critical — Immediate Danger",
    scenarios: [
      {
        id: "suicidal-thoughts",
        icon: AlertTriangle,
        title: "Thoughts of Self-Harm or Suicide",
        description:
          "If you are having thoughts of ending your life or hurting yourself, please act now. You deserve immediate help.",
        severity: "critical",
        ctaLabel: "Get immediate steps",
        modalTag: "CRITICAL",
        modalTagColor: "#fff",
        modalTagBg: "var(--color-danger)",
        steps: [
          { text: "Call 112 (emergency) or go to the nearest hospital immediately." },
          { text: "Tell someone you trust — your partner, a friend, a family member — right now." },
          { text: "Remove any items that could be used for self-harm from your immediate environment." },
          { text: "Stay with another person until professional help arrives." },
          { text: "Remember: these feelings are temporary and treatable. You are not a burden." },
        ],
      },
      {
        id: "harm-to-baby",
        icon: ShieldAlert,
        title: "Thoughts of Harming Your Baby",
        description:
          "Intrusive thoughts about hurting your child are a recognized symptom. Having the thought does not make you a bad mother.",
        severity: "critical",
        ctaLabel: "Get immediate steps",
        modalTag: "CRITICAL",
        modalTagColor: "#fff",
        modalTagBg: "var(--color-danger)",
        steps: [
          { text: "Place your baby in a safe space (crib, bassinet) and step away briefly." },
          { text: "Call a trusted person to come be with you and the baby immediately." },
          { text: "Call 112 or your doctor and explain what you are experiencing." },
          { text: "These thoughts are a medical symptom, not a reflection of who you are as a mother." },
          { text: "Do not be alone with the baby until you have spoken to a professional." },
        ],
      },
      {
        id: "psychosis-signs",
        icon: Brain,
        title: "Signs of Postpartum Psychosis",
        description:
          "Hallucinations, delusions, extreme confusion, or inability to sleep for days. This is a medical emergency.",
        severity: "critical",
        ctaLabel: "Get immediate steps",
        modalTag: "CRITICAL",
        modalTagColor: "#fff",
        modalTagBg: "var(--color-danger)",
        steps: [
          { text: "This is a medical emergency. Call 112 immediately." },
          { text: "Do not leave the person alone. Stay with them or ensure someone else does." },
          { text: "Remove access to medications, sharp objects, and the baby if unsupervised." },
          { text: "Do not try to 'reason' with delusions or hallucinations — just keep everyone safe." },
          { text: "Postpartum psychosis is fully treatable with rapid medical intervention." },
        ],
      },
    ],
  },
  {
    title: "Urgent — Needs Attention Soon",
    scenarios: [
      {
        id: "severe-anxiety",
        icon: Heart,
        title: "Severe Anxiety or Panic Attacks",
        description:
          "Racing heart, feeling of doom, inability to breathe, or paralyzing fear that won't stop.",
        severity: "urgent",
        ctaLabel: "See calming steps",
        modalTag: "URGENT",
        modalTagColor: "#7a5600",
        modalTagBg: "#fff3cd",
        steps: [
          { text: "Ground yourself: Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste." },
          { text: "Breathe slowly: inhale for 4 counts, hold for 4, exhale for 6." },
          { text: "Move to a quiet, safe space. Sit or lie down." },
          { text: "Call someone you trust to talk you through this moment." },
          { text: "Schedule an appointment with your doctor within 24-48 hours." },
        ],
      },
      {
        id: "cant-care-for-baby",
        icon: Baby,
        title: "Unable to Care for Your Baby",
        description:
          "Feeling so overwhelmed that you cannot feed, change, or soothe your baby. You need support right now.",
        severity: "urgent",
        ctaLabel: "See support steps",
        modalTag: "URGENT",
        modalTagColor: "#7a5600",
        modalTagBg: "#fff3cd",
        steps: [
          { text: "Place your baby somewhere safe (crib or bassinet)." },
          { text: "Call your partner, a family member, or a neighbour to take over care temporarily." },
          { text: "It is okay to step away and take a few minutes to breathe." },
          { text: "This does not make you a failure. It makes you human." },
          { text: "Contact your health provider to discuss what you are experiencing." },
        ],
      },
      {
        id: "domestic-violence",
        icon: HandHeart,
        title: "Experiencing Domestic Violence",
        description:
          "If you are being physically, emotionally, or sexually abused at home, there are people ready to help you right now.",
        severity: "urgent",
        ctaLabel: "See safety steps",
        modalTag: "URGENT",
        modalTagColor: "#7a5600",
        modalTagBg: "#fff3cd",
        steps: [
          { text: "If you are in immediate physical danger, call 112 (emergency services)." },
          { text: "Pack a small bag with essentials (ID, money, phone charger) and keep it accessible." },
          { text: "Identify a safe place you can go to — a friend's house, a family member, a shelter." },
          { text: "Document injuries (photos with dates) if it's safe to do so." },
          { text: "You do not deserve this. Reach out to a local shelter or support organization." },
        ],
      },
    ],
  },
  {
    title: "Emotional Distress — Seeking Guidance",
    scenarios: [
      {
        id: "persistent-sadness",
        icon: Frown,
        title: "Persistent Sadness or Emptiness",
        description:
          "Ongoing feelings of hopelessness, crying spells, or emotional numbness lasting more than two weeks.",
        severity: "distress",
        ctaLabel: "See guidance steps",
        modalTag: "GUIDANCE",
        modalTagColor: "var(--color-primary)",
        modalTagBg: "var(--color-brand-50)",
        steps: [
          { text: "Know that what you're feeling is valid and more common than people admit." },
          { text: "Talk to someone you trust — sharing is not complaining, it's coping." },
          { text: "Write down what you're feeling. Journaling can help you process emotions." },
          { text: "Try to maintain one small daily routine that brings a moment of calm." },
          { text: "Schedule an appointment with a mental health professional. This is strength, not weakness." },
        ],
      },
      {
        id: "bonding-difficulties",
        icon: HeartCrack,
        title: "Difficulty Bonding with Baby",
        description:
          "Not feeling connected to your newborn, guilt about lack of maternal instinct, or emotional detachment.",
        severity: "distress",
        ctaLabel: "See guidance steps",
        modalTag: "GUIDANCE",
        modalTagColor: "var(--color-primary)",
        modalTagBg: "var(--color-brand-50)",
        steps: [
          { text: "Bonding is not always instant. It can take time, and that is completely normal." },
          { text: "Try skin-to-skin contact, gentle talking, or singing — even if it feels forced at first." },
          { text: "Reduce pressure on yourself. You don't have to feel a movie-worthy connection." },
          { text: "Share what you're feeling with your partner or a trusted friend." },
          { text: "Speak to your doctor. Bonding difficulties can be a symptom of PPD and are very treatable." },
        ],
      },
      {
        id: "unsure-ppd",
        icon: Stethoscope,
        title: "Not Sure If It's PPD",
        description:
          "Wondering whether what you're experiencing is normal 'baby blues' or something more serious.",
        severity: "distress",
        ctaLabel: "Learn the difference",
        modalTag: "GUIDANCE",
        modalTagColor: "var(--color-primary)",
        modalTagBg: "var(--color-brand-50)",
        steps: [
          { text: "'Baby blues' typically resolve within 2 weeks. If feelings persist or intensify, it may be PPD." },
          { text: "Key signs: persistent sadness, loss of interest, sleep changes unrelated to the baby, appetite shifts." },
          { text: "PPD is not a character flaw. It is a medical condition caused by hormonal, physical, and emotional changes." },
          { text: "Take a validated screening tool like the Edinburgh Postnatal Depression Scale (EPDS)." },
          { text: "Book an appointment with your doctor or a maternal mental health specialist to discuss your symptoms." },
        ],
      },
    ],
  },
];
