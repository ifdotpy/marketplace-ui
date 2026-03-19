import { CatalogDataItem, InfoLabelFilter } from '../../models';
import { ProvidersUtils } from '../../services/providers.utils';
import {
  getFilteredDataByInfoLabels,
  getFilteredDataBySearchTerm,
  getSortedDataByInstallStatus,
  getSortedDataByTitle,
  getSuggestions,
} from './core-catalog.component.service';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FormLabelComponent } from '@fundamental-ngx/core/form';
import {
  LayoutPanelBodyComponent,
  LayoutPanelComponent,
  LayoutPanelDescriptionComponent,
  LayoutPanelFooterComponent,
  LayoutPanelHeadComponent,
  LayoutPanelHeaderComponent,
  LayoutPanelTitleDirective,
} from '@fundamental-ngx/core/layout-panel';
import {
  FdpSelectionChangeEvent,
  FormGroupComponent,
  MultiComboboxSelectionChangeEvent,
  SuggestionItem,
} from '@fundamental-ngx/platform';
import {
  FormFieldComponent,
  MultiComboboxComponent,
  SelectComponent,
} from '@fundamental-ngx/platform/form';
import { SearchFieldComponent } from '@fundamental-ngx/platform/search-field';
import { CatalogItemComponent } from 'components/catalog';
import { EmptyCatalogComponent } from 'components/catalog';
import { CategoriesUtils } from 'components/catalog';

export interface CardFilter {
  category?: string;
  providers: Filter[];
}

interface Filter {
  label: string;
  id: string;
}

@Component({
  selector: 'app-core-catalog',
  imports: [
    LayoutPanelComponent,
    LayoutPanelHeaderComponent,
    LayoutPanelHeadComponent,
    LayoutPanelTitleDirective,
    LayoutPanelDescriptionComponent,
    LayoutPanelBodyComponent,
    FormLabelComponent,
    MultiComboboxComponent,
    SearchFieldComponent,
    LayoutPanelFooterComponent,
    CatalogItemComponent,
    EmptyCatalogComponent,
    FormFieldComponent,
    FormGroupComponent,
    SelectComponent,
  ],
  templateUrl: './core-catalog.component.html',
  styleUrl: './core-catalog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoreCatalogComponent implements OnInit, OnChanges {
  readonly title = input('Catalog', {
    transform: (value: undefined | string) => value ?? 'Catalog',
  });

  /**
   * Subtitle text displayed below the catalog title.
   */
  @Input() subtitle?: string;

  /**
   * List of catalog items to display.
   */
  @Input() data: CatalogDataItem[] = [];

  /**
   * Placeholder text for the search input field.
   */
  @Input() searchPlaceholder = 'Search';

  /**
   * Disables the search input field when set to `true`.
   */
  @Input() disableSearch = false;

  /**
   * Initial search filter value.
   */
  @Input() initialFilter = '';

  /**
   * Determines whether the category and provider filters should be displayed.
   */
  @Input() filterHeader = false;

  /**
   * Title displayed when no search results are found.
   */
  @Input() noItemsFoundTitle = 'No results found';

  /**
   * Enables suggestions when typing in the search input.
   */
  @Input() enableSuggestions = false;

  /**
   * If `true`, sorts the catalog items alphabetically.
   * Otherwise, items are sorted by installation status.
   */
  @Input() sortAlphabetically = false;

  /**
   * Filters catalog items based on the provided info label filters.
   */
  @Input() infoLabelFilters?: InfoLabelFilter[];

  /**
   * Emits when an item in the catalog is clicked.
   * The event payload is the clicked item.
   */
  @Output() readonly itemClicked = new EventEmitter<CatalogDataItem>();

  /**
   * Emits when the search input value changes.
   * The event payload is the updated search term.
   */
  @Output() readonly inputChanged = new EventEmitter<string>();

  constructor(private route: ActivatedRoute) {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((queryParams: ParamMap) => {
        this.infoLabelFilters = this.buildInfoLabelFilters(queryParams);
      });
  }

  buildInfoLabelFilters(queryParams?: ParamMap): InfoLabelFilter[] | undefined {
    if (!queryParams?.keys.length) {
      return undefined;
    }

    return queryParams.keys.map((label) => {
      const stringValues = decodeURIComponent(queryParams.get(label) || '');
      return {
        label,
        values: stringValues.split(',').map((v) => v.trim()),
      };
    });
  }

  filteredData: CatalogDataItem[] = [];
  categories: string[] = [];
  providers: Filter[] = [];
  searchTerm = '';
  suggestions: SuggestionItem[] = new Array<SuggestionItem>();
  filter: CardFilter = { category: 'All', providers: [] };

  ngOnChanges(changes: SimpleChanges) {
    const infoLabelChange = changes['infoLabelFilters'];
    const dataChange = changes['data'];
    if (
      infoLabelChange ||
      (dataChange && dataChange.previousValue !== dataChange.currentValue)
    ) {
      this.filterData();
    }
  }

  ngOnInit() {
    this.searchTerm = this.initialFilter;
    this.filterData();
    if (this.enableSuggestions) {
      this.createSuggestions();
    }
    if (this.filterHeader) {
      this.categories = CategoriesUtils.getCategories(this.data);
      this.providers = ProvidersUtils.getProviders();
    }
  }

  private filterData() {
    let filteredData: CatalogDataItem[] = [...this.data];
    if (this.sortAlphabetically) {
      filteredData = getSortedDataByTitle(filteredData);
    } else {
      filteredData = getSortedDataByInstallStatus(filteredData);
    }

    if (this.infoLabelFilters?.length) {
      filteredData = getFilteredDataByInfoLabels(
        filteredData,
        this.infoLabelFilters,
      );
    }

    this.filteredData = getFilteredDataBySearchTerm(
      filteredData,
      this.searchTerm,
    );

    this.filterCards();
  }

  itemClickedHandler(item: CatalogDataItem) {
    this.itemClicked.emit(item);
  }

  createSuggestions(): void {
    this.suggestions = getSuggestions(this.filteredData);
  }

  onInputChange(searchTerm = '') {
    this.searchTerm = searchTerm;

    this.inputChanged.emit(this.searchTerm);
    this.filterData();
  }

  filterCards(): void {
    this.filteredData = this.filteredData.filter(
      (el) =>
        CategoriesUtils.filterByCategory(this.filter, el) &&
        ProvidersUtils.filterByProviders(this.filter, el),
    );
  }

  setCategoryFilter($event: FdpSelectionChangeEvent) {
    this.filter.category = $event.payload as string;
    this.filterData();
  }

  setProvidersFilter(item: MultiComboboxSelectionChangeEvent) {
    this.filter.providers = item.selectedItems;
    this.filterData();
  }
}
