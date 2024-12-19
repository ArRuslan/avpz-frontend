import {Component, OnInit, ViewChild} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterPopupComponent } from '../../shared/popup-windows/filter-popup/filter-popup.component';
import { SortPopupComponent } from '../../shared/popup-windows/sort-popup/sort-popup.component';
import {OpenApiService} from "../../services/open-api.service";
import {ActivatedRoute} from "@angular/router";
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { SortOptionsModel } from '../../shared/popup-windows/sort-popup/sort-popup.component';

class SortOptions {
  order: 'asc' | 'desc' = 'asc';
  sortParameter: 'name' | 'category' | 'start_time' = 'name';
}

class FilterOptions {
  name: string | null = null; // Назва івенту для фільтрації
  city: string | null = null; // Назва міста для фільтрації
  category: string | null = null; // Категорія для фільтрації
}

interface RoomTypeInfo {
  title: string;
  photos: string[];
  description: string;
  details: string[];
  extraText: string;
}

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent {
  events: any[] = [];
  searchText: any;
  filterOptions: FilterOptions = new FilterOptions();
  hotels: any[] = [];
  rooms: any[] = [];
  isHotelsPage: boolean = true;
  category: string | null = null;
  searchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 50;
  totalCount: number = 0;
  selectedHotel: any = null;
  hotelDetails: any = null;
  isHotelPage: boolean = true;
  isSearchActive: boolean = false;
  isFilterActive: boolean = false;
  currentHotelId: number | null = null;
  sortOptions: SortOptionsModel = new SortOptionsModel();
  isSortActive: boolean = false;

  constructor(public dialog: MatDialog, private openApiService: OpenApiService, private route: ActivatedRoute, private router: Router) {}

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
  };
  selectedRoomType: RoomTypeInfo | null = null;

  navigateToHotels(): void {
    this.router.navigate(['/hotels']);
  }

  showRoomDetails(type: string): void {
    this.selectedRoomType = this.roomTypeDescriptions[type];
  }

  ngOnInit(): void {
    // Визначаємо, чи це сторінка готелю з кімнатами або загальна сторінка готелів
    this.route.url.subscribe(urlSegments => {
      const isHotelRoomsPage = urlSegments.some(segment => segment.path === 'hotel') &&
                               urlSegments.some(segment => segment.path === 'rooms');
      this.isHotelPage = !isHotelRoomsPage; // true, якщо загальна сторінка готелів

      // Обробляємо параметри URL
      this.route.params.subscribe(params => {
        const category = params['category'];
        const hotelId = params['hotelId'];

        if (category) {
          this.showRoomDetails(category); // Показуємо деталі типу кімнат
        } else if (isHotelRoomsPage && hotelId) {
          this.currentHotelId = +hotelId;
          this.getHotelDetails(+hotelId); // Завантажуємо деталі готелю
          this.getRoomsForHotel(+hotelId); // Завантажуємо кімнати для готелю
          this.searchRoomsForHotel(+hotelId); // Пошук кімнат для готелю
        } else if (this.isHotelPage) {
          this.getAllHotels(); // Завантажуємо всі готелі
        }
      });
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

  private getHotelDetails(hotelId: number): void {
    this.openApiService.getHotelById(hotelId).subscribe(
      (response) => {
        this.hotelDetails = response;
        console.log('Hotel details fetched:', this.hotelDetails);
      },
      (error) => {
        console.error('Error fetching hotel details:', error);
      }
    );
  }

  private getRoomsForHotel(hotelId: number): void {
    this.openApiService.getRoomsByHotelId(hotelId).subscribe(
      (response) => {
        this.rooms = response.result.map((room: any) => ({
          ...room,
          imageUrl: `/assets/images/rooms/${room.type.toLowerCase().replace(' ', '_')}_1.jpg`
        }));
        console.log('Rooms fetched for hotel:', this.rooms);
      },
      (error) => {
        console.error('Error fetching rooms for hotel:', error);
      }
    );
  }

  search(): void {
    const trimmedQuery = this.searchQuery?.trim();

    if (!trimmedQuery) {
      console.warn('Search query is empty');
      return;
    }

    this.isSearchActive = true;

    if (this.isHotelPage) {
      // Пошук готелів
      this.searchHotels2();
    } else {
      const hotelId = +this.route.snapshot.params['hotelId'];
      this.searchRoomsForHotel(hotelId);
    }
  }

  searchHotels2(): void {
    const trimmedQuery = this.searchQuery?.trim();

    this.isSearchActive = true;

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

  searchRoomsForHotel(hotelId: number): void {
    const trimmedQuery = this.searchQuery?.trim();

    if (!trimmedQuery) {
      console.warn('Search query is empty');
      return;
    }

    const params: any = {
      page: this.currentPage.toString(),
      page_size: this.pageSize.toString(),
      hotel_id: hotelId.toString(),
    };

    const requests = [];

    // Пошук за типом кімнати завжди
    requests.push(this.openApiService.searchRooms({ ...params, type: trimmedQuery }));

    // Пошук за ціною, тільки якщо введене значення є числом
    if (!isNaN(Number(trimmedQuery))) {
      requests.push(this.openApiService.searchRooms({ ...params, price_min: Number(trimmedQuery) }));
      requests.push(this.openApiService.searchRooms({ ...params, price_max: Number(trimmedQuery) }));
    }

    // Виконуємо всі запити одночасно
    forkJoin(requests).subscribe(
      (results) => {
        // Об'єднуємо результати усіх запитів у єдиний масив
        const allResults = results.flatMap((res: any) => res?.result || []);

        // Видаляємо дублікатні кімнати за унікальним ID
        this.rooms = Array.from(new Set(allResults.map(room => room.id))).map(
          id => allResults.find(room => room.id === id)
        );

        console.log('Merged results:', this.rooms);
      },
      error => {
        console.error('Error fetching rooms:', error);
        this.rooms = [];
      }
    );
  }

  resetSearch(): void {
    this.searchQuery = '';
  this.isSearchActive = false;
  this.isFilterActive = false;
  this.isSortActive = false;
  this.currentPage = 1;

    if (this.isHotelPage) {
      this.getAllHotels(); // Завантажити всі готелі
    } else if (this.currentHotelId) {
      this.getRoomsForHotel(this.currentHotelId); // Завантажити всі кімнати для готелю
    }
  }

  loadNextPage(): void {
    if (this.hotels.length < this.totalCount) {
      this.currentPage++;
      this.searchHotels2();
    }
  }

  openFilterDialog(): void {
    const dialogRef = this.dialog.open(FilterPopupComponent, {
      width: '100%',
      height: '100%',
      data: {
        filterOptions: this.filterOptions,
        isHotelPage: this.isHotelPage // Передаємо флаг
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Applied filters:', result);
        this.filterOptions = result;
        this.applyFilters(result);
      }
    });
  }

  applyFilters(filters: any): void {
    // Видаляємо параметри зі значенням null або undefined
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value != null && value !== '')
    );

    this.isFilterActive = true;

    if (this.isHotelPage) {
      this.openApiService.filterHotels(cleanedFilters).subscribe(
        (response) => {
          this.hotels = response.result;
          console.log('Filtered hotels:', this.hotels);
        },
        (error) => {
          console.error('Error filtering hotels:', error);
        }
      );
    } else {
      const params = { hotel_id: this.currentHotelId, ...cleanedFilters };
      this.openApiService.filterRooms(params).subscribe(
        (response) => {
          this.rooms = response.result;
          console.log('Filtered rooms:', this.rooms);
        },
        (error) => {
          console.error('Error filtering rooms:', error);
        }
      );
    }
  }

  openSortDialog(): void {
    const dialogRef = this.dialog.open(SortPopupComponent, {
      width: '400px',
      data: {
        sortOptions: this.sortOptions,
        isHotelPage: this.isHotelPage
      }
    });

    dialogRef.afterClosed().subscribe((result: SortOptionsModel) => {
      if (result) {
        this.sortOptions = result; // Тепер це SortOptionsModel
        this.applySorting(result);
      }
    });
  }

  applySorting(sortOptions: SortOptionsModel): void {
    this.isSortActive = true;

    const sortParameter = sortOptions.sortParameter;
    const order = sortOptions.order === 'asc' ? 1 : -1;

    if (this.isHotelPage) {
      if (sortParameter === 'name' || sortParameter === 'address') {
        this.hotels.sort((a, b) => a[sortParameter].localeCompare(b[sortParameter]) * order);
      }
    } else {
      if (sortParameter === 'type') {
        this.rooms.sort((a, b) => a.type.localeCompare(b.type) * order);
      } else if (sortParameter === 'price') {
        this.rooms.sort((a, b) => (a.price - b.price) * order);
      }
    }

    console.log(`Список після сортування (${sortParameter}, ${sortOptions.order}):`, this.isHotelPage ? this.hotels : this.rooms);
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
        this.events = response.result;
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
        this.events = response.result;
        console.log(this.events);
        this.getAllEventsImages();
      },
      (error) => {
        console.log('Error fetching events:', error);
      }
    );
  }


}
