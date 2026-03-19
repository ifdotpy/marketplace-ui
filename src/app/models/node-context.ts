import { PortalContext } from './portal-context';
import { GoBackContext } from 'models/luigi-go-back';

export interface EntityConfig {
  contextProperty: string;
}

export interface NodeContext extends Record<string, any> {
  token: string;
  accountId: string;
  userId: string;
  entityType: string;
  portalBaseUrl: string;
  portalContext: PortalContext;
  serviceProviderConfig: Record<string, string>;
  entityName: string;
  entityId: string;
  entity: any;
  profileUserId?: string;
  analyticsTrackerConfig: AnalyzerTrackingConfig;
  entityContext: Record<
    string,
    {
      id: string;
      displayName: string;
      description?: string;
      policies: string[];
      automaticdNamespace?: string;
      type?: string;
      extensions?: {
        dora?: {
          identifier: string;
        };
        piper?: {
          enabled: boolean;
        };
      };
    }
  >;

  goBackContext?: GoBackContext | any;
  parentNavigationContexts: string[];
  providerName?: string;
}

export interface AnalyzerTrackingConfig {
  siteUrl?: string;
}
