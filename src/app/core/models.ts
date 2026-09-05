export type ColorName = 'Red' | 'Blue' | 'Orange' | 'Black' | 'Green' | 'Yellow';
export type SizeName = 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | 'Regular';

export interface Product {
  id: number;
  slug: string;
  brand: string;
  name: string;
  price: number;
  oldPrice: number;
  category: string;
  colors: ColorName[];
  sizes: SizeName[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  images: string[];
  description: string;
}

export interface Review {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  title: string;
  body: string;
  postedOn: string;
}

export interface CartItem {
  id: string; // productId + size + color
  productId: number;
  brand: string;
  name: string;
  image: string;
  price: number;
  size: SizeName;
  color: ColorName | null;
  qty: number;
}

export interface Address {
  id: number;
  name: string;
  phone: string;
  line1: string;
  area: string;
  city: string;
  pin: string;
  state: string;
  isDefault: boolean;
}

export type CardBrand = 'visa' | 'mastercard';

export interface SavedCard {
  id: number;
  label: string; // "Master Card"
  holder: string;
  number: string; // masked
  expiry: string;
  brand: CardBrand;
}

export type OrderStatus = 'Delivered' | 'In Process' | 'Cancelled';

/** One purchased line — the Orders screen lists these, each with its own status. */
export interface OrderItem {
  id: string;
  name: string;
  image: string;
  size: SizeName;
  qty: number;
  price: number;
  status: OrderStatus;
  statusTextKey: string;
}

export type NotificationIcon = 'avatar' | 'box' | 'box-check' | 'lock';

export interface AppNotification {
  id: number;
  icon: NotificationIcon;
  image?: string;
  titleKey: string;
  textKey: string;
  /** Absolute times stay literal; relative ones use a translation key. */
  time?: string;
  timeKey?: string;
}

export interface Category {
  slug: string;
  titleKey: string;
  image: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
}

export type SortKey = 'latest' | 'price-asc' | 'price-desc' | 'rating';

export interface ShopFilters {
  categories: string[];
  colors: ColorName[];
  sizes: SizeName[];
  maxPrice: number;
  sort: SortKey;
  page: number;
}
