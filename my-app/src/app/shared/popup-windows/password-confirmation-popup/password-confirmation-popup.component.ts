import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {OpenApiService} from "../../../services/open-api.service";
import {MyProfileComponent} from "../../../pages/my-profile/my-profile.component";

@Component({
  selector: 'app-password-confirmation-popup',
  templateUrl: './password-confirmation-popup.component.html',
  styleUrls: ['./password-confirmation-popup.component.scss']
})
export class PasswordConfirmationPopupComponent {

  constructor(private dialogRef: MatDialogRef<PasswordConfirmationPopupComponent>) { }
  enteredPassword: string | undefined;

  closePopup() {
    this.dialogRef.close();
  }

  confirmPassword() {
    // Відправте введений пароль назад до головного компонента
    this.dialogRef.close(this.enteredPassword);
  }
}
