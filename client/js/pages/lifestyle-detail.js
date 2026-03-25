/**
 * lifestyle-detail-page.js
 *
 * Reads ?id=<card-id> from the URL, finds the matching entry in the
 * lifestyleCards / medicalCards data, and renders the full detail page.
 *
 * Architecture mirrors resources-detail-page.js:
 *  - Shared navbar / footer via component imports
 *  - Hero built from data
 *  - Main content column (foundation text + tips grid + evidence)
 *  - Sticky sidebar (next-steps actions + related mini-cards)
 *  - Related cards strip at the bottom (reuses lm-card renderer)
 */

import { renderNavbar, initNavbar } from '../../components/navbar.js';
import { renderFooter }             from '../../components/footer.js';
import { icons }                    from '../../components/icons.js';
import { lifestyleCards, medicalCards } from '../data/lifestyle.js';

/* ─────────────────────────────────────────────────────────
   Extended detail data keyed by card id.
   Add / expand entries here as content grows.
   ───────────────────────────────────────────────────────── */
const detailData = {
  sleep: {
    heroImage: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=1200&q=80',
    subtitle: 'Restorative care for your transition',
    filter: 'lifestyle',
    foundation: [
      'Quality sleep is a critical physiological requirement for postpartum healing. During deep sleep the body undergoes essential endocrine stabilisation, helping to re-balance the hormonal shifts that occur after childbirth.',
      'Research indicates that consolidated rest significantly enhances emotional resilience. By prioritising sleep you are directly supporting your brain\'s ability to process stress and regulate mood, creating a more stable foundation for your mental health journey.',
    ],
    tips: [
      {
        icon: icons.tipSun,
        title: 'Sleep when the baby sleeps',
        desc: 'Abandon household pressure and match your infant\'s circadian rhythm whenever possible.',
      },
      {
        icon: icons.tipUsers,
        title: 'Shift-based rest with a partner',
        desc: 'Implement 4–6 hour protected sleep windows by dividing overnight care duties.',
      },
      {
        icon: icons.tipCheckSquare,
        title: 'Prioritise rest over chores',
        desc: 'Radical acceptance of an imperfect space to safeguard cognitive and emotional energy.',
      },
    ],
    evidence: [
      'The <strong>World Health Organization (WHO)</strong> emphasises that maternal sleep deprivation is a key risk factor in the development and severity of postpartum depression symptoms.',
      'The <strong>Journal of Sleep Research</strong> found that obtaining at least one 4-hour block of uninterrupted sleep significantly improved maternal mood scores within 72 hours.',
      'Melatonin regulation and cortisol stabilisation are directly tethered to consistent rest environments, reducing autonomic nervous system arousal.',
    ],
    nextSteps: [
      { label: 'Download a Sleep Log',       icon: 'download',         href: '#' },
      { label: 'Find a Night Doula',          icon: 'medical_services', href: '#' },
      { label: 'Partner Communication Tips',  icon: 'forum',            href: '#' },
    ],
    relatedImages: [
      { src: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80', tag: 'Nutrition',    title: 'Foods for Hormonal Balance', id: 'nutrition' },
      { src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80', tag: 'Mindfulness',  title: '10-Minute Morning Reset',    id: 'journalling' },
    ],
  },

  nutrition: {
    heroImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80',
    subtitle: 'Nourish your body, steady your mind',
    filter: 'lifestyle',
    foundation: [
      'What you eat in the weeks and months after giving birth can have a profound impact on your mood, energy, and ability to cope with the demands of new motherhood.',
      'Research consistently shows a strong link between diet quality and postpartum mental health. Anti-inflammatory whole foods support the hormonal recalibration your body needs.',
    ],
    tips: [
      {
        icon: icons.tipShield,
        title: 'Omega-3 rich foods',
        desc: 'Oily fish, flaxseeds, and walnuts support brain health and may reduce depression risk.',
      },
      {
        icon: icons.tipGlobe,
        title: 'Stay hydrated',
        desc: 'Consistent water intake supports milk production and prevents fatigue-related mood dips.',
      },
      {
        icon: icons.tipGift,
        title: 'Iron & Vitamin D',
        desc: 'Replenish iron lost during delivery and address common Vitamin D deficiency linked to low mood.',
      },
    ],
    evidence: [
      '<strong>Harvard T.H. Chan School of Public Health</strong> research links Mediterranean-style diets to lower rates of postpartum depression.',
      'A <strong>Lancet Psychiatry</strong> review found that dietary intervention significantly reduced depressive symptoms in postpartum women.',
      'Folate and zinc both play roles in emotional regulation and immune function — nutrients often depleted during pregnancy.',
    ],
    nextSteps: [
      { label: 'Anti-inflammatory meal plan', icon: 'download', href: '#' },
      { label: 'Find a dietitian',            icon: 'medical_services', href: '#' },
      { label: 'Supplement guidance',         icon: 'info',    href: '#' },
    ],
    relatedImages: [
      { src: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400&q=80', tag: 'Sleep',    title: 'Sleep Strategies', id: 'sleep' },
      { src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80', tag: 'Movement', title: 'Gentle Movement',  id: 'movement' },
    ],
  },

  movement: {
    heroImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80',
    subtitle: 'Gentle activity, lasting relief',
    filter: 'lifestyle',
    foundation: [
      'Gentle, consistent physical activity is one of the most evidence-backed lifestyle interventions for postpartum mental health. Movement triggers neurochemical changes that directly counter depression.',
      'The goal is not fitness — it is regulation. Even a 10-minute walk raises endorphins, reduces cortisol, and gives your nervous system the signal that you are safe.',
    ],
    tips: [
      {
        icon: icons.tipWalk,
        title: 'Daily short walks',
        desc: 'Aim for 10–20 minutes of fresh air and movement each day, pram optional.',
      },
      {
        icon: icons.tipClock,
        title: 'Restorative yoga',
        desc: 'Yin and restorative yoga activate the parasympathetic nervous system, reducing anxiety.',
      },
      {
        icon: icons.tipHeadphones,
        title: 'Breathwork & stretching',
        desc: 'Five minutes of diaphragmatic breathing slows heart rate and grounds your attention.',
      },
    ],
    evidence: [
      '<strong>Mayo Clinic</strong> guidelines list regular physical activity as a first-line recommendation for managing mild-to-moderate postpartum depression.',
      'A <strong>British Journal of General Practice</strong> meta-analysis found exercise reduced PPD severity scores by 48% compared to usual care.',
      'Even low-intensity movement increases BDNF (brain-derived neurotrophic factor), which supports mood regulation and neuroplasticity.',
    ],
    nextSteps: [
      { label: '7-day gentle movement plan', icon: 'download',  href: '#' },
      { label: 'Find postnatal yoga classes', icon: 'location_on', href: '#' },
      { label: 'Ask about physiotherapy',    icon: 'medical_services', href: '#' },
    ],
    relatedImages: [
      { src: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400&q=80', tag: 'Sleep',      title: 'Sleep Strategies', id: 'sleep' },
      { src: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=400&q=80', tag: 'Wellbeing',  title: 'Social Connection', id: 'social' },
    ],
  },

  social: {
    heroImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    subtitle: 'Community as medicine',
    filter: 'lifestyle',
    foundation: [
      'Social isolation is one of the strongest predictors of postpartum depression. The transition to parenthood can feel lonely even in a crowded room — and that disconnect needs to be deliberately countered.',
      'Research consistently shows that peer support reduces the duration and severity of PPD. Connection does not have to be deep to be healing; regular, light-touch contact with others who "get it" is enough.',
    ],
    tips: [
      {
        icon: icons.tipUsers,
        title: 'Join a new-parent group',
        desc: 'In-person or online groups normalise your experience and reduce shame.',
      },
      {
        icon: icons.tipMessage,
        title: 'Stay in low-effort contact',
        desc: 'A voice note to a friend counts. You do not need to host or be "on" to connect.',
      },
      {
        icon: icons.tipHome,
        title: 'Accept help at home',
        desc: 'Let family and friends assist with meals, errands, or baby care without guilt.',
      },
    ],
    evidence: [
      '<strong>American Psychological Association (APA)</strong> research identifies social support as the single most protective factor against postpartum depression across cultures.',
      'A <strong>Cochrane Review</strong> found that lay-led peer support interventions reduced PPD incidence by up to 50% in community settings.',
      'Oxytocin released during positive social interaction directly counters the cortisol-dominant stress state common in new mothers.',
    ],
    nextSteps: [
      { label: 'Find local support groups', icon: 'location_on',       href: '#' },
      { label: 'Browse online communities', icon: 'forum',             href: '#' },
      { label: 'Talk to a health visitor',  icon: 'medical_services',  href: '#' },
    ],
    relatedImages: [
      { src: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400&q=80', tag: 'Sleep',       title: 'Sleep Strategies', id: 'sleep' },
      { src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80', tag: 'Journalling', title: 'Journalling', id: 'journalling' },
    ],
  },

  journalling: {
    heroImage: 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=1200&q=80',
    subtitle: 'Writing as a path to understanding',
    filter: 'lifestyle',
    foundation: [
      'Expressive writing has a well-documented effect on emotional processing. For new mothers navigating an identity shift alongside hormonal upheaval, journalling offers a low-barrier, always-available outlet.',
      'Research shows that even brief daily writing sessions — 10 to 15 minutes — reduce intrusive thoughts, lower cortisol, and improve sleep quality over time.',
    ],
    tips: [
      {
        icon: icons.tipEdit,
        title: 'Free-write for 10 minutes',
        desc: 'No rules, no re-reading. Let thoughts land on the page without editing.',
      },
      {
        icon: icons.tipCalendar,
        title: 'Track your mood daily',
        desc: 'One sentence about how you felt today builds a pattern you can share with your doctor.',
      },
      {
        icon: icons.tipSmile,
        title: 'Gratitude and grief together',
        desc: 'Hold space for contradictory emotions — joy and loss can, and often do, coexist.',
      },
    ],
    evidence: [
      '<strong>Cambridge Medicine</strong> studies link expressive journalling to reduced ruminative thinking, a key driver of anxiety and depression.',
      'Research by <strong>Dr James Pennebaker (UT Austin)</strong> shows that writing about difficult experiences reduces cortisol and improves immune function over a 4-week period.',
      'Mood-tracking journals shared with healthcare providers improve diagnosis accuracy and help tailor treatment for postpartum conditions.',
    ],
    nextSteps: [
      { label: 'Download mood-tracking template', icon: 'download', href: '#' },
      { label: 'Guided journalling prompts',      icon: 'edit',     href: '#' },
      { label: 'Talk to a therapist',             icon: 'medical_services', href: '#' },
    ],
    relatedImages: [
      { src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80', tag: 'Social',  title: 'Social Connection', id: 'social' },
      { src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80', tag: 'Movement', title: 'Movement', id: 'movement' },
    ],
  },

  therapy: {
    subtitle: 'Evidence-based talking therapies',
    filter: 'medical',
    foundation: [
      'Cognitive Behavioural Therapy (CBT) and Interpersonal Psychotherapy (IPT) are the most rigorously studied psychological treatments for postpartum depression, with strong evidence from randomised controlled trials.',
      'CBT targets unhelpful thought patterns — the self-critical inner voice that says you are failing. IPT focuses on the relationship and identity transitions that trigger vulnerability in new parents.',
    ],
    tips: [
      {
        icon: icons.tipMessage,
        title: 'CBT — thoughts & behaviours',
        desc: 'Identify and gently challenge thought distortions that amplify feelings of failure or worthlessness.',
      },
      {
        icon: icons.tipUsers,
        title: 'IPT — roles & relationships',
        desc: 'Navigate the identity shift of new parenthood and improve communication with your support network.',
      },
      {
        icon: icons.tipGrid,
        title: 'Online & in-person options',
        desc: 'Telehealth therapy removes access barriers — many providers offer evening and weekend sessions.',
      },
    ],
    evidence: [
      'A <strong>NICE (UK)</strong> clinical guideline identifies CBT and IPT as first-line treatments for moderate-to-severe PPD, on par with medication.',
      '<strong>Cochrane Reviews</strong> of psychosocial interventions found that talking therapy delivered within 6 months postpartum significantly reduces symptom severity.',
      'IPT adapted for the postpartum period has shown remission rates above 60% in controlled trials.',
    ],
    nextSteps: [
      { label: 'Find a CBT therapist',    icon: 'search',           href: '#' },
      { label: 'Online therapy options',  icon: 'laptop',           href: '#' },
      { label: 'Ask your GP for referral', icon: 'medical_services', href: '#' },
    ],
    relatedImages: [
      { src: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80', tag: 'Medical',   title: 'Medication Overview',            id: 'medication' },
      { src: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400&q=80', tag: 'Lifestyle', title: 'Sleep Strategies', id: 'sleep' },
    ],
  },

  medication: {
    subtitle: 'Pharmacological support for postpartum depression',
    filter: 'medical',
    foundation: [
      'For moderate to severe postpartum depression, medication can be a vital component of treatment — not a last resort. SSRIs and other agents work by stabilising the neurotransmitter disruption that underlies PPD.',
      'The decision to start medication should always be made in partnership with a doctor. Many medications are safe during breastfeeding, and the risk of untreated PPD to both mother and infant typically outweighs medication risk.',
    ],
    tips: [
      {
        icon: icons.tipGrid,
        title: 'SSRIs — the first-line choice',
        desc: 'Sertraline and escitalopram are most commonly prescribed due to their evidence base and tolerability.',
      },
      {
        icon: icons.tipShield,
        title: 'Brexanolone (Zulresso)',
        desc: 'A synthetic neuroactive steroid specifically approved for PPD, delivered via IV infusion.',
      },
      {
        icon: icons.tipClock,
        title: 'Give it time to work',
        desc: 'Most antidepressants take 2–4 weeks to reach full effect. Persist and communicate with your doctor.',
      },
    ],
    evidence: [
      '<strong>NICE (UK)</strong> and <strong>ACOG (US)</strong> both recommend SSRIs as a first-line medication treatment for moderate-to-severe PPD.',
      'Meta-analyses confirm that sertraline has minimal transfer into breast milk, making it a widely recommended choice for breastfeeding mothers.',
      'The FDA approval of brexanolone (2019) marked the first medication developed specifically for postpartum depression.',
    ],
    nextSteps: [
      { label: 'Discuss options with your doctor', icon: 'medical_services', href: '#' },
      { label: 'Medication safety in breastfeeding', icon: 'child_care',    href: '#' },
      { label: 'Combine with therapy',               icon: 'psychology',    href: '#' },
    ],
    relatedImages: [
      { src: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80', tag: 'Medical',   title: 'Therapy (CBT / IPT)', id: 'therapy' },
      { src: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400&q=80', tag: 'Medical', title: 'Breastfeeding Considerations', id: 'breastfeeding' },
    ],
  },

  breastfeeding: {
    heroImage: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&q=80',
    subtitle: 'Safety, compatibility, and informed choices',
    filter: 'medical',
    foundation: [
      'Many mothers with postpartum depression worry that seeking treatment will compromise their ability to breastfeed. In most cases, this is not true. Medical professionals use evidence databases like LactMed to identify treatments with minimal transfer into breast milk.',
      'Leaving PPD untreated poses a far greater risk to infant development than most prescribed medications. An engaged, mentally well mother is the best outcome for your baby.',
    ],
    tips: [
      {
        icon: icons.tipClock,
        title: 'Ask about LactMed',
        desc: 'The US National Library of Medicine\'s database catalogues medication safety data for breastfeeding mothers.',
      },
      {
        icon: icons.tipMessage,
        title: 'Be honest with your doctor',
        desc: 'Disclose that you are breastfeeding before any prescription so compatibility can be confirmed.',
      },
      {
        icon: icons.tipHeart,
        title: 'Your wellbeing matters too',
        desc: 'A mother who is mentally well is better able to bond with and care for her baby.',
      },
    ],
    evidence: [
      '<strong>Academy of Breastfeeding Medicine</strong> clinical protocols confirm that sertraline, paroxetine, and nortriptyline are among the safest options during lactation.',
      'Studies show that untreated maternal depression negatively impacts infant cognitive development, secure attachment, and language acquisition.',
      '<strong>NICE Guidelines (2014, updated 2020)</strong> recommend that treatment decisions always weigh the risk of untreated PPD against medication risk — rarely favouring withholding treatment.',
    ],
    nextSteps: [
      { label: 'Search LactMed database',         icon: 'search',           href: 'https://www.ncbi.nlm.nih.gov/books/NBK501922/' },
      { label: 'Talk to a lactation consultant',   icon: 'medical_services', href: '#' },
      { label: 'Discuss medication options',       icon: 'medication',       href: '#' },
    ],
    relatedImages: [
      { src: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80', tag: 'Medical', title: 'Therapy (CBT / IPT)',   id: 'therapy' },
      { src: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400&q=80', tag: 'Medical', title: 'Medication Overview', id: 'medication' },
    ],
  },
};

/* ─────────────────────────────────────────────────────────
   Render helpers
   ───────────────────────────────────────────────────────── */

/** Merge card base data with detail content */
function resolveCard(id) {
  const base = [...lifestyleCards, ...medicalCards].find(c => c.id === id);
  const detail = detailData[id];
  if (!base || !detail) return null;
  return { ...base, ...detail };
}

function renderHero(card) {
  const hero = document.getElementById('lmd-hero');
  const hasBgImage = !!card.heroImage;

  hero.className = `lmd-hero ${hasBgImage ? 'lmd-hero--image' : 'lmd-hero--text'}`;
  if (hasBgImage) {
    hero.style.backgroundImage = `url(${card.heroImage})`;
  }
  hero.removeAttribute('aria-busy');

  const categoryLabel = card.filter === 'lifestyle' ? 'Lifestyle' : 'Medical';

  hero.innerHTML = `
    <div class="lmd-hero-inner container">
      <span class="lmd-hero-eyebrow">${categoryLabel}</span>
      <h1 class="lmd-hero-title">${card.title}</h1>
      ${card.subtitle ? `<p class="lmd-hero-subtitle">${card.subtitle}</p>` : ''}
    </div>
  `;
}

function renderContent(card) {
  const article = document.getElementById('lmd-content');
  article.removeAttribute('aria-busy');

  const tipsHTML = card.tips?.map(t => `
    <div class="lmd-tip-card">
      <div class="lmd-tip-icon">${t.icon}</div>
      <h3 class="lmd-tip-title">${t.title}</h3>
      <p class="lmd-tip-desc">${t.desc}</p>
    </div>`).join('') ?? '';

  const evidenceHTML = card.evidence?.map(e => `
    <li class="lmd-evidence-item">
      <span class="lmd-evidence-bullet" aria-hidden="true">•</span>
      <p>${e}</p>
    </li>`).join('') ?? '';

  const foundationHTML = card.foundation?.map(p => `<p>${p}</p>`).join('') ?? '';

  const actionsHTML = card.nextSteps?.map(s => `
    <a href="${s.href}" class="lmd-action-btn">
      <span>${s.label}</span>
      ${icons.actionArrow}
    </a>`).join('') ?? '';

  const relatedMiniHTML = card.relatedImages?.map(r => `
    <a href="/lifestyle/detail?id=${r.id}" class="lmd-related-mini-card">
      <img src="${r.src}" alt="${r.title}" loading="lazy" width="300" height="110" />
      <p class="lmd-related-mini-tag">${r.tag}</p>
      <h4 class="lmd-related-mini-title">${r.title}</h4>
    </a>`).join('') ?? '';

  article.innerHTML = `
    <div class="lmd-main">

      <!-- Foundation text -->
      <section aria-labelledby="lmd-foundation-heading">
        <h2 class="lmd-section-heading" id="lmd-foundation-heading">
          <span class="lmd-section-heading-icon" aria-hidden="true">
            ${icons.sectionShield}
          </span>
          The Foundation
        </h2>
        <div class="lmd-foundation">
          ${foundationHTML}
        </div>
      </section>

      <!-- Tips / strategies grid -->
      ${tipsHTML ? `
      <section aria-labelledby="lmd-tips-heading">
        <h2 class="lmd-section-heading" id="lmd-tips-heading">
          <span class="lmd-section-heading-icon" aria-hidden="true">
            ${icons.sectionCheckSquare}
          </span>
          Practical Strategies
        </h2>
        <div class="lmd-tips-grid">${tipsHTML}</div>
      </section>` : ''}

      <!-- Clinical evidence -->
      ${evidenceHTML ? `
      <section class="lmd-evidence" aria-labelledby="lmd-evidence-heading">
        <h2 class="lmd-evidence-heading" id="lmd-evidence-heading">
          ${icons.sectionBook}
          Clinical Evidence
        </h2>
        <ul class="lmd-evidence-list">${evidenceHTML}</ul>
      </section>` : ''}

    </div>

    <!-- Sidebar -->
    <aside class="lmd-sidebar" aria-label="Next steps and related content">

      ${actionsHTML ? `
      <section class="lmd-sidebar-section" aria-labelledby="lmd-actions-heading">
        <h3 class="lmd-sidebar-heading" id="lmd-actions-heading">Next Steps</h3>
        ${actionsHTML}
      </section>` : ''}

      ${relatedMiniHTML ? `
      <section class="lmd-sidebar-section" aria-labelledby="lmd-related-mini-heading">
        <h3 class="lmd-sidebar-heading" id="lmd-related-mini-heading">Related</h3>
        <div class="lmd-related-mini">${relatedMiniHTML}</div>
      </section>` : ''}

    </aside>
  `;
}

function renderRelated(card) {
  // Show the other cards in the same category at the bottom
  const pool = card.filter === 'lifestyle' ? lifestyleCards : medicalCards;
  const related = pool.filter(c => c.id !== card.id);
  if (!related.length) return;

  const relatedSection = document.getElementById('lmd-related');
  const relatedGrid    = document.getElementById('lmd-related-grid');

  relatedGrid.innerHTML = related.map(c => `
    <a href="/lifestyle/detail?id=${c.id}" class="lm-card" style="text-decoration:none;">
      <div class="lm-card-icon">${c.icon}</div>
      <h3 class="lm-card-title">${c.title}</h3>
      <p class="lm-card-desc">${c.description}</p>
      <div class="lm-card-footer">
        <span class="lm-card-citation-label">Clinical Citation</span>
        <span class="lm-card-citation">${c.citation ?? 'Consult a doctor'}</span>
      </div>
    </a>`).join('');

  relatedSection.hidden = false;
}

function showError(message) {
  const err = document.getElementById('lmd-error');
  err.querySelector('.lmd-error-message').textContent = message;
  err.hidden = false;

  document.getElementById('lmd-hero').hidden    = true;
  document.getElementById('lmd-content').hidden = true;
}

/* ─────────────────────────────────────────────────────────
   Init
   ───────────────────────────────────────────────────────── */
function initPage() {
  // Shared components
  const navbarRoot = document.getElementById('navbar-root');
  if (navbarRoot) { navbarRoot.innerHTML = renderNavbar('lifestyle'); initNavbar(); }

  const footerRoot = document.getElementById('footer-root');
  if (footerRoot) { footerRoot.innerHTML = renderFooter(); }

  // Resolve card id from URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showError('No intervention specified. Please return to the Lifestyle & Medical page.');
    return;
  }

  const card = resolveCard(id);

  if (!card) {
    showError(`Intervention "${id}" was not found.`);
    return;
  }

  // Update page title & breadcrumb
  document.title = `${card.title} – Bloom After`;
  const breadcrumbCurrent = document.getElementById('lmd-breadcrumb-current');
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = card.title;

  // Render sections
  renderHero(card);
  renderContent(card);
  renderRelated(card);
}

document.addEventListener('DOMContentLoaded', initPage);