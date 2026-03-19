import { Overlay } from '@angular/cdk/overlay';
import { Injectable, inject } from '@angular/core';
import {
  MESSAGE_BOX_DEFAULT_CONFIG,
  MessageBoxConfig,
  MessageBoxContentType,
  MessageBoxRef,
  MessageBoxService,
  RtlService,
} from '@fundamental-ngx/core';
import { LuigiDialogUtil } from 'services/luigi';

@Injectable({
  providedIn: 'root',
})
export class FundamentalMessageBoxService extends MessageBoxService {
  constructor(
    private luigiDialogUtil: LuigiDialogUtil,
    overlay: Overlay,
  ) {
    super(
      inject(MESSAGE_BOX_DEFAULT_CONFIG, { optional: true })!,
      inject(RtlService, { optional: true })!,
      overlay,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override open<T = any>(
    content: MessageBoxContentType,
    config?: MessageBoxConfig<T>,
  ): MessageBoxRef<T> {
    const ref = super.open(content, config);
    this.luigiDialogUtil.manageLuigiBackdrops(ref);
    return ref;
  }
}
