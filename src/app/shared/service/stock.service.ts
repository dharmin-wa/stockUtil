import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  // private API_KEY = 'KP7WNUWOXOPRLSK8';
  // private API_KEY1 = 'N0EHF7SIWY7DGM59';
  // private API_KEY2 = 'L1E7U6Q5VBJRCVAS';
  public API_KEYs = ['KP7WNUWOXOPRLSK8', 'N0EHF7SIWY7DGM59', 'L1E7U6Q5VBJRCVAS'];
  private API_URL = `https://www.alphavantage.co/query`;
  public lastIndex!: number;


  constructor(private http: HttpClient, private socket: Socket) { }

  public getDataFromJson(path: string): Observable<any> {
    return this.http.get(`${path}`);
  }

  public getStockData(symbol: string): Observable<any> {
    let API_KEY = this.getRandomString(this.API_KEYs);
    return this.http.get(`${this.API_URL}?apikey=${API_KEY}&function=GLOBAL_QUOTE&symbol=${symbol}`);
  }

  public getStockDataList(searchText: string): Observable<any> {
    let API_KEY = this.getRandomString(this.API_KEYs);
    return this.http.get(`${this.API_URL}?apikey=${API_KEY}&function=SYMBOL_SEARCH&keywords=${searchText}`);
  }

  public getSymbolInfo(symbol: string) {
    let API_KEY = this.getRandomString(this.API_KEYs);
    return this.http.get(`${this.API_URL}?apikey=${API_KEY}&function=OVERVIEW&symbol=${symbol}`);
  }

  public getSymbolTimeSeriesInfo(symbol: string) {
    let API_KEY = this.getRandomString(this.API_KEYs);
    return this.http.get(`${this.API_URL}?apikey=${API_KEY}&function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=full`);
  }

  public getSymbolIntradayInfo(symbol: string) {
    let API_KEY = this.getRandomString(this.API_KEYs);
    return this.http.get(`${this.API_URL}?apikey=${API_KEY}&function=TIME_SERIES_INTRADAY&interval=1min&symbol=${symbol}&outputsize=compact`);
  }

  public getRandomString(strings: string[]) {
    let index;

    do {
      index = Math.floor(Math.random() * strings.length);
    } while (index === this.lastIndex);

    this.lastIndex = index;

    return strings[index];
  }

}
