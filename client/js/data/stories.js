// Temporary mock stories used for local development and visual QA.
// Remove this file when backend endpoints are available.
export const MOCK_STORIES = [
  {
    _id: 'mock-1',
    name: 'Ada O.',
    privacy: 'named',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    story: 'After the birth of my first child I felt lost and overwhelmed. Therapy and peer support helped me re-learn self-care and regain confidence in parenting.',
    what_helped: ['Therapy', 'Peer support'],
    location: 'Lagos, Nigeria',
    createdAt: '2026-02-20T10:00:00Z',
  },
  {
    _id: 'mock-2',
    name: '',
    privacy: 'anonymous',
    image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    story: 'I started small: short walks, a few minutes of mindfulness each day. Over time those small changes compounded into real improvements.',
    what_helped: ['Lifestyle changes', 'Self-help strategies'],
    location: 'Accra, Ghana',
    createdAt: '2026-01-11T08:30:00Z',
  },
  {
    _id: 'mock-3',
    name: 'Ngozi',
    privacy: 'named',
    image_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
    story: 'Medication paired with counselling made the difference for me; it took time but I felt lighter by month three.',
    what_helped: ['Therapy'],
    location: 'Abuja, Nigeria',
    createdAt: '2026-03-01T14:15:00Z',
  },
  {
    _id: 'mock-4',
    name: 'Chinwe',
    privacy: 'named',
    image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
    story: 'Joining a local mothers group helped me feel less alone and gave me practical tips from people who understood.',
    what_helped: ['Peer support'],
    location: 'Kano, Nigeria',
    createdAt: '2026-02-25T11:00:00Z',
  },
  {
    _id: 'mock-5',
    name: '',
    privacy: 'anonymous',
    image_url: '',
    story: 'Breathing techniques and a routine helped me calm panic moments. I still have hard days, but the tools help.',
    what_helped: ['Self-help strategies'],
    location: 'Nairobi, Kenya',
    createdAt: '2026-01-30T09:00:00Z',
  },
  {
    _id: 'mock-6',
    name: 'Amaka',
    privacy: 'named',
    image_url: 'https://images.unsplash.com/photo-1531123414780-fb6b5b4b46b1?w=800&q=80',
    story: 'Counselling combined with exercise changed my outlook; the support from my partner was crucial too.',
    what_helped: ['Therapy', 'Lifestyle changes'],
    location: 'Port Harcourt, Nigeria',
    createdAt: '2026-02-10T07:45:00Z',
  }
];

export function getMockStories() {
  // simulate async fetch with small delay
  return new Promise(resolve => setTimeout(() => resolve(MOCK_STORIES.slice()), 120));
}
