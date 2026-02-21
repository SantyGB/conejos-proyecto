import { Component, ViewChild, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import { RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    LayoutModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule

  ],
  templateUrl: './admin-panel.html',
  styleUrls: ['./admin-panel.scss']
})
export class AdminPanel implements OnInit {

  private observer = inject(BreakpointObserver);   // ← FIX REAL

  @ViewChild(MatSidenav, { static: true })
  sidenav!: MatSidenav;
logout(){
  
}
  ngOnInit(): void {

    this.observer.observe(['(max-width: 800px)']).subscribe(res => {

      if (res.matches) {
        this.sidenav.mode = 'over';
        this.sidenav.close();
      } else {
        this.sidenav.mode = 'side';
        this.sidenav.open();
      }

    });
  }
}
