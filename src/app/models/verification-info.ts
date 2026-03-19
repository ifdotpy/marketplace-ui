import { ObjectStatus } from '@fundamental-ngx/core/object-status';

export interface VerificationInfo {
  showIcon: boolean;
  label: string;
  objectStatus: ObjectStatus;
  inlineHelp?: string;
}
