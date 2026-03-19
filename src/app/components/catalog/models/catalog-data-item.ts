import { AdditionalInfo } from './additional-info';
import { Badge } from './badge';
import { Label } from './label';
import { Verification } from 'models/verification';


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
