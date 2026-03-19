import { gql } from 'apollo-angular';

export const createAPIBindingMutation = gql`
  mutation (
    $name: String!
    $apiExportPath: String!
    $apiExportName: String!
    $permissionClaims: [ApisKcpIoV1alpha2APIBindingspecspecpermissionClaimsInput]
  ) {
    apis_kcp_io {
      v1alpha2 {
        createAPIBinding(
          object: {
            metadata: { name: $name }
            spec: {
              reference: {
                export: { name: $apiExportName, path: $apiExportPath }
              }
              permissionClaims: $permissionClaims
            }
          }
        ) {
          metadata {
            name
          }
        }
      }
    }
  }
`;

export const deleteAPIBindingMutation = gql`
  mutation ($name: String!) {
    apis_kcp_io {
      v1alpha2 {
        deleteAPIBinding(name: $name)
      }
    }
  }
`;

export const getMarketplaceEntriesQuery = gql`
  {
    marketplace_platform_mesh_io {
      v1alpha1 {
        MarketplaceEntries {
          items {
            metadata {
              name
            }
            spec {
              installed
              apiExport {
                metadata
                spec {
                  permissionClaims {
                    all
                    group
                    identityHash
                    resource
                  }
                }
              }
              providerMetadata {
                spec {
                  contacts {
                    displayName
                    email
                    role
                  }
                  displayName
                  description
                  documentation {
                    url
                  }
                  icon {
                    light {
                      url
                      data
                    }
                    dark {
                      url
                      data
                    }
                  }
                  preferredSupportChannels {
                    url
                    displayName
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
