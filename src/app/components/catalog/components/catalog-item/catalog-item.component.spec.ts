import { CatalogDataItem } from '../../models';
import { CatalogItemComponent } from './catalog-item.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mock } from 'vitest-mock-extended';

const buildItem = (overrides: Partial<CatalogDataItem> = {}): CatalogDataItem => ({
  title: 'Test Provider',
  description: 'A test provider description',
  badge: { text: 'INSTALLED', color: 'var(--sapPositiveColor)' },
  labels: [{ color: '1', title: 'Beta' }],
  additionalInfo: [{ label: 'Category', value: 'AI' }],
  verification: { type: 'community' },
  image: 'https://example.com/icon.png',
  ...overrides,
});

describe('CatalogItemComponent', () => {
  let component: CatalogItemComponent;
  let fixture: ComponentFixture<CatalogItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('data', buildItem());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('showProviderVerification', () => {
    it('should return true when verification is defined', () => {
      fixture.componentRef.setInput('data', buildItem({ verification: { type: 'community' } }));
      fixture.detectChanges();
      expect(component.showProviderVerification()).toBe(true);
    });

    it('should return true when verification is null', () => {
      fixture.componentRef.setInput('data', buildItem({ verification: null as any }));
      fixture.detectChanges();
      // null !== undefined, so verification is "defined"
      expect(component.showProviderVerification()).toBe(true);
    });

    it('should return false when verification is undefined', () => {
      fixture.componentRef.setInput('data', buildItem({ verification: undefined }));
      fixture.detectChanges();
      expect(component.showProviderVerification()).toBe(false);
    });
  });

  describe('generateId', () => {
    it('should return MD5 hash of image when image is set', () => {
      fixture.componentRef.setInput('data', buildItem({ image: 'https://example.com/icon.png', glyph: undefined }));
      fixture.detectChanges();
      const id = component.generateId();
      expect(id).toBeTruthy();
      expect(id).toMatch(/^[0-9a-f]{32}$/);
    });

    it('should return glyph when no image is set but glyph is set', () => {
      fixture.componentRef.setInput('data', buildItem({ image: undefined, glyph: 'sap-icon://accept' }));
      fixture.detectChanges();
      expect(component.generateId()).toBe('sap-icon://accept');
    });

    it('should return "no-icon" when neither image nor glyph is set', () => {
      fixture.componentRef.setInput('data', buildItem({ image: undefined, glyph: undefined }));
      fixture.detectChanges();
      expect(component.generateId()).toBe('no-icon');
    });
  });

  describe('ensureBadge', () => {
    it('should set badge backgroundColor and tabIndex when badge and DOM element exist', () => {
      const badgeColor = '#ff0000';
      const data = buildItem({ badge: { text: 'INSTALLED', color: badgeColor } });
      fixture.componentRef.setInput('data', data);
      fixture.detectChanges();

      const badge = mock<HTMLElement>();
      badge.style = { backgroundColor: '' } as any;
      badge.tabIndex = 0;
      component['elementRef'].nativeElement.querySelector = vi
        .fn()
        .mockReturnValue(badge);

      component['ensureBadge']();

      expect(component['elementRef'].nativeElement.querySelector).toHaveBeenCalledWith('.fd-badge');
      expect(badge.style.backgroundColor).toEqual(badgeColor);
      expect(badge.tabIndex).toEqual(-1);
    });

    it('should not throw when badge is not defined', () => {
      fixture.componentRef.setInput('data', buildItem({ badge: undefined }));
      fixture.detectChanges();

      expect(() => component['ensureBadge']()).not.toThrow();
    });
  });
});
