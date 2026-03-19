import { Routes } from '@angular/router';
import { ProviderDetailDialogComponent } from 'components/provider/provider-detail-dialog/provider-detail-dialog.component';
import { ProvidersComponent } from 'components/provider/providers.component';

export const routes: Routes = [
  {
    path: 'marketplace',
    component: ProvidersComponent,
  },
  {
    path: 'provider/:providerName',
    component: ProviderDetailDialogComponent,
  },
];
