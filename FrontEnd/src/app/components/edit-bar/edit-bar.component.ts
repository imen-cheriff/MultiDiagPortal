import { CommonModule } from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';


@Component({
  selector: 'app-edit-bar',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './edit-bar.component.html',
  styleUrls: ['./edit-bar.component.scss']
})
export class EditBarComponent {

  @Input() selectedElement: any;
  @Input() readonly: boolean = false;
  @Input() editDisabled: boolean = false;
  @Input() saveDisabled: boolean = false;
  @Input() newDisplayed: boolean = true;
  @Input() deleteDisplayed: boolean = true;
  @Input() saveTooltip: string = '';

  @Output() editClicked: EventEmitter<void> = new EventEmitter();
  @Output() saveClicked: EventEmitter<void> = new EventEmitter();
  @Output() cancelClicked: EventEmitter<void> = new EventEmitter();
  @Output() newClicked: EventEmitter<void> = new EventEmitter();
  @Output() deleteClicked: EventEmitter<void> = new EventEmitter();

  edit() {
    this.editClicked.emit();
  }

  save() {
    this.saveClicked.emit();
  }

  cancel() {
    this.cancelClicked.emit();
  }

  new() {
    this.newClicked.emit();
  }

  delete() {
    this.deleteClicked.emit();
  }
  
}