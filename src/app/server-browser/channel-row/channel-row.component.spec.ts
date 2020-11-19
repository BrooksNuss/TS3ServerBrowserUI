import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChannelRowComponent } from './channel-row.component';

describe('ChannelRowComponent', () => {
  let component: ChannelRowComponent;
  let fixture: ComponentFixture<ChannelRowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
