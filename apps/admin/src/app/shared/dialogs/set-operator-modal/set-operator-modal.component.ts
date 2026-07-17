import { Component, DestroyRef, inject, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ChangeStatusModalData } from "@shared/dialogs/change-status-modal/interfaces/change-status-modal";
import { InfiniteScrollDirective } from "@core/directives/infinite-scroll.directive";
import { IPaginate } from "@core/interfaces";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, map, switchMap, tap } from "rxjs/operators";
import { combineLatest, debounceTime, finalize } from "rxjs";

@Component({
  selector: 'em-set-operator-modal',
  standalone: true,
  imports: [InfiniteScrollDirective],
  templateUrl: './set-operator-modal.component.html',
  styleUrl: './set-operator-modal.component.scss'
})
export class SetOperatorModalComponent {
  isLoadingMore = signal(false);
  selectedStatus = signal<string>('');
  searchTerm = signal<string>('');
  searchPage = signal(1);
  dropdownStatusOpen = signal<boolean>(false);
  pagination: IPaginate | any;
  private page = 1;
  private hasNextPage = true;
  private users: { id: string; name: string }[] = [];
  private initialStatusId = '';
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private dialogRef: MatDialogRef<SetOperatorModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangeStatusModalData
  ) {
    this.initializeData();
    this.setupReactiveSearch();
  }

  get selectedOperatorName(): string {
    return this.users?.find(s => s.id === this.selectedStatus())?.name ?? 'Выберите пользователя';
  }

  get isUnchanged(): boolean {
    return this.selectedStatus() === this.initialStatusId;
  }

  get filteredUsers(): { id: string; name: string }[] {
    const term = this.searchTerm().toLowerCase().trim();
    return term
      ? this.users.filter(u => u.name.toLowerCase().includes(term))
      : this.users;
  }

  toggleStatusDropdown(): void {
    this.dropdownStatusOpen.update(open => !open);
  }

  selectStatus(statusId: string): void {
    this.selectedStatus.set(statusId);
    this.dropdownStatusOpen.set(false);
  }

  loadNextPage(): void {
    if (!this.isLoadingMore()) {
      this.searchPage.update(p => p + 1);
    }
  }

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
    this.searchPage.set(1);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close({
      selectedStatusId: this.selectedStatus(),
    });
  }

  private initializeData(): void {
    this.users = this.data.userOptions ?? [];
    this.page = 2;
    this.hasNextPage = true;
    this.initialStatusId = this.data.initialValues?.userId ?? '';
    this.selectedStatus.set(this.initialStatusId);
    this.pagination = {
      hasNextPage: this.hasNextPage
    };
  }

  private setupReactiveSearch(): void {
    const term$ = toObservable(this.searchTerm).pipe(
      map(term => term.trim()),
      debounceTime(300),
      distinctUntilChanged()
    );

    const page$ = toObservable(this.searchPage);

    combineLatest([term$, page$]).pipe(
      tap(() => this.isLoadingMore.set(true)),
      switchMap(([term, page]) =>
        this.data.loadUsers(page, term).pipe(
          finalize(() => this.isLoadingMore.set(false))
        )
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => {
      const isFirstPage = this.searchPage() === 1;

      if (isFirstPage) {
        this.users = [...result.users];
      } else {
        this.users.push(...result.users);
      }

      this.hasNextPage = result.hasNextPage;
      this.page = result.nextPage;
      this.pagination = {
        hasNextPage: result.hasNextPage
      };
    });
  }

}
