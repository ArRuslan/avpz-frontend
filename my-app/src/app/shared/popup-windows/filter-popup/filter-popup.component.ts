import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

class FilterOptions {
  name: string | null = null; // Назва івенту для фільтрації
  city: string | null = null; // Назва міста для фільтрації
  category: string | null = null; // Категорія для фільтрації
}

@Component({
  selector: 'app-filter-popup',
  templateUrl: './filter-popup.component.html',
  styleUrls: ['./filter-popup.component.scss']
})
export class FilterPopupComponent {
  filterOptions: FilterOptions = new FilterOptions();

  constructor(
    private dialogRef: MatDialogRef<FilterPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.filterOptions = data.filterOptions;
  }

  closePopup() {
    this.dialogRef.close();
  }

  applyFilters() {
    this.dialogRef.close(this.filterOptions);
  }
}
