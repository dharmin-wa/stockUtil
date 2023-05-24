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
  public API_URL = `https://www.alphavantage.co/query`;
  public url = "";
  public lastIndex!: number;


  constructor(private http: HttpClient, private socket: Socket) { }

  public getDataFromJson(path: string): Observable<any> {
    return this.http.get(`${path}`);
  }

  public getStockData(symbol: string): Observable<any> {
    let API_KEY = this.getRandomString(this.API_KEYs);
    this.url = "";
    this.url = `${this.API_URL}?apikey=${API_KEY}&function=GLOBAL_QUOTE&symbol=${symbol}`;
    return this.http.get(this.url);
  }

  public getStockDataList(searchText: string): Observable<any> {
    let API_KEY = this.getRandomString(this.API_KEYs);
    this.url = "";
    this.url = `${this.API_URL}?apikey=${API_KEY}&function=SYMBOL_SEARCH&keywords=${searchText}`;
    return this.http.get(this.url);
  }

  public getSymbolInfo(symbol: string) {
    let API_KEY = this.getRandomString(this.API_KEYs);
    this.url = "";
    this.url = `${this.API_URL}?apikey=${API_KEY}&function=OVERVIEW&symbol=${symbol}`;
    return this.http.get(this.url);
  }

  public getSymbolTimeSeriesInfo(symbol: string) {
    let API_KEY = this.getRandomString(this.API_KEYs);
    this.url = "";
    this.url = `${this.API_URL}?apikey=${API_KEY}&function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=full`;
    return this.http.get(this.url);
  }

  public getSymbolIntradayInfo(symbol: string) {
    let API_KEY = this.getRandomString(this.API_KEYs);
    this.url = "";
    this.url = `${this.API_URL}?apikey=${API_KEY}&function=TIME_SERIES_INTRADAY&interval=1min&symbol=${symbol}&outputsize=compact`;
    return this.http.get(this.url);
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
