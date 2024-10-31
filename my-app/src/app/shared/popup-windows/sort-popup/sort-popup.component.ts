import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {OpenApiService} from "../../../services/open-api.service";
import {Observable} from "rxjs";

class SortOptions {
  order: 'asc' | 'desc' = 'asc';
  sortParameter: 'name' | 'category' | 'start_time' = 'name';
}

@Component({
  selector: 'app-sort-popup',
  templateUrl: './sort-popup.component.html',
  styleUrls: ['./sort-popup.component.scss']
})
export class SortPopupComponent {
  events: any[] = [];
  sortOptions: SortOptions = new SortOptions();

  constructor(
    private dialogRef: MatDialogRef<SortPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.sortOptions = data.sortOptions;
  }

  closePopup() {
    this.dialogRef.close();
  }

  applySorting(): void {
    this.dialogRef.close(this.sortOptions);
  }
}
