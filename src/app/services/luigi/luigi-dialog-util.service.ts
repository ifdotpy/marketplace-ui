import { LuigiClient } from './luigi-client.service';
import { Injectable } from '@angular/core';
import { DialogRefBase } from '@fundamental-ngx/core/dialog';

@Injectable({
  providedIn: 'root',
})
export class LuigiDialogUtil {
  constructor(private luigiClient: LuigiClient) {}

  /**
   * Subscribes to the dialogRef.afterClosed observable to add / remove the backdrops
   * provided by luigi clients ux manager.
   * @param dialogRef The fundamentals dialog reference to apply backdrops to.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manageLuigiBackdrops(dialogRef: DialogRefBase<any>): void {
    this.dialogOpened();
    dialogRef.afterClosed.subscribe({
      next: () => {
        this.dialogClosed();
      },
      error: () => {
        this.dialogClosed();
      },
    });
  }

  private dialogOpenCounter = 0;

  private dialogOpened() {
    this.dialogOpenCounter++;
    this.luigiClient.uxManager().addBackdrop();
  }

  private dialogClosed() {
    this.dialogOpenCounter--;
    if (this.dialogOpenCounter <= 0) {
      this.dialogOpenCounter = 0;
      this.luigiClient.uxManager().removeBackdrop();
    }
  }
}
