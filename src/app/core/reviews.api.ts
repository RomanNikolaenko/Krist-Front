import { httpResource, HttpClient } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './auth/api.config';
import { Review, ShopReview } from './models';

export interface ReviewDraft {
  rating: number;
  title: string;
  body: string;
}

/**
 * Reviews are read by everyone and written by whoever is signed in.
 *
 * The list is a resource so the page re-fetches itself after a write; the
 * writes are plain calls, because a POST is something a person did once rather
 * than a value the screen derives.
 */
@Injectable({ providedIn: 'root' })
export class ReviewsApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(API_BASE_URL);

  forProduct(slug: Signal<string>) {
    return httpResource<Review[]>(
      () => (slug() ? `${this.api}/products/${encodeURIComponent(slug())}/reviews` : undefined),
      { defaultValue: [] },
    );
  }

  /**
   * Every review in the shop, for the home page rail. Most-liked first, then
   * newest; the limit is a ceiling on the carousel rather than a page size.
   */
  all(limit = 50) {
    return httpResource<ShopReview[]>(() => `${this.api}/reviews?limit=${limit}`, {
      defaultValue: [],
    });
  }

  write(slug: string, draft: ReviewDraft): Promise<Review> {
    return firstValueFrom(
      this.http.post<Review>(`${this.api}/products/${encodeURIComponent(slug)}/reviews`, draft),
    );
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.api}/reviews/${id}`));
  }

  setLike(id: string, liked: boolean): Promise<{ likes: number }> {
    const url = `${this.api}/reviews/${id}/like`;
    return firstValueFrom(
      liked ? this.http.post<{ likes: number }>(url, {}) : this.http.delete<{ likes: number }>(url),
    );
  }
}
