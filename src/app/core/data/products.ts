import { ColorName, Product, SizeName } from '../models';

const LOREM =
  'It is a long established fact that a reader will be distracted by the readable content ' +
  'of a page when looking at its layout. The point of using Lorem Ipsum is that it has ' +
  'a more-or-less normal distribution of letters';

/** Placeholder photography — swap the seeds for real exports from the Figma kit. */
const img = (seed: string, i = 1) => `https://picsum.photos/seed/krist-${seed}-${i}/700/860`;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

type Row = [
  brand: string,
  name: string,
  price: number,
  oldPrice: number,
  category: string,
  colors: ColorName[],
  sizes: SizeName[],
  rating: number,
  reviews: number,
];

const APPAREL: SizeName[] = ['S', 'M', 'L', 'XL', 'XXL'];
const APPAREL_PLUS: SizeName[] = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const ONE: SizeName[] = ['Regular'];
const SHOE: SizeName[] = ['M', 'L', 'XL'];
const SMALL: SizeName[] = ['S', 'M', 'L'];

const ROWS: Row[] = [
  ['Roadstar', 'Printed Cotton T-Shirt', 38, 40, 'Men', ['Black', 'Blue'], APPAREL, 4.5, 84],
  [
    'Allen Solly',
    'Women Textured Handheld Bag',
    80,
    100,
    'Bags',
    ['Orange', 'Black'],
    ONE,
    4.8,
    121,
  ],
  [
    'Louis Philippe Sport',
    'Polo Collar T-Shirt',
    50,
    55,
    'Men',
    ['Blue', 'Black'],
    APPAREL,
    4.3,
    66,
  ],
  ['Adidas', 'Men adi-dash Running Shoes', 60, 75, 'Men', ['Blue', 'Black'], SHOE, 4.7, 143],
  ['Roadstar', 'Printed Cotton Crew Tee', 38, 45, 'Men', ['Black'], APPAREL, 4.1, 39],
  ['US Polo', 'Tailored Cotton Casual Shirt', 40, 50, 'Men', ['Blue', 'Red'], APPAREL, 4.4, 92],
  ['Zyla', 'Women Sandals', 35, 40, 'Women', ['Black'], SMALL, 4.2, 51],
  [
    'YK Disney',
    'Girls Pink Moana Printed Dress',
    80,
    100,
    'Kids',
    ['Red', 'Blue', 'Orange', 'Black', 'Green', 'Yellow'],
    APPAREL,
    5,
    121,
  ],
  ['Arrow', 'Casual Blue Jeans', 50, 60, 'Men', ['Blue'], APPAREL, 4.0, 47],
  ['Trendyol', 'Floral Embroidered Maxi Dress', 35, 45, 'Women', ['Red', 'Blue'], APPAREL, 4.6, 78],
  [
    'Allen Solly',
    'Brown Leather Jacket',
    60,
    70,
    'Winter Wear',
    ['Orange', 'Black'],
    APPAREL,
    4.5,
    63,
  ],
  ['US Polo', 'Casual Shoe for Men', 40, 50, 'Men', ['Orange'], SHOE, 4.3, 58],
  ['Gucci', 'Leather Hand Purse', 40, 60, 'Bags', ['Red'], ONE, 4.9, 156],
  ['YK Disney', 'Red Printed T-Shirt', 30, 35, 'Kids', ['Red'], SMALL, 4.4, 71],
  ['Roadstar', 'Printed Blazer for Men', 60, 70, 'Men', ['Black', 'Blue'], APPAREL, 4.2, 44],
  ['Flora', 'Woven Shoulder Purse', 35, 45, 'Bags', ['Orange', 'Yellow'], ONE, 4.6, 89],
  ['Levis', 'Slim Fit Denim Shirt', 45, 55, 'Men', ['Blue'], APPAREL, 4.1, 37],
  ['Zara', 'Oversized Wool Coat', 120, 150, 'Winter Wear', ['Black'], APPAREL_PLUS, 4.8, 112],
  ['Uniqlo', 'Ribbed Knit Sweater', 42, 50, 'Winter Wear', ['Green', 'Yellow'], APPAREL, 4.0, 28],
  ['Fossil', 'Classic Leather Watch', 95, 120, 'Watches', ['Black', 'Orange'], ONE, 4.7, 134],
  ['Titan', 'Minimal Steel Watch', 78, 90, 'Watches', ['Blue'], ONE, 4.4, 61],
  ['Hidesign', 'Slim Bifold Wallet', 28, 35, 'Wallets', ['Black', 'Orange'], ONE, 4.3, 42],
  ['Woodland', 'Textured Leather Belt', 22, 30, 'Belts', ['Black'], SHOE, 4.1, 33],
  ['Puma', 'Everyday Training Tee', 32, 38, 'Men', ['Green', 'Black'], APPAREL, 4.2, 55],
  ['Biba', 'Cotton Straight Kurta', 44, 55, 'Women', ['Yellow', 'Red'], APPAREL, 4.5, 74],
  ['Vero Moda', 'Pleated Midi Skirt', 38, 48, 'Women', ['Black', 'Blue'], APPAREL, 4.3, 46],
  ['Only', 'Cropped Denim Jacket', 58, 70, 'Women', ['Blue'], APPAREL, 4.6, 82],
  ['Mango', 'Satin Wrap Blouse', 40, 52, 'Women', ['Red', 'Green'], APPAREL, 4.2, 39],
  [
    'Nike',
    'Court Vision Sneakers',
    72,
    85,
    'Men',
    ['Black', 'Red'],
    ['M', 'L', 'XL', 'XXL'],
    4.8,
    168,
  ],
  ['Skechers', 'Go Walk Slip-On', 55, 68, 'Women', ['Blue', 'Green'], SMALL, 4.4, 91],
  ['Caprese', 'Quilted Shoulder Bag', 65, 80, 'Bags', ['Yellow'], ONE, 4.5, 57],
  ['Baggit', 'Everyday Tote Bag', 48, 60, 'Bags', ['Orange', 'Black'], ONE, 4.1, 36],
  [
    'Ray-Ban',
    'Round Metal Sunglasses',
    110,
    135,
    'Accessories',
    ['Black', 'Orange'],
    ONE,
    4.9,
    201,
  ],
  ['Fastrack', 'Sport Digital Watch', 45, 55, 'Watches', ['Green', 'Black'], ONE, 4.0, 48],
  [
    'Tommy Hilfiger',
    'Reversible Leather Belt',
    35,
    45,
    'Belts',
    ['Black', 'Orange'],
    SHOE,
    4.4,
    52,
  ],
  ['Wildcraft', 'Canvas Card Wallet', 18, 25, 'Wallets', ['Green', 'Blue'], ONE, 3.9, 24],
  ['Max', 'Kids Dungaree Set', 34, 42, 'Kids', ['Blue', 'Red'], SMALL, 4.3, 41],
  ['Gini and Jony', 'Boys Checked Shirt', 26, 32, 'Kids', ['Red', 'Blue'], SMALL, 4.2, 35],
  ['Pantaloons', 'Girls Party Frock', 52, 65, 'Kids', ['Yellow', 'Red'], SMALL, 4.6, 68],
  [
    'Jack and Jones',
    'Hooded Puffer Jacket',
    98,
    125,
    'Winter Wear',
    ['Black', 'Green'],
    APPAREL,
    4.7,
    103,
  ],
  [
    'Superdry',
    'Quilted Bomber Jacket',
    105,
    130,
    'Winter Wear',
    ['Blue', 'Black'],
    APPAREL_PLUS,
    4.5,
    76,
  ],
  [
    'Marks and Spencer',
    'Merino Wool Scarf',
    24,
    32,
    'Accessories',
    ['Red', 'Yellow'],
    ONE,
    4.2,
    29,
  ],
  ['Peter England', 'Formal Cotton Trousers', 46, 58, 'Men', ['Black', 'Blue'], APPAREL, 4.1, 44],
  ['Van Heusen', 'Slim Fit Formal Shirt', 44, 55, 'Men', ['Blue', 'Yellow'], APPAREL, 4.3, 59],
  ['Aldo', 'Pointed Heel Pumps', 68, 82, 'Women', ['Red', 'Black'], SMALL, 4.4, 63],
  ['Bata', 'Comfort Walk Loafers', 42, 52, 'Men', ['Orange'], SHOE, 4.0, 38],
  ['Lavie', 'Structured Handbag', 58, 72, 'Bags', ['Red', 'Orange'], ONE, 4.3, 47],
  [
    'Daniel Wellington',
    'Petite Mesh Watch',
    130,
    160,
    'Watches',
    ['Yellow', 'Black'],
    ONE,
    4.8,
    145,
  ],
];

export const PRODUCTS: Product[] = ROWS.map((row, i) => {
  const [brand, name, price, oldPrice, category, colors, sizes, rating, reviews] = row;
  const seed = String(i + 1);
  return {
    id: i + 1,
    slug: slugify(`${name}-${i + 1}`),
    brand,
    name,
    price,
    oldPrice,
    category,
    colors,
    sizes,
    rating,
    reviewCount: reviews,
    inStock: true,
    images: [img(seed, 1), img(seed, 2), img(seed, 3), img(seed, 4)],
    description: LOREM,
  };
});

export const PRODUCT_CATEGORIES = [
  'Men',
  'Women',
  'Kids',
  'Bags',
  'Belts',
  'Wallets',
  'Watches',
  'Accessories',
  'Winter Wear',
];

/** Categories that get an expander chevron in the shop sidebar. */
export const EXPANDABLE_CATEGORIES = ['Men', 'Women', 'Kids'];

export const ALL_COLORS: { name: ColorName; token: string }[] = [
  { name: 'Red', token: 'var(--sw-red)' },
  { name: 'Blue', token: 'var(--sw-blue)' },
  { name: 'Orange', token: 'var(--sw-orange)' },
  { name: 'Black', token: 'var(--sw-black)' },
  { name: 'Green', token: 'var(--sw-green)' },
  { name: 'Yellow', token: 'var(--sw-yellow)' },
];

export const ALL_SIZES: SizeName[] = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const MAX_PRICE = 2000;
