import { Component, computed, inject, signal } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogTemplate, MatButtonModule, TranslatePipe } from 'hmdm-ui-kit';

export type TOrphanedFilesDialogData = {
  customerName: string;
  files: string[];
};

/**
 * Shows the orphaned files of a customer as a check-list (all checked by default)
 * and asks whether to delete them.
 * Closes with the checked file names if the user agrees, `undefined` otherwise.
 */
@Component({
  selector: 'core-orphaned-files-dialog',
  templateUrl: './orphaned-files-dialog.html',
  styleUrl: './orphaned-files-dialog.scss',
  imports: [DialogTemplate, MatButtonModule, MatCheckbox, TranslatePipe],
})
export class OrphanedFilesDialog {
  private readonly dialogRef = inject(MatDialogRef<OrphanedFilesDialog, string[]>);
  data: TOrphanedFilesDialogData = inject(MAT_DIALOG_DATA);

  readonly selected = signal(new Set(this.data.files));
  readonly allSelected = computed(() => this.selected().size === this.data.files.length);
  readonly someSelected = computed(() => this.selected().size > 0 && !this.allSelected());

  toggle(file: string, checked: boolean): void {
    const next = new Set(this.selected());
    if (checked) {
      next.add(file);
    } else {
      next.delete(file);
    }
    this.selected.set(next);
  }

  toggleAll(checked: boolean): void {
    this.selected.set(new Set(checked ? this.data.files : []));
  }

  onSave(): void {
    this.dialogRef.close(this.data.files.filter((file) => this.selected().has(file)));
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
