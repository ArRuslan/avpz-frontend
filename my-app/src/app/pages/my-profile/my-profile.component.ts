import { Component, OnInit } from '@angular/core';
import {OpenApiService, TicketData} from "../../services/open-api.service";
import {
  PasswordConfirmationPopupComponent
} from "../../shared/popup-windows/password-confirmation-popup/password-confirmation-popup.component";
import {MatDialog} from "@angular/material/dialog";
import {AnnouncementPopupComponent} from "../../shared/popup-windows/announcement-popup/announcement-popup.component";
import {Observable, tap} from "rxjs";
import {SetAvatarPopupComponent} from "../../shared/popup-windows/set-avatar-popup/set-avatar-popup.component";

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  userData: any; // Змінна для збереження інформації про користувача
  isEditing: boolean = false;
  avatarUrl: string | undefined;
  files: FileList | undefined;
  isUserLoggedIn: boolean | undefined;
  paymentMethods = [
    { type: 'Activate account', card_number: '4444-4444-4444-4444', isActive: true },
    { type: 'Activate account', card_number: '4444-4444-4444-4444', isActive: false },
  ];
  reservations = [
    { room: 'Room #1', status: 'Soon' },
    { room: 'Room #2', status: 'Soon' },
    { room: 'Room #3', status: 'Is Over' },
  ];

  constructor(public dialog: MatDialog, private openApiService: OpenApiService) { }

  ngOnInit(): void {
    if (localStorage.getItem("token")) {
      this.isUserLoggedIn = true;
      this.getUserData().subscribe(
        () => {
          this.getUserAvatar();
          this.getUserPaymentMethods();
          this.getUserTickets();
        },
        (error) => {
          console.error('Помилка при отриманні даних користувача:', error);
        }
      );
    } else {
      this.isUserLoggedIn = false;
    }
  }

  getUserData(): Observable<any> {
    return this.openApiService.getUserInfo().pipe(
      tap((response) => {
        // Зберігаємо отримані дані про користувача
        this.userData = response;
        console.log(this.userData);
      })
    );
  }

  getUserAvatar(): void {
    if (this.userData && this.userData.avatar_id !== null) {
      console.log(this.userData.id);
      this.avatarUrl = this.openApiService.getUserAvatar(this.userData);
    }
  }

  getUserPaymentMethods(): void {
    this.openApiService.getUserPaymentMethods().subscribe(
      (response) => {
      //  this.paymentMethods = response;
        console.log(this.paymentMethods);
      },
      (error) => {
        console.log('Error fetching payment methods:', error);
      }
    );
  }

  getUserTickets(): void {
    this.openApiService.getUserTickets().subscribe(
      (response) => {
       // this.reservations = response;
        console.log(this.reservations);
      },
      (error) => {
        console.log('Error fetching payment methods:', error);
      }
    );
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  saveData() {
    console.log(this.userData)
    const dataToUpdate = {
      first_name: this.userData.first_name,
      last_name: this.userData.last_name,
    }
    this.openApiService.updateUserProfile(dataToUpdate).subscribe(
      (response) => {
        this.userData = response;
        console.log('User data updated successfully:', this.userData);
        this.openAnnouncementPopup('User data updated successfully!');
      },
      (error) => {
        console.log('Error updating user information:', error);
        this.openAnnouncementPopup('Error updating user information.');
        this.getUserData();
      }
    );

    this.isEditing = false;
  }

  openAnnouncementPopup(message: string): void {
    const dialogRef = this.dialog.open(AnnouncementPopupComponent, {
      width: '100%',
      height: '100%',
      data: { message: message }
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('Announcement popup closed');
    });
  }

  changeAvatar() {
    // Перевірка, чи вибрано файли
    const dialogRef = this.dialog.open(SetAvatarPopupComponent,
      {width: '100%', height: '100%'});

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result !== 'cancel') {
        this.files = result;
        if (this.files && this.files.length > 0) {
          // Отримання першого вибраного файлу
          const file = this.files[0];
          const reader = new FileReader();

          reader.onload = (e: any) => {
            // Конвертація файлу у base64
            const base64Image = e.target.result;
            const dialogRef = this.dialog.open(PasswordConfirmationPopupComponent,
              {width: '100%', height: '100%'});

            dialogRef.afterClosed().subscribe((result) => {
              if (result && result !== 'cancel') {

                this.openApiService.updateUserAvatar(base64Image, result).subscribe(
                  (response) => {
                    this.getUserAvatar();
                    this.openAnnouncementPopup('Avatar changed successfully!');
                  },
                  (error) => {
                    console.error('Помилка при встановленні аватара:', error);
                    this.openAnnouncementPopup('Incorrect password');
                  }
                );
              } else {
                this.openAnnouncementPopup('Password confirmation canceled.');
              }
            });
          };

          reader.readAsDataURL(file);
        } else {
          console.warn('No file selected.');
        }
      } else {
        this.openAnnouncementPopup('Changing avatar canceled.');
      }
    });
  }

  handleFileInput($event: Event) {
    // @ts-ignore
    this.files = $event.target.files;
  }

  formatStartTime(start_time: any) {
    // Перевіряємо, чи start_time є числом
    if (typeof start_time === 'number') {
      // Створюємо новий об'єкт Date, передаючи start_time (припускаючи, що це час в секундах)
      const startTimeDate = new Date(start_time * 1000); // множимо на 1000, оскільки час в мілісекундах

      // Форматуємо час у зрозумілий формат (наприклад, "Година:Хвилина:Секунда")
      const formattedTime = startTimeDate.toLocaleString(); // використовуємо toLocaleString() для отримання локалізованого часу

      // Повертаємо отриманий результат
      return formattedTime;
    } else {
      // Якщо start_time не є числом, повертаємо порожній рядок
      return "";
    }
  }

  showTicketInfo(ticket: any) {
    let message = '<p>Event name: ' + ticket.event.name + '</p>'+
                          '<p>Category: ' + ticket.event.category + '</p>'+
                          '<p>City ' + ticket.event.city + '</p>'+
                          '<p>Plan name:' + ticket.plan.name + '</p>'+
                          '<p>Price: ' + ticket.plan.price + 'UAH</p>';


    const dialogRef = this.dialog.open(AnnouncementPopupComponent, {
      width: '100%', height: '100%',
      data: { message: message } // Тут ви можете передати інформацію про квиток
    });
  }
}
