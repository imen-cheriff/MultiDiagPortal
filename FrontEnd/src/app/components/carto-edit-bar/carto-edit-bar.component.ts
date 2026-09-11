import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-carto-edit-bar',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './carto-edit-bar.component.html',
  styleUrls: ['./carto-edit-bar.component.scss'],
})
export class CartoEditBarComponent {
  @Input() selectedElement: any;
  @Input() readonly: boolean = true;
  @Input() saveDisabled: boolean = false;
  @Input() editDisabled: boolean = false;
  @Input() newDisplayed: boolean = true;
  @Input() deleteDisplayed: boolean = true;
  @Input() saveTooltip: string = '';

  @Output() editClicked = new EventEmitter<void>();
  @Output() saveClicked = new EventEmitter<void>();
  @Output() cancelClicked = new EventEmitter<void>();
  @Output() newClicked = new EventEmitter<void>();
  @Output() deleteClicked = new EventEmitter<number>();
  @Output() importClicked = new EventEmitter<File>(); // New output for import
  @Output() exportClicked = new EventEmitter<void>(); // New output for export
  @Output() historyClicked = new EventEmitter<void>(); // New output for history

  @ViewChild('fileInput') fileInput!: ElementRef;

  onEditClick(): void {
    this.editClicked.emit();
  }

  onSaveClick(): void {
    this.saveClicked.emit();
  }

  onCancelClick(): void {
    this.cancelClicked.emit();
  }

  onNewClick(): void {
    this.newClicked.emit();
  }

  onDeleteClick(id: number): void {
    this.deleteClicked.emit(id);
  }

  onImportClick(): void {
    this.fileInput.nativeElement.click();
  }

  onExportClick(): void {
    this.exportClicked.emit();
  }

  onHistoryClick(): void {
    this.historyClicked.emit();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.importClicked.emit(file);
      // Reset the file input so the same file can be selected again
      this.fileInput.nativeElement.value = '';
    }
  }
}
