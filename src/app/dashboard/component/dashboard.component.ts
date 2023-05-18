import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import {
  ApexAxisChartSeries,
  ChartComponent
} from "ng-apexcharts";
import { Socket } from 'ngx-socket-io';

import { Subject, asyncScheduler, forkJoin, interval, of } from 'rxjs';
import { map, mergeMap, takeUntil, toArray } from 'rxjs/operators';
import { StockService } from '../../shared/service/stock.service';
import { ChartLineOptions, ChartOptions, ChartSOptions } from 'src/app/shared/type/stockchart.type';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild("piechart") chart: ChartComponent | any;
  @ViewChild("chartLine") chartLine: ChartComponent | any;
  @ViewChild("chart") chartS: ChartComponent | any;

  public cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'IT Stocks', cols: 4, rows: 1, subtitle: 'Comparing' },
          { title: 'Bank Stocks', cols: 4, rows: 1 },
          { title: 'Crud Oil', cols: 4, rows: 1 },
        ];
      }

      return [
        { title: 'IT Stocks', cols: 1, rows: 1, subtitle: 'Comparing' },
        { title: 'Bank Stocks', cols: 3, rows: 1 },
        { title: 'Crud Oil', cols: 4, rows: 2 },
      ];
    })
  );
  public chartOptions: ChartOptions | any;
  public chartData: ApexAxisChartSeries | any;
  public symbolLabels: Array<string> = new Array<string>();
  public symbolSeries: Array<number> = new Array<number>();

  public chartLineOptions: ChartLineOptions | any;
  public bankDataSeries: ApexAxisChartSeries | any;
  private destroy$ = new Subject<void>();

  public chartSOptions: ChartSOptions | any;
  public sData: any = [];
  public daysToAdd: number = 0;

  constructor(private breakpointObserver: BreakpointObserver, public stockService: StockService, private socket: Socket) { }

  ngOnInit(): void {
    this.sData = [];
    this.initSocket();
    this.loadItStock();
    this.loadBankStocks();
    // this.realTimeNewDataS();

  }

  public initSocket() {
    this.socket.connect();

    this.socket.on("stockData", (data: any) => {
      this.sData.push(data);
      this.chartSOptions = {
        ...this.chartSOptions,
        series: [
          {
            data: this.sData
          }
        ],
      }
    });

    this.initSChart();
  }

  public loadItStock() {
    this.symbolLabels = new Array<string>();
    this.symbolSeries = new Array<number>();
    let length = 0;
    const stockSymbols = of('assets/data/TCS.json', 'assets/data/WIPRO.json', 'assets/data/HCLTECH.json');

    stockSymbols.pipe(
      toArray()
    ).subscribe(symbols => {
      length = symbols.length;
    });


    const stockData = stockSymbols.pipe(
      mergeMap(path => this.stockService.getDataFromJson(path))
    );
    stockData.subscribe(data => {
      if (data.Note) {
        throw new Error(data.Note);
      }
      else {
        if (data && data.length > 0) {
          let selectedData = data[data.length - 1];
          if (selectedData.Symbol != undefined) {
            this.symbolLabels.push(selectedData.Symbol);
            this.symbolSeries.push(selectedData.Close);
          }
        }

        if (length == this.symbolLabels.length)
          this.initChart();
      }
    });
  }

  public loadBankStocks() {
    const combinedBankData = forkJoin([this.stockService.getDataFromJson('assets/data/icici.json'), this.stockService.getDataFromJson('assets/data/axis.json'), this.stockService.getDataFromJson('assets/data/hdfc.json')]);

    combinedBankData.subscribe(res => {

      let iciciData = this.filterByLodash(res[0]);
      let iciciFormattedData = {
        name: "ICICI Bank - close",
        data: iciciData.map((x: any) => Number(x.Close))
      }
      let axisData = this.filterByLodash(res[1]);
      let axisFormattedData = {
        name: "Axis Bank  - close",
        data: axisData.map((x: any) => Number(x.Close))
      }
      let hdfcData = this.filterByLodash(res[2]);

      let hdfcFormattedData = {
        name: "Hdfc Bank  - close",
        data: hdfcData.map((x: any) => Number(x.Close))
      }
      this.bankDataSeries = [iciciFormattedData, axisFormattedData, hdfcFormattedData]
      this.initLineChart();

    });
  }


  public realTimeNewDataS() {

    interval(1000, asyncScheduler)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + this.daysToAdd);
        const now = currentDate.getTime();

        const value = Math.floor(Math.random() * 10) + 40;
        this.sData.push([now, value]);
        this.chartSOptions = {
          ...this.chartSOptions,
          series: [
            {
              data: this.sData
            }
          ],
        };

        this.daysToAdd++;
      });
  }

  public filterByLodash(data: any) {
    const currentYear = new Date().getFullYear();

    const currentYearData = _.filter(data, (data) => {
      const year = new Date(data.Date).getFullYear();
      return year === currentYear;
    });

    const dataGroupedByMonth = _.groupBy(currentYearData, (data) => {
      const date = new Date(data.Date);
      const month = date.toLocaleString('default', { month: 'short' });
      return `${month}-${date.getFullYear()}`;
    });

    const dataEntries = Object.entries(dataGroupedByMonth);

    const lastDateDataOfEveryMonth = _.reduce(
      dataEntries,
      (result: any, [key, value]) => {
        const sortedData = _.sortBy(value, (data) => new Date(data.Date));
        const lastDateData = sortedData.pop();
        return [...result, lastDateData];
      },
      []
    );

    return lastDateDataOfEveryMonth;
  }


  public initChart() {
    this.chartOptions = {
      series: this.symbolSeries,
      chart: {
        width: 380,
        type: "pie"
      },
      labels: this.symbolLabels,
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

  public initLineChart() {
    this.chartLineOptions = {
      series: this.bankDataSeries,
      chart: {
        height: 350,
        type: "line",
        dropShadow: {
          enabled: true,
          color: "#000",
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2
        },
        toolbar: {
          show: false
        }
      },
      colors: ["#77B6EA", "#545454", "#800000"],
      dataLabels: {
        enabled: true
      },
      stroke: {
        curve: "smooth"
      },
      title: {
        text: "Bank summary (Monthly closing)",
        align: "left"
      },
      grid: {
        borderColor: "#e7e7e7",
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      markers: {
        size: 1
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        title: {
          text: "Month"
        }
      },
      yaxis: {
        title: {
          text: "Price ($)"
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        offsetX: -5
      }
    };
  }

  public initSChart(): void {
    this.chartSOptions = {
      series: [
        {
          data: this.sData
        }
      ],
      chart: {
        type: "area",
        height: 350,
        animations: {
          enabled: true,
          easing: 'linear',
          dynamicAnimation: {
            speed: 1000
          }
        },
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      stroke: {
        curve: 'smooth'
      },
      dataLabels: {
        enabled: false
      },
      markers: {
        size: 0
      },
      xaxis: {
        type: "datetime",
        tickAmount: 6
      },
      tooltip: {
        x: {
          format: "dd MMM yyyy"
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 100]
        }
      }
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.socket.disconnect();
  }
}
