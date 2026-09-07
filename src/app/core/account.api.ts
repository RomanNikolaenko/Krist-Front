import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './auth/api.config';
import { Address, AppNotification, SavedCard } from './models';

export interface ProfileRecord {
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  addressLine: string | null;
}

export type AddressDraft = Omit<Address, 'id'>;
export type SavedCardDraft = Omit<SavedCard, 'id'>;

/**
 * Everything behind "My Profile", as calls rather than resources.
 *
 * The stores above these keep the state and decide when to reload; this layer
 * only knows the URLs. Nothing here takes a user id — the server reads that
 * from the session, which is why there is no way to ask for somebody else's.
 */
@Injectable({ providedIn: 'root' })
export class AccountApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_BASE_URL);

  profile(): Promise<ProfileRecord> {
    return firstValueFrom(this.http.get<ProfileRecord>(`${this.api}/account/profile`));
  }

  updateProfile(patch: Partial<Omit<ProfileRecord, 'email'>>): Promise<ProfileRecord> {
    return firstValueFrom(this.http.patch<ProfileRecord>(`${this.api}/account/profile`, patch));
  }

  /**
   * Sends the picture itself, as multipart.
   *
   * No Content-Type is set here on purpose: the browser has to write the
   * boundary into the header, and naming the type by hand produces a body the
   * server cannot parse.
   */
  uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const body = new FormData();
    body.append('file', file);

    return firstValueFrom(
      this.http.post<{ avatarUrl: string }>(`${this.api}/account/avatar`, body),
    );
  }

  removeAvatar(): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/account/avatar`));
  }

  /**
   * Closes the account. The password goes in the body rather than a header
   * because it is a confirmation, not a credential the request is signed with.
   */
  deleteAccount(password: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.delete<{ message: string }>(`${this.api}/account`, { body: { password } }),
    );
  }
  addresses(): Promise<Address[]> {
    return firstValueFrom(this.http.get<Address[]>(`${this.api}/account/addresses`));
  }

  addAddress(draft: AddressDraft): Promise<Address> {
    return firstValueFrom(this.http.post<Address>(`${this.api}/account/addresses`, draft));
  }

  updateAddress(id: string, draft: AddressDraft): Promise<Address> {
    return firstValueFrom(this.http.put<Address>(`${this.api}/account/addresses/${id}`, draft));
  }

  removeAddress(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/account/addresses/${id}`));
  }

  setDefaultAddress(id: string): Promise<Address> {
    return firstValueFrom(
      this.http.post<Address>(`${this.api}/account/addresses/${id}/default`, {}),
    );
  }

  cards(): Promise<SavedCard[]> {
    return firstValueFrom(this.http.get<SavedCard[]>(`${this.api}/account/cards`));
  }

  addCard(draft: SavedCardDraft): Promise<SavedCard> {
    return firstValueFrom(this.http.post<SavedCard>(`${this.api}/account/cards`, draft));
  }

  removeCard(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/account/cards/${id}`));
  }

  setDefaultCard(id: string): Promise<SavedCard> {
    return firstValueFrom(this.http.post<SavedCard>(`${this.api}/account/cards/${id}/default`, {}));
  }

  notifications(): Promise<AppNotification[]> {
    return firstValueFrom(this.http.get<AppNotification[]>(`${this.api}/account/notifications`));
  }

  markRead(id: string): Promise<{ read: number }> {
    return firstValueFrom(
      this.http.post<{ read: number }>(`${this.api}/account/notifications/${id}/read`, {}),
    );
  }

  markAllRead(): Promise<{ read: number }> {
    return firstValueFrom(
      this.http.post<{ read: number }>(`${this.api}/account/notifications/read-all`, {}),
    );
  }
}
