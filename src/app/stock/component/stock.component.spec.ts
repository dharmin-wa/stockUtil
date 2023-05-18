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
// import { NgApexchartsModule } from 'ng-apexcharts';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StockRoutingModule } from './stock-routing.module';
import { of } from 'rxjs';

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
        // NgApexchartsModule,
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getStockDataList with the search value', async () => {
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

  it('should load stock detail data', () => {
    // Mock the response data for each API call
    const stockData = { 'Global Quote': { '01. symbol': 'ABC', '05. price': '100', '02. open': '95' } };
    const symbolInfo = { Name: 'ABC Company', '52WeekHigh': '110', '52WeekLow': '90' };
    const intradayInfo = { 'Time Series (1min)': {} };
    const timeSeriesInfo = { 'Time Series (Daily)': {} };

    // Set up the mock return values for each API call
    stockServiceMock.getStockData = jest.fn().mockReturnValue(of(stockData));
    stockServiceMock.getSymbolInfo = jest.fn().mockReturnValue(of(symbolInfo));
    stockServiceMock.getSymbolIntradayInfo = jest.fn().mockReturnValue(of(intradayInfo));
    stockServiceMock.getSymbolTimeSeriesInfo = jest.fn().mockReturnValue(of(timeSeriesInfo));

    // Call the method
    component.loadStockDetailData('ABC');

    // Verify that the stockDetailData is updated with the expected values
    expect(component.stockDetailData.symbol).toEqual('ABC');
    expect(component.stockDetailData.price).toEqual(100);
    expect(component.stockDetailData.open).toEqual(95);
    expect(component.stockDetailData.name).toEqual('ABC Company');
    expect(component.stockDetailData.weekshigh).toEqual(110);
    expect(component.stockDetailData.weekslow).toEqual(90);

    // Verify that the necessary methods were called with the expected arguments
    expect(stockServiceMock.getStockData).toHaveBeenCalledWith('ABC');
    expect(stockServiceMock.getSymbolInfo).toHaveBeenCalledWith('ABC');
    expect(stockServiceMock.getSymbolIntradayInfo).toHaveBeenCalledWith('ABC');
    expect(stockServiceMock.getSymbolTimeSeriesInfo).toHaveBeenCalledWith('ABC');

    // Verify any additional expectations based on the behavior of the method
    // ...
  });

});
