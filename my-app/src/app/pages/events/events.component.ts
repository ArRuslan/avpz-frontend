import {Component, OnInit, ViewChild} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterPopupComponent } from '../../shared/popup-windows/filter-popup/filter-popup.component';
import { SortPopupComponent } from '../../shared/popup-windows/sort-popup/sort-popup.component';
import {OpenApiService} from "../../services/open-api.service";
import {ActivatedRoute} from "@angular/router";
import { forkJoin } from 'rxjs';

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
  hotels: any[] = [];
  rooms: any[] = [];
  isHotelsPage: boolean = true;
  category: string | null = null;
  searchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 50;
  totalCount: number = 0;

  constructor(public dialog: MatDialog, private openApiService: OpenApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const category = params['category'];
      const hotelId = params['hotelId'];

      if (category) {
        this.getRoomsByCategory(category);
      } else if (hotelId) {
        this.getRoomsForHotel(+hotelId);
      } else {
        this.getAllHotels();
      }
    });
  }

  private determinePageType(): void {
    this.route.url.subscribe(urlSegments => {
      const isHotelsPage = urlSegments.some(segment => segment.path === 'hotels');
      const hotelId = isHotelsPage ? null : +this.route.snapshot.params['hotelId'];

      if (isHotelsPage) {
        this.getAllHotels();
      } else if (hotelId) {
        this.getRoomsForHotel(hotelId);
      }
    });
  }

  private getAllHotels(): void {
    this.openApiService.searchHotels().subscribe(
      response => {
        this.hotels = response.result.map((hotel: any) => ({
          ...hotel,
          imageUrl: `https://via.placeholder.com/250`
        }));
      },
      error => {
        console.error('Error fetching hotels:', error);
      }
    );
  }

  private getRoomsByCategory(category: string): void {
    this.openApiService.getRoomsByType(category).subscribe(
      response => {
        this.rooms = response.result.map((room: any) => ({
          ...room,
          imageUrl: `https://via.placeholder.com/250`
        }));
      },
      error => {
        console.error('Error fetching rooms by category:', error);
      }
    );
  }

  private getRoomsForHotel(hotelId: number): void {
    this.openApiService.getHotelRooms(hotelId).subscribe(
      response => {
        console.log('API response:', response);
        if (Array.isArray(response)) {
          this.rooms = response.map((room: any) => ({
            ...room,
            imageUrl: `https://via.placeholder.com/250`
          }));
        } else {
          console.error('Invalid API response format:', response);
        }
      },
      error => {
        console.error('Error fetching rooms for hotel:', error);
      }
    );
  }

  searchHotels2(): void {
    const trimmedQuery = this.searchQuery?.trim();

    if (!trimmedQuery) {
      console.warn('Search query is empty');
      return;
    }

    const params: any = {
      page: this.currentPage.toString(),
      page_size: this.pageSize.toString(),
    };

    const nameSearch = this.openApiService.searchHotels2({ ...params, name: trimmedQuery });
    const addressSearch = this.openApiService.searchHotels2({ ...params, address: trimmedQuery });
    const descriptionSearch = this.openApiService.searchHotels2({ ...params, description: trimmedQuery });

    forkJoin([nameSearch, addressSearch, descriptionSearch]).subscribe(
      ([nameResults, addressResults, descriptionResults]) => {
        const allResults = [
          ...(nameResults?.result || []),
          ...(addressResults?.result || []),
          ...(descriptionResults?.result || []),
        ];

        this.hotels = Array.from(new Set(allResults.map(hotel => hotel.id))).map(
          id => allResults.find(hotel => hotel.id === id)
        );

        console.log('Merged results:', this.hotels);
      },
      error => {
        console.error('Error fetching hotels:', error);
        this.hotels = [];
      }
    );
  }

  loadNextPage(): void {
    if (this.hotels.length < this.totalCount) {
      this.currentPage++;
      this.searchHotels2();
    }
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
