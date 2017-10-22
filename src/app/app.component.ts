import { Component } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { OnInit } from '@angular/core';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  testResponse: any;
  private listDaysUrl = 'http://localhost:4343/api/listDays';
  private testUrl = 'http://localhost:4343/api/2017-10-09/minutes';
  smogStatPm100 = [];
  smogStatPm25 = [];
  smogStat;
  daysList = [];

  // lineChart
  public lineChartData: Array<any> = [
    {data: [], label: 'PM 10'},
    {data: [], label: 'PM 2,5'}
  ];
  public lineChartLabels: Array<any> = [
    // '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    // '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    // '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    // '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];
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

  constructor(private myHttp: Http) { }

  ngOnInit() {
    this.getDaysList().subscribe();

    this.getDataObservable().subscribe(
        data => {
          this.testResponse = data;
          // console.log('I CANT SEE DATA HERE: ', this.testResponse);
        }
    );
  }

  getDaysList () {
    return this.myHttp.get(this.listDaysUrl)
    .map(data => {
      this.daysList = data.json();
      console.log('Hello', this.daysList);
      return this.daysList;
    });
  }

  getDataObservable() {
    return this.myHttp.get(this.testUrl)
        .map(data => {
            data.json();
            this.smogStat = data.json();
            this.smogStat['minuteAverages'].forEach((element, key) => {
              this.lineChartData[0].data.push(element['pm10']);
              this.lineChartData[1].data.push(element['pm2_5']);
              if (key % 60 === 0) {
                this.lineChartLabels.push(element['minute']);
              } else {
                this.lineChartLabels.push('');
              }
              this.smogStatPm100.push(element['pm10']);
              this.smogStatPm25.push(element['pm2_5']);
            });

            console.log('I CAN SEE DATA THERE: ', this.smogStat['minuteAverages']);
            return this.smogStat;
    });
  }


}
