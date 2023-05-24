import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { StockService } from '../../shared/service/stock.service';
import { StockComponent } from './stock.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StockRoutingModule } from './stock-routing.module';
import { of } from 'rxjs';
import { seriesHistory } from '../model/serieshistory';

describe('StockComponent', () => {
  let component: StockComponent;
  let fixture: ComponentFixture<StockComponent>;
  let stockServiceMock: Partial<StockService>;

  const mockStockData = {
    bestMatches: [
      {
        '1. symbol': 'symbol1',
        '2. name': 'name1',
        '3. type': 'type1'
      },
      {
        '1. symbol': 'symbol2',
        '2. name': 'name2',
        '3. type': 'type2'
      }
    ]
  };

  beforeEach(() => {
    stockServiceMock = {
      getStockDataList: jest.fn().mockReturnValue(of(mockStockData)),
      getStockData: jest.fn().mockReturnValue(of({})),
      getSymbolInfo: jest.fn().mockReturnValue(of({})),
      getSymbolIntradayInfo: jest.fn().mockReturnValue(of({})),
      getSymbolTimeSeriesInfo: jest.fn().mockReturnValue(of({})),
    };

  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StockComponent],
      imports: [
        CommonModule,
        StockRoutingModule,
        LayoutModule,
        FormsModule,
        ReactiveFormsModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatGridListModule,
        MatCardModule,
        MatMenuModule,
        MatSelectModule,
        MatInputModule,
        HttpClientModule,
        MatAutocompleteModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: StockService, useValue: stockServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(StockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call getStockDataList with the search value (searchBoxSubscribe)', async () => {
    const searchValue = 'example';

    const searchControl = component.searchControl;
    searchControl.setValue(searchValue);

    searchControl.updateValueAndValidity();

    await new Promise((resolve) => setTimeout(resolve, 800));

    expect(stockServiceMock.getStockDataList).toHaveBeenCalledWith(searchValue);

    expect(component.stockSearchList).toEqual([
      { symbol: 'symbol1', name: 'name1', type: 'type1' },
      { symbol: 'symbol2', name: 'name2', type: 'type2' }
    ]);

    component.filteredOptions$.subscribe((options) => {
      expect(options).toEqual([
        { symbol: 'symbol1', name: 'name1', type: 'type1' },
        { symbol: 'symbol2', name: 'name2', type: 'type2' }
      ]);
    });
  });

  it('should filter stockSearchList based on type "Equity" (_filter)', () => {
    component.stockSearchList = [
      { name: 'Stock A', type: 'Equity' },
      { name: 'Stock B', type: 'Equity' },
      { name: 'Stock C', type: 'ETF' },
    ];

    const filteredList = component['_filter']('test');

    expect(filteredList).toEqual([
      { name: 'Stock A', type: 'Equity' },
      { name: 'Stock B', type: 'Equity' },
    ]);
  });

  it('should call loadStockDetailData with selected option value (onOptionSelected)', () => {
    const mockOptionValue = 'stockSymbol';

    component.loadStockDetailData = jest.fn();

    const mockEvent = {
      option: {
        value: mockOptionValue,
      },
    };

    component.onOptionSelected(mockEvent);

    expect(component.loadStockDetailData).toHaveBeenCalledWith(mockOptionValue);
  });

  it('should not call loadStockDetailData if event or option value is missing (onOptionSelected)', () => {
    component.loadStockDetailData = jest.fn();

    component.onOptionSelected(null);
    expect(component.loadStockDetailData).not.toHaveBeenCalled();

    component.onOptionSelected({});
    expect(component.loadStockDetailData).not.toHaveBeenCalled();

    component.onOptionSelected({ option: {} });
    expect(component.loadStockDetailData).not.toHaveBeenCalled();
  });

  it('should load stock detail data (loadStockDetailData)', () => {
    const symbolValue = 'ABC';
    const stockData = { 'Global Quote': { '01. symbol': 'ABC', '05. price': '100', '02. open': '95' } };
    const symbolInfo = { Name: 'ABC Company', '52WeekHigh': '110', '52WeekLow': '90' };
    const intradayInfo = { 'Time Series (1min)': {} };
    const timeSeriesInfo = { 'Time Series (Daily)': {} };

    stockServiceMock.getStockData = jest.fn().mockReturnValue(of(stockData));
    stockServiceMock.getSymbolInfo = jest.fn().mockReturnValue(of(symbolInfo));
    stockServiceMock.getSymbolIntradayInfo = jest.fn().mockReturnValue(of(intradayInfo));
    stockServiceMock.getSymbolTimeSeriesInfo = jest.fn().mockReturnValue(of(timeSeriesInfo));

    component.loadStockDetailData(symbolValue);

    expect(component.stockDetailData.symbol).toEqual(symbolValue);
    expect(component.stockDetailData.price).toEqual(100);
    expect(component.stockDetailData.open).toEqual(95);
    expect(component.stockDetailData.name).toEqual('ABC Company');
    expect(component.stockDetailData.weekshigh).toEqual(110);
    expect(component.stockDetailData.weekslow).toEqual(90);

    expect(stockServiceMock.getStockData).toHaveBeenCalledWith(symbolValue);
    expect(stockServiceMock.getSymbolInfo).toHaveBeenCalledWith(symbolValue);
    expect(stockServiceMock.getSymbolIntradayInfo).toHaveBeenCalledWith(symbolValue);
    expect(stockServiceMock.getSymbolTimeSeriesInfo).toHaveBeenCalledWith(symbolValue);


  });

  it('should set chartIntraData and call initIntraChart with converted data (filterIntraDayData)', () => {
    const mockData = [
      { date: '2023-05-01', open: '10', high: '15', low: '5', close: '12' },
      { date: '2023-05-02', open: '12', high: '18', low: '8', close: '16' },
      { date: '2023-05-03', open: '14', high: '20', low: '10', close: '18' },
    ];
    const initIntraChartSpy = jest.spyOn(component, 'initIntraChart');

    component.filterIntraDayData(mockData);

    expect(component.chartIntraData).toEqual([
      { x: new Date('2023-05-01T00:00:00.000Z'), y: [10, 15, 5, 12] },
      { x: new Date('2023-05-02T00:00:00.000Z'), y: [12, 18, 8, 16] },
      { x: new Date('2023-05-03T00:00:00.000Z'), y: [14, 20, 10, 18] },
    ]);
    expect(initIntraChartSpy).toHaveBeenCalled();
  });

  it('should call filterDataByTimeRange with the selected range (filterDataByTimeRangeEvent)', () => {
    const mockEvent = {
      target: {
        value: 'last5days',
      },
    };
    const filterDataByTimeRangeSpy = jest.spyOn(component, 'filterDataByTimeRange');

    component.filterDataByTimeRangeEvent(mockEvent as unknown as Event);

    expect(filterDataByTimeRangeSpy).toHaveBeenCalledWith('last5days');
  });

  it('should update seriesHistory and call initStockHistoryChart when range is empty (filterDataByTimeRange)', () => {
    const initStockHistoryChartSpy = jest.spyOn(component, 'initStockHistoryChart');
    component.seriesHistory = seriesHistory;

    component.filterDataByTimeRange('');

    expect(component.seriesHistory).toEqual(seriesHistory);
    expect(component.seriesHistory[0].data).toEqual([]);
    expect(component.seriesHistory[1].data).toEqual([]);
    expect(component.seriesHistory[2].data).toEqual([]);
    expect(component.seriesHistory[3].data).toEqual([]);
    expect(initStockHistoryChartSpy).toHaveBeenCalled();
  });

  it('should update history chart data when range is valid (filterDataByTimeRange)', () => {
    const mockData = [
      { date: new Date('2023-05-18T00:00:00.000Z'), open: 100, high: 150, low: 80, close: 120 },
      { date: new Date('2023-05-17T00:00:00.000Z'), open: 120, high: 160, low: 100, close: 140 },
    ];
    const expectedData = [
      { date: new Date('2023-05-18T00:00:00.000Z'), open: 100, high: 150, low: 80, close: 120 },
      { date: new Date('2023-05-17T00:00:00.000Z'), open: 120, high: 160, low: 100, close: 140 },
    ];
    const updateHistoryChartSpy = jest.spyOn(component, 'updateHistoryChart');

    component.formattedTimeData = mockData;

    component.filterDataByTimeRange('last1month');
    expect(updateHistoryChartSpy).toHaveBeenCalledWith(expectedData);
  });

  it('should update categories and seriesHistory and call initStockHistoryChart (updateHistoryChart)', () => {
    const data = [
      { date: '2023-05-01', open: 100, high: 110, low: 90, close: 105 },
      { date: '2023-05-02', open: 105, high: 115, low: 95, close: 110 },
      { date: '2023-05-03', open: 110, high: 120, low: 100, close: 115 },
    ];

    const initStockHistoryChartSpy = jest.spyOn(component, 'initStockHistoryChart');
    component.updateHistoryChart(data);

    expect(component.categories).toEqual(['2023-05-01', '2023-05-02', '2023-05-03']);

    expect(component.seriesHistory).toEqual([
      { name: 'Open', data: [100, 105, 110] },
      { name: 'High', data: [110, 115, 120] },
      { name: 'Low', data: [90, 95, 100] },
      { name: 'Close', data: [105, 110, 115] },
    ]);

    expect(initStockHistoryChartSpy).toHaveBeenCalled();
  });

  it('should initialize chartIntraOptions with correct values (initIntraChart)', () => {
    component.initIntraChart();

    expect(component.chartIntraOptions).toEqual({
      chart: {
        type: 'candlestick',
        height: 350,
      },
      xaxis: {
        type: 'datetime',
      },
      yaxis: {
        tooltip: {
          enabled: true,
        },
      },
      series: [
        {
          name: 'candle',
          data: component.chartIntraData,
        },
      ],
    });
  });

  it('should initialize chartStockOptions with correct values (initStockChart)', () => {
    component.initStockChart();

    expect(component.chartStockOptions).toEqual({
      series: [0, 0, 0],
      chart: {
        width: 380,
        type: 'donut',
      },
      labels: ['Open', '52 Weeks High', '52 Weeks Low'],
      dataLabels: {
        enabled: false,
      },
      fill: {
        type: 'gradient',
      },
      legend: {
        formatter: expect.any(Function),
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    });
  });

  it('should initialize chartStockHistoryOptions with correct values (initStockHistoryChart)', () => {
    component.initStockHistoryChart();

    expect(component.chartStockHistoryOptions).toEqual({
      series: component.seriesHistory,
      chart: {
        type: 'bar',
        stacked: true,
        height: 350,
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: true,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0,
            },
          },
        },
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        type: 'category',
        categories: component.categories,
      },
      yaxis: {
        position: 'right',
        offsetY: 40,
        title: {
          text: '$ ',
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: expect.any(Function),
        },
      },
    });
  });

});
