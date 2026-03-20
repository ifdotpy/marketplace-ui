import { AdditionalInfo } from './additional-info';
import { Badge } from './badge';
import { Label } from './provider-metadata';
import { Verification } from './verification';


export interface CatalogDataItem {
  title?: string;
  description?: string;
  badge?: Badge;
  category?: string;
  provider?: string;
  image?: string;
  glyph?: string;
  additionalInfo?: AdditionalInfo[];
  labels?: Label[];
  verification?: Verification;
  testId?: string;
}
