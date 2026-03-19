import { HttpErrorResponse } from '@angular/common/http';
import { MessageBoxService } from '@fundamental-ngx/core';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { createMockStore } from '@ngrx/store/testing';
import { MockProxy, mock } from 'vitest-mock-extended';
import { LuigiGoBackAction } from 'models/luigi-go-back';
import { of } from 'rxjs';
import {
  goBackAction,
  requestFailed,
  showConfirmation,
} from 'state/common.action';
import { CommonEffects } from 'state/common.effects';
import { LuigiClient } from 'services/luigi';
import { NotificationService } from 'services/notification.service';

describe('CommonEffects', () => {
  let luigiClient: MockProxy<LuigiClient>;
  let messageBoxService: MockProxy<MessageBoxService>;
  let mockStore: Store;
  let notificationService: MockProxy<NotificationService>;

  beforeEach(() => {
    messageBoxService = mock<MessageBoxService>();
    notificationService = mock<NotificationService>();
    luigiClient = mock<LuigiClient>({
      linkManager: vi.fn().mockReturnValue({ goBack: vi.fn() }),
    });
    mockStore = createMockStore();
  });

  afterEach(() => {
    (mockStore as any).complete?.();
  });

  function createEffects(action: Action) {
    return new CommonEffects(
      new Actions(of(action)),
      messageBoxService,
      notificationService,
      mockStore,
      luigiClient,
    );
  }

  describe('resourceRequestFailed', () => {
    it('should open a message box with the dialog title on failed requests', () => {
      const error = mock<HttpErrorResponse>({ message: 'Something went wrong' });
      const dialogTitle = 'Error Dialog Title';
      const action = requestFailed({ error, goBack: false, dialogTitle });

      const effects = createEffects(action);
      effects.resourceRequestFailed.subscribe();

      expect(messageBoxService.open).toHaveBeenCalledWith(
        expect.objectContaining({ title: dialogTitle }),
        { type: 'error' },
      );
    });

    it('should use inner error.message when error.error is present', () => {
      const error = new HttpErrorResponse({ error: { message: 'Inner error message' }, status: 400 });
      const action = requestFailed({ error, goBack: false, dialogTitle: 'Title' });

      const effects = createEffects(action);
      effects.resourceRequestFailed.subscribe();

      expect(messageBoxService.open).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Inner error message' }),
        { type: 'error' },
      );
    });

    it('should dispatch goBackAction and close message box when approveButtonCallback is called with goBack=true', () => {
      const error = mock<HttpErrorResponse>({ message: 'Error' });
      const action = requestFailed({ error, goBack: true, dialogTitle: 'Title' });

      const closeMock = vi.fn();
      let approveButtonCallback: (() => void) | undefined;

      messageBoxService.open.mockImplementation((config: any) => {
        approveButtonCallback = config.approveButtonCallback;
        return { close: closeMock } as any;
      });

      const dispatchSpy = vi.spyOn(mockStore, 'dispatch');

      const effects = new CommonEffects(
        new Actions(of(action)),
        messageBoxService,
        notificationService,
        mockStore,
        luigiClient,
      );
      effects.resourceRequestFailed.subscribe();

      approveButtonCallback!();

      expect(dispatchSpy).toHaveBeenCalledWith(
        goBackAction({ action: LuigiGoBackAction.RESOURCE_ACCOUNT_ERROR }),
      );
      expect(closeMock).toHaveBeenCalled();
    });

    it('should only close message box when approveButtonCallback is called with goBack=false', () => {
      const error = mock<HttpErrorResponse>({ message: 'Error' });
      const action = requestFailed({ error, goBack: false, dialogTitle: 'Title' });

      const closeMock = vi.fn();
      let approveButtonCallback: (() => void) | undefined;

      messageBoxService.open.mockImplementation((config: any) => {
        approveButtonCallback = config.approveButtonCallback;
        return { close: closeMock } as any;
      });

      const dispatchSpy = vi.spyOn(mockStore, 'dispatch');

      const effects = createEffects(action);
      effects.resourceRequestFailed.subscribe();

      approveButtonCallback!();

      expect(dispatchSpy).not.toHaveBeenCalled();
      expect(closeMock).toHaveBeenCalled();
    });
  });

  describe('showConfirmation', () => {
    it('should call openSuccessToast with the message', () => {
      const action = showConfirmation({ message: 'Operation successful' });

      const effects = createEffects(action);
      effects.showConfirmation.subscribe();

      expect(notificationService.openSuccessToast).toHaveBeenCalledWith('Operation successful');
    });
  });

  describe('goBack', () => {
    it('should call linkManager().goBack with the action', () => {
      const goBackMock = vi.fn();
      luigiClient.linkManager.mockReturnValue({ goBack: goBackMock } as any);
      const action = goBackAction({ action: LuigiGoBackAction.RESOURCE_ACCOUNT_EDITED });

      const effects = createEffects(action);
      effects.goBack.subscribe();

      expect(goBackMock).toHaveBeenCalledWith({
        action: LuigiGoBackAction.RESOURCE_ACCOUNT_EDITED,
      });
    });
  });
});
