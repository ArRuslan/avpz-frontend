import {Component, OnInit, ViewChild} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterPopupComponent } from '../../shared/popup-windows/filter-popup/filter-popup.component';
import { SortPopupComponent } from '../../shared/popup-windows/sort-popup/sort-popup.component';
import {OpenApiService} from "../../services/open-api.service";
import {ActivatedRoute} from "@angular/router";
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

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
    this.route.params.subscribe(params => {
      const category = params['category'];
      const hotelId = params['hotelId'];

      if (category) {
        this.showRoomDetails(category);
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
