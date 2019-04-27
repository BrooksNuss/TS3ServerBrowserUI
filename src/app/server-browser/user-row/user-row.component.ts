import { Component, OnInit, Input } from '@angular/core';
import { ListUserResponse } from '../models/listUserResponse';

@Component({
  selector: 'user-row',
  templateUrl: './user-row.component.html',
  styleUrls: ['./user-row.component.scss']
})
export class UserRowComponent implements OnInit {
  @Input() userInfo: ListUserResponse;

  constructor() { }

  ngOnInit() {
  }

}
