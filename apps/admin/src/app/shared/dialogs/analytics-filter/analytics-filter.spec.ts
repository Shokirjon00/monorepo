import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticsFilterComponent } from './analytics-filter.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { SvgIconComponent, SvgIconRegistryService } from 'angular-svg-icon';
import { HttpClientTestingModule } from "@angular/common/http/testing";

const svgIconRegistryServiceMock = {
  loadSvg: jest.fn(),
  addSvg: jest.fn(),
  getSvg: jest.fn().mockReturnValue(of(null))
};

const routerMock = {
  navigate: jest.fn().mockReturnValue(Promise.resolve(true))
};

const activatedRouteMock = {
  snapshot: {
    queryParams: {}
  },
  queryParams: of({})
};

describe('AnalyticsFilterComponent', () => {
  let component: AnalyticsFilterComponent;
  let fixture: ComponentFixture<AnalyticsFilterComponent>;
  let matDialogRefMock: any;
  let matDialogMock: any;


  beforeEach(async () => {
    matDialogRefMock = {close: jest.fn()};
    matDialogMock = {
      open: jest.fn(() => ({
        afterClosed: () => of({
          start: {format: jest.fn(() => '01.01.2025')},
          end: {format: jest.fn(() => '31.01.2025')}
        })
      }))
    };

    await TestBed.configureTestingModule({
      imports: [AnalyticsFilterComponent, DropdownComponent, SvgIconComponent, HttpClientTestingModule],
      providers: [
        DatePipe,
        {provide: MatDialogRef, useValue: matDialogRefMock},
        {provide: MatDialog, useValue: matDialogMock},
        {provide: Router, useValue: routerMock},
        {provide: ActivatedRoute, useValue: activatedRouteMock},
        {provide: SvgIconRegistryService, useValue: svgIconRegistryServiceMock},
        {
          provide: MAT_DIALOG_DATA, useValue: {
            queryParams: {},
            dataFilterApi: [],
            merchantApi: [],
            posesTypeApi: [],
            posesApi: [],
            dateFlag: false,
            dateType: {name: 'Сегодня', icon: 'day.svg'},
            selectedMerchant: {name: 'Все торговые точки', icon: 'checkmark-double.svg'},
            selectedPos: {name: 'Все кассы', icon: 'checkmark-double.svg'},
            selectedPosType: {name: 'Тип кассы', icon: 'checkmark-double.svg'}
          }
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should open select period dialog on dateChange with PERIOD_ID', () => {
    component.dateChange('faea99d1-30a5-45c8-b00e-ed797b74e420');
    expect(matDialogMock.open).toHaveBeenCalled();
  });

  it('should clear period correctly', () => {
    component.queryParams.startDate = '2025-10-01';
    component.queryParams.endDate = '2025-10-15';
    component.clearPeriod();
    expect(component.queryParams.startDate).toBeUndefined();
    expect(component.queryParams.endDate).toBeUndefined();
    expect(component.dateType.name).toBe('Сегодня');
  });

  it('should change merchant correctly', () => {
    component.merchantChange('123');
    expect(component.queryParams.merchantId).toBe('123');
    expect(component.posFilter.merchantId).toBe('123');
  });

  it('should clear company correctly', () => {
    component.clearCompany();
    expect(component.queryParams.companyId).toBe('');
    expect(component.selectedCompany.name).toBe('Все организации');
  });


  it('should clear merchant correctly', () => {
    component.clearMerchant();
    expect(component.queryParams.merchantId).toBeUndefined();
    expect(component.selectedMerchant.name).toBe('Все торговые точки');
  });

  it('should change poses correctly', () => {
    component.posesChange('pos123');
    expect(component.queryParams.posId).toBe('pos123');
    expect(component.posTypeFilter).toBe('id==pos123');
  });

  it('should reset filter correctly', () => {
    component.queryParams = {merchantId: '123', posId: '456', posTypeId: '789'};
    component.resetFilter();
    expect(component.queryParams.merchantId).toBeUndefined();
    expect(component.dateType.name).toBe('Сегодня');
    expect(matDialogRefMock.close).toHaveBeenCalled();
  });

  it('should apply filter correctly', () => {
    component.queryParams = {merchantId: '123'};
    component.applyFilter();
    expect(matDialogRefMock.close).toHaveBeenCalledWith({merchantId: '123'});
  });

  it('should render dropdowns', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll('em-dropdown').length).toBe(4);
  });

  it('should call resetFilter on button click', () => {
    const compiled = fixture.nativeElement;
    const btn = compiled.querySelector('.btn-secondary');
    btn.click();
    expect(component.dateType.name).toBe('Сегодня');
  });

  it('should call applyFilter on button click', () => {
    const compiled = fixture.nativeElement;
    const btn = compiled.querySelector('.btn-primary');
    component.queryParams = {merchantId: '123'};
    btn.click();
    expect(matDialogRefMock.close).toHaveBeenCalledWith({merchantId: '123'});
  });
});
