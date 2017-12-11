import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { Http, Response } from '@angular/http';

@Component({
  selector: 'app-today-minutes',
  templateUrl: './today-minutes.component.html',
  styleUrls: ['./today-minutes.component.css']
})
export class TodayMinutesComponent implements OnInit {
  private sub: any;
  title = 'app';
  testResponse: any;
  private listDaysUrl = '/api/listDays';
  private testUrl = '/api/%s/quarterHours';
  smogStatPm100 = [];
  smogStatPm25 = [];
  smogStat;
  daysList = [];
  selectedValue = null;
  @Input() selectedDay;

  // lineChart
  public isLineChartLoaded = false;

  public lineChartData: Array<any>;

  public lineChartLabels: Array<string>;

  public lineChartOptions: any = {
    responsive: true
  };
  public lineChartColors: Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';

  constructor(private myHttp: Http, private route: ActivatedRoute) { }

  private resetData() {
    this.smogStatPm100 = [];
    this.smogStatPm25 = [];
    this.smogStat = undefined;
    this.lineChartData = [
      {data: [], label: 'PM 10'},
      {data: [], label: 'PM 2,5'}
    ];
    this.isLineChartLoaded = false;
    this.lineChartLabels = [
      // '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
      // '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      // '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      // '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ];
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.resetData();
      if (params['day'] === undefined) {
        this.getDaysList().subscribe(
          x => {
            if (x[x.length - 1]) {
              const lastDate: string = x[x.length - 1];
              this.selectedDay = lastDate;
              this.getDataObservable(lastDate).subscribe(
                data => {
                  this.testResponse = data;
                }
              );
            }
          },
          e => console.log('Error while downloading days list: %s', e),
          () => console.log('onCompleted')
        );
      } else {
        this.getDaysList().subscribe();
        this.selectedDay = params['day'];
        this.getDataObservable(params['day']).subscribe(
          data => {
            this.testResponse = data;
          }
        );
      }
    });
  }

  getDaysList () {
    return this.myHttp.get(this.listDaysUrl)
    .map(data => {
      this.daysList = data.json();
      return this.daysList;
    });
  }

  getDataObservable(day: string) {
    const url: string = this.testUrl.replace(/%s/g, day);
    return this.myHttp.get(url)
        .map(data => {
            data.json();
            this.smogStat = data.json();
            this.smogStat['minuteAverages'].forEach((element, key) => {
              this.lineChartData[0].data.push(element['pm10']);
              this.lineChartData[1].data.push(element['pm2_5']);
              // if (key % 60 === 0) {
                this.lineChartLabels.push(element['minuteRange']);
              // } else {
              //   this.lineChartLabels.push('');
              // }
              this.smogStatPm100.push(element['pm10']);
              this.smogStatPm25.push(element['pm2_5']);
            });

            this.isLineChartLoaded = true;
            return this.smogStat;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
