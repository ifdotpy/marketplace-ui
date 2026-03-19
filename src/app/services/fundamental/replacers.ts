import { FundamentalDialogService } from './fundamental-dialog.service';
import { FundamentalMessageBoxService } from './fundamental-message-box.service';
import { DialogService, MessageBoxService } from '@fundamental-ngx/core';

export const FundamentalDialogServiceReplacer = {
  provide: DialogService,
  useClass: FundamentalDialogService,
};

export const FundamentalMessageBoxServiceReplacer = {
  provide: MessageBoxService,
  useClass: FundamentalMessageBoxService,
};
