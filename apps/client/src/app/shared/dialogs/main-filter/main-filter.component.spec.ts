import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { MainFilterComponent } from './main-filter.component';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SvgIconRegistryService } from "angular-svg-icon";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";

describe('MainFilterComponent', () => {
  let component: MainFilterComponent;
  let fixture: ComponentFixture<MainFilterComponent>;
  let fb: FormBuilder;

  const mockRouter = {
    navigate: jest.fn().mockResolvedValue(true),
  };

  const mockRoute = {
    queryParams: of({}),
  };

  const mockDialogRef = {
    close: jest.fn(),
  };

  const svgIconRegistryServiceMock = {
    loadSvg: jest.fn(),
    addSvg: jest.fn(),
    getSvg: jest.fn().mockReturnValue(of(null))
  };

  const mockBottomSheet = {
    open: jest.fn().mockReturnValue({
      afterDismissed: () => of(null),
    }),
  };

  const mockDialog = {
    open: jest.fn().mockReturnValue({
      afterClosed: () => of(null),
    }),
  };

  const mockDialogData = {
    componentKey: 'test-component',
    captions: [
      {
        key: 'Имя',
        field: 'name',
        filterType: 'text',
        isFiltered: false,
        value: '',
        endDate: '',
        type: 'string'
      },
      {
        key: 'Дата создания',
        field: 'createdAt',
        filterType: 'date',
        isFiltered: false,
        value: '',
        endDate: '',
        type: 'string'
      }
    ],
    isCustomFilter: false,
    dateType: {name: 'Сегодня', icon: 'day.svg', id: 'today'},
    selectedMerchant: [{name: 'Все торговые точки', icon: 'checkmark-double.svg'}],
    selectedPos: {name: 'Все кассы', icon: 'checkmark-double.svg'},
    selectedPosType: {name: 'Тип кассы', icon: 'checkmark-double.svg'}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainFilterComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        {provide: Router, useValue: mockRouter},
        {provide: ActivatedRoute, useValue: mockRoute},
        {provide: MatDialogRef, useValue: mockDialogRef},
        {provide: MatDialog, useValue: mockDialog},
        {provide: MatBottomSheet, useValue: mockBottomSheet},
        {provide: MAT_DIALOG_DATA, useValue: mockDialogData},
        {provide: SvgIconRegistryService, useValue: svgIconRegistryServiceMock}
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MainFilterComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);

    fixture.detectChanges();
  });

  function createFilterGroup(): FormGroup {
    return fb.group({
      key: 'key1',
      value: 'test',
      endDate: '',
      field: 'name',
      type: 'string',
      filterType: 'text',
    });
  }

  // === ТЕСТЫ ===

  it('должен добавить фильтр', () => {
    component.filtersFormArray.clear();
    component.filterItems = [];
    const caption = {key: 'Имя', field: 'name', filterType: 'text'} as any;
    component.setFilter(caption);
    expect(component.filtersFormArray.at(0)?.value.key).toBe('Имя');
  });

  it('должен удалить фильтр', () => {
    component.filtersFormArray.clear();
    component.filterItems = [];

    component.filtersFormArray.push(createFilterGroup());
    component.filterItems.push({key: 'name', value: 'abc', type: 'text'});

    expect(component.filtersFormArray.length).toBe(1); // Проверяем что фильтр добавился
    expect(component.filterItems.length).toBe(1);

    component.removeFilter(0);

    expect(component.filtersFormArray.length).toBe(0);
    expect(component.filterItems.length).toBe(0);
  });

  it('должен выбрать статус и записать в params', () => {
    component.selectStatus({key: 'Active', value: 'true'});
    expect(component.params['isActive']).toBe('true');
    component.selectStatus(null);
    expect(component.params['isActive']).toBeUndefined();
  });

  it('должен выбрать тип отправки и записать в params', () => {
    component.selectSendType({key: 'Email', value: 'email'});
    expect(component.params['sendType']).toBe('email');
    component.selectSendType(null);
    expect(component.params['sendType']).toBeUndefined();
  });

  it('должен выбрать статус возврата и записать в params', () => {
    component.selectRefundApplicationStatus({key: 'Pending', value: 'pending'});
    expect(component.params['statusId']).toBe('pending');
    component.selectRefundApplicationStatus(null);
    expect(component.params['statusId']).toBeUndefined();
  });

  it('должен выбрать тип статуса и записать в params', () => {
    component.selectStatusType({key: 'Active', value: 'active'});
    expect(component.params['type']).toBe('active');
    component.selectStatusType(null);
    expect(component.params['type']).toBeUndefined();
  });

  it('должен сбросить фильтры', () => {
    const spy = jest.spyOn(component as any, 'reloadPage').mockImplementation(() => {
    });
    component.isCustomFilter = true;
    component.resetFilter();
    expect(component.params).toEqual({});
    expect(spy).toHaveBeenCalled();
  });

  it('должен установить значения по умолчанию', () => {
    component.setDefault();
    expect(component.dateType.name).toBe('Сегодня');
    expect(component.selectedMerchant[0].name).toBe('Все торговые точки');
    expect(component.selectedPos.name).toBe('Все кассы');
    expect(component.selectedPosType.name).toBe('Тип кассы');
  });

  it('должен очистить выбранный период', () => {
    component.params = {startDate: '2024-10-01', endDate: '2024-10-02'};
    component.clearPeriod();
    expect(component.dateType.name).toBe('Сегодня');
  });

  it('должен изменить торговую точку', () => {
    component.merchantChange(['m1']);
    expect(component.params.merchantId).toEqual(['m1']);
  });

  it('должен очистить торговую точку', () => {
    component.clearMerchant();
    expect(component.params.merchantId).toBe('');
    expect(component.params.posId).toBe('');
  });

  it('должен изменить кассу', () => {
    component.posesChange(['p1']);
    expect(component.params.posId).toEqual(['p1']);
  });

  it('должен очистить кассу', () => {
    component.clearPos();
    expect(component.params.posId).toBe('');
  });

  it('должен изменить тип кассы', () => {
    component.posesTypeChange(['type1']);
    expect(component.params.posTypeId).toEqual(['type1']);
  });

  it('должен очистить тип кассы', () => {
    component.clearPosType();
    expect(component.params.posTypeId).toBe('');
  });

  it('должен применить фильтр', () => {
    const closeSpy = jest.spyOn(component['modalRef'], 'close');
    const reloadSpy = jest.spyOn(component as any, 'reloadPage').mockImplementation(() => {
    });

    component.applyFilter();

    expect(closeSpy).toHaveBeenCalledWith(true);
    expect(reloadSpy).toHaveBeenCalled();
  });


  it('должен возвращать filtersFormArray', () => {
    expect(component.filtersFormArray).toBeTruthy();
  });

  it('должен создавать группу фильтров', () => {
    const group = component.createFilterGroup();
    expect(group.contains('key')).toBe(true);
    expect(group.contains('value')).toBe(true);
    expect(group.contains('field')).toBe(true);
  });
});
