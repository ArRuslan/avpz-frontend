import {Component, OnInit, ViewChild} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterPopupComponent } from '../../shared/popup-windows/filter-popup/filter-popup.component';
import { SortPopupComponent } from '../../shared/popup-windows/sort-popup/sort-popup.component';
import {OpenApiService} from "../../services/open-api.service";
import {ActivatedRoute} from "@angular/router";

class SortOptions {
  order: 'asc' | 'desc' = 'asc';
  sortParameter: 'name' | 'category' | 'start_time' = 'name';
}

class FilterOptions {
  name: string | null = null; // Назва івенту для фільтрації
  city: string | null = null; // Назва міста для фільтрації
  category: string | null = null; // Категорія для фільтрації
}

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent {
  events: any[] = [];
  searchText: any;
  sortOptions: SortOptions = new SortOptions();
  filterOptions: FilterOptions = new FilterOptions();
  category: string | null | undefined;

  constructor(public dialog: MatDialog, private openApiService: OpenApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.category = params['category']; // Отримайте параметр категорії з URL
      // Тепер ви можете використовувати цей параметр для завантаження відповідних івентів
      if (this.category) {
        this.filterEventsByCategory(this.category);
      } else {
        this.getAllEvents();
      }
    });
  }

  getAllEventsImages(): void {
    for (let i = 0; i < this.events.length; i++) {
      this.events[i].imageUrl = this.openApiService.getEventPhoto(this.events[i]);
    }
    console.log(this.events);
  }

  getAllEvents(): void {


    this.openApiService.searchHotels().subscribe(
      (response) => {
        this.events = response;
        console.log(this.events);
        this.getAllEventsImages();
      },
      (error) => {
        console.log('Error fetching events:', error);
      }
    );
  }

  searchEventsByName(eventName: string=this.searchText): void {
    const searchData: {
      name: string
    } = {
      name: eventName
    };

    this.openApiService.searchHotels().subscribe(
      (response) => {
        this.events = response;
        console.log(this.events);
        this.getAllEventsImages();
      },
      (error) => {
        console.log('Error fetching events:', error);
      }
    );
  }

  openSortDialog(): void {
    const dialogRef = this.dialog.open(SortPopupComponent, {width: '100%', height: '100%', data: { sortOptions: this.sortOptions }});

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.sortOptions = result;
        this.applySorting(result); // Передача результату сортування до методу applySorting()

      }
    });
  }

  applySorting(sortOptions: any): void {

    this.openApiService.sortEvents(sortOptions.sortParameter, sortOptions.order).subscribe(
      (response) => {
        this.events = response;
        console.log(response);
        this.getAllEventsImages();
      },
      (error) => {
        console.log('Error fetching events:', error);
      }
    );
  }

  openFilterDialog(): void {
    const dialogRef = this.dialog.open(FilterPopupComponent, {width: '100%', height: '100%', data: { filterOptions: this.filterOptions }});

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.filterOptions = result;
        this.applyFilters(result); // Передача результату сортування до методу applySorting()

      }
    });
  }

  applyFilters(filters: any): void {
    const searchData: {
      name?: string, // Назва івенту для фільтрації
      city?: string, // Назва міста для фільтрації
      category?: string
    } = {};

    if (filters.name !== null && filters.name !== "") {
      searchData.name = filters.name;
    }
    if (filters.city !== null && filters.city !== "") {
      searchData.city = filters.city;
    }
    if (filters.category !== null && filters.category !== "") {
      searchData.category = filters.category;
    }

    this.openApiService.searchHotels().subscribe(
      (response) => {
        this.events = response;
        console.log(this.events);
        this.getAllEventsImages();
      },
      (error) => {
        console.log('Error fetching events:', error);
      }
    );
  }

  private filterEventsByCategory(category: string) {
    console.log('Filtering events by category:', category);
    const searchData: {
      category: string
    } = {
      category: category
    };

    this.openApiService.searchHotels().subscribe(
      (response) => {
        this.events = response;
        console.log(this.events);
        this.getAllEventsImages();
      },
      (error) => {
        console.log('Error fetching events:', error);
      }
    );
  }
}
