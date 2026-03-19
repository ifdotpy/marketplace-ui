import { Overlay } from '@angular/cdk/overlay';
import { Injectable, Injector, inject } from '@angular/core';
import {
  DIALOG_DEFAULT_CONFIG,
  DialogConfig,
  DialogContentType,
  DialogRef,
  DialogService,
  RtlService,
} from '@fundamental-ngx/core';
import { LuigiDialogUtil } from 'services/luigi';

@Injectable({
  providedIn: 'root',
})
export class FundamentalDialogService extends DialogService {
  constructor(
    private luigiDialogUtil: LuigiDialogUtil,
    injector: Injector,
    overlay: Overlay,
  ) {
    super(
      inject(DIALOG_DEFAULT_CONFIG, { optional: true })!,
      inject(RtlService, { optional: true })!,
      injector,
      overlay,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override open<T = any>(
    content: DialogContentType,
    dialogConfig?: DialogConfig<T>,
  ): DialogRef<T> {
    const ref = super.open(content, dialogConfig);
    this.luigiDialogUtil.manageLuigiBackdrops(ref);
    return ref;
  }
}
