import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  ApexAxisChartSeries,
  ChartComponent
} from "ng-apexcharts";
import { Observable, Subscription, debounceTime, distinctUntilChanged, forkJoin, map, of } from 'rxjs';
import { StockService } from 'src/app/shared/service/stock.service';
import { ChartOptions, ChartStockHistoryOptions, ChartStockOptions } from 'src/app/shared/type/stockchart.type';
import { Stock } from '../model/stock';
import { SeriesHistory, seriesHistory } from '../model/serieshistory';
const legendLabels = ["Open", "52 Weeks High", "52 Weeks Low"];

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss']
})
export class StockComponent implements OnInit, OnDestroy {
  @ViewChild("chartIntra") chartIntra!: ChartComponent;
  @ViewChild("chartStock") chartStock!: ChartComponent;
  @ViewChild("chartHistory") chartHistory!: ChartComponent;

  public cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Stock', cols: 3, rows: 1 },
          { title: 'IntraDay', cols: 3, rows: 1 },
          { title: 'Stock History', cols: 3, rows: 1 },
        ];
      }

      return [
        { title: 'Stock', cols: 1, rows: 1 },
        { title: 'IntraDay', cols: 1, rows: 1 },
        { title: 'Stock History', cols: 1, rows: 1 },
      ];
    })
  );
  public searchControl = new FormControl();
  public stockDetailData: Stock = new Stock();
  public timeSeriesData: any = [];
  public intraDayData: any = [];

  public chartIntraOptions: ChartOptions | any;
  public chartIntraData: ApexAxisChartSeries | any;

  public chartStockOptions: ChartStockOptions | any;

  public chartStockHistoryOptions: ChartStockHistoryOptions | any;
  public chartStockHistoryData: ApexAxisChartSeries | any;

  public seriesHistory: SeriesHistory[] = [];

  public categories: Array<string> = Array<string>();
  public stockSearchList: any[] = [];

  public formattedTimeData: any[] = [];

  public filteredOptions$!: Observable<any[]>;
  public searchSubscription: Subscription = new Subscription();
  public selectedDuration: string = 'last5days';

  constructor(private breakpointObserver: BreakpointObserver, public stockService: StockService) { }

  ngOnInit(): void {
    this.searchBoxSubscribe();
  }

  public searchBoxSubscribe() {
    this.searchSubscription = this.searchControl.valueChanges
      .pipe(
        debounceTime(800),
        distinctUntilChanged()).subscribe(
          (search) => {
            if (search) {
              this.stockService.getStockDataList(search).subscribe(data => {
                this.stockSearchList = data.bestMatches.map((item: any) => {
                  return { symbol: item['1. symbol'], name: item['2. name'], type: item['3. type'] };
                }).filter((item: any) => item.name !== null);
                this.filteredOptions$ = of(this._filter(search));
              });
            } else {
              this.stockSearchList = [];
              this.filteredOptions$ = of(this.stockSearchList);
            }

          }
        )
  }

  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    // return this.stockSearchList.filter(option => option.name.toLowerCase().includes(filterValue));
    return this.stockSearchList.filter(option => option.type == "Equity");
  }

  public onOptionSelected(event: any) {
    if (event?.option?.value)
      this.loadStockDetailData(event.option.value);

  }

  public loadStockDetailData(symbol: string) {
    const combinedTimers = forkJoin([this.stockService.getStockData(symbol), this.stockService.getSymbolInfo(symbol), this.stockService.getSymbolIntradayInfo(symbol), this.stockService.getSymbolTimeSeriesInfo(symbol)]);

    combinedTimers.subscribe((res: any) => {
      let stockTodaySummary: any = ((typeof res[0] === 'object' && res[0] == null) || res[0]?.Note || res[0]['Error Message']) ? undefined : res[0];
      let stockFullDetail: any = ((typeof res[1] === 'object' && res[1] == null) || res[1]?.Note || res[1]['Error Message']) ? undefined : res[1];
      this.stockDetailData = new Stock();

      if (stockTodaySummary != undefined && stockTodaySummary['Global Quote'] != undefined) {
        this.stockDetailData.symbol = stockTodaySummary['Global Quote']['01. symbol'];
        this.stockDetailData.price = Number(stockTodaySummary['Global Quote']['05. price']);
        this.stockDetailData.open = Number(stockTodaySummary['Global Quote']['02. open']);
      }

      if (stockFullDetail != undefined && stockFullDetail != undefined) {
        this.stockDetailData.name = stockFullDetail.Name;
        this.stockDetailData.weekshigh = Number(stockFullDetail["52WeekHigh"]);
        this.stockDetailData.weekslow = Number(stockFullDetail["52WeekLow"]);
      }

      this.initStockChart();

      this.intraDayData = ((typeof res[2] === 'object' && res[2] == null) || res[2]?.Note || res[2]['Error Message']) ? undefined : res[2];
      this.timeSeriesData = ((typeof res[3] === 'object' && res[3] == null) || res[3]?.Note || res[3]['Error Message']) ? undefined : res[3];
      if (this.intraDayData != undefined && this.intraDayData['Time Series (1min)'] != undefined) {
        const flatArrayDate = Object.entries(this.intraDayData['Time Series (1min)']).map(([date, values]) => {
          if (typeof values !== 'object') {
            return { date };
          }
          return { date, ...values };
        });

        const formattedData = flatArrayDate.map((d: any) => {
          const { date, "1. open": open, "2. high": high, "3. low": low, "4. close": close, "5. volume": volume } = d;
          return { date, open, high, low, close, volume };
        });

        this.filterIntraDayData(formattedData)
      }
      else {
        console.log(this.intraDayData?.Note);
        this.filterIntraDayData([])
      }

      if (this.timeSeriesData != undefined && this.timeSeriesData['Time Series (Daily)'] != undefined) {
        const flatTimeArrayDate = Object.entries(this.timeSeriesData['Time Series (Daily)']).map(([date, values]) => {
          if (typeof values !== 'object') {
            return { date };
          }
          return { date, ...values };
        });

        this.formattedTimeData = [];
        this.formattedTimeData = flatTimeArrayDate.map((d: any) => {
          const { date, "1. open": open, "2. high": high, "3. low": low, "4. close": close } = d;
          return { date, open, high, low, close };
        });

        this.filterDataByTimeRange('last5days');
        this.selectedDuration = 'last5days';
      }
      else {
        this.filterDataByTimeRange('');
        console.log(this.timeSeriesData?.Note);
      }


    })
  }

  public filterIntraDayData(data: any) {
    const convertedData = data.map((d: any) => {
      const date = new Date(d.date);
      const [year, month, day] = [date.getFullYear(), date.getMonth(), date.getDate()];
      const timestamp = new Date(d.date).getTime();
      const [open, high, low, close] = [Number(d.open), Number(d.high), Number(d.low), Number(d.close)];
      return {
        x: new Date(timestamp),
        y: [open, high, low, close]
      };
    });

    this.chartIntraData = convertedData;
    this.initIntraChart();
  }

  public filterDataByTimeRangeEvent(event: Event) {
    const range = (event.target as HTMLSelectElement).value;
    this.filterDataByTimeRange(range);
  }

  public filterDataByTimeRange(range: string) {
    const today = new Date();
    let fromDate: Date;
    let data: any = [];

    switch (range) {
      case 'last5days':
        fromDate = new Date(today.setDate(today.getDate() - 5));
        break;
      case 'last1month':
        fromDate = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case 'last6months':
        fromDate = new Date(today.setMonth(today.getMonth() - 6));
        break;
      case 'last1year':
        fromDate = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
      default:
        fromDate = new Date(today.setFullYear(today.getFullYear() - 1));
    }
    if (range == '') {
      this.seriesHistory = seriesHistory;
      this.seriesHistory.forEach(x => x.data = []);
      this.initStockHistoryChart();
    }
    else {
      data = [...this.formattedTimeData].filter((d: any) => new Date(d.date) >= fromDate);
      this.updateHistoryChart(data);
    }
  }

  public updateHistoryChart(data: any) {
    this.categories = [];
    this.seriesHistory = seriesHistory;
    this.seriesHistory.forEach(x => x.data = []);

    for (const d of data) {
      this.categories.push(d.date);
      this.seriesHistory[0].data.push(Number(d.open));
      this.seriesHistory[1].data.push(Number(d.high));
      this.seriesHistory[2].data.push(Number(d.low));
      this.seriesHistory[3].data.push(Number(d.close));
    }

    this.initStockHistoryChart();
  }

  public initIntraChart() {
    this.chartIntraOptions = {
      chart: {
        type: "candlestick",
        height: 350
      },
      xaxis: {
        type: "datetime"
      },
      yaxis: {
        tooltip: {
          enabled: true
        }
      },
      series: [{
        name: "candle",
        data: this.chartIntraData
      }],
    }
  }

  public initStockChart() {
    this.chartStockOptions = {
      series: [this.stockDetailData.open ? this.stockDetailData.open : 0, this.stockDetailData.weekshigh ? this.stockDetailData.weekshigh : 0, this.stockDetailData.weekslow ? this.stockDetailData.weekslow : 0],
      chart: {
        width: 380,
        type: "donut"
      },
      labels: legendLabels,
      dataLabels: {
        enabled: false
      },
      fill: {
        type: "gradient"
      },
      legend: {
        formatter: function (val: any, opts: any) {
          return legendLabels[opts.seriesIndex]
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }

  public initStockHistoryChart() {

    this.chartStockHistoryOptions = {
      series: this.seriesHistory,
      chart: {
        type: "bar",
        stacked: true,
        height: 350,
        toolbar: {
          show: true
        },
        zoom: {
          enabled: true
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: "bottom",
              offsetX: -10,
              offsetY: 0
            }
          }
        }
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          endingShape: "rounded"
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        type: "category",
        categories: this.categories
      },
      yaxis: {
        position: "right",
        offsetY: 40,
        title: {
          text: "$ "
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return "$ " + val;
          }
        }
      }
    };
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }
}
