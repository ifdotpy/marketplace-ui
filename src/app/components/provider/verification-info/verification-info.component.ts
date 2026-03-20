import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ObjectStatusComponent } from '@fundamental-ngx/core';
import { AvatarComponent } from '@fundamental-ngx/core/avatar';
import { InlineHelpDirective } from '@fundamental-ngx/core/inline-help';
import { Verification } from 'models/verification';
import { VerificationInfo } from 'models/verification-info';

@Component({
  selector: 'app-provider-verification',
  imports: [AvatarComponent, InlineHelpDirective, ObjectStatusComponent],
  templateUrl: './verification-info.component.html',
  styleUrl: './verification-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationInfoComponent {
  /**
   * Indication the verification status
   */
  verification = input<Verification | undefined>(undefined);
  verificationInfo = computed(() => this.mapVerificationInfo());

  communityVerificationInfo: VerificationInfo = {
    showIcon: false,
    label: 'Community',
    objectStatus: 'neutral',
  };

  mapVerificationInfo(): VerificationInfo {
    return this.communityVerificationInfo;
  }
}
