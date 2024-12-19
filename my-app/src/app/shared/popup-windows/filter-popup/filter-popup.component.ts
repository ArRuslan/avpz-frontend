import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

class FilterOptions {
  // Для фільтрації готелів
  name: string | null = null;       // Назва готелю
  address: string | null = null;    // Адреса готелю
  description: string | null = null; // Опис готелю

  // Для фільтрації кімнат
  type: string | null = null;       // Тип кімнати
  price_min: number | null = null;  // Мінімальна ціна
  price_max: number | null = null;  // Максимальна ціна
}

@Component({
  selector: 'app-filter-popup',
  templateUrl: './filter-popup.component.html',
  styleUrls: ['./filter-popup.component.scss']
})
export class FilterPopupComponent {
  filterOptions: FilterOptions = new FilterOptions();
  isHotelPage: boolean = true;

  constructor(
    private dialogRef: MatDialogRef<FilterPopupComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.filterOptions = data.filterOptions || new FilterOptions();
    this.isHotelPage = data.isHotelPage; 
  }

  closePopup() {
    this.dialogRef.close();
  }

  applyFilters() {
    this.dialogRef.close(this.filterOptions);
  }
}
