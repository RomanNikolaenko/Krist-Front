/**
 * Colours and sizes are rows in the database an administrator can add to, so
 * neither can be a union of the ones that happened to exist when this file was
 * written. They are names, and the catalogue is the only thing that knows which
 * ones are real.
 */
export type ColorName = string;
export type SizeName = string;

/**
 * The shapes the API answers with.
 *
 * Ids are strings because the server hands out uuids — the numeric ids these
 * types used to carry belonged to a hard-coded array and did not survive the
 * move to a database.
 */
export interface Product {
  id: string;
  slug: string;
  brand: string;
  name: string;
  price: number;
  oldPrice: number | null;
  /** Every category it is sold under. */
  categories: string[];
  colors: ColorName[];
  sizes: SizeName[];
  /** Null when nobody has reviewed it, which is not the same as zero stars. */
  rating: number | null;
  reviewCount: number;
  inStock: boolean;
  images: string[];
  description: string;
}

export interface ProductPage {
  items: Product[];
  total: number;
  pages: number;
  from: number;
  to: number;
}

export interface Facets {
  /** Departments, each carrying whatever sits inside it. One level deep. */
  categories: {
    key: string;
    slug: string;
    name: string;
    image: string | null;
    count: number;
    children: { key: string; slug: string; name: string; count: number }[];
  }[];
  /**
   * `name` is the value the shop filters on and never changes with the
   * language; `label` is what the reader sees.
   */
  colors: { name: ColorName; label: string; hex: string; count: number }[];
  sizes: { name: SizeName; count: number }[];
  /** The range the catalogue actually spans — the ends of the price slider. */
  minPrice: number;
  maxPrice: number;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  author: { name: string; avatarUrl: string | null };
  likes: number;
  likedByMe: boolean;
  mine: boolean;
}

/** A review on the home page rail, with the product it was written about. */
export interface ShopReview {
  id: string;
  rating: number;
  title: string;
  body: string;
  author: { name: string; avatarUrl: string | null };
  product: { slug: string; name: string };
}

export interface CartItem {
  /** productId + size + colour, so two variants of one product are two lines. */
  id: string;
  productId: string;
  slug: string;
  brand: string;
  name: string;
  image: string;
  price: number;
  size: SizeName;
  color: ColorName | null;
  qty: number;
}

export type PaymentMethod = 'card' | 'gpay' | 'paypal' | 'cod';

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  area: string;
  city: string;
  pin: string;
  state: string;
  isDefault: boolean;
}

export type CardBrand = 'VISA' | 'MASTERCARD';

/**
 * A saved card as the server is willing to know it — no number, because only
 * the last four digits are ever stored or shown.
 */
export interface SavedCard {
  id: string;
  label: string;
  holder: string;
  brand: CardBrand;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

/**
 * Where one line of an order has got to. The first four are the shop's to set,
 * in roughly that order; CANCELLED is the customer's and nothing takes it back.
 */
export type OrderStatus = 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';

export interface OrderLine {
  id: string;
  productId: string | null;
  slug: string | null;
  name: string;
  image: string;
  price: number;
  size: SizeName;
  /** As the line recorded it, which is the shop's own name for the colour. */
  color: ColorName | null;
  /** The same colour in the language being read, when it is still listed. */
  colorLabel: string | null;
  qty: number;
  status: OrderStatus;
}

/** The address an order went to, kept flat: it is a record, not a live row. */
export interface OrderAddress {
  name: string;
  phone: string;
  line1: string;
  area: string;
  city: string;
  pin: string;
  state: string;
}

export interface Order {
  id: string;
  number: string;
  placedAt: string;
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
  /** Null once the address it was sent to has been deleted from the account. */
  address: OrderAddress | null;
  items: OrderLine[];
}

export type NotificationKind =
  'PROFILE_UPDATED' | 'ORDER_PLACED' | 'ORDER_DELIVERED' | 'REVIEW_POSTED' | 'PASSWORD_CHANGED';

/**
 * The event, not the sentence. The wording lives in the i18n files, so the
 * same row reads correctly in either language.
 */
export interface AppNotification {
  id: string;
  kind: NotificationKind;
  metadata: Record<string, string>;
  read: boolean;
  createdAt: string;
}

export type SortKey = 'latest' | 'price-asc' | 'price-desc' | 'rating';

export interface ShopFilters {
  categories: string[];
  colors: ColorName[];
  sizes: SizeName[];
  minPrice: number;
  maxPrice: number;
  sort: SortKey;
  page: number;
}
