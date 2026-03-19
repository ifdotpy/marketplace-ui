import { createAction, props } from '@ngrx/store';

export const unInstallProviderInstance = createAction(
  '[Provider Instance] Uninstall provider instance' + '',
  props<{
    providerName: string;
  }>(),
);

export const uninstalledProviderInstanceSuccessfully = createAction(
  '[Provider Instance] provider instance uninstalled successfully',
  props<{ providerName: string }>(),
);
