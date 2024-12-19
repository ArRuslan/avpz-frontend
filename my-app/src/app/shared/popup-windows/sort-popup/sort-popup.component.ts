import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export class SortOptionsModel {
  order: 'asc' | 'desc' = 'asc';
  sortParameter: 'name' | 'type' | 'price' | 'address' | 'category' | 'start_time' = 'name';
}

@Component({
  selector: 'app-sort-popup',
  templateUrl: './sort-popup.component.html',
  styleUrls: ['./sort-popup.component.scss']
})
export class SortPopupComponent {
  sortOptions: SortOptionsModel = new SortOptionsModel();
  availableSortParameters: { value: string, label: string }[] = [];

  constructor(
    private dialogRef: MatDialogRef<SortPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.sortOptions = data.sortOptions || new SortOptionsModel();

    this.availableSortParameters = data.isHotelPage
      ? [
          { value: 'name', label: 'Name' },
          { value: 'address', label: 'Address' }
        ]
      : [
          { value: 'type', label: 'Room Type' },
          { value: 'price', label: 'Price' }
        ];
  }

  closePopup() {
    this.dialogRef.close();
  }

  applySorting() {
    this.dialogRef.close(this.sortOptions);
  }
}
