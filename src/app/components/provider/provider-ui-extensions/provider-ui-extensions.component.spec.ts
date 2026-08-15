import { ProviderUIExtensionsComponent } from './provider-ui-extensions.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketplaceEntry } from 'models/provider-metadata';
import {
  PROVIDER_UI_EXTENSION_NAVIGATE,
  PROVIDER_UI_EXTENSION_RESIZE,
} from 'models/provider-ui-extension';
import { ProviderService } from 'services/provider.service';

const provider = (name: string, url?: string): MarketplaceEntry => ({
  metadata: { name },
  spec: {
    apiExport: { metadata: '', spec: { permissionClaims: [] } },
    providerMetadata: {
      spec: {
        displayName: name,
        uiExtensions: url ? [{ url }] : [],
      },
    },
  },
});

describe('ProviderUIExtensionsComponent', () => {
  let component: ProviderUIExtensionsComponent;
  let fixture: ComponentFixture<ProviderUIExtensionsComponent>;
  let navigateToProviderDetails: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    navigateToProviderDetails = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ProviderUIExtensionsComponent],
      providers: [
        {
          provide: ProviderService,
          useValue: { navigateToProviderDetails },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderUIExtensionsComponent);
    component = fixture.componentInstance;
  });

  it('renders supported extensions in declaration order', async () => {
    const current = provider('current');
    current.spec.providerMetadata.spec.uiExtensions = [
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
          id: PROVIDER_UI_EXTENSION_RESIZE,
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
          id: PROVIDER_UI_EXTENSION_NAVIGATE,
          data: { providerName: 'candidate' },
        },
      }),
      0,
    );
    component['handleCustomMessage'](
      new CustomEvent('custom-message', {
        detail: {
          id: PROVIDER_UI_EXTENSION_NAVIGATE,
          data: { providerName: 'hidden' },
        },
      }),
      0,
    );

    expect(navigateToProviderDetails).toHaveBeenCalledOnce();
    expect(navigateToProviderDetails).toHaveBeenCalledWith(candidate);
  });
});
