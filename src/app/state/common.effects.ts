import { Injectable } from '@angular/core';
import { MessageBoxRef, MessageBoxService } from '@fundamental-ngx/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { GoBackContext, LuigiGoBackAction } from 'models/luigi-go-back';
import { map } from 'rxjs/operators';
import { LuigiClient } from 'services/luigi';
import { NotificationService } from 'services/notification.service';
import {
  goBackAction,
  requestFailed,
  showConfirmation,
} from 'state/common.action';
import { prettifyErrorMessage } from 'utils/helpers';

@Injectable({ providedIn: 'root' })
export class CommonEffects {
  constructor(
    private actions: Actions,
    private messageBoxService: MessageBoxService,
    private notificationService: NotificationService,
    private store: Store,
    private luigiClient: LuigiClient,
  ) {}

  resourceRequestFailed = createEffect(
    () =>
      this.actions.pipe(
        ofType(requestFailed),
        map(({ error, dialogTitle, goBack }) => {
          let errorMessage: string;
          if (error.error) {
            const innerError = error.error as Record<string, string>;
            errorMessage = innerError.message;
          } else {
            errorMessage = error.message?.toString();
          }
          const messageBoxRef: MessageBoxRef = this.messageBoxService.open(
            {
              title: dialogTitle,
              content: prettifyErrorMessage(errorMessage),
              approveButton: 'Ok',
              approveButtonCallback: () => {
                if (goBack) {
                  this.store.dispatch(
                    goBackAction({
                      action: LuigiGoBackAction.RESOURCE_ACCOUNT_ERROR,
                    }),
                  );
                }
                messageBoxRef.close();
              },
            },
            {
              type: 'error',
            },
          );
        }),
      ),
    { dispatch: false },
  );

  showConfirmation = createEffect(
    () =>
      this.actions.pipe(
        ofType(showConfirmation),
        map(({ message }) => {
          this.notificationService.openSuccessToast(message);
        }),
      ),
    { dispatch: false },
  );

  goBack = createEffect(
    () =>
      this.actions.pipe(
        ofType(goBackAction),
        map((action) => {
          this.luigiClient.linkManager().goBack({
            action: action.action,
          } as GoBackContext);
        }),
      ),
    { dispatch: false },
  );
}
