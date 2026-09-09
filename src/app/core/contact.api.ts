import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './auth/api.config';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * The two things a visitor can send without an account.
 *
 * Both screens used to keep their answer to themselves: the contact form said
 * "sent" and sent nothing, and the footer box cancelled its own submit.
 */
@Injectable({ providedIn: 'root' })
export class ContactApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_BASE_URL);

  send(message: ContactMessage): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${this.api}/contact`, message));
  }

  subscribe(email: string): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>(`${this.api}/newsletter`, { email }));
  }
}
