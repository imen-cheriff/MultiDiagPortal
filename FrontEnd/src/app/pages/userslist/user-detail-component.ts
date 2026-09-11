import { CommonModule } from "@angular/common"
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { EditBarComponent } from "../../components/edit-bar/edit-bar.component"
import { UserslistComponent } from "./users-list.component"
import { UsersService } from "../../users.service"
import { MatDialog } from "@angular/material/dialog"
import { MatSnackBar } from "@angular/material/snack-bar"
import { User } from "../../models/user"
import { ConfirmDialogComponent } from "../../components/dialog/confirm/confirm-form-dialog.component"



@Component({
  selector: "app-user-detail",
  standalone: true,
  imports: [CommonModule, FormsModule, EditBarComponent],
  templateUrl: "./user-detail.component.html",
  styleUrls: ["./user-detail.component.scss"],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserDetailComponent implements OnChanges {

  constructor(
    private readonly userService: UsersService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  @Input() user: User | null = null
  @Output() newClicked: EventEmitter<void> = new EventEmitter()

  @ViewChild(UserslistComponent) usersListComponent!: UserslistComponent
  userActionEvent: EventEmitter<void> = new EventEmitter<void>()

  currentDetail: User | null = null
  readonly = true
  isCreatingUser = false

  errorMessage: string | undefined = '';
  successMessage: string = '';

  ngOnChanges() {
    if (this.user) {
      this.readonly = true
      this.currentDetail = { ...this.user }
      this.isCreatingUser = false
    }
  }

  edit() {
    this.readonly = false
 }

  cancel() {
    if (this.user) {
      this.readonly = true
      this.currentDetail = { ...this.user }
    } else {
      this.currentDetail = null
    }
    this.isCreatingUser = false
  }

  async newUser() {
    this.isCreatingUser = true
    this.readonly = false
    this.currentDetail = {
      username: "",
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      dateofbirth: undefined,
      phone: undefined,
      country: "",
      role: "",
      locked: false,
    }
    this.newClicked.emit()
  }

  async save() {
    if (!this.currentDetail) return;
  
    const isUpdate = !!this.user;
    const dialogMessage = isUpdate
      ? "Are you sure you want to edit this user?"
      : "Are you sure you want to create this user?";
  
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: "Confirmation", message: dialogMessage, type: "confirm" },
      width: "400px",
      panelClass: "confirmation-dialog",
    });
  
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return; // Ensure nothing happens if cancel is clicked
  
      const token = localStorage.getItem("token");
      if (!token) {
        this.showError("Authentication token not found");
        return;
      }
  
      try {
        if (isUpdate && this.user?.id) {
          await this.userService.updateUser(this.user.id, this.currentDetail, token);
          this.snackBar.open('User updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['custom-snackbar'],
          });
        } else {
          await this.userService.register(this.currentDetail, token);
          this.snackBar.open('User created successfully', 'Close', {
            duration: 3000,
            panelClass: ['custom-snackbar'],
          });
        }
  
        this.readonly = true;
        this.updateUserList();
  
        if (!isUpdate) {
          this.isCreatingUser = false;
        }
      } catch (error: any) {
        console.error(`Error ${isUpdate ? "updating" : "creating"} user:`, error);
  
        // Check if the error is due to a duplicate username
        if (error.error?.error === "Username already exists") {
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              title: "Error",
              message: "The username already exists. Please choose a different username.",
              type: "error",
            },
            width: "400px",
            panelClass: "error-dialog",
          });
        } else {
          this.dialog.open(ConfirmDialogComponent, {
            data: {
              title: "Error",
              message: `Failed to ${isUpdate ? "update" : "create"} user. Please ensure all fields are valid.`,
              type: "error",
            },
            width: "400px",
            panelClass: "error-dialog",
          });
        }
      }
    });
  }

  delete(userId: number | undefined): void {
    if (!userId) return

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: "Confirmation", message: "Are you sure you want to delete this user?" },
      width: "400px",
      panelClass: "confirmation-dialog",
    })

    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) {
        return;
      }

      const token = localStorage.getItem("token")
      if (!token) {
        this.showError("Authentication token not found")
        return
      }

      try {
        await this.userService.deleteUser(userId, token)
        this.showSuccessMessage("User deleted successfully")
        this.currentDetail = null
        this.updateUserList()
      } catch (error) {
        console.error("Error deleting user:", error)
        this.showError("Failed to delete user")
      }
    })
  }

  updateUserList(): void {
    if (this.usersListComponent) {
      this.usersListComponent.getUsers();
    } else {
      console.error("UsersListComponent is not available");
    }
  }

  showSuccessMessage(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 3000,
      panelClass: ["success-snackbar"],
    })
  }

  showError(message: string) {
    this.errorMessage = message
    this.snackBar.open(message, "Close", {
      duration: 3000,
      panelClass: ["error-snackbar"],
    })

    setTimeout(() => {
      this.errorMessage = undefined
    }, 3000)
  }
}

