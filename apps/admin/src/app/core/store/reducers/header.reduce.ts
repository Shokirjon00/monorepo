/*
import {createReducer, on} from '@ngrx/store';
import {createEntityAdapter, EntityAdapter} from '@ngrx/entity';
import {IHeaderModel} from '@core/store/models/header.model.interface';
import {HeaderAction} from '@core/store/actions/header.action';

export const adapter: EntityAdapter<IHeaderModel> = createEntityAdapter<IHeaderModel>();

export const initialState = adapter.getInitialState();

export const headerReducer = createReducer(
  initialState,
  on(HeaderAction.setCompanyId, (state, {id}) => ({
    ...state,
    companyId: id,
  })),
  on(HeaderAction.cleanCompanyId, (state) => ({
    ...state,
    companyId: null,
  })),
  on(HeaderAction.setMerchantId, (state, {id}) => ({
    ...state,
    merchantId: id,
  })),
  on(HeaderAction.cleanMerchantId, (state) => ({
    ...state,
    merchantId: null,
  })),
  on(HeaderAction.setPosId, (state, {id}) => ({
    ...state,
    posId: id,
  })),
  on(HeaderAction.cleanPosId, (state) => ({
    ...state,
    posId: null,
  }))
)
*/
