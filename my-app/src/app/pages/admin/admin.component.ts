import { Component, OnInit } from '@angular/core';
import { OpenApiService } from '../../services/open-api.service';
import { ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  activeSection: string = 'Hotels';
  data: any[] = [];
  hotels: any[] = [];
  selectedHotelId: number | null = null;
  selectedItem: any = null;
  selectedRole: number = 0;
  admins: any[] = [];
  allUsers: any[] = [];
  allBookings: any[] = [];
  currentPage: number = 1;
  pageSize: number = 50;
  totalPages: number = 1;
  currentHotelsPage: number = 1;
  hotelsPageSize: number = 25;
  totalHotelsPages: number = 1;
  showLoadMore: boolean = false;
  userPagesHistory: number[] = [];
  rowsHistory: any[][] = [];
  isSearching: boolean = false;

  bookingCode: string = '';
  verificationResult: string | null = null;
  booking: any = null;

  constructor(private apiService: OpenApiService, private cdr: ChangeDetectorRef) {}

  verifyBookingCode(): void {
    if (!this.bookingCode) {
      this.verificationResult = 'Please enter a booking code.';
      return;
    }

    const [booking_id, user_id, room_id] = this.bookingCode.split(':');

    if (!booking_id || !user_id || !room_id) {
      this.verificationResult = 'Invalid code format. Use booking_id:user_id:room_id.';
      return;
    }

    this.apiService.getAdminBookings(booking_id).subscribe((data) => {
      console.log(data);
      if (data.user.id == user_id && data.room.id == room_id) {
        this.verificationResult = 'Verification successful.';
        this.booking = data;
      } else {
        this.verificationResult = 'Verification failed. User ID or Room ID does not match.';
        this.booking = null;
      }
    }, (error) => {
      this.verificationResult = 'Error fetching booking details. Please try again.';
      console.error(error);
    });
  }

  clear(): void {
    this.booking = null;
    this.verificationResult = null;
    this.bookingCode = '';
  }

  selectItem(item: any): void {
    this.selectedItem = item;
    console.log('Selected item:', this.selectedItem);
  }

  ngOnInit(): void {
    this.activeSection = 'Hotels';
    this.loadHotels();
    this.loadData();
    this.loadUsers(this.selectedRole);
  }

  ensureString(value: string | null): string {
    return value ?? '';
  }

  isDisabled(section: string): boolean {
    const restrictedSections = ['Bookings', 'Payments'];
    return restrictedSections.includes(section);
  }

  loadMoreData(): void {
    if (this.activeSection === 'Hotels') {
      this.loadMoreHotels();
    } else if (this.activeSection === 'Users') {
      this.loadMoreUsers();
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else if (this.activeSection === 'Bookings') {
      this.loadMoreBookings();
    }
  }

  goBack(): void {
    if (this.rowsHistory.length > 0) {
      const previousRows = this.rowsHistory.pop();
      if (previousRows) {
        this.data = previousRows;
        this.currentPage--;
        this.showLoadMore = true;
      }
      this.updatePageData();
    } else {
      console.warn('No previous rows available in history.');
    }
  }


  private hotelsMap: { [key: number]: any } = {};
  private localHotels: any[] = [];

  loadHotels(page: number = 1): void {
    console.log('Loading hotels, page:', page);
    this.apiService.getHotels(page).subscribe(
      (response) => {
        this.data = response;
        if (response && Array.isArray(response)) {
          this.data = [...this.data, ...response];
          this.hotels = [...this.hotels, ...response];
          this.hotelsMap = this.hotels.reduce((map: any, hotel: any) => {
            map[hotel.id] = hotel;
            return map;
          }, {});

          if (!this.selectedHotelId && this.hotels.length > 0) {
            this.selectedHotelId = this.hotels[0].id;
          }
          this.showLoadMore = response.length === 25;
        } else {
          console.warn('Unexpected response format:', response);
          this.showLoadMore = false;
        }
        this.cdr.detectChanges();
        console.log('Hotels:', this.hotels);
      },
      (error) => {
        console.error('Error fetching Hotels:', error);
        this.showLoadMore = false;
      }
    );
  }

  loadMoreHotels(): void {
    this.currentPage++;
    this.apiService.getHotels(this.currentPage).subscribe(
      (response) => {
        if (response && response.length > 0) {
          this.data = [...this.data, ...response];
          this.showLoadMore = response.length === 25;
        } else {
          this.showLoadMore = false;
        }
      },
      (error) => {
        console.error('Error fetching Hotels:', error);
      }
    );
  }

  loadRooms(): void {
    if (this.selectedHotelId) {
      const hotelName = this.hotelsMap[this.selectedHotelId]?.name || 'Unknown';
      console.log('Selected hotel name:', hotelName);

      this.apiService.getHotelRooms(this.selectedHotelId).subscribe(
        data => {
          this.data = data.map((item: any) => ({
            id: item.id,
            hotelName: hotelName,
            type: item.type,
            price: item.price
          }));
          console.log('Rooms Data:', this.data);
        },
        error => {
          console.error('Error fetching Rooms:', error);
        }
      );
    } else {
      console.warn('No hotel selected. Cannot load rooms.');
    }
  }

loadAdmins(): void {
  if (!this.selectedHotelId) {
    console.warn('No hotel selected');
    this.admins = [];
    return;
  }

  this.apiService.getAdminsByHotel(this.selectedHotelId).subscribe(
    data => {
      this.admins = data.map((admin: any) => ({
        id: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        phoneNumber: admin.phone_number,
        role: admin.role,
        mfaEnabled: admin.mfa_enabled
      }));
      console.log('Admins Data:', this.admins);
    },
    error => console.error('Error fetching admins:', error)
  );
}

loadUsers(role?: number, page: number = 1): void {
  if (role !== undefined && role !== this.selectedRole) {
    // Зміна ролі: очищаємо історію
    this.selectedRole = role;
    this.rowsHistory = [];
    this.currentPage = 1;
  }

  if (this.currentPage !== page) {
    // Зберігаємо поточну сторінку в історії перед зміною сторінки
    this.rowsHistory.push([...this.data]);
  }

  this.currentPage = page;

  this.apiService.getUsers(this.selectedRole, this.currentPage, this.pageSize).subscribe(
    (response) => {
      // Формуємо користувачів зі сторінки
      const newUsers = response.result.map((user: any) => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: user.phone_number,
        role: user.role,
        mfaEnabled: user.mfa_enabled,
      }));

      if (page === 1) {
        // Якщо перша сторінка, перезаписуємо дані
        this.allUsers = newUsers;
      } else {
        // Якщо наступна сторінка, додаємо до існуючих
        this.allUsers = [...this.allUsers, ...newUsers];
      }

      this.totalPages = Math.ceil(response.count / this.pageSize);

      // Визначаємо, чи є ще дані для завантаження
      this.showLoadMore = response.result.length === this.pageSize;

      // Оновлюємо відображені дані
      this.updatePageData();
    },
    (error) => {
      console.error('Error fetching users:', error);
    }
  );
}

loadMoreUsers(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.loadUsers(this.selectedRole, this.currentPage);
  }
}

booking_user_id: string = '';
booking_room_id: string = '';
booking_check_in: string = '';
booking_check_out: string = '';
booking_totalPrice: string = '';
booking_status: string = '';

loadBookings(page: number = 1): void {
  this.apiService.getBookings(page).subscribe(
    (response) => {
    this.data = response.result.map((item: any) => ({
      id: item.id,
      user: item.user_id,
      room: item.room_id,
      dates: item.check_in + ' - ' + item.check_out,
      totalPrice: item.total_price,
      status: item.status}))
      .filter((item: any) => 
        (this.booking_user_id === '' || item.user == this.booking_user_id) &&
        (this.booking_room_id === '' || item.room == this.booking_room_id) &&
        (this.booking_check_in === '' || item.check_in == this.booking_check_in) &&
        (this.booking_check_out === '' || item.check_out == this.booking_check_out) &&
        (this.booking_totalPrice === '' || item.totalPrice == this.booking_totalPrice) &&
        (this.booking_status === '' || item.status == this.booking_status)
      );
    }),
    (error: any) => console.error('Error fetching data:', error)
};

loadMoreBookings(): void {
  this.currentPage++;
  this.apiService.getBookings(this.currentPage).subscribe(
    (response) => {
      if (response && response.length > 0) {
        this.data = [...this.data, ...response];
        this.showLoadMore = response.length === 25;
      } else {
        this.showLoadMore = false;
      }
    },
    (error) => {
      console.error('Error fetching Bookings:', error);
    }
  );
}

updatePageData(): void {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.data = this.allUsers.slice(startIndex, endIndex);
}

previousPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.updatePageData();
  }
}

nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.updatePageData();
  }
}

  setActiveSection(section: string): void {
    this.activeSection = section;
    this.loadData();
    if (this.activeSection === 'Administrators') {
      this.loadAdmins();
    } else {
      this.loadData();
    }
  }

  loadData(): void {
    switch (this.activeSection) {
      case 'Hotels':
        this.loadHotels();
        break;

      case 'Bookings':
        this.loadBookings();
        break;

      case 'Rooms':
        if (this.selectedHotelId) {
          this.loadRooms();
        } else {
          console.warn('No hotel ID selected for Rooms');
        }
        break;

      case 'Administrators':
        if (this.selectedHotelId) {
          this.loadAdmins();
        } else {
          console.warn('No hotel ID selected for Administrators');
        }
        break;

      case 'Users':
        this.loadUsers(this.selectedRole, this.currentPage); // Виклик з поточною сторінкою
        break;

      default:
        console.warn(`No handler defined for section: ${this.activeSection}`);
        this.data = [];
    }
  }

  handleAdd(): void {
    if (this.activeSection === 'Hotels') {
      const newHotel = {
        name: prompt('Enter Hotel Name:', ''),
        address: prompt('Enter Hotel Address:', ''),
        description: prompt('Enter Hotel Description:', '')
      };

      if (newHotel.name && newHotel.address && newHotel.description) {
        this.apiService.createHotel(newHotel).subscribe(
          (response) => {
            console.log('Server response:', response);
            console.log('Hotel added successfully:', response);
            alert('Hotel added successfully!');

            this.hotels.push(response);
            this.data = [...this.hotels];

            if (this.hotels.length % this.hotelsPageSize === 0) {
              this.showLoadMore = true;
            }
          },
          (error) => {
            console.error('Error adding hotel:', error);
            alert('Error adding hotel: ' + error.message);
          }
        );
      } else {
        alert('All fields are required!');
      }
    } else if (this.activeSection === 'Rooms' && this.selectedHotelId) {
      const newRoom = {
        type: prompt('Enter Room Type:', ''),
        price: prompt('Enter Room Price:', '')
      };

      if (newRoom.type && newRoom.price) {
        this.apiService.createRoom(this.selectedHotelId, newRoom).subscribe(
          (response) => {
            console.log('Room added successfully:', response);
            alert('Room added successfully!');
            this.loadRooms();
          },
          (error) => {
            console.error('Error adding room:', error);
            alert('Error adding room: ' + error.message);
          }
        );
      } else {
        alert('All fields are required!');
      }
    } else if (this.activeSection === 'Administrators') {
      const email = prompt('Enter Admin Email:', '');
      const role = prompt('Enter Admin Role (0, 1, 2, 100, 999):', '');

      if (email && role && ['0', '1', '2', '100', '999'].includes(role)) {
        const newAdmin = {
          email: email.trim(),
          role: parseInt(role, 10)
        };

        this.apiService.createAdmin(this.selectedHotelId!, newAdmin).subscribe(
          (response) => {
            console.log('Admin added successfully:', response);
            alert('Admin added successfully!');
            this.loadAdmins(); // Оновіть таблицю адміністраторів
          },
          (error) => {
            console.error('Error adding admin:', error);
            alert('Error adding admin: ' + error.message);
          }
        );
      } else {
        alert('Invalid input. Make sure all fields are filled and the role is valid (0, 1, 2, 100, 999).');
      }
    } else if (this.activeSection === 'Bookings') {
      const email = prompt('Enter Admin Email:', '');
      const role = prompt('Enter Admin Role (0, 1, 2, 100, 999):', '');

      if (email && role && ['0', '1', '2', '100', '999'].includes(role)) {
        const newAdmin = {
          email: email.trim(),
          role: parseInt(role, 10)
        };

        this.apiService.createAdmin(this.selectedHotelId!, newAdmin).subscribe(
          (response) => {
            console.log('Admin added successfully:', response);
            alert('Admin added successfully!');
            this.loadAdmins(); // Оновіть таблицю адміністраторів
          },
          (error) => {
            console.error('Error adding admin:', error);
            alert('Error adding admin: ' + error.message);
          }
        );
      } else {
        alert('Invalid input. Make sure all fields are filled and the role is valid (0, 1, 2, 100, 999).');
      }
    }
  }

  handleEdit(): void {
    if (this.activeSection === 'Hotels' && this.selectedItem) {
      const updatedHotel = {
        ...this.selectedItem,
        name: prompt('Edit Hotel Name:', this.selectedItem.name) || this.selectedItem.name,
        address: prompt('Edit Hotel Address:', this.selectedItem.address) || this.selectedItem.address,
        description: prompt('Edit Hotel Description:', this.selectedItem.description) || this.selectedItem.description,
      };

      this.apiService.updateHotel(updatedHotel.id, updatedHotel).subscribe(
        (response) => {
          console.log('Hotel updated successfully:', response);

          const hotelIndex = this.hotels.findIndex(hotel => hotel.id === response.id);
          if (hotelIndex !== -1) {
            this.hotels[hotelIndex] = { ...this.hotels[hotelIndex], ...response };
            this.data = [...this.hotels];
            alert('Hotel updated successfully!');
          } else {
            console.warn('Updated hotel not found in hotels array. Adding it manually.');
            this.hotels.push(response);
            this.data = [...this.hotels];
          }
        },
        (error) => {
          console.error('Error updating hotel:', error);
          alert('Error updating hotel: ' + error.message);
        }
      );
    } else if (this.activeSection === 'Rooms' && this.selectedItem) {
      const roomId = this.selectedItem.id;
      if (!roomId) {
        console.error('Room ID is missing!');
        alert('Room ID is missing. Please select a valid room.');
        return;
      }
      const updatedRoom = {
        ...this.selectedItem,
        type: prompt('Edit Room Type:', this.selectedItem.type) || this.selectedItem.type,
        price: prompt('Edit Room Price:', this.selectedItem.price) || this.selectedItem.price
      };

      this.apiService.updateRoom(this.selectedItem.id, updatedRoom).subscribe(
        (response) => {
          console.log('Room updated successfully:', response);
          alert('Room updated successfully!');
          this.loadRooms(); // Оновлення таблиці
        },
        (error) => {
          console.error('Error updating room:', error);
          alert('Error updating room: ' + error.message);
        }
      );
    } else if (this.activeSection === 'Administrators' && this.selectedItem) {
      const role = prompt(
        `Edit Admin Role (Current: ${this.selectedItem.role}, Options: 0, 1, 2, 100, 999):`,
        this.selectedItem.role.toString()
      );

      if (role && ['0', '1', '2', '100', '999'].includes(role)) {
        const updatedAdmin = {
          ...this.selectedItem,
          role: parseInt(role, 10)
        };

        this.apiService.updateAdmin(this.selectedItem.id, updatedAdmin).subscribe(
          (response) => {
            console.log('Admin updated successfully:', response);
            alert('Admin updated successfully!');
            this.loadAdmins();
          },
          (error) => {
            console.error('Error updating admin:', error);
            alert('Error updating admin: ' + error.message);
          }
        );
      } else {
        alert('Invalid role. Please enter one of the following: 0, 1, 2, 100, 999.');
      }
    }
  }

  handleDelete(): void {
    if (this.activeSection === 'Rooms' && this.selectedItem) {
      const confirmDelete = confirm(`Are you sure you want to delete this room?`);
      if (confirmDelete) {
        this.apiService.deleteRoom(this.selectedItem.id).subscribe(
          (response) => {
            console.log('Room deleted successfully:', response);
            alert('Room deleted successfully!');
            this.loadRooms(); // Оновлення таблиці
          },
          (error) => {
            console.error('Error deleting room:', error);
            alert('Error deleting room: ' + error.message);
          }
        );
      }
    } else if (this.activeSection === 'Administrators' && this.selectedItem) {
      const confirmDelete = confirm(`Are you sure you want to delete admin "${this.selectedItem.name}"?`);
      if (confirmDelete) {
        this.apiService.deleteAdmin(this.selectedItem.id).subscribe(
          (response) => {
            console.log('Admin deleted successfully:', response);
            alert('Admin deleted successfully!');
            this.loadAdmins();
          },
          (error) => {
            console.error('Error deleting admin:', error);
            alert('Error deleting admin: ' + error.message);
          }
        );
      }
    } else if (this.activeSection === 'Administrators' && this.selectedItem) {
      const confirmDelete = confirm(`Are you sure you want to delete admin "${this.selectedItem.firstName} ${this.selectedItem.lastName}"?`);
      if (confirmDelete) {
        this.apiService.deleteAdmin(this.selectedItem.id).subscribe(
          (response) => {
            console.log('Admin deleted successfully:', response);
            alert('Admin deleted successfully!');
            this.loadAdmins();
          },
          (error) => {
            console.error('Error deleting admin:', error);
            alert('Error deleting admin: ' + error.message);
          }
        );
      }
    } else {
      alert('Please select an admin to delete.');
    }
  }

  searchEmail: string = '';

  searchUser(): void {
    if (this.searchEmail.trim() === '') {
      alert('Please enter an email to search.');
      return;
    }

    this.isSearching = true;

    this.apiService.searchUserByEmail(this.searchEmail).subscribe(
      (response) => {
        if (response) {
          this.data = [
            {
              id: response.id,
              email: response.email,
              firstName: response.first_name,
              lastName: response.last_name,
              phoneNumber: response.phone_number,
              role: response.role,
              mfaEnabled: response.mfa_enabled,
            },
          ];
          this.showLoadMore = false;
        } else {
          alert('User not found.');
          this.data = [];
        }
      },
      (error) => {
        console.error('Error fetching user:', error);
        alert('Error fetching user. Please try again.');
      }
    );
  }

  searchId: number | null = null;

  searchUserById(): void {
    if (this.searchId === null || this.searchId === undefined) {
      alert('Please enter a valid User ID');
      return;
    }

    this.isSearching = true;

    this.apiService.getUserById(this.searchId).subscribe(
      (response) => {
        this.data = [response]; // Відобразіть знайденого користувача у таблиці
        console.log('User found:', response);
      },
      (error) => {
        console.error('Error fetching user by ID:', error);
        alert('User not found. Please check the ID.');
      }
    );
  }

  exitSearchMode(): void {
    this.isSearching = false;
    this.loadUsers(this.selectedRole);
    this.searchId = Number('');
    this.searchEmail = '';
  }
}



