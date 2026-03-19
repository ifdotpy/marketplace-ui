import { LuigiClient } from './luigi-client.service';
import { LuigiDialogUtil } from './luigi-dialog-util.service';
import { TestBed } from '@angular/core/testing';
import { DialogRef } from '@fundamental-ngx/core/dialog';
import { mock } from 'vitest-mock-extended';
import { MockProvider } from 'ng-mocks';
import { Subject } from 'rxjs';

describe('LuigiDialogUtil', () => {
  let luigiDialogUtil: LuigiDialogUtil;
  let luigiClient: LuigiClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProvider(LuigiClient, {
          uxManager: vi.fn().mockReturnValue({
            addBackdrop: vi.fn(),
            removeBackdrop: vi.fn(),
          }),
        }),
      ],
    });

    luigiClient = TestBed.inject(LuigiClient);
    luigiDialogUtil = TestBed.inject(LuigiDialogUtil);
  });

  describe('manageLuigiBackdrops', () => {
    it('should call dialogOpened immediately and dialogClosed after close next', () => {
      const dialogRef: DialogRef = mock<DialogRef>();
      const afterClosed = new Subject<void>();
      dialogRef.afterClosed = afterClosed;

      const dialogOpenedSpy = vi.fn();
      const dialogClosedSpy = vi.fn();
      luigiDialogUtil['dialogOpened'] = dialogOpenedSpy;
      luigiDialogUtil['dialogClosed'] = dialogClosedSpy;

      luigiDialogUtil.manageLuigiBackdrops(dialogRef);

      expect(dialogOpenedSpy).toHaveBeenCalledTimes(1);
      expect(dialogClosedSpy).not.toHaveBeenCalled();

      afterClosed.next();

      expect(dialogClosedSpy).toHaveBeenCalledTimes(1);
    });

    it('should call dialogClosed when afterClosed errors', () => {
      const dialogRef: DialogRef = mock<DialogRef>();
      const afterClosed = new Subject<void>();
      dialogRef.afterClosed = afterClosed;

      const dialogOpenedSpy = vi.fn();
      const dialogClosedSpy = vi.fn();
      luigiDialogUtil['dialogOpened'] = dialogOpenedSpy;
      luigiDialogUtil['dialogClosed'] = dialogClosedSpy;

      luigiDialogUtil.manageLuigiBackdrops(dialogRef);
      afterClosed.error(new Error('dialog error'));

      expect(dialogClosedSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('dialogOpened (private)', () => {
    it('should increment dialogOpenCounter and call addBackdrop', () => {
      luigiDialogUtil['dialogOpenCounter'] = 0;

      luigiDialogUtil['dialogOpened']();

      expect(luigiDialogUtil['dialogOpenCounter']).toEqual(1);
      expect(luigiClient.uxManager().addBackdrop).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple opens', () => {
      luigiDialogUtil['dialogOpenCounter'] = 0;

      luigiDialogUtil['dialogOpened']();
      luigiDialogUtil['dialogOpened']();

      expect(luigiDialogUtil['dialogOpenCounter']).toEqual(2);
      expect(luigiClient.uxManager().addBackdrop).toHaveBeenCalledTimes(2);
    });
  });

  describe('dialogClosed (private)', () => {
    it('should decrement to 0 and call removeBackdrop when counter is 1', () => {
      luigiDialogUtil['dialogOpenCounter'] = 1;

      luigiDialogUtil['dialogClosed']();

      expect(luigiDialogUtil['dialogOpenCounter']).toEqual(0);
      expect(luigiClient.uxManager().removeBackdrop).toHaveBeenCalledTimes(1);
    });

    it('should decrement counter but not call removeBackdrop when counter is above 1', () => {
      luigiDialogUtil['dialogOpenCounter'] = 2;

      luigiDialogUtil['dialogClosed']();

      expect(luigiDialogUtil['dialogOpenCounter']).toEqual(1);
      expect(luigiClient.uxManager().removeBackdrop).not.toHaveBeenCalled();
    });

    it('should not go below 0 and still call removeBackdrop when counter is already 0', () => {
      luigiDialogUtil['dialogOpenCounter'] = 0;

      luigiDialogUtil['dialogClosed']();

      expect(luigiDialogUtil['dialogOpenCounter']).toEqual(0);
      expect(luigiClient.uxManager().removeBackdrop).toHaveBeenCalledTimes(1);
    });
  });
});
