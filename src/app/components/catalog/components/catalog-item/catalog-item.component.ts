import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
} from '@angular/core';
import {
  CardComponent,
  CardContentComponent,
  CardHeaderComponent,
  CardMainHeaderComponent,
  CardTitleDirective,
} from '@fundamental-ngx/core';
import { AvatarComponent } from '@fundamental-ngx/core/avatar';
import { FormLabelComponent } from '@fundamental-ngx/core/form';
import { InfoLabelComponent } from '@fundamental-ngx/core/info-label';
import { TextComponent } from '@fundamental-ngx/core/text';
import { CatalogDataItem } from 'components/catalog';
import { VerificationInfoComponent } from 'components/verification-info/verification-info.component';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-catalog-item[data]',
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardMainHeaderComponent,
    InfoLabelComponent,
    AvatarComponent,
    CardTitleDirective,
    VerificationInfoComponent,
    CardContentComponent,
    FormLabelComponent,
    TextComponent,
  ],
  templateUrl: './catalog-item.component.html',
  styleUrl: './catalog-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogItemComponent implements OnChanges, AfterViewInit {
  /**
   * Catalog data item to be displayed in the card
   */
  @Input()
  data!: CatalogDataItem;

  /**
   * If the extension's verification is null, it indicates that the Community provides it, making it visible.
   * If the verification is undefined, typically found in the templates catalog, the information remains hidden.
   */
  showProviderVerification = (): boolean =>
    this.data?.verification !== undefined;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnChanges(): void {
    this.ensureBadge();
  }

  ngAfterViewInit(): void {
    this.ensureBadge();
  }

  private ensureBadge() {
    if (!this.data.badge) {
      return;
    }
    const badge =
      this.elementRef.nativeElement.querySelector<HTMLElement>('.fd-badge');
    if (!badge) {
      return;
    }

    badge.style.backgroundColor = this.data.badge.color;
    badge.tabIndex = -1;
  }

  generateId(): string {
    if (this.data.image) {
      return Md5.hashStr(this.data.image);
    }
    if (this.data.glyph) {
      return this.data.glyph;
    }
    return 'no-icon';
  }
}
