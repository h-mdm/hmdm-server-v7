import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { THttpResponse } from '../../../shared/types/http-response.type';
import { THttpPageableResponse } from 'hmdm-ui-kit';
import { TCustomerDTO } from '../types/customer-dto.type';
import { TCustomerSearchRequest } from '../types/customer-search-request.type';
import { TUserDTO } from '../../user/types/user-dto.type';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly http: HttpClient = inject(HttpClient);

  search(
    body: TCustomerSearchRequest,
  ): Observable<{ items: TCustomerDTO[]; totalItemsCount: number }> {
    return this.http
      .post<THttpPageableResponse<TCustomerDTO>>('rest/private/customers/search', body)
      .pipe(map((response) => response.data));
  }

  getForUpdate(id: number): Observable<TCustomerDTO> {
    return this.http
      .get<THttpResponse<TCustomerDTO>>(`rest/private/customers/${id}/edit`)
      .pipe(map((response) => response.data));
  }

  save(body: TCustomerDTO): Observable<{ adminCredentials?: string } | null> {
    return this.http
      .put<THttpResponse<{ adminCredentials?: string } | null>>('rest/private/customers', body)
      .pipe(
        map((response) => {
          if (response.status === 'ERROR') {
            throw new Error(response.message ?? 'error');
          }
          return response.data;
        }),
      );
  }

  remove(id: number): Observable<void> {
    return this.http
      .delete<THttpResponse<void>>(`rest/private/customers/${id}`)
      .pipe(map(() => void 0));
  }

  validatePrefix(prefix: string): Observable<boolean> {
    return this.http
      .get<
        THttpResponse<boolean>
      >(`rest/private/customers/prefix/${encodeURIComponent(prefix)}/used`)
      .pipe(map((response) => response.data));
  }

  impersonate(id: number): Observable<TUserDTO> {
    return this.http
      .get<THttpResponse<TUserDTO>>(`rest/private/customers/impersonate/${id}`)
      .pipe(map((response) => response.data));
  }

  /** Gets the names of orphaned APK files in the customer's storage directory. */
  getOrphanedFiles(id: number): Observable<string[]> {
    return this.http
      .get<THttpResponse<string[]>>(`rest/private/customers/${id}/orphanedFiles`)
      .pipe(map((response) => response.data));
  }

  /** Deletes the specified orphaned files from the customer's storage directory; returns the number of deleted files. */
  removeOrphanedFiles(id: number, fileNames: string[]): Observable<number> {
    return this.http
      .post<THttpResponse<number>>(`rest/private/customers/${id}/orphanedFiles/remove`, fileNames)
      .pipe(map((response) => response.data));
  }
}
