import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerBrowserComponent } from './server-browser.component';

describe('ServerBrowserComponent', () => {
  let component: ServerBrowserComponent;
  let fixture: ComponentFixture<ServerBrowserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerBrowserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
