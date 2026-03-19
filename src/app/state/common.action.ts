import { LuigiGoBackAction } from '../models/luigi-go-back';
import { HttpErrorResponse } from '@angular/common/http';
import { createAction, props } from '@ngrx/store';

export const requestFailed = createAction(
  '[Errors] request failed',
  props<{
    goBack: boolean;
    dialogTitle: string;
    error: HttpErrorResponse;
  }>(),
);

export const goBackAction = createAction(
  '[Luigi Navigation] Go back to previous page',
  props<{
    action: LuigiGoBackAction;
  }>(),
);

export const showConfirmation = createAction(
  '[Account Resources] Show confirmation',
  props<{
    message: string;
  }>(),
);
