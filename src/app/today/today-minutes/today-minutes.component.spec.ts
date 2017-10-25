import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodayMinutesComponent } from './today-minutes.component';

describe('TodayMinutesComponent', () => {
  let component: TodayMinutesComponent;
  let fixture: ComponentFixture<TodayMinutesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodayMinutesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodayMinutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
