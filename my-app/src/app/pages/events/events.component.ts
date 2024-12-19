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

  roomTypeDescriptions: { [key: string]: RoomTypeInfo } = {
    luxury: {
      title: 'Luxury Room',
      photos: [
        'assets/images/rooms/lux_room_1.jpg',
        'assets/images/rooms/lux_room_2.jpg',
        'assets/images/rooms/lux_room_3.jpg',
        'assets/images/rooms/lux_room_4.jpg'
      ],
      description: 'Our luxury rooms offer an extraordinary level of comfort and style, ideal for those who want a truly premium experience.',
      details: [
        'Spacious king-sized bed with luxury bedding',
        'Private balcony offering stunning views',
        'Marble-clad bathroom with jacuzzi and rainfall shower',
        'Modern entertainment system with smart TV and premium channels',
        'Dedicated workspace and high-speed Wi-Fi'
      ],
      extraText: `The luxury rooms are designed for discerning travelers who seek the perfect blend of comfort and sophistication. Each room features exquisite furnishings, handpicked decor, and state-of-the-art amenities. The interiors boast neutral tones accented with gold finishes, offering a serene and luxurious ambiance.

      In addition to the expansive living space, guests can enjoy private balconies or terraces that provide unparalleled views of the city skyline or lush gardens. The marble bathrooms come with a deep soaking tub and luxurious toiletries, ensuring a spa-like experience.

      Our luxury room service includes personalized butler service and complimentary refreshments. Whether for leisure or business, the luxury room exceeds expectations with its attention to detail and modern amenities.`
    },
    premium: {
      title: 'Premium Room',
      photos: [
        'assets/images/rooms/pr_room_1.jpg',
        'assets/images/rooms/pr_room_2.jpg',
        'assets/images/rooms/pr_room_3.jpg',
        'assets/images/rooms/pr_room_4.jpg'
      ],
      description: 'The premium rooms provide comfort and modern design, perfect for both business and leisure travelers.',
      details: [
        'Queen-sized bed with cozy linens',
        'Modern work desk and seating area',
        'Fully stocked minibar and coffee station',
        'Complimentary high-speed internet access',
        'Elegant bathroom with shower'
      ],
      extraText: `Premium rooms offer a harmonious balance between functionality and style. Thoughtfully designed interiors feature contemporary furniture, natural lighting, and a calming color palette. The workspace and high-speed internet make it ideal for business travelers.

      Guests will appreciate the convenience of a stocked minibar, a coffee-making station, and cozy seating for relaxing evenings. The bathrooms are equipped with high-pressure showers, premium toiletries, and soft towels for a refreshing start to the day.

      Premium rooms provide a mid-tier luxury experience without compromising on quality or convenience. Whether it’s for business meetings or a relaxing getaway, this room meets the needs of every traveler.`
    },
    standard: {
      title: 'Standard Room',
      photos: [
        'assets/images/rooms/st_room_1.jpg',
        'assets/images/rooms/st_room_2.jpg',
        'assets/images/rooms/st_room_3.jpg',
        'assets/images/rooms/st_room_4.jpg'
      ],
      description: 'Our standard rooms offer affordability with all the essential amenities for a comfortable stay.',
      details: [
        'Twin beds with soft bedding',
        'Flat-screen TV with satellite channels',
        'Air conditioning for maximum comfort',
        'Private bathroom with all essentials',
        'Compact workspace'
      ],
      extraText: `The standard rooms provide a practical and comfortable environment for budget-conscious travelers. Each room is carefully designed to maximize functionality and comfort, with a focus on providing essential amenities.

      The decor combines simplicity with clean, modern finishes. Guests will find twin beds with quality bedding, a private bathroom with a shower, and a flat-screen TV for entertainment. Efficient use of space ensures there’s room for both work and relaxation.

      Ideal for short stays or business trips, standard rooms offer great value for money. While simple in design, they maintain a high standard of cleanliness and functionality, ensuring a pleasant experience for all guests.`
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
