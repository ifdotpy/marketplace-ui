import { initAction } from './init.action';
import { luigiContextUpdate } from './luigi-context-update.action';
import { Injectable, inject } from '@angular/core';
import { Actions, OnInitEffects, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { NodeContext } from 'models/node-context';
import { filter, map, mergeMap } from 'rxjs/operators';
import { PmLuigiContextService } from 'services/luigi';

@Injectable({
  providedIn: 'root',
})
export class LuigiContextEffect implements OnInitEffects {
  registerForLuigiContextChanges$ = createEffect(
    (
      actions$ = inject(Actions),
      luigiContextService = inject(PmLuigiContextService),
    ) =>
      actions$.pipe(
        ofType(initAction),
        mergeMap(() =>
          luigiContextService.contextObservable().pipe(
            filter((contextMessage) => !!contextMessage.context.token),
            map((contextMessage) => {
              return luigiContextUpdate({
                luigiContext: contextMessage.context as NodeContext,
              });
            }),
          ),
        ),
      ),
  );

  ngrxOnInitEffects(): Action {
    return initAction();
  }
}
