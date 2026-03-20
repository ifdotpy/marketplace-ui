import { CatalogComponent } from './catalog.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, convertToParamMap } from '@angular/router';
import { CatalogDataItem } from 'models/index';
import { of } from 'rxjs';
import { mock } from 'vitest-mock-extended';

describe('CoreCatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({})),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('buildInfoLabelFilters', () => {
    it('should return undefined when queryParams is undefined', () => {
      expect(component.buildInfoLabelFilters(undefined)).toBeUndefined();
    });

    it('should return undefined when queryParams has no keys', () => {
      const emptyParamMap: ParamMap = {
        keys: [],
        get: () => null,
        has: () => false,
        getAll: () => [],
      };
      expect(component.buildInfoLabelFilters(emptyParamMap)).toBeUndefined();
    });

    it('should build a single info label filter from a param with one value', () => {
      const paramMap = convertToParamMap({ provider: 'hyperspace' });
      const result = component.buildInfoLabelFilters(paramMap);
      expect(result).toEqual([{ label: 'provider', values: ['hyperspace'] }]);
    });

    it('should build info label filters splitting by comma', () => {
      const paramMap = convertToParamMap({
        provider: 'hyperspace%2Cdxp',
      });
      const result = component.buildInfoLabelFilters(paramMap);
      expect(result).toEqual([
        { label: 'provider', values: ['hyperspace', 'dxp'] },
      ]);
    });

    it('should build multiple info label filters from multiple params', () => {
      const paramMap = convertToParamMap({
        provider: 'hyperspace%2Cdxp',
        category: 'Software',
      });
      const result = component.buildInfoLabelFilters(paramMap);
      expect(result).toEqual([
        { label: 'provider', values: ['hyperspace', 'dxp'] },
        { label: 'category', values: ['Software'] },
      ]);
    });
  });

  describe('ngOnInit', () => {
    it('should apply initialFilter to searchTerm', () => {
      component.initialFilter = 'mySearch';
      component.ngOnInit();
      expect(component.searchTerm).toBe('mySearch');
    });

    it('should populate suggestions when enableSuggestions is true', () => {
      component.data = [
        { title: 'Item 1', description: 'Description 1' },
        { title: 'Item 2', description: 'Description 2' },
      ];
      component.enableSuggestions = true;
      component.ngOnInit();
      expect(component.suggestions).toEqual([
        { value: 'Item 1' },
        { value: 'Item 2' },
      ]);
    });

    it('should not populate suggestions when enableSuggestions is false', () => {
      component.data = [{ title: 'Item 1' }];
      component.enableSuggestions = false;
      component.ngOnInit();
      expect(component.suggestions).toEqual([]);
    });

    it('should populate categories and providers when filterHeader is true', () => {
      component.data = [];
      component.filterHeader = true;
      component.ngOnInit();
      expect(component.categories).toContain('All');
      expect(Array.isArray(component.providers)).toBe(true);
    });
  });

  describe('ngOnChanges', () => {
    it('should re-filter data when infoLabelFilters changes', () => {
      component.data = [
        {
          title: 'interesting title',
          additionalInfo: [{ label: 'content', value: 'interesting' }],
        },
        {
          title: 'Boring title',
          additionalInfo: [{ label: 'content', value: 'boring' }],
        },
      ];
      component.ngOnInit();
      const beforeCount = component.filteredData.length;

      component.infoLabelFilters = [
        { label: 'content', values: ['interesting'] },
      ];
      component.ngOnChanges({
        infoLabelFilters: {
          previousValue: undefined,
          currentValue: component.infoLabelFilters,
          firstChange: true,
          isFirstChange: () => true,
        },
      });

      expect(beforeCount).toBe(2);
      expect(component.filteredData.length).toBe(1);
      expect(component.filteredData[0].title).toBe('interesting title');
    });

    it('should re-filter when data changes', () => {
      component.data = [];
      component.ngOnInit();

      const newData: CatalogDataItem[] = [
        { title: 'Alpha' },
        { title: 'Beta' },
      ];
      component.data = newData;
      component.ngOnChanges({
        data: {
          previousValue: [],
          currentValue: newData,
          firstChange: false,
          isFirstChange: () => false,
        },
      });

      expect(component.filteredData.length).toBe(2);
    });
  });

  describe('onInputChange', () => {
    it('should update searchTerm and emit inputChanged', () => {
      vi.spyOn(component.inputChanged, 'emit');
      component.onInputChange('hello');
      expect(component.searchTerm).toBe('hello');
      expect(component.inputChanged.emit).toHaveBeenCalledWith('hello');
    });

    it('should default to empty string when no argument provided', () => {
      vi.spyOn(component.inputChanged, 'emit');
      component.onInputChange();
      expect(component.searchTerm).toBe('');
      expect(component.inputChanged.emit).toHaveBeenCalledWith('');
    });
  });

  describe('itemClickedHandler', () => {
    it('should emit itemClicked with the item', () => {
      const item = mock<CatalogDataItem>();
      vi.spyOn(component.itemClicked, 'emit');
      component.itemClickedHandler(item);
      expect(component.itemClicked.emit).toHaveBeenCalledWith(item);
    });
  });
});
