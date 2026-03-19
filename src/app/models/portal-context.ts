export interface PortalContext extends Record<string, string> {
  crdGatewayApiUrl: string;
  environment: 'dev' | 'int' | 'prod';
}
