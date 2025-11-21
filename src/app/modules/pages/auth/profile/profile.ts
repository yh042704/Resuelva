import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from 'src/app/core/models/api.models';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export default class Profile implements OnInit {
  profileForm?: FormGroup;
  usuario: User | null = null;

  private authService: AuthService = inject(AuthService);
  private fb: FormBuilder = inject(FormBuilder);

  ngOnInit(): void {
    this.usuario = this.authService.getCurrentUser();

    this.profileForm = this.fb.group({
      userid: ['', [Validators.required, Validators.maxLength(200)]],
      email: ['', [Validators.maxLength(1000)]],
      name: ['', [Validators.maxLength(1000)]],
      phone: ['', [Validators.maxLength(1000)]],
      description: ['', [Validators.maxLength(1000)]],
    });

    setTimeout(() => {
      if (this.usuario)
        this.profileForm!.patchValue(this.usuario);

    }, 100);
  }
}
