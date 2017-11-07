import { Component, Input } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { OnInit, OnChanges, SimpleChanges } from '@angular/core';
import 'rxjs/add/operator/map';
import Chart from 'chart.js';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  ngOnInit() {

  }
}
