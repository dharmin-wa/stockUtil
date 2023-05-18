import { LayoutModule } from '@angular/cdk/layout';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DashboardComponent } from './dashboard.component';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { StockService } from '../../shared/service/stock.service';
import { WrappedSocket } from 'ngx-socket-io/src/socket-io.service';


describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let stockServiceMock: Partial<StockService>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
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
        HttpClientModule,
        NoopAnimationsModule
        // NgApexchartsModule
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        WrappedSocket,
        { provide: StockService, useValue: stockServiceMock },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should compile', () => {
    expect(component).toBeTruthy();
  });

  it('Check SData Null', () => {
    // const initSocketSpy = spyOn(component, 'initSocket');
    component.ngOnInit();
    expect(component.sData).toEqual([]);
  })

  // it('', () => {
  //   const initSocketSpy = spyOn(component, 'initSChart');
  //   component.initSocket();
  //   expect(initSocketSpy).toHaveBeenCalled();
  // })

  // it('', () => {
  //   component.sData = [1,2,3]
  //   component.initSChart();
  //   expect(component.chartSOptions.series.data).toEqual(component.sData);
  // })
});
