import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientRowComponent } from './client-row.component';

describe('ClientRowComponent', () => {
  let component: ClientRowComponent;
  let fixture: ComponentFixture<ClientRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
