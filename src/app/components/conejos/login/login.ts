import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [FormsModule]
})
export class LoginComponent {

  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  login() {
    // validación básica
    if (this.email && this.password) {

      console.log('Login correcto');

      this.router.navigate(['/dashboard']);

    } else {
      alert('Completa los campos');
    }
  }
}