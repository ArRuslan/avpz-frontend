import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-set-avatar-popup',
  templateUrl: './set-avatar-popup.component.html',
  styleUrls: ['./set-avatar-popup.component.scss']
})
export class SetAvatarPopupComponent {
  files: FileList | undefined;

  constructor(private dialogRef: MatDialogRef<SetAvatarPopupComponent>) { }

  closePopup() {
    this.dialogRef.close();
  }

  saveAvatar() {
    this.dialogRef.close(this.files);
  }

  handleFileInput($event: Event) {
    // @ts-ignore
    this.files = $event.target.files;
  }
}
