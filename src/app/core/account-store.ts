import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { AccountApi, AddressDraft, ProfileRecord, SavedCardDraft } from './account.api';
import { AuthService } from './auth/auth.service';
import { Address, AppNotification, SavedCard } from './models';
import { injectMediaUrl } from './media';

/** The flattened shape the profile screens bind to. */
export interface ProfileView {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  avatar: string;
}

const EMPTY_PROFILE: ProfileView = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  avatar: '',
};

/**
 * The account, as the server has it.
 *
 * Everything here used to be seeded from demo constants and kept in
 * localStorage, which is why an account that had never saved a card still had
 * two of them. Now nothing exists until the API says it does: a fresh account
 * reads back empty, and that is the right answer rather than a missing feature.
 *
 * The two exceptions are the checkout selections. Which address and which
 * payment method someone picked is a step in a flow they have not finished, not
 * a fact about their account, so those stay in this browser until the order is
 * placed.
 */
@Injectable({ providedIn: 'root' })
export class AccountStore {
  private readonly api = inject(AccountApi);
  private readonly auth = inject(AuthService);
  private readonly media = injectMediaUrl();

  private readonly profileState = signal<ProfileRecord | null>(null);
  private readonly addressList = signal<Address[]>([]);
  private readonly cardList = signal<SavedCard[]>([]);
  private readonly notificationList = signal<AppNotification[]>([]);
  private readonly loaded = signal(false);

  readonly addresses = this.addressList.asReadonly();
  readonly cards = this.cardList.asReadonly();
  readonly notifications = this.notificationList.asReadonly();
  readonly ready = this.loaded.asReadonly();

  readonly profile = computed<ProfileView>(() => {
    const record = this.profileState();
    if (!record) return EMPTY_PROFILE;

    return {
      firstName: record.firstName ?? '',
      lastName: record.lastName ?? '',
      phone: record.phone ?? '',
      email: record.email,
      address: record.addressLine ?? '',
      // An uploaded picture is a path on the API host, not on this one.
      avatar: this.media(record.avatarUrl),
    };
  });

  readonly fullName = computed(() => {
    const { firstName, lastName, email } = this.profile();
    return [firstName, lastName].filter(Boolean).join(' ') || email;
  });

  readonly unreadCount = computed(
    () => this.notificationList().filter((notification) => !notification.read).length,
  );

  /** The one a screen should offer first, when it has to offer one. */
  readonly defaultAddress = computed<Address | null>(
    () => this.addressList().find((address) => address.isDefault) ?? this.addressList()[0] ?? null,
  );

  readonly defaultCard = computed<SavedCard | null>(
    () => this.cardList().find((card) => card.isDefault) ?? this.cardList()[0] ?? null,
  );

  constructor() {
    effect(() => {
      if (!this.auth.isAuthenticated()) {
        untracked(() => this.clear());
        return;
      }

      void untracked(() => this.load());
    });
  }

  async load(): Promise<void> {
    const [profile, addresses, cards, notifications] = await Promise.all([
      this.api.profile(),
      this.api.addresses(),
      this.api.cards(),
      this.api.notifications(),
    ]);

    this.profileState.set(profile);
    this.addressList.set(addresses);
    this.cardList.set(cards);
    this.notificationList.set(notifications);
    this.loaded.set(true);
  }

  /**
   * `address` is this screen's word for the one free-text line; the API calls
   * it `addressLine`. The email is not sent at all — moving an account to a new
   * address is an authentication change, not a profile edit.
   */
  async updateProfile(patch: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  }): Promise<void> {
    const record = await this.api.updateProfile({
      ...(patch.firstName === undefined ? {} : { firstName: patch.firstName }),
      ...(patch.lastName === undefined ? {} : { lastName: patch.lastName }),
      ...(patch.phone === undefined ? {} : { phone: patch.phone }),
      ...(patch.address === undefined ? {} : { addressLine: patch.address }),
    });

    this.profileState.set(record);
    this.notificationList.set(await this.api.notifications());
  }

  /** Replaces the profile picture with an uploaded file. */
  async uploadAvatar(file: File): Promise<void> {
    await this.api.uploadAvatar(file);
    this.profileState.set(await this.api.profile());
    this.notificationList.set(await this.api.notifications());
  }

  async removeAvatar(): Promise<void> {
    await this.api.removeAvatar();
    this.profileState.set(await this.api.profile());
  }

  async addAddress(draft: AddressDraft): Promise<Address> {
    const created = await this.api.addAddress(draft);
    this.addressList.set(await this.api.addresses());
    return created;
  }

  async updateAddress(id: string, draft: AddressDraft): Promise<void> {
    await this.api.updateAddress(id, draft);
    this.addressList.set(await this.api.addresses());
  }

  async removeAddress(id: string): Promise<void> {
    await this.api.removeAddress(id);
    this.addressList.set(await this.api.addresses());
  }

  /** Returns the card, because the checkout needs to know which one it made. */
  async addCard(draft: SavedCardDraft): Promise<SavedCard> {
    const created = await this.api.addCard(draft);
    this.cardList.set(await this.api.cards());
    return created;
  }

  async removeCard(id: string): Promise<void> {
    await this.api.removeCard(id);
    this.cardList.set(await this.api.cards());
  }

  async setDefaultCard(id: string): Promise<void> {
    await this.api.setDefaultCard(id);
    this.cardList.set(await this.api.cards());
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.api.markRead(id);
    this.notificationList.set(await this.api.notifications());
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.api.markAllRead();
    this.notificationList.set(await this.api.notifications());
  }

  private clear(): void {
    this.profileState.set(null);
    this.addressList.set([]);
    this.cardList.set([]);
    this.notificationList.set([]);
    this.loaded.set(false);
  }
}
