import {
  DEFAULT_TOAST_CLOSE_AFTER,
  NotificationService,
} from './notification.service';
import { UxManager } from '@luigi-project/client';
import { LuigiClient } from 'services/luigi';
import { mock } from 'vitest-mock-extended';

describe('NotificationService', () => {
  const showAlertMock = vi.fn();
  const luigiClient = mock<LuigiClient>({
    uxManager: () => mock<UxManager>({ showAlert: showAlertMock }),
  });
  const service = new NotificationService(luigiClient);

  afterEach(() => vi.resetAllMocks());

  describe('openErrorStrip', () => {
    it('should open error alert with the provided message', () => {
      service.openErrorStrip('some error occurred');
      expect(luigiClient.uxManager().showAlert).toHaveBeenCalledWith({
        text: 'Some error occurred',
        type: 'error',
      });
    });

    it('should capitalize the first letter of the error message', () => {
      service.openErrorStrip('failed to load resource');
      expect(luigiClient.uxManager().showAlert).toHaveBeenCalledWith({
        text: 'Failed to load resource',
        type: 'error',
      });
    });

    it('should handle empty error message', () => {
      service.openErrorStrip('');
      expect(luigiClient.uxManager().showAlert).toHaveBeenCalledWith({
        text: '',
        type: 'error',
      });
    });
  });

  describe('openSuccessToast', () => {
    it('should open message-toast alert with the provided message', () => {
      service.openSuccessToast('Something happened', 3000);
      expect(luigiClient.uxManager().showAlert).toHaveBeenCalledWith({
        text: 'Something happened',
        type: 'message-toast',
        closeAfter: 3000,
      });
    });

    it('should capitalize the first letter of the success message', () => {
      service.openSuccessToast('something happened', 3000);
      expect(luigiClient.uxManager().showAlert).toHaveBeenCalledWith({
        text: 'Something happened',
        type: 'message-toast',
        closeAfter: 3000,
      });
    });

    it('should use DEFAULT_TOAST_CLOSE_AFTER when closeAfter is not provided', () => {
      service.openSuccessToast('provider enabled');
      expect(luigiClient.uxManager().showAlert).toHaveBeenCalledWith({
        text: 'Provider enabled',
        type: 'message-toast',
        closeAfter: DEFAULT_TOAST_CLOSE_AFTER,
      });
    });

    it('should use DEFAULT_TOAST_CLOSE_AFTER when empty string is the message', () => {
      service.openSuccessToast('');
      expect(luigiClient.uxManager().showAlert).toHaveBeenCalledWith({
        text: '',
        type: 'message-toast',
        closeAfter: DEFAULT_TOAST_CLOSE_AFTER,
      });
    });
  });
});
