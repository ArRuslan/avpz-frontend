import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-announcement-popup',
  templateUrl: './announcement-popup.component.html',
  styleUrls: ['./announcement-popup.component.scss']
})
export class AnnouncementPopupComponent implements OnInit {
  message: string | undefined;

  constructor(
    private dialogRef: MatDialogRef<AnnouncementPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.message = this.data.message;
  }

  closePopup() {
    this.dialogRef.close();
  }
}
