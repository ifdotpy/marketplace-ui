import { ProviderDetailViewExtensionsComponent } from './provider-detail-view-extensions.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  PROVIDER_DETAIL_VIEW_EXTENSION_NAVIGATE,
  PROVIDER_DETAIL_VIEW_EXTENSION_RESIZE,
} from 'models/provider-detail-view-extension';
import { MarketplaceEntry } from 'models/provider-metadata';
import { ProviderService } from 'services/provider.service';

const provider = (name: string, url?: string): MarketplaceEntry => ({
  metadata: { name },
  spec: {
    apiExport: { metadata: '', spec: { permissionClaims: [] } },
    providerMetadata: {
      spec: {
        displayName: name,
        detailViewExtensions: url ? [{ url }] : [],
      },
    },
  },
});

describe('ProviderDetailViewExtensionsComponent', () => {
  let component: ProviderDetailViewExtensionsComponent;
  let fixture: ComponentFixture<ProviderDetailViewExtensionsComponent>;
  let navigateToProviderDetails: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    navigateToProviderDetails = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ProviderDetailViewExtensionsComponent],
      providers: [
        {
          provide: ProviderService,
          useValue: { navigateToProviderDetails },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderDetailViewExtensionsComponent);
    component = fixture.componentInstance;
  });

  it('renders supported extensions in declaration order', async () => {
    const current = provider('current');
    current.spec.providerMetadata.spec.detailViewExtensions = [
      { url: 'https://one.example/renderer' },
      { url: 'javascript:alert(1)' },
      { url: 'https://two.example/renderer' },
    ];
    fixture.componentRef.setInput('currentProvider', current);
    fixture.componentRef.setInput('providers', [current]);
    fixture.detectChanges();
    await fixture.whenStable();

    const containers =
      fixture.nativeElement.querySelectorAll('luigi-container');
    expect(containers).toHaveLength(2);
    expect(containers[0].viewurl).toBe('https://one.example/renderer');
    expect(containers[1].viewurl).toBe('https://two.example/renderer');
    expect(containers[0].skipCookieCheck).toBe('true');
  });

  it('passes only the current and visible providers in the versioned context', async () => {
    const current = provider('current', 'https://example.com/renderer');
    const candidate = provider('candidate');
    fixture.componentRef.setInput('currentProvider', current);
    fixture.componentRef.setInput('providers', [current, candidate]);
    fixture.detectChanges();
    await fixture.whenStable();

    const container = fixture.nativeElement.querySelector('luigi-container');
    const context = JSON.parse(container.context);
    expect(context.protocolVersion).toBe('platform-mesh.provider-details.v1');
    expect(context.currentProvider.name).toBe('current');
    expect(context.providers.map(({ name }: { name: string }) => name)).toEqual(
      ['current', 'candidate'],
    );
  });

  it('bounds renderer resize requests', async () => {
    const current = provider('current', 'https://example.com/renderer');
    fixture.componentRef.setInput('currentProvider', current);
    fixture.componentRef.setInput('providers', [current]);
    fixture.detectChanges();
    await fixture.whenStable();

    component['handleCustomMessage'](
      new CustomEvent('custom-message', {
        detail: {
          id: PROVIDER_DETAIL_VIEW_EXTENSION_RESIZE,
          data: { height: 5000 },
        },
      }),
      0,
    );
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('luigi-container').style.height,
    ).toBe('2000px');
  });

  it('navigates only to a visible provider', async () => {
    const current = provider('current', 'https://example.com/renderer');
    const candidate = provider('candidate');
    fixture.componentRef.setInput('currentProvider', current);
    fixture.componentRef.setInput('providers', [current, candidate]);
    fixture.detectChanges();
    await fixture.whenStable();

    component['handleCustomMessage'](
      new CustomEvent('custom-message', {
        detail: {
          id: PROVIDER_DETAIL_VIEW_EXTENSION_NAVIGATE,
          data: { providerName: 'candidate' },
        },
      }),
      0,
    );
    component['handleCustomMessage'](
      new CustomEvent('custom-message', {
        detail: {
          id: PROVIDER_DETAIL_VIEW_EXTENSION_NAVIGATE,
          data: { providerName: 'hidden' },
        },
      }),
      0,
    );

    expect(navigateToProviderDetails).toHaveBeenCalledOnce();
    expect(navigateToProviderDetails).toHaveBeenCalledWith(candidate);
  });
});
