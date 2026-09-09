/** Labels are translation keys — see core/i18n/en.ts. */
export const INSTAGRAM_STORIES = [
  'https://picsum.photos/seed/krist-ig1/420/520',
  'https://picsum.photos/seed/krist-ig2/420/520',
  'https://picsum.photos/seed/krist-ig3/420/520',
  'https://picsum.photos/seed/krist-ig4/420/520',
];

export const FEATURES = [
  { icon: 'box', titleKey: 'feature.shipping', textKey: 'feature.shippingText' },
  { icon: 'dollar', titleKey: 'feature.money', textKey: 'feature.moneyText' },
  { icon: 'headphones', titleKey: 'feature.support', textKey: 'feature.supportText' },
  { icon: 'card', titleKey: 'feature.payment', textKey: 'feature.paymentText' },
];

export const STORY_VALUES = [
  { icon: 'box', titleKey: 'story.value1', textKey: 'story.value1Text' },
  { icon: 'dollar', titleKey: 'story.value2', textKey: 'story.value2Text' },
  { icon: 'heart', titleKey: 'story.value3', textKey: 'story.value3Text' },
];

export const STORY_STATS = [
  { value: '12', labelKey: 'story.statYears' },
  { value: '480', labelKey: 'story.statProducts' },
  { value: '65k', labelKey: 'story.statCustomers' },
  { value: '23', labelKey: 'story.statCountries' },
];

/** Editorial content, like the catalogue, stays in one language on purpose. */
export const BLOG_POSTS = [
  {
    slug: 'how-we-pick-fabric',
    title: 'How we pick a fabric',
    excerpt:
      'Six mills, four countries and one very boring spreadsheet. What actually decides whether a cloth makes it into a season.',
    tag: 'Craft',
    date: '18 Feb 2023',
    minutes: 6,
    image: 'https://picsum.photos/seed/krist-blog-1/900/600',
  },
  {
    slug: 'fit-notes-denim',
    title: 'Fit notes: the denim block',
    excerpt:
      'We remade our jeans block three times this year. Here is what changed at the waist, the thigh and the hem, and why.',
    tag: 'Fit',
    date: '02 Mar 2023',
    minutes: 4,
    image: 'https://picsum.photos/seed/krist-blog-2/900/600',
  },
  {
    slug: 'a-day-at-the-mill',
    title: 'A day at the mill',
    excerpt:
      'Photographs from the floor of the weaving room, and a conversation with the people who run it.',
    tag: 'People',
    date: '21 Mar 2023',
    minutes: 8,
    image: 'https://picsum.photos/seed/krist-blog-3/900/600',
  },
  {
    slug: 'caring-for-wool',
    title: 'Caring for wool without ruining it',
    excerpt:
      'Wash less, air more, and stop hanging your knitwear. A short guide to making a coat last a decade.',
    tag: 'Care',
    date: '09 Apr 2023',
    minutes: 5,
    image: 'https://picsum.photos/seed/krist-blog-4/900/600',
  },
  {
    slug: 'small-runs',
    title: 'Why we make small runs',
    excerpt:
      'Selling out is not a marketing tactic for us. The maths behind producing less than we could sell.',
    tag: 'Studio',
    date: '27 Apr 2023',
    minutes: 7,
    image: 'https://picsum.photos/seed/krist-blog-5/900/600',
  },
  {
    slug: 'colour-season',
    title: 'Building a colour season',
    excerpt:
      'Nine swatches survive out of about two hundred. How the palette for a season actually gets chosen.',
    tag: 'Design',
    date: '15 May 2023',
    minutes: 5,
    image: 'https://picsum.photos/seed/krist-blog-6/900/600',
  },
];

/**
 * Every entry carries its own route: a label that also appears in the header
 * has to lead to the same screen, or the two read as different links wearing
 * the same name. The kit ships no careers / delivery / policy screens, so
 * those four point at the home page until there is something to link to.
 */
export const FOOTER_LINKS = [
  {
    titleKey: 'footer.information',
    links: [
      { key: 'footer.myAccount', route: '/profile/personal-information' },
      { key: 'footer.login', route: '/login' },
      { key: 'footer.myCart', route: '/cart' },
      { key: 'footer.myWishlist', route: '/profile/wishlists' },
      { key: 'footer.checkout', route: '/checkout/address' },
    ],
  },
  /*
   * Only what exists. Careers, delivery terms, a privacy policy and terms of
   * use each pointed at the home page — a link that lies about where it goes is
   * worse than a column with fewer rows. They come back when the pages do.
   */
  {
    titleKey: 'footer.service',
    links: [
      { key: 'footer.aboutUs', route: '/our-story' },
      { key: 'nav.contact', route: '/contact' },
      { key: 'nav.blog', route: '/blog' },
    ],
  },
];

export const DISCOUNT_CODES: Record<string, number> = {
  FLAT50: 50,
  KRIST10: 10,
};

export const DELIVERY_CHARGE = 5;
