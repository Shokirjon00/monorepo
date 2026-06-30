import { ActivatedRoute, Router } from '@angular/router';
import { inject } from '@angular/core';
import { getFromLocalStorage } from "@core/utils/index";

export function restoreQueryParamsIfEmpty(
  captionKey: string,
  route?: ActivatedRoute,
  router?: Router
): void {
  const _router = router ?? inject(Router);
  const _route = route ?? inject(ActivatedRoute);

  const hasQueryParams = Object.keys(_route.snapshot.queryParams).length > 0;

  if (!hasQueryParams) {
    const savedFilters = getFromLocalStorage(captionKey);
    if (savedFilters) {
      _router.navigate([], {
        relativeTo: _route,
        queryParams: savedFilters,
        queryParamsHandling: 'merge',
        replaceUrl: true
      }).then();
    }
  }
}
