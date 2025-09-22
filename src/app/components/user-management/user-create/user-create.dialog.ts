import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TRPC_CLIENT } from '../../../utils/trpc.client';
import { isTRPCClientError } from '@trpc/client';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-user-create',
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './user-create.dialog.html',
  styleUrl: './user-create.dialog.scss',
})
export class UserCreateDialog {
  readonly dialogRef = inject(MatDialogRef<UserCreateDialog>);
  readonly data = inject(MAT_DIALOG_DATA);
  readonly trpc = inject(TRPC_CLIENT);

  readonly netIdModel = viewChild.required('netIdInput', { read: NgModel });
  netId = signal('');
  isLoading = signal(false);

  async req() {
    try {
      this.isLoading.set(true);
      const user = await this.trpc.userManagement.createUser.mutate({
        netId: this.netId(),
      });
      this.dialogRef.close(user.id);
    } catch (err) {
      if (isTRPCClientError(err) && err.data.code === 'BAD_REQUEST') {
        this.netIdModel().control?.setErrors({ notFound: true });
      } else if (isTRPCClientError(err) && err.data.code === 'CONFLICT') {
        this.netIdModel().control?.setErrors({ conflict: true });
      } else {
        this.netIdModel().control?.setErrors({ unknown: true });
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
