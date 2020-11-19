import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SidenavContentComponent } from './sidenav-content.component';

describe('SidenavContentComponent', () => {
  let component: SidenavContentComponent;
  let fixture: ComponentFixture<SidenavContentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SidenavContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
