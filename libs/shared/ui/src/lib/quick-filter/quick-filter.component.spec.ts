import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuickFilterComponent } from './quick-filter.component';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SvgIconRegistryService } from "angular-svg-icon";
import { By } from '@angular/platform-browser';

const routerMock = {
  navigate: jest.fn().mockReturnValue(Promise.resolve(true))
};

const activatedRouteMock = {
  snapshot: {
    queryParams: {}
  },
  queryParams: of({})
};

const svgIconRegistryServiceMock = {
  loadSvg: jest.fn(),
  addSvg: jest.fn(),
  getSvg: jest.fn().mockReturnValue(of(null))
};

describe('QuickFilterComponent', () => {
  let component: QuickFilterComponent;
  let fixture: ComponentFixture<QuickFilterComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        QuickFilterComponent,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        DatePipe,
        {provide: Router, useValue: routerMock},
        {provide: ActivatedRoute, useValue: activatedRouteMock},
        {provide: SvgIconRegistryService, useValue: svgIconRegistryServiceMock}
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickFilterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен создаться', () => {
    expect(component).toBeTruthy();
  });

  it('должен отображать заголовок "Фильтры"', () => {
    const title = fixture.debugElement.query(By.css('.form-title')).nativeElement;
    expect(title.textContent).toContain('Фильтры');
  });

  describe('Инициализация компонента', () => {
    it('должен инициализироваться с дефолтными значениями', () => {
      expect(component.maxHeight()).toBe('340px');
      expect(component.canSearch()).toBe(true);
      expect(component.defaultFilterField).toBe('name');
    });

    it('должен устанавливать filterFields и фильтровать поля', () => {
      const fields = [
        {field: 'name', key: 'Имя', filterType: 'text', isFiltered: false},
        {field: 'date', key: 'Дата', filterType: 'date', isFiltered: true}
      ] as any;

      component.filterFields = fields;

      expect(component['_filterFields'].length).toBe(1);
      expect(component['_filterFields'][0].field).toBe('name');
    });
  });

  describe('Методы управления фильтрами', () => {
    beforeEach(() => {
      component.filterFields = [
        {field: 'name', key: 'Имя', filterType: 'text'},
        {field: 'status', key: 'Статус', filterType: 'list'}
      ] as any;

      component['filterItems'] = [];
    });

    it('должен открывать список доступных фильтров', () => {
      component.openList(0);

      expect(component.isOpen()[0]).toBe(true);
      expect(component.selectedIndex()).toBe(0);
    });

    it('должен закрывать dropdown при открытии другого', () => {
      component.isOpen.set([false, true]);
      component.dropdownOpened(1, true);

      expect(component.isOpen()[1]).toBe(false);
    });
  });

  describe('Обработка изменений фильтров', () => {
    it('должен применять текстовый фильтр по Enter', () => {
      const filterItem = {field: 'name', filterType: 'text', value: 'test'};
      const navigateSpy = jest.spyOn(router, 'navigate');

      component.applyFilterOnEnter(filterItem as any);

      expect(navigateSpy).toHaveBeenCalled();
    });

    it('должен очищать пустой фильтр по Enter', () => {
      const filterItem = {field: 'name', filterType: 'text', value: '', key: 'Имя'};
      const navigateSpy = jest.spyOn(router, 'navigate');

      component.applyFilterOnEnter(filterItem as any);

      expect(navigateSpy).toHaveBeenCalled();
    });
  });

  describe('Выбор значений из списков', () => {
    it('должен обрабатывать выбор статуса', () => {
      const field = {key: 'Active', value: 'true'};
      const navigateSpy = jest.spyOn(router, 'navigate');

      (component as any).selectListItem('isActive', field.value);

      expect(navigateSpy).toHaveBeenCalled();
    });

    it('должен обрабатывать выбор типа статуса', () => {
      const field = {selected: {key: 'Test', id: '123'}, filterKey: 'status'};
      const navigateSpy = jest.spyOn(router, 'navigate');

      (component as any).selectStatusType(field.selected);

      expect(navigateSpy).toHaveBeenCalled();
    });

    it('должен обрабатывать поиск в dropdown', () => {
      const field = {key: 'Test', id: '123'};
      const navigateSpy = jest.spyOn(router, 'navigate');

      (component as any).searchDropdown(field, 'status', 'Статус');

      expect(navigateSpy).toHaveBeenCalled();
    });

    it('должен обрабатывать выбор статуса заявки на возврат', () => {
      const field = {key: 'Pending', value: '1'};
      const navigateSpy = jest.spyOn(router, 'navigate');

      (component as any).selectListItem('statusId', field.value);

      expect(navigateSpy).toHaveBeenCalled();
    });

    it('должен обрабатывать выбор типа отправки', () => {
      const field = {key: 'Email', value: 'email'};
      const navigateSpy = jest.spyOn(router, 'navigate');

      (component as any).selectListItem('sendType', field.value);

      expect(navigateSpy).toHaveBeenCalled();
    });

    it('должен обрабатывать выбор типа возврата', () => {
      const field = {key: 'Full', value: 'full'};
      const navigateSpy = jest.spyOn(router, 'navigate');

      (component as any).selectListItem('canRefundName', field.value);

      expect(navigateSpy).toHaveBeenCalled();
    });

    it('должен обрабатывать выбор типа действия', () => {
      const field = {key: 'Create', value: 'create'};
      const navigateSpy = jest.spyOn(router, 'navigate');

      (component as any).selectListItem('type', field.value);

      expect(navigateSpy).toHaveBeenCalled();
    });
  });

  describe('Замена фильтра', () => {
    it('должен заменять фильтр на новый', () => {
      const oldItem = {field: 'name', filterType: 'text', value: 'test', key: 'Имя'};
      const newItem = {field: 'date', filterType: 'date', key: 'Дата'};

      // Инициализируем через публичный setter
      component.filterFields = [
        {field: 'name', key: 'Имя', filterType: 'text', isFiltered: false},
        {field: 'date', key: 'Дата', filterType: 'date', isFiltered: false},
        {field: 'status', key: 'Статус', filterType: 'list', isFiltered: false}
      ] as any;

      component.selectedChanged(newItem as any, oldItem as any, 0);

      expect(router.navigate).toHaveBeenCalled();
    });
  });
});
