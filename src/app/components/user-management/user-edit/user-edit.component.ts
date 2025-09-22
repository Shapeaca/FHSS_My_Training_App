import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  ConfirmationDialog,
  trpcResource,
} from '@fhss-web-team/frontend-utils';
import { TRPC_CLIENT } from '../../../utils/trpc.client';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Permission, PERMISSIONS, Role, ROLES } from '../../../../security';

@Component({
  selector: 'fhss-user-edit',
  imports: [
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    DatePipe,
    TitleCasePipe,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss',
})
export class UserEditComponent {
  readonly trpc = inject(TRPC_CLIENT);
  readonly dialog = inject(MatDialog);
  readonly dialogRef = inject(MatDialogRef<UserEditComponent>);
  readonly userId: string | undefined = inject(MAT_DIALOG_DATA);

  userResource = trpcResource(
    this.trpc.userManagement.getUser.mutate,
    () => ({ userId: this.userId ?? '' }),
    { autoRefresh: true },
  );

  blockInteraction = computed(
    () => !this.user() || this.userResource.isLoading(),
  );

  user = computed(() => this.userResource.value());

  displayName = computed(() => {
    const user = this.user();
    if (!user) {
      if (this.userResource.isLoading()) {
        return 'loading...';
      }
      return 'Not found';
    }
    return `${user.preferredFirstName ?? user.firstName} ${user.preferredLastName ?? user.lastName}`;
  });

  fullName = computed(() => {
    const user = this.user();
    if (!user) return '';
    return `${user.firstName}${user.middleName ? ` ${user.middleName}` : ''} ${user.lastName}${user.suffix ? ` ${user.suffix}` : ''}`;
  });


  deleteUser() {
    const user = this.user();
    if (!user) {
      return;
    }

    const confirmationRef = this.dialog.open(ConfirmationDialog, {
      data: { action: `delete the user "${this.displayName()}"` },
    });
    confirmationRef.afterClosed().subscribe(async (yes) => {
      if (yes) {
        try {
          await this.trpc.userManagement.deleteUser.mutate({ userId: user.id });
          this.dialogRef.close('delete');
        } catch (error) {
          console.error(error);
        }
      }
    });
  }

  hasMadeUpdate = signal(false);
  readonly allRoles = ROLES;
  readonly allPermissions = PERMISSIONS;
  isEditingAccess = signal(false);
  saveAccess() {
    try {
      this.trpc.userManagement.setAccess.mutate({
        userId: this.user()!.id,
        roles: this.user()!.roles as Role[],
        permissions: this.user()!.permissions as Permission[],
      });
      this.isEditingAccess.set(false);
      this.hasMadeUpdate.set(true);
    } catch (err) {
      console.error(err);
    }
  }
}
