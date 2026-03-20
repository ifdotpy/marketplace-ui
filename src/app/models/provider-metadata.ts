import { MessageStripType } from '@fundamental-ngx/core';
import { Verification } from 'models/verification';

export interface MessageStripConfig {
  type: MessageStripType;
  text: string;
  noIcon: boolean;
  dismissible: boolean;
}

export interface ActionsConfig {
  additionalActions: ActionConfig[];
  globalActions: GlobalAccountActionConfig[];
}

export interface ActionConfig {
  id: string;
  glyph: string;
  displayName: string;
  condition: string;
  executionPayload?: ExecutionPayload;
  requiredPolicies?: string[];
  confirmationPopup?: ActionPopupConfig;
  actionSuccessMessage?: string;
}

export interface GlobalAccountActionConfig {
  id: string;
  glyph: string;
  displayName: string;
  condition: string;
  actionConfig?: GlobalActionConfig;
  requiredPolicies?: string[];
}

export interface GlobalActionConfig {
  type: string;
  path: string;
}

export interface ActionPopupConfig {
  title: string;
  text: string;
  type: string;
  acceptButton: string;
  cancelButton: string;
}

export interface ExecutionPayload {
  payload: string;
}

export interface StatusConfig {
  mapping: StatusMapping;
  tooltipDataPath?: string;
  tooltipDefaultMessage?: string;
}

export interface StatusMapping {
  critical: string[];
  positive: string[];
  negative: string[];
  informative: string[];
  default: string[];
}

export interface Contact {
  displayName: string;
  email?: string;
  roles?: string[];
  contactLink?: string;
}

export type ColorCategory =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10';

export interface Label {
  title: string;
  color: ColorCategory;
  glyph?: string;
}

export interface MarketplaceEntry {
  metadata: {
    name: string;
  };
  spec: {
    installed: boolean;
    apiExport: {
      metadata: string;
      spec: {
        permissionClaims: {
          all: boolean;
          group: string;
          identityHash: string;
          resource: string;
          verbs: string[];
        }[];
      };
    };
    providerMetadata: ProviderMetadata;
  };
}

export interface ProviderMetadata {
  spec: {
    tags?: string[];

    displayName: string;
    description?: string;

    data?: string;
    contacts?: Contact[];
    documentation?: Documentation[];
    icon?: Icon;

    links?: Link[];
    preferredSupportChannels?: Link[];
    helpCenterData?: Documentation[];

    // not supported yet
    image?: string; // data:image/x;base64,
    category?: string;
    creationTimestamp?: string;
    labels?: Label[];
    mainLink?: Link;
    provider?: string;
    serviceLevel?: ServiceLevel;
    verification?: Verification;
  };
}

export interface Link {
  name: string;
  displayName?: string;
  url: string;
  default?: boolean;
}

export enum ServiceLevel {
  VeryHigh = 'veryHigh24x7',
  High = 'high24x5',
  MediumOne = 'mediumOne16x5',
  MediumTwo = 'mediumTwo12x5',
  Low = 'low8x5',
}

export interface Documentation {
  name: string;
  url?: string;
}

export interface Icon {
  light: Image;
  dark: Image;
}

export interface Image {
  url?: string;
  data?: string;
}

export interface ServiceInstanceStatusValue {
  label: string;
}

export enum ServiceStatus {
  READY = 'READY',
  IN_DELETION = 'IN_DELETION',
}

export interface InstallProviderInput {
  marketPlaceEntry: MarketplaceEntry;
  installationData?: Record<string, unknown>;
}

export interface UpdateProviderInput {
  providerInput: ProviderInput;
  instanceId: string;
  installationData: Record<string, unknown>;
}

export interface ProviderInput {
  id: string;
}

export interface ProviderMetadataFilter {
  installableIn?: string[];
  excludeHiddenExtensions?: boolean;
  excludeHiddenInGlobalCatalogExtensions?: boolean;
}
