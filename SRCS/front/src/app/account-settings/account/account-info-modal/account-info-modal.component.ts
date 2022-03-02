import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {NgForm} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {User} from "../../../shared/user";
import {NotifierService} from "angular-notifier";

@Component({
  selector: 'account-info-modal',
  templateUrl: 'account-info-modal.component.html',
  styleUrls: ['account-info-modal.component.scss']
})
export class AccountInfoModalComponent {

  @Input() modal: NgbActiveModal;
  @Input() user: User;
  @Output() save = new EventEmitter<{ nickname: NgForm,  avatar: HTMLInputElement}>();

  @ViewChild('avatarUpload') avatarUpload: ElementRef;

  private _maxImageSize = 3 * 1024 * 1024;

  imgSrc: string;
  constructor(private notifierService: NotifierService) {
  }

  ngOnInit() {
    this.imgSrc = this.user.img;
  }

  saveAccountInfo(accountInfoForm: NgForm) {
    this.save.emit({nickname: accountInfoForm, avatar: this.avatarUpload.nativeElement});
  }


  readURL(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file && file.size > this._maxImageSize) {
      this.notifierService.notify('error', 'max image size is 3   MB')
    } else if (file) {
      const reader = new FileReader();
      reader.onload = e => this.imgSrc = (reader.result as string);
      reader.readAsDataURL(file);
    }
  }

}
