# Provider detail view extensions

A provider can add read-only content to its Marketplace detail view with
`ProviderMetadata.spec.detailViewExtensions`. Marketplace renders each URL in declaration order with
[Luigi Container](https://github.com/luigi-project/luigi/tree/main/container).

```yaml
spec:
  detailViewExtensions:
    - url: https://provider.example/ui/provider-details/
```

The iframe receives this Luigi context:

```json
{
  "protocolVersion": "platform-mesh.provider-details.v1",
  "currentProvider": {
    "name": "example.provider.io",
    "providerMetadata": {}
  },
  "providers": [
    {
      "name": "example.provider.io",
      "providerMetadata": {}
    }
  ]
}
```

`providers` contains only Marketplace entries visible to the current user. Extensions can send
these Luigi custom messages:

- `platform-mesh.provider-details.resize.v1` with `{ "height": 480 }` to resize the container.
- `platform-mesh.provider-details.navigate.v1` with `{ "providerName": "..." }` to open another
  visible provider.

Marketplace does not forward credentials. Provider metadata and extension URLs are provider-owned
content and use the same trust boundary as the existing `ProviderMetadata` links.
