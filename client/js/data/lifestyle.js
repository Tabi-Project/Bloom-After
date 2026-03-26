const icons = {
  sleep: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  nutrition: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  movement: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="12" cy="5" r="2"/><path d="M5.5 10h13l-2 7H7.5l-2-7z"/><path d="M12 7v3"/></svg>`,
  social: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  journalling: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  therapy: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  medication: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
  breastfeeding: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 8v4l3 3"/></svg>`,
};

export const interventions = [
  {
    id: 'sleep',
    title: 'Sleep Strategies',
    category: 'lifestyle',
    subtitle: 'Restorative care for your transition',
    icon: icons.sleep,
    summary: 'Prioritise rest through shift-based schedules with a partner or restorative nap techniques. Sleep deprivation is a key physiological trigger for mood disturbances.',
    foundation: [
      'Quality sleep is a critical physiological requirement for postpartum healing. During deep sleep the body undergoes essential endocrine stabilisation, helping to re-balance the hormonal shifts that occur after childbirth.',
      'Research indicates that consolidated rest significantly enhances emotional resilience. By prioritising sleep you are directly supporting your brain\'s ability to process stress and regulate mood.'
    ],
    tips: [
      { title: 'Sleep when the baby sleeps', desc: 'Abandon household pressure and match your infant\'s circadian rhythm whenever possible.' },
      { title: 'Shift-based rest', desc: 'Implement 4–6 hour protected sleep windows by dividing overnight care duties.' }
    ],
    evidence: [
      'The World Health Organization (WHO) emphasises that maternal sleep deprivation is a key risk factor in postpartum depression.',
      'Harvard Health notes that obtaining at least one 4-hour block of uninterrupted sleep significantly improves maternal mood scores.'
    ]
  },
  {
    id: 'nutrition',
    title: 'Nutrition',
    category: 'lifestyle',
    subtitle: 'Nourish your body, steady your mind',
    icon: icons.nutrition,
    summary: 'Focus on anti-inflammatory whole foods, omega-3 fatty acids, and consistent hydration to support hormonal stabilisation and sustained energy levels.',
    foundation: [
      'What you eat in the weeks and months after giving birth can have a profound impact on your mood, energy, and ability to cope with the demands of new motherhood.',
      'Research consistently shows a strong link between diet quality and postpartum mental health.'
    ],
    tips: [
      { title: 'Omega-3 rich foods', desc: 'Oily fish, flaxseeds, and walnuts support brain health and may reduce depression risk.' },
      { title: 'Stay hydrated', desc: 'Consistent water intake supports milk production and prevents fatigue-related mood dips.' }
    ],
    evidence: [
      'The WHO highlights the importance of macro-nutrient replenishment for maternal recovery.',
      'Dietary interventions focusing on anti-inflammatory foods significantly reduce depressive symptoms in postpartum women.'
    ]
  },
  {
    id: 'movement',
    title: 'Movement',
    category: 'lifestyle',
    subtitle: 'Gentle activity, lasting relief',
    icon: icons.movement,
    summary: 'Gentle, consistent activity like walking or restorative yoga releases natural endorphins and helps regulate the nervous system after childbirth.',
    foundation: [
      'Gentle, consistent physical activity is one of the most evidence-backed lifestyle interventions for postpartum mental health.',
      'The goal is not fitness — it is regulation. Even a 10-minute walk raises endorphins and reduces cortisol.'
    ],
    tips: [
      { title: 'Daily short walks', desc: 'Aim for 10–20 minutes of fresh air and movement each day, pram optional.' },
      { title: 'Restorative yoga', desc: 'Yin and restorative yoga activate the parasympathetic nervous system, reducing anxiety.' }
    ],
    evidence: [
      'Mayo Clinic guidelines list regular physical activity as a first-line recommendation for managing mild-to-moderate postpartum depression.'
    ]
  },
  {
    id: 'social',
    title: 'Social Connection',
    category: 'lifestyle',
    subtitle: 'Community as medicine',
    icon: icons.social,
    summary: 'Reducing isolation by engaging with peers who understand the transition to parenthood. Shared experience is a powerful buffer against depression.',
    foundation: [
      'Social isolation is one of the strongest predictors of postpartum depression. The transition to parenthood can feel lonely even in a crowded room.',
      'Connection does not have to be deep to be healing; regular, light-touch contact with others who "get it" is enough.'
    ],
    tips: [
      { title: 'Join a new-parent group', desc: 'In-person or online groups normalise your experience and reduce shame.' },
      { title: 'Stay in low-effort contact', desc: 'A voice note to a friend counts. You do not need to host or be "on" to connect.' }
    ],
    evidence: [
      'The American Psychological Association (APA) identifies social support as a major protective factor against postpartum depression.'
    ]
  },
  {
    id: 'journalling',
    title: 'Journalling',
    category: 'lifestyle',
    subtitle: 'Writing as a path to understanding',
    icon: icons.journalling,
    summary: 'Using expressive writing to process complex emotions and track mood patterns provides a private space for honest reflection without judgement.',
    foundation: [
      'Expressive writing has a well-documented effect on emotional processing. It offers a low-barrier, always-available outlet.',
      'Research shows that even brief daily writing sessions reduce intrusive thoughts and lower cortisol.'
    ],
    tips: [
      { title: 'Free-write for 10 minutes', desc: 'No rules, no re-reading. Let thoughts land on the page without editing.' },
      { title: 'Track your mood daily', desc: 'One sentence about how you felt today builds a pattern you can share with your doctor.' }
    ],
    evidence: [
      'Cambridge Medicine studies link expressive journalling to reduced ruminative thinking, a key driver of anxiety and depression.'
    ]
  },
  {
    id: 'therapy',
    title: 'Therapy (CBT / IPT)',
    category: 'medical',
    subtitle: 'Evidence-based talking therapies',
    icon: icons.therapy,
    summary: 'Cognitive Behavioural Therapy (CBT) and Interpersonal Psychotherapy (IPT) are the gold standards for postpartum care.',
    foundation: [
      'Cognitive Behavioural Therapy (CBT) and Interpersonal Psychotherapy (IPT) are the most rigorously studied psychological treatments for postpartum depression.',
      'CBT targets unhelpful thought patterns, while IPT focuses on the relationship and identity transitions that trigger vulnerability.'
    ],
    tips: [
      { title: 'CBT — thoughts & behaviours', desc: 'Identify and gently challenge thought distortions that amplify feelings of failure.' },
      { title: 'Online & in-person options', desc: 'Telehealth therapy removes access barriers — many providers offer evening sessions.' }
    ],
    evidence: [
      'NICE (UK) clinical guidelines identify CBT and IPT as first-line treatments for moderate-to-severe PPD.'
    ]
  },
  {
    id: 'medication',
    title: 'Medication Overview',
    category: 'medical',
    subtitle: 'Pharmacological support for postpartum depression',
    icon: icons.medication,
    summary: 'SSRIs and other pharmacological interventions can be vital for moderate to severe postpartum depression.',
    foundation: [
      'For moderate to severe postpartum depression, medication can be a vital component of treatment — not a last resort.',
      'Modern medications are increasingly refined for safety and effectiveness in postpartum populations.'
    ],
    tips: [
      { title: 'SSRIs — the first-line choice', desc: 'Sertraline and escitalopram are most commonly prescribed due to their evidence base and tolerability.' },
      { title: 'Give it time to work', desc: 'Most antidepressants take 2–4 weeks to reach full effect.' }
    ],
    evidence: [
      'NICE (UK) and ACOG (US) both recommend SSRIs as a first-line medication treatment for moderate-to-severe PPD.'
    ]
  },
  {
    id: 'breastfeeding',
    title: 'Breastfeeding Considerations',
    category: 'medical',
    subtitle: 'Safety, compatibility, and informed choices',
    icon: icons.breastfeeding,
    summary: 'Many therapeutic options are compatible with breastfeeding. Medical professionals use databases like LactMed to ensure safety.',
    foundation: [
      'Many mothers with postpartum depression worry that seeking treatment will compromise their ability to breastfeed. In most cases, this is not true.',
      'Leaving PPD untreated poses a far greater risk to infant development than most prescribed medications.'
    ],
    tips: [
      { title: 'Ask about LactMed', desc: 'The US National Library of Medicine\'s database catalogues medication safety data for breastfeeding mothers.' },
      { title: 'Be honest with your doctor', desc: 'Disclose that you are breastfeeding before any prescription so compatibility can be confirmed.' }
    ],
    evidence: [
      'The Academy of Breastfeeding Medicine clinical protocols confirm that many common antidepressants are among the safest options during lactation.'
    ]
  }
];