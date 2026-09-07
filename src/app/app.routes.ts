import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from './core/auth/auth.guard';
import { checkoutStepGuard } from './core/checkout.guard';
import { Shell } from './layout/shell';

export const routes: Routes = [
  /*
   * Outside the storefront shell on purpose: this is not a page of the shop but
   * the tool that fills it, and it carries its own chrome. Declared first so the
   * empty-path shell below does not try to match "admin" as one of its own.
   */
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-shell').then((m) => m.AdminShell),
    canActivate: [permissionGuard('products.write')],
    title: 'Krist — Admin',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'products' },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/products-list').then((m) => m.AdminProductsList),
      },
      // Before ":id", or "new" is read as the id of a product that does not exist.
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/admin/product-form').then((m) => m.AdminProductForm),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./features/admin/product-form').then((m) => m.AdminProductForm),
      },
      {
        path: 'taxonomy',
        loadComponent: () => import('./features/admin/taxonomy').then((m) => m.AdminTaxonomy),
      },
    ],
  },
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
        title: 'Krist — Fashion Store',
      },
      {
        path: 'shop',
        loadComponent: () => import('./features/shop/shop').then((m) => m.Shop),
        title: 'Shop — Krist',
      },
      {
        path: 'product/:slug',
        loadComponent: () => import('./features/product/product').then((m) => m.ProductPage),
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart').then((m) => m.Cart),
        title: 'Checkout — Krist',
      },
      {
        path: 'checkout',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'address' },
          {
            path: 'address',
            loadComponent: () =>
              import('./features/checkout/shipping-address').then((m) => m.ShippingAddress),
            title: 'Shipping Address — Krist',
          },
          {
            path: 'payment',
            loadComponent: () =>
              import('./features/checkout/payment-method').then((m) => m.PaymentMethodPage),
            canActivate: [checkoutStepGuard('payment')],
            title: 'Payment Method — Krist',
          },
          {
            path: 'review',
            loadComponent: () =>
              import('./features/checkout/review-order').then((m) => m.ReviewOrder),
            canActivate: [checkoutStepGuard('review')],
            title: 'Review Your Order — Krist',
          },
        ],
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
        title: 'My Profile — Krist',
        canActivate: [authGuard],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'personal-information' },
          {
            path: 'personal-information',
            loadComponent: () =>
              import('./features/profile/personal-information').then((m) => m.PersonalInformation),
          },
          {
            path: 'orders',
            loadComponent: () => import('./features/profile/my-orders').then((m) => m.MyOrders),
          },
          {
            path: 'orders/:id',
            loadComponent: () =>
              import('./features/profile/order-detail').then((m) => m.OrderDetail),
          },
          {
            path: 'wishlists',
            loadComponent: () =>
              import('./features/profile/my-wishlists').then((m) => m.MyWishlists),
          },
          {
            path: 'addresses',
            loadComponent: () =>
              import('./features/profile/manage-addresses').then((m) => m.ManageAddresses),
          },
          {
            path: 'cards',
            loadComponent: () => import('./features/profile/saved-cards').then((m) => m.SavedCards),
          },
          {
            path: 'notifications',
            loadComponent: () =>
              import('./features/profile/notifications').then((m) => m.Notifications),
          },
          {
            path: 'settings',
            loadComponent: () => import('./features/profile/settings').then((m) => m.Settings),
          },
        ],
      },
      {
        path: 'our-story',
        loadComponent: () => import('./features/pages/our-story').then((m) => m.OurStory),
        title: 'Our Story — Krist',
      },
      {
        path: 'blog',
        loadComponent: () => import('./features/pages/blog').then((m) => m.Blog),
        title: 'Blog — Krist',
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/pages/contact').then((m) => m.Contact),
        title: 'Contact Us — Krist',
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
    title: 'Login — Krist',
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup').then((m) => m.Signup),
    title: 'Create Account — Krist',
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password').then((m) => m.ForgotPassword),
    title: 'Forgot Password — Krist',
  },
  {
    path: 'otp',
    loadComponent: () => import('./features/auth/otp').then((m) => m.Otp),
    title: 'Enter OTP — Krist',
  },
  {
    path: 'password-changed',
    loadComponent: () => import('./features/auth/password-changed').then((m) => m.PasswordChanged),
    title: 'Password Changed — Krist',
  },
  { path: '**', redirectTo: '' },
];
