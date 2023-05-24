import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Socket } from 'ngx-socket-io';
import { of } from 'rxjs';
import { StockService } from '../../shared/service/stock.service';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let breakpointObserverMock: Partial<BreakpointObserver>;
  let socketMock: { connect: jest.Mock; on: jest.Mock; disconnect: jest.Mock };
  let stockServiceMock: Partial<StockService>;
  let getDataFromJsonSpy: jest.SpyInstance;

  beforeEach(async () => {
    const stockDataMock = [
      { Symbol: 'TCS', Close: 100 },
      { Symbol: 'WIPRO', Close: 200 },
      { Symbol: 'HCLTECH', Close: 300 },
    ];

    breakpointObserverMock = {
      observe: jest.fn().mockReturnValue(of({ matches: true })),
    };

    socketMock = {
      connect: jest.fn(),
      on: jest.fn(),
      disconnect: jest.fn(),
    };

    stockServiceMock = {
      getDataFromJson: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [
        NoopAnimationsModule,
        LayoutModule,
        MatButtonModule,
        MatCardModule,
        MatGridListModule,
        MatIconModule,
        MatMenuModule,
        CommonModule,
        DashboardRoutingModule,
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: BreakpointObserver, useValue: breakpointObserverMock },
        { provide: Socket, useValue: socketMock },
        { provide: StockService, useValue: stockServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    getDataFromJsonSpy = jest.spyOn(stockServiceMock, 'getDataFromJson');
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should connect the socket on initialization', () => {
    component.ngOnInit();
    expect(socketMock.connect).toHaveBeenCalled();
  });

  it('should register a callback for "stockData" event and update chartSOptions on data received', () => {
    const testData = [1, 2, 3];
    component.ngOnInit();

    const onDataCallback = socketMock.on.mock.calls[0][1];
    onDataCallback(testData);

    expect(component.sData).toEqual([testData]);
    expect(component.chartSOptions.series[0].data).toEqual(component.sData);
  });

  it('should initialize socket and update chart options correctly', () => {
    const mockData = [1, 2, 3];

    const socketConnectSpy = jest.spyOn(socketMock, 'connect');
    const initSChartSpy = jest.spyOn(component, 'initSChart');

    const socketOnSpy = jest.spyOn(socketMock, 'on').mockImplementation((eventName: string, callback: any) => {
      if (eventName === 'stockData') {
        callback(mockData);
      }
    });

    component.initSocket();

    expect(socketConnectSpy).toHaveBeenCalledTimes(2);
    expect(socketOnSpy).toHaveBeenCalledTimes(2);
    expect(socketOnSpy).toHaveBeenCalledWith('stockData', expect.any(Function));
    expect(initSChartSpy).toHaveBeenCalledTimes(1);
    expect(component.sData).toEqual([mockData]);
    expect(component.chartSOptions).toEqual({
      ...component.chartSOptions,
      series: [{ data: [mockData] }],
    });
  });

  it('should call the necessary methods to load IT stocks', () => {
    const initChartSpy = jest.spyOn(component, 'initChart');
    const stockDataMock = [
      [{ Symbol: 'TCS', Close: 3035.65 }],
      [{ Symbol: 'WIPRO', Close: 492.75 }],
      [{ Symbol: 'HCLTECH', Close: 898.95 }],
    ];

    getDataFromJsonSpy
      .mockReturnValueOnce(of(stockDataMock[0]))
      .mockReturnValueOnce(of(stockDataMock[1]))
      .mockReturnValueOnce(of(stockDataMock[2]));

    component.loadItStock();

    expect(getDataFromJsonSpy).toHaveBeenCalledTimes(7);
    expect(component.symbolLabels).toEqual(['TCS', 'WIPRO', 'HCLTECH']);
    expect(component.symbolSeries).toEqual([3035.65, 492.75, 898.95]);
    expect(initChartSpy).toHaveBeenCalled();
  });

  it('should call the necessary methods to load bank stocks', () => {
    const initLineChartSpy = jest.spyOn(component, 'initLineChart');

    const mockStockData = [
      [{
        Date: "2023-03-03",
        Symbol: "ICICIBANK",
        Close: 100,
      },
      {
        Date: "2023-04-02",
        Symbol: "ICICIBANK",
        Close: 200,
      },
      {
        Date: "2023-05-02",
        Symbol: "ICICIBANK",
        Close: 300,
      },],
      [{
        Date: "2023-03-03",
        Symbol: "AXISBANK",
        Close: 400,
      },
      {
        Date: "2023-04-02",
        Symbol: "AXISBANK",
        Close: 500,
      },
      {
        Date: "2023-05-02",
        Symbol: "AXISBANK",
        Close: 600,
      },],
      [{
        Date: "2023-03-03",
        Symbol: "HDFCBANK",
        Close: 700,
      },
      {
        Date: "2023-04-02",
        Symbol: "HDFCBANK",
        Close: 800,
      },
      {
        Date: "2023-05-02",
        Symbol: "HDFCBANK",
        Close: 900,
      },],
    ]

    getDataFromJsonSpy
      .mockReturnValueOnce(of(mockStockData[0]))
      .mockReturnValueOnce(of(mockStockData[1]))
      .mockReturnValueOnce(of(mockStockData[2]));

    component.loadBankStocks();

    expect(getDataFromJsonSpy).toHaveBeenCalledTimes(7);

    expect(component.bankDataSeries).toEqual([
      {
        name: 'ICICI Bank - close',
        data: [100, 200, 300]
      },
      {
        name: 'Axis Bank  - close',
        data: [400, 500, 600]
      },
      {
        name: 'Hdfc Bank  - close',
        data: [700, 800, 900]
      }
    ]);

    expect(initLineChartSpy).toHaveBeenCalled();
  });
});
