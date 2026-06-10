// Dashboard TypeScript

declare const Cropper: any;

interface Task {
  id: number;
  titulo: string;
  descricao: string;
  dataInicio: Date;
  dataExpiracao: Date;
  status: "pending" | "in_progress" | "completed";
}

class Dashboard {
  private tasks: Task[] = [];
  private token: string | null = null;
  private selectedProfileImage: string | null = null;
  private cropper: any = null;

  constructor() {
    this.token = localStorage.getItem("token");
    if (!this.token) {
      window.location.href = "/login";
      return;
    }

    this.initializeEventListeners();
    this.loadUserInfo();
    this.loadTasks();
  }

  private initializeEventListeners(): void {
    // Create task modal
    const createTaskBtn = document.getElementById("createTaskBtn");
    const createTaskModal = document.getElementById("createTaskModal");
    const closeModal = document.getElementById("closeModal");
    const createTaskForm = document.getElementById(
      "createTaskForm",
    ) as HTMLFormElement;

    createTaskBtn?.addEventListener("click", () => {
      createTaskModal?.classList.add("active");
    });

    closeModal?.addEventListener("click", () => {
      createTaskModal?.classList.remove("active");
    });

    createTaskForm?.addEventListener("submit", (e) => this.handleCreateTask(e));

    // Settings modal
    const settingsBtn = document.getElementById("settingsBtn");
    const settingsModal = document.getElementById("settingsModal");
    const closeSettingsModal = document.getElementById("closeSettingsModal");
    const saveSettings = document.getElementById("saveSettings");

    settingsBtn?.addEventListener("click", () => {
      settingsModal?.classList.add("active");
      this.loadSettingsProfileImage();
    });

    closeSettingsModal?.addEventListener("click", () => {
      settingsModal?.classList.remove("active");
    });

    saveSettings?.addEventListener("click", () => this.handleSaveSettings());

    // Profile image upload
    const selectProfileImageBtn = document.getElementById(
      "selectProfileImageBtn",
    );
    const profileImageUpload = document.getElementById(
      "profileImageUpload",
    ) as HTMLInputElement;
    const removeProfileImageBtn = document.getElementById(
      "removeProfileImageBtn",
    );

    selectProfileImageBtn?.addEventListener("click", () => {
      profileImageUpload?.click();
    });

    profileImageUpload?.addEventListener("change", (e) =>
      this.handleProfileImageSelect(e),
    );

    removeProfileImageBtn?.addEventListener("click", () =>
      this.handleRemoveProfileImage(),
    );

    const confirmCropBtn = document.getElementById("confirmCropBtn");
    const cancelCropBtn = document.getElementById("cancelCropBtn");

    confirmCropBtn?.addEventListener("click", () => this.handleConfirmCrop());
    cancelCropBtn?.addEventListener("click", () => this.handleCancelCrop());

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn?.addEventListener("click", () => this.handleLogout());

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === createTaskModal) {
        createTaskModal?.classList.remove("active");
      }
      if (e.target === settingsModal) {
        settingsModal?.classList.remove("active");
      }
    });
  }

  private async loadUserInfo(): Promise<void> {
    // Fetch profile from database to get latest profile image and theme
    try {
      const response = await fetch("/api/client/profile", {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        // Update localStorage with latest data from database
        localStorage.setItem(
          "userName",
          profileData.nome || localStorage.getItem("userName") || "",
        );
        localStorage.setItem(
          "userEmail",
          profileData.email || localStorage.getItem("userEmail") || "",
        );
        localStorage.setItem("profileImage", profileData.profileImage || "");
        localStorage.setItem("theme", profileData.theme || "light");
      }
    } catch (error) {
      console.error("Error fetching profile from database:", error);
    }

    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");
    const profileImage = localStorage.getItem("profileImage");
    const theme = localStorage.getItem("theme") || "light";

    const userNameElement = document.getElementById("userName");
    const userEmailElement = document.getElementById("userEmail");
    const profileImageElement = document.getElementById(
      "profileImage",
    ) as HTMLImageElement;
    const defaultAvatarElement = document.getElementById("defaultAvatar");

    if (userNameElement && userName) {
      userNameElement.textContent = userName;
    }
    if (userEmailElement && userEmail) {
      userEmailElement.textContent = userEmail;
    }
    if (profileImageElement && defaultAvatarElement) {
      if (profileImage) {
        profileImageElement.src = profileImage;
        profileImageElement.style.display = "block";
        defaultAvatarElement.style.display = "none";
      } else {
        profileImageElement.style.display = "none";
        defaultAvatarElement.style.display = "block";
      }
    }

    // Apply theme from database
    document.documentElement.setAttribute("data-theme", theme);
  }

  private async loadTasks(): Promise<void> {
    try {
      const response = await fetch("/api/client/todos", {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        this.tasks = await response.json();
        this.renderTasks();
      } else {
        console.error("Failed to load tasks");
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  }

  private renderTasks(): void {
    const tasksContainer = document.getElementById("tasksContainer");
    if (!tasksContainer) return;

    tasksContainer.innerHTML = "";

    if (this.tasks.length === 0) {
      tasksContainer.innerHTML =
        '<p class="no-tasks">Nenhuma tarefa encontrada. Crie sua primeira tarefa!</p>';
      return;
    }

    this.tasks.forEach((task) => {
      const taskElement = this.createTaskElement(task);
      tasksContainer.appendChild(taskElement);
    });
  }

  private createTaskElement(task: Task): HTMLElement {
    const taskDiv = document.createElement("div");
    const statusClass = this.getTaskStatusClass(task);
    taskDiv.className = `task-card ${statusClass}`;

    const startDate = new Date(task.dataInicio).toLocaleDateString("pt-BR");
    const expiryDate = new Date(task.dataExpiracao).toLocaleDateString("pt-BR");

    taskDiv.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${task.titulo}</h3>
                <div class="task-actions">
                    <button class="task-action-btn complete-btn" data-id="${task.id}" title="Concluir">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </button>
                    <button class="task-action-btn delete-btn" data-id="${task.id}" title="Excluir">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <p class="task-description">${task.descricao}</p>
            <div class="task-dates">
                <span class="task-date">Início: ${startDate}</span>
                <span class="task-date">Expiração: ${expiryDate}</span>
            </div>
        `;

    // Add event listeners for task actions
    const completeBtn = taskDiv.querySelector(".complete-btn");
    const deleteBtn = taskDiv.querySelector(".delete-btn");

    completeBtn?.addEventListener("click", () =>
      this.handleCompleteTask(task.id),
    );
    deleteBtn?.addEventListener("click", () => this.handleDeleteTask(task.id));

    return taskDiv;
  }

  private getTaskStatusClass(task: Task): string {
    const now = new Date();
    const expiryDate = new Date(task.dataExpiracao);

    if (task.status === "completed") {
      return "task-completed"; // Green
    } else if (expiryDate < now) {
      return "task-expired"; // Red
    } else {
      return "task-pending"; // Blue
    }
  }

  private async handleCreateTask(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const taskData = {
      titulo: formData.get("taskName") as string,
      descricao: formData.get("taskFunction") as string,
      dataInicio: formData.get("taskStartDate") as string,
      dataExpiracao: formData.get("taskExpiryDate") as string,
    };

    try {
      const response = await fetch("/api/client/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const modal = document.getElementById("createTaskModal");
        modal?.classList.remove("active");
        form.reset();
        this.loadTasks();
      } else {
        alert("Erro ao criar tarefa");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Erro ao criar tarefa");
    }
  }

  private async handleCompleteTask(taskId: number): Promise<void> {
    try {
      const response = await fetch(`/api/client/todos/${taskId}/complete`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        this.loadTasks();
      } else {
        alert("Erro ao concluir tarefa");
      }
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Erro ao concluir tarefa");
    }
  }

  private async handleDeleteTask(taskId: number): Promise<void> {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) {
      return;
    }

    try {
      const response = await fetch(`/api/client/todos/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        this.loadTasks();
      } else {
        alert("Erro ao excluir tarefa");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Erro ao excluir tarefa");
    }
  }

  private handleSaveSettings(): void {
    const theme = (document.getElementById("theme") as HTMLSelectElement)
      ?.value;
    const language = (document.getElementById("language") as HTMLSelectElement)
      ?.value;

    localStorage.setItem("theme", theme);
    localStorage.setItem("language", language);

    // Apply theme
    document.documentElement.setAttribute("data-theme", theme);

    // Save theme and profile image to database
    this.saveProfileSettings();

    const modal = document.getElementById("settingsModal");
    modal?.classList.remove("active");
  }

  private loadSettingsProfileImage(): void {
    const profileImage = localStorage.getItem("profileImage");
    const profileImagePreview = document.getElementById("profileImagePreview");
    const previewImg = document.getElementById(
      "previewImg",
    ) as HTMLImageElement;

    if (profileImage && profileImagePreview && previewImg) {
      previewImg.src = profileImage;
      profileImagePreview.style.display = "block";
    } else if (profileImagePreview) {
      profileImagePreview.style.display = "none";
    }
  }

  private handleProfileImageSelect(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        
        const cropperContainer = document.getElementById("cropperContainer");
        const cropperImage = document.getElementById("cropperImage") as HTMLImageElement;
        const profileImagePreview = document.getElementById("profileImagePreview");

        if (cropperContainer && cropperImage) {
          cropperImage.src = base64;
          cropperContainer.style.display = "block";
          if (profileImagePreview) profileImagePreview.style.display = "none";
          
          if (this.cropper) {
            this.cropper.destroy();
          }
          
          this.cropper = new Cropper(cropperImage, {
            aspectRatio: 1,
            viewMode: 1,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  private handleConfirmCrop(): void {
    if (this.cropper) {
      const canvas = this.cropper.getCroppedCanvas({
        width: 200,
        height: 200
      });
      this.selectedProfileImage = canvas.toDataURL("image/jpeg");
      
      const previewImg = document.getElementById("previewImg") as HTMLImageElement;
      const profileImagePreview = document.getElementById("profileImagePreview");
      const cropperContainer = document.getElementById("cropperContainer");
      
      if (previewImg) previewImg.src = this.selectedProfileImage!;
      if (profileImagePreview) profileImagePreview.style.display = "block";
      if (cropperContainer) cropperContainer.style.display = "none";
      
      this.cropper.destroy();
      this.cropper = null;
    }
  }

  private handleCancelCrop(): void {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
    const cropperContainer = document.getElementById("cropperContainer");
    if (cropperContainer) cropperContainer.style.display = "none";
    
    const profileImageUpload = document.getElementById("profileImageUpload") as HTMLInputElement;
    if (profileImageUpload) profileImageUpload.value = "";
  }

  private handleRemoveProfileImage(): void {
    this.selectedProfileImage = "";
    const profileImagePreview = document.getElementById("profileImagePreview");
    const previewImg = document.getElementById(
      "previewImg",
    ) as HTMLImageElement;
    const profileImageUpload = document.getElementById(
      "profileImageUpload",
    ) as HTMLInputElement;

    if (profileImagePreview) {
      profileImagePreview.style.display = "none";
    }
    if (previewImg) {
      previewImg.src = "";
    }
    if (profileImageUpload) {
      profileImageUpload.value = "";
    }
  }

  private async saveProfileSettings(): Promise<void> {
    const theme = localStorage.getItem("theme") || "light";

    // Only send profileImage if user selected a new one
    const body: { theme: string; profileImage?: string } = { theme };
    if (this.selectedProfileImage !== null) {
      body.profileImage = this.selectedProfileImage;
    }

    try {
      const response = await fetch("/api/client/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        if (this.selectedProfileImage !== null) {
          localStorage.setItem("profileImage", this.selectedProfileImage || "");
          this.selectedProfileImage = null;
        }
      } else {
        alert("Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Error saving profile settings:", error);
      alert("Erro ao salvar configurações");
    }
  }

  private async saveProfileImage(): Promise<void> {
    try {
      const response = await fetch("/api/client/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ profileImage: this.selectedProfileImage }),
      });

      if (response.ok) {
        localStorage.setItem("profileImage", this.selectedProfileImage || "");
        this.loadUserInfo();
        this.selectedProfileImage = null;
      } else {
        alert("Erro ao salvar imagem de perfil");
      }
    } catch (error) {
      console.error("Error saving profile image:", error);
      alert("Erro ao salvar imagem de perfil");
    }
  }

  private handleLogout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("profileImage");
    window.location.href = "/login";
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new Dashboard();
});
