import { Component } from '@angular/core';
import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';
import * as signalR from '@microsoft/signalr'; // Corrected import path
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
}
