import { inject, Injectable } from '@angular/core';
import { MatDialog } from 'hmdm-ui-kit';
import { filter, switchMap, take, tap } from 'rxjs';
import { MessageDialog } from '../components/message-dialog/message-dialog';
import { PushFacadeService } from './push-facade.service';

@Injectable({
  providedIn: 'root',
})
export class PushDialogService {
  private dialog = inject(MatDialog);
  private pushFacadeService = inject(PushFacadeService);

  openNewMessageDialog(): void {
    this.dialog
      .open(MessageDialog)
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        tap((data) => console.log('Message to send:', data)),
        switchMap((data) => this.pushFacadeService.sendMessage(data)),
      )
      .subscribe(() => {
        this.pushFacadeService.searchMessages();
      });
  }
}
