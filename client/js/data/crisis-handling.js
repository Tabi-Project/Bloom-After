const criticalEmergencies = [
  {
    id: 1,
    title: "PostPartum Psychosis",
    icon: `<i class="fa-solid fa-triangle-exclamation"></i>`,
    description:
      "Experiencing hallucinations, extreme paranoia, delusions, or a severe break from reality.",
    linkText: "View Protocol",
    color: `var(--color-danger)`,
  },

  {
    id: 2,
    title: "Thoughts of Self-Harm",
    icon: `<i class="fa-solid fa-user-xmark"></i>`,
    description:
      "Overwhelming feelings of wanting to hurt yourself or feeling that your family would be better off without you.",
    linkText: "View Protocol",
    color: `var(--color-danger)`,
  },

  {
    id: 3,
    title: "Thoughts of Harming Your Baby",
    icon: `<i class="fa-solid fa-exclamation"></i>`,
    description:
      "Intrusive, disturbing, and overwhelming thoughts or urges about causing harm to your child.",
    linkText: "View Protocol",
    color: `var(--color-danger)`,
  },
];

const urgentSituations = [
  {
    id: 1,
    title: "Severe Panic Attacks",
    icon: `<i class="fa-solid fa-wind"></i>`,
    description:
      "Racing heart, inability to catch your breath, trembling, and a severe feeling of impending doom..",
    linkText: "View Coping Steps",
    color: `var(--color-warning)`,
  },

  {
    id: 2,
    title: "Total Inability to Sleep",
    icon: `<i class="fa-solid fa-moon"></i>`,
    description:
      "Unable to sleep for days, experiencing racing thoughts even when the baby is resting.",
    linkText: "View Coping Steps",
    color: `var(--color-warning)`,
  },

  {
    id: 3,
    title: "Complete Emotional Numbness",
    icon: `<i class="fa-solid fa-cloud"></i>`,
    description:
      "Feeling entirely detached from reality, your surroundings, or an inability to feel any emotions at all.",
    linkText: "View Coping Steps",
    color: `var(--color-warning)`,
  },
];

const highDistress = [
  {
    id: 1,
    title: "Uncontrollable Crying Spells",
    icon: `<i class="fa-solid fa-cloud-rain"></i>`,
    description:
      "Crying for hours, feeling entirely consumed by sadness, and unable to self-soothe.",
    linkText: "Read Guidance",
    color: `var(--color-primary)`,
  },

  {
    id: 2,
    title: "Severe Anger or Rage",
    icon: `<i class="fa-solid fa-fire"></i>`,
    description:
      "Uncharacteristic, explosive, or terrifying anger directed towards your partner, baby, or yourself.",
    linkText: "Read Guidance",
    color: `var(--color-primary)`,
  },

  {
    id: 3,
    title: "Paralyzing Anxiety",
    icon: `<i class="fa-solid fa-bolt"></i>`,
    description:
      "Unable to make any decisions, constant dread, and a persistent feeling that something terrible will happen.",
    linkText: "Read Guidance",
    color: `var(--color-primary)`,
  },
];

export { criticalEmergencies, urgentSituations, highDistress };
