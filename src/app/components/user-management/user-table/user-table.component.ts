import { Component, inject, viewChild } from '@angular/core';
import { FhssTableComponent, makeTableConfig } from '@fhss-web-team/frontend-utils';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserEditComponent } from '../user-edit/user-edit.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TRPC_CLIENT } from '../../../utils/trpc.client';
import { UserCreateDialog } from '../user-create/user-create.dialog';

const ByuAccountType = {
  NonByu: 'NonByu',
  Student: 'Student',
  Employee: 'Employee',
  ServiceAccount: 'ServiceAccount',
} as const;

@Component({
  selector: 'fhss-user-table',
  imports: [
    FhssTableComponent,
    MatButtonModule,
    MatButtonToggleModule,
    FormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss',
})
export class UserTableComponent {
  readonly trpc = inject(TRPC_CLIENT);
  readonly dialog = inject(MatDialog);
  readonly tableConfig = makeTableConfig({
    procedure: this.trpc.userManagement.getUsers.mutate,
    columns: {
      id: { hide: true },
      netId: {
        header: 'Net ID',
        allowSort: true,
        individualFilter: true,
      },
      preferredName: {
        header: 'Name',
        allowSort: true,
        individualFilter: true,
      },
      accountType: { header: 'Account Type', allowSort: true },
      roles: { header: 'Roles' },
      createdAt: { header: 'Created', allowSort: true },
    },
    showSearch: true,
    sorting: {
      defaultSortBy: 'netId',
      defaultSortDirection: 'asc',
    },
    pagination: {
      pageSize: 10,
    },
    interaction: {
      type: 'click',
      onClick: data => {
        const editRef = this.dialog.open(UserEditComponent, { data: data.id });
        editRef.afterClosed().subscribe(action => {
          if (action === 'delete' && this.table().dataResource.value()?.data.length === 1) {
            this.table().pageIndex.set(0);
          } else if (action) {
            this.table().refresh();
          }
        });
      },
    },
  });

  table = viewChild.required(FhssTableComponent);

  createdAfter: Date | undefined;
  forceBefore = (d: Date | null): boolean => !d || !this.createdBefore || d < this.createdBefore;
  createdBefore: Date | undefined;
  forceAfter = (d: Date | null): boolean => !d || !this.createdAfter || d > this.createdAfter;

  readonly accountTypeOptions = Object.keys(ByuAccountType);
  selectedAccountTypes: string[] = [];

  openUserCreate() {
    const dialogRef = this.dialog.open(UserCreateDialog);
    dialogRef.afterClosed().subscribe(userId => {
      if (userId) {
        const ref = this.dialog.open(UserEditComponent, { data: userId });
        ref.afterClosed().subscribe(() => {
          this.table().refresh();
        });
      }
    });
  }
}
