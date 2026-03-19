import { Injectable } from '@angular/core';
import { AlertSettings } from '@luigi-project/client';
import { LuigiClient } from 'services/luigi';

export const DEFAULT_TOAST_CLOSE_AFTER = 5000;

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private luigiClient: LuigiClient) {}

  openErrorStrip(errorMessage: string): void {
    void this.luigiClient.uxManager().showAlert({
      text: capitalizeFirstLetter(errorMessage),
      type: 'error',
    });
  }

  /**
   * Opens a new message toast of Fundamentals {@link https://sap.github.io/fundamental-ngx/#/core/message-toast} via
   * Luigi Client customAlertHandler {@link https://docs.luigi-project.io/docs/general-settings/?section=customalerthandler},
   * @param successMessage The message to be displayed as toast.
   * @param closeAfter (Optional) [DEFAULT_TOAST_CLOSE_AFTER] time in milliseconds that tells when to close the Alert automatically. If not provided, the Alert will stay on until the default time is reached.
   */
  openSuccessToast(successMessage: string, closeAfter?: number): void {
    void this.luigiClient.uxManager().showAlert({
      text: capitalizeFirstLetter(successMessage),
      type: 'message-toast' as AlertSettings['type'],
      closeAfter: closeAfter || DEFAULT_TOAST_CLOSE_AFTER,
    });
  }
}

function capitalizeFirstLetter(message: string): string {
  return message ? `${message[0].toUpperCase()}${message.slice(1)}` : message;
}
