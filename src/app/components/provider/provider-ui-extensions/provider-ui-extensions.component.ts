import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { MarketplaceEntry, UIExtension } from 'models/provider-metadata';
import {
  PROVIDER_UI_EXTENSION_NAVIGATE,
  PROVIDER_UI_EXTENSION_PROTOCOL,
  PROVIDER_UI_EXTENSION_RESIZE,
  ProviderUIExtensionContext,
  toUIExtensionProvider,
} from 'models/provider-ui-extension';
import { ProviderService } from 'services/provider.service';

interface LuigiCustomMessage {
  id?: unknown;
  data?: {
    height?: unknown;
    providerName?: unknown;
  };
}

@Component({
  selector: 'app-provider-ui-extensions',
  templateUrl: './provider-ui-extensions.component.html',
  styleUrl: './provider-ui-extensions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProviderUIExtensionsComponent {
  readonly currentProvider = input.required<MarketplaceEntry>();
  readonly providers = input.required<readonly MarketplaceEntry[]>();

  protected readonly extensions = computed(() =>
    (
      this.currentProvider().spec.providerMetadata.spec.uiExtensions ?? []
    ).filter(isSupportedExtension),
  );
  protected readonly context = computed(() =>
    JSON.stringify(this.buildContext()),
  );

  private readonly heights = signal<Record<number, number>>({});
  private readonly providerService = inject(ProviderService);

  protected extensionHeight(index: number): string {
    return `${this.heights()[index] ?? 360}px`;
  }

  protected handleCustomMessage(event: Event, index: number): void {
    const message = (event as CustomEvent<LuigiCustomMessage>).detail;

    if (message?.id === PROVIDER_UI_EXTENSION_RESIZE) {
      const height = message.data?.height;
      if (typeof height === 'number' && Number.isFinite(height)) {
        this.heights.update((heights) => ({
          ...heights,
          [index]: Math.min(2000, Math.max(120, Math.ceil(height))),
        }));
      }
      return;
    }

    if (message?.id === PROVIDER_UI_EXTENSION_NAVIGATE) {
      const providerName = message.data?.providerName;
      if (typeof providerName !== 'string') {
        return;
      }
      const provider = this.providers().find(
        (entry) => entry.metadata.name === providerName,
      );
      if (provider) {
        this.providerService.navigateToProviderDetails(provider);
      }
    }
  }

  private buildContext(): ProviderUIExtensionContext {
    return {
      protocolVersion: PROVIDER_UI_EXTENSION_PROTOCOL,
      currentProvider: toUIExtensionProvider(this.currentProvider()),
      providers: this.providers().map(toUIExtensionProvider),
    };
  }
}

function isSupportedExtension(extension: UIExtension): boolean {
  try {
    return ['http:', 'https:'].includes(new URL(extension.url).protocol);
  } catch {
    return false;
  }
}
