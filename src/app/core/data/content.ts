import {
  Address,
  AppNotification,
  Category,
  OrderItem,
  Review,
  SavedCard,
  Testimonial,
} from '../models';

const LOREM_SHORT =
  'It is a long established fact that a reader will be distracted by the readable content ' +
  'of a page when looking at its layout. The point of using Lorem Ipsum.';

const LOREM_LONG =
  'It is a long established fact that a reader will be distracted by the readable content of ' +
  'a page when looking at its layout. The point of using Lorem Ipsum is that it has a ' +
  "more-or-less normal distribution of letters, as opposed to using 'Content here, content " +
  "here', making it look like readable English.";

/** Labels are translation keys — see core/i18n/en.ts. */
export const MEGA_MENU: { titleKey: string; links: string[] }[][] = [
  [
    {
      titleKey: 'mega.men',
      links: [
        'mega.tshirts',
        'mega.casualShirts',
        'mega.formalShirts',
        'mega.jackets',
        'mega.blazersCoats',
      ],
    },
    { titleKey: 'mega.indianFestive', links: ['mega.kurtaSets', 'mega.sherwanis'] },
  ],
  [
    {
      titleKey: 'mega.women',
      links: [
        'mega.kurtasSuits',
        'mega.sarees',
        'mega.ethnicWear',
        'mega.lehengaCholis',
        'mega.jackets',
      ],
    },
    { titleKey: 'mega.westernWear', links: ['mega.dresses', 'mega.jumpsuits'] },
  ],
  [
    {
      titleKey: 'mega.footwear',
      links: ['mega.flats', 'mega.casualShoes', 'mega.heels', 'mega.boots', 'mega.sportsShoes'],
    },
    { titleKey: 'mega.productFeatures', links: ['mega.viewer360', 'mega.productVideo'] },
  ],
  [
    {
      titleKey: 'mega.kids',
      links: [
        'mega.tshirts',
        'mega.shirts',
        'mega.jeans',
        'mega.trousers',
        'mega.partyWear',
        'mega.innerwear',
        'mega.trackPants',
        'mega.valuePack',
      ],
    },
  ],
];

export const HOME_CATEGORIES: Category[] = [
  {
    slug: 'casual',
    titleKey: 'home.cat.casual',
    image: 'https://picsum.photos/seed/krist-cat-casual/540/700',
  },
  {
    slug: 'western',
    titleKey: 'home.cat.western',
    image: 'https://picsum.photos/seed/krist-cat-western/540/700',
  },
  {
    slug: 'ethnic',
    titleKey: 'home.cat.ethnic',
    image: 'https://picsum.photos/seed/krist-cat-ethnic/540/700',
  },
  {
    slug: 'kids',
    titleKey: 'home.cat.kids',
    image: 'https://picsum.photos/seed/krist-cat-kids/540/700',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: LOREM_SHORT,
    author: 'Leslie Alexander',
    role: 'Model',
    avatar: 'https://picsum.photos/seed/krist-t1/96/96',
    rating: 5,
  },
  {
    quote: LOREM_SHORT,
    author: 'Jacob Jones',
    role: 'Co-Founder',
    avatar: 'https://picsum.photos/seed/krist-t2/96/96',
    rating: 5,
  },
  {
    quote: LOREM_SHORT,
    author: 'Jenny Wilson',
    role: 'Fashion Designer',
    avatar: 'https://picsum.photos/seed/krist-t3/96/96',
    rating: 5,
  },
];

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

export const REVIEWS: Review[] = [
  {
    id: 1,
    author: 'Mark Williams',
    avatar: 'https://picsum.photos/seed/krist-r1/80/80',
    rating: 5,
    title: 'Excellent Product, I Love It 😍',
    body: LOREM_LONG,
    postedOn: 'June 05, 2023',
  },
  {
    id: 2,
    author: 'Alexa Johnson',
    avatar: 'https://picsum.photos/seed/krist-r2/80/80',
    rating: 5,
    title: 'My Daughter is very much happy with this products',
    body: LOREM_LONG,
    postedOn: 'June 05, 2023',
  },
];

export const ADDRESSES: Address[] = [
  {
    id: 1,
    name: 'Robert Fox',
    phone: '(209) 555-0104',
    line1: '4517 Washington Ave.',
    area: 'Manchester',
    city: 'Manchester',
    pin: '39495',
    state: 'Kentucky',
    isDefault: true,
  },
  {
    id: 2,
    name: 'John Willions',
    phone: '(270) 555-0117',
    line1: '3891 Ranchview Dr.',
    area: 'Richardson',
    city: 'Richardson',
    pin: '62639',
    state: 'California',
    isDefault: false,
  },
  {
    id: 3,
    name: 'Alexa Johnson',
    phone: '(208) 555-0112',
    line1: '4517 Washington Ave.',
    area: 'Manchester',
    city: 'Manchester',
    pin: '39495',
    state: 'Kentucky',
    isDefault: false,
  },
];

export const CITIES = ['Manchester', 'Richardson', 'Mesa', 'Austin', 'Fairfield', 'Naperville'];

export const STATES = ['Kentucky', 'California', 'New Jersey', 'Texas', 'Illinois', 'Nevada'];

export const SAVED_CARDS: SavedCard[] = [
  {
    id: 1,
    label: 'Master Card',
    holder: 'Robert Fox',
    number: '3456 XX78 9800 55X3',
    expiry: '09/26',
    brand: 'mastercard',
  },
  {
    id: 2,
    label: 'Visa Card',
    holder: 'Robert Fox',
    number: '5677 3490 XX90 XX23',
    expiry: '04/27',
    brand: 'visa',
  },
];

export const ORDERS: OrderItem[] = [
  {
    id: 'ord-1',
    name: 'Girls Pink Moana Printed Dress',
    image: 'https://picsum.photos/seed/krist-8-1/700/860',
    size: 'S',
    qty: 1,
    price: 80,
    status: 'Delivered',
    statusTextKey: 'statusText.delivered',
  },
  {
    id: 'ord-2',
    name: 'Women Textured Handheld Bag',
    image: 'https://picsum.photos/seed/krist-2-1/700/860',
    size: 'Regular',
    qty: 1,
    price: 80,
    status: 'In Process',
    statusTextKey: 'statusText.inProcess',
  },
  {
    id: 'ord-3',
    name: 'Tailored Cotton Casual Shirt',
    image: 'https://picsum.photos/seed/krist-6-1/700/860',
    size: 'M',
    qty: 1,
    price: 40,
    status: 'In Process',
    statusTextKey: 'statusText.inProcess',
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    icon: 'avatar',
    image: 'https://picsum.photos/seed/krist-avatar/160/160',
    titleKey: 'notif.profileUpdate',
    textKey: 'notif.profileUpdateText',
    timeKey: 'notif.justNow',
  },
  {
    id: 2,
    icon: 'box',
    titleKey: 'notif.orderPlaced',
    textKey: 'notif.orderPlacedText',
    time: '11:16 AM',
  },
  {
    id: 3,
    icon: 'box-check',
    titleKey: 'notif.orderDelivered',
    textKey: 'notif.orderDeliveredText',
    time: '09:00 AM',
  },
  {
    id: 4,
    icon: 'avatar',
    image: 'https://picsum.photos/seed/krist-avatar/160/160',
    titleKey: 'notif.feedback',
    textKey: 'notif.feedbackText',
    timeKey: 'notif.yesterday',
  },
  {
    id: 5,
    icon: 'lock',
    titleKey: 'notif.password',
    textKey: 'notif.passwordText',
    timeKey: 'notif.yesterday',
  },
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

export const PROFILE = {
  firstName: 'Robert',
  lastName: 'Fox',
  phone: '(252) 555-0126',
  email: 'robertfox@exmple.com',
  address: '2464 Royal Ln. Mesa, New Jersey 45463',
  avatar: 'https://picsum.photos/seed/krist-avatar/160/160',
};

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
  {
    titleKey: 'footer.service',
    links: [
      { key: 'footer.aboutUs', route: '/our-story' },
      { key: 'footer.careers', route: '/' },
      { key: 'footer.delivery', route: '/' },
      { key: 'footer.privacy', route: '/' },
      { key: 'footer.terms', route: '/' },
    ],
  },
];

export const DISCOUNT_CODES: Record<string, number> = {
  FLAT50: 50,
  KRIST10: 10,
};

export const DELIVERY_CHARGE = 5;
