import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  PROVIDER_DETAIL_VIEW_EXTENSION_NAVIGATE,
  PROVIDER_DETAIL_VIEW_EXTENSION_PROTOCOL,
  PROVIDER_DETAIL_VIEW_EXTENSION_RESIZE,
  ProviderDetailViewExtensionContext,
  toDetailViewExtensionProvider,
} from 'models/provider-detail-view-extension';
import {
  DetailViewExtension,
  MarketplaceEntry,
} from 'models/provider-metadata';
import { ProviderService } from 'services/provider.service';

interface LuigiCustomMessage {
  id?: unknown;
  data?: {
    height?: unknown;
    providerName?: unknown;
  };
}

@Component({
  selector: 'app-provider-detail-view-extensions',
  templateUrl: './provider-detail-view-extensions.component.html',
  styleUrl: './provider-detail-view-extensions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProviderDetailViewExtensionsComponent {
  readonly currentProvider = input.required<MarketplaceEntry>();
  readonly providers = input.required<readonly MarketplaceEntry[]>();

  protected readonly extensions = computed(() =>
    (
      this.currentProvider().spec.providerMetadata.spec.detailViewExtensions ??
      []
    ).filter((extension) => this.isSupportedExtension(extension)),
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

    if (message?.id === PROVIDER_DETAIL_VIEW_EXTENSION_RESIZE) {
      const height = message.data?.height;
      if (typeof height === 'number' && Number.isFinite(height)) {
        this.heights.update((heights) => ({
          ...heights,
          [index]: Math.min(2000, Math.max(120, Math.ceil(height))),
        }));
      }
      return;
    }

    if (message?.id === PROVIDER_DETAIL_VIEW_EXTENSION_NAVIGATE) {
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

  private buildContext(): ProviderDetailViewExtensionContext {
    return {
      protocolVersion: PROVIDER_DETAIL_VIEW_EXTENSION_PROTOCOL,
      currentProvider: toDetailViewExtensionProvider(this.currentProvider()),
      providers: this.providers().map(toDetailViewExtensionProvider),
    };
  }

  private isSupportedExtension(extension: DetailViewExtension): boolean {
    try {
      return ['http:', 'https:'].includes(new URL(extension.url).protocol);
    } catch {
      return false;
    }
  }
}
