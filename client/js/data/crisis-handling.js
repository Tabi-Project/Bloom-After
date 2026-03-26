export const crisisData = [
  {
    id: 'psychosis',
    title: 'Postpartum Psychosis',
    severity: 'critical',
    severityLabel: 'Critical Emergency',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    description: 'Experiencing hallucinations, extreme paranoia, delusions, or a severe break from reality.',
    steps: [
      'Do not leave the mother alone with the baby under any circumstances.',
      'Call emergency services (112) immediately or go to the nearest hospital A&E.',
      'Remove any potentially harmful objects from the immediate environment.',
      'Speak calmly and clearly. Do not argue with delusions or hallucinations, but assure her she is safe.',
      'Contact a trusted family member or partner to come over immediately.'
    ]
  },
  {
    id: 'self-harm',
    title: 'Thoughts of Self-Harm',
    severity: 'critical',
    severityLabel: 'Critical Emergency',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    description: 'Overwhelming feelings of wanting to hurt yourself or feeling that your family would be better off without you.',
    steps: [
      'Stop what you are doing. Put the baby in a safe place (like a crib) and step into another room.',
      'Call the National Suicide Prevention Helpline (0806 210 6493) immediately.',
      'Call a trusted friend, partner, or family member and tell them you need them to come over right now.',
      'Remove yourself from any environment that contains objects you could use to harm yourself.',
      'Remember that these thoughts are a symptom of an illness, not a reflection of your worth.'
    ]
  },
  {
    id: 'harming-baby',
    title: 'Thoughts of Harming Baby',
    severity: 'critical',
    severityLabel: 'Critical Emergency',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    description: 'Intrusive, disturbing, and overwhelming thoughts or urges about causing harm to your child.',
    steps: [
      'Place the baby in a safe place immediately (like their crib or bassinet) and leave the room.',
      'Call another adult in the house to take over baby care. If you are alone, call someone to come over immediately.',
      'Call your local emergency line or psychiatric emergency contact.',
      'Understand that having an intrusive thought does not mean you will act on it, but it does mean you need immediate medical support.'
    ]
  },
  {
    id: 'panic-attack',
    title: 'Severe Panic Attacks',
    severity: 'urgent',
    severityLabel: 'Urgent Situation',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>`,
    description: 'Racing heart, inability to catch your breath, trembling, and a severe feeling of impending doom.',
    steps: [
      'Sit down and place your feet flat on the floor to ground yourself.',
      'Use the 5-4-3-2-1 method: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.',
      'Breathe in for 4 seconds, hold for 4 seconds, and exhale slowly for 6 seconds.',
      'Contact your healthcare provider or GP to schedule an urgent appointment.'
    ]
  },
  {
    id: 'insomnia',
    title: 'Total Inability to Sleep',
    severity: 'urgent',
    severityLabel: 'Urgent Situation',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    description: 'Unable to sleep for days, experiencing racing thoughts even when the baby is resting.',
    steps: [
      'Do not try to force sleep. If you have been lying awake for 20 minutes, get up and sit in a dimly lit room.',
      'Hand over all nighttime baby care to a partner or support person for the next 24 hours.',
      'Contact your doctor immediately. Postpartum insomnia lasting multiple days requires medical intervention to prevent further deterioration.'
    ]
  },
  {
    id: 'crying-spells',
    title: 'Uncontrollable Crying',
    severity: 'distress',
    severityLabel: 'High Distress',
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
    description: 'Crying for hours, feeling entirely consumed by sadness, and unable to self-soothe.',
    steps: [
      'Acknowledge that crying is a release valve for your nervous system. Do not try to immediately stop it.',
      'Change your physical state: splash cold water on your face or hold an ice cube.',
      'Call a trusted friend and simply ask them to stay on the phone with you while you cry.',
      'Schedule an appointment with a therapist or counselor to discuss these feelings.'
    ]
  }
];