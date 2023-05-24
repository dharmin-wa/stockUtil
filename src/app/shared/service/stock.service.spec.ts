import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Socket } from 'ngx-socket-io';
import { StockService } from './stock.service';

describe('StockService', () => {
  let service: StockService;
  let httpMock: HttpTestingController;
  let socketMock: Partial<Socket>;

  const stockMockData = {
    "Global Quote": {
      "01. symbol": "IBM",
      "02. open": "125.3000",
      "03. high": "126.5100",
      "04. low": "125.1894",
      "05. price": "126.1500",
      "06. volume": "3797883",
      "07. latest trading day": "2023-05-18",
      "08. previous close": "125.7100",
      "09. change": "0.4400",
      "10. change percent": "0.3500%"
    }
  };

  const stockDataList = {
    "bestMatches": [
      {
        "1. symbol": "TSCO.LON",
        "2. name": "Tesco PLC",
        "3. type": "Equity",
        "4. region": "United Kingdom",
        "5. marketOpen": "08:00",
        "6. marketClose": "16:30",
        "7. timezone": "UTC+01",
        "8. currency": "GBX",
        "9. matchScore": "0.7273"
      },
      {
        "1. symbol": "TSCDF",
        "2. name": "Tesco plc",
        "3. type": "Equity",
        "4. region": "United States",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-04",
        "8. currency": "USD",
        "9. matchScore": "0.7143"
      },
      {
        "1. symbol": "TSCDY",
        "2. name": "Tesco plc",
        "3. type": "Equity",
        "4. region": "United States",
        "5. marketOpen": "09:30",
        "6. marketClose": "16:00",
        "7. timezone": "UTC-04",
        "8. currency": "USD",
        "9. matchScore": "0.7143"
      },
      {
        "1. symbol": "TCO2.FRK",
        "2. name": "TESCO PLC ADR/1 LS-05",
        "3. type": "Equity",
        "4. region": "Frankfurt",
        "5. marketOpen": "08:00",
        "6. marketClose": "20:00",
        "7. timezone": "UTC+02",
        "8. currency": "EUR",
        "9. matchScore": "0.5455"
      },
      {
        "1. symbol": "TCO0.FRK",
        "2. name": "TESCO PLC LS-0633333",
        "3. type": "Equity",
        "4. region": "Frankfurt",
        "5. marketOpen": "08:00",
        "6. marketClose": "20:00",
        "7. timezone": "UTC+02",
        "8. currency": "EUR",
        "9. matchScore": "0.5455"
      }
    ]
  }

  beforeEach(() => {
    socketMock = {};

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        StockService,
        { provide: Socket, useValue: socketMock }
      ]
    });

    service = TestBed.inject(StockService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should make an HTTP GET request to retrieve data from a JSON file', (done) => {
    const path = 'data.json';

    service.getDataFromJson(path).subscribe((data) => {
      expect(data).toEqual([]);
      done();
    });

    const req = httpMock.expectOne(path);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should make an HTTP GET request to retrieve stock data', (done) => {
    const symbol = 'IBM';
    service.getStockData(symbol).subscribe((data) => {

      const expectedData = {
        "Global Quote": {
          "01. symbol": "IBM",
          "02. open": "125.3000",
          "03. high": "126.5100",
          "04. low": "125.1894",
          "05. price": "126.1500",
          "06. volume": "3797883",
          "07. latest trading day": "2023-05-18",
          "08. previous close": "125.7100",
          "09. change": "0.4400",
          "10. change percent": "0.3500%" // Modify the value to make it different from stockMockData
        }
      };

      expect(data).toEqual(expectedData);
      done();
    });

    const req = httpMock.expectOne(service.url);
    expect(req.request.method).toBe('GET');
    req.flush(stockMockData);
  });

  it('should make an HTTP GET request to retrieve stock data list', (done) => {
    const symbol = 'IBM';
    service.getStockDataList(symbol).subscribe((data) => {
      expect(data).toEqual(stockDataList);
      done();
    });

    const req = httpMock.expectOne(service.url);
    expect(req.request.method).toBe('GET');
    req.flush(stockDataList);
  });

  it('should make an HTTP GET request to retrieve stock data list', (done) => {
    const symbol = 'tesco';
    service.getStockDataList(symbol).subscribe((data) => {
      expect(data).toEqual(stockDataList);
      done();
    });

    const req = httpMock.expectOne(service.url);
    expect(req.request.method).toBe('GET');
    req.flush(stockDataList);
  });

  it('should make an HTTP GET request to retrieve SymbolInfo', (done) => {
    const symbol = 'IBM';
    service.getSymbolInfo(symbol).subscribe((data) => {
      expect(data).toEqual([]);
      done();
    });

    const req = httpMock.expectOne(service.url);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should make an HTTP GET request to retrieve SymbolTimeSeriesInfo', (done) => {
    const symbol = 'IBM';
    service.getSymbolTimeSeriesInfo(symbol).subscribe((data) => {
      expect(data).toEqual([]);
      done();
    });

    const req = httpMock.expectOne(service.url);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should make an HTTP GET request to retrieve SymbolIntradayInfo', (done) => {
    const symbol = 'IBM';
    service.getSymbolIntradayInfo(symbol).subscribe((data) => {
      expect(data).toEqual([]);
      done();
    });

    const req = httpMock.expectOne(service.url);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});