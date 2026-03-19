import { ProviderMetadata } from 'models/index';

export const PROVIDER_INSTANCE_INSTALLED = 'PROVIDER_INSTANCE_INSTALLED';
export const PROVIDER_INSTANCE_UPDATED = 'PROVIDER_INSTANCE_UPDATED';

export enum LuigiGoBackAction {
  PROVIDER_INSTANCE_UNINSTALLED = 'PROVIDER_INSTANCE_UNINSTALLED',
  EXTENSION_UNINSTALLED = 'PROVIDER_INSTANCE_UNINSTALLED',
  RESOURCE_ACCOUNT_EDITED = 'ACCOUNT_EDITED',
  RESOURCE_ACCOUNT_ERROR = 'RESOURCE_ACCOUNT_CANCEL',
}

export interface GoBackContext {
  action: LuigiGoBackAction;
  provider?: ProviderMetadata;
  installationData?: Record<string, unknown>;
}
