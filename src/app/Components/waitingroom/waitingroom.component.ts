import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SignalRServiceService } from '../../Services/signal-rservice.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HubConnection } from '@microsoft/signalr';

@Component({
  selector: 'app-waitingroom',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './waitingroom.component.html',
  styleUrls: ['./waitingroom.component.css']
})
export class WaitingroomComponent {
  title = 'ChatWaveApp';
  connectionLogs: string = '';
  messages: { username: string; msg: string }[] = [];
  conn: HubConnection | null = null;

  constructor(private router: Router, private signalRService: SignalRServiceService) {}

  async joinChatRoom(username: string, chatRoom: string): Promise<void> {
    this.signalRService.createConnection();
    this.conn = this.signalRService.getConnection();

    if (this.conn) {
      this.signalRService.setHandlers((username: string, msg: string) => {
        this.connectionLogs += `Received message: ${msg}\n`;
        this.setMessages({ username, msg });
      });

      try {
        await this.waitForConnection();
        await this.signalRService.getConnection()?.invoke("joinSpecificChatRoom", { username, chatRoom });
        this.connectionLogs += 'Connection established and joined chat room.\n';
        this.router.navigate(['/chat-room'], {
          state: { messages: this.messages }
        });
      } catch (error) {
        this.connectionLogs += `Connection error: ${error}\n`;
      }
    } else {
      this.connectionLogs += 'SignalR connection not established.\n';
    }
  }

  private waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.signalRService.isConnected()) {
        resolve();
      } else {
        this.signalRService.getConnection()?.start()
          .then(() => resolve())
          .catch(err => reject(err));
      }
    });
  }

  setMessages(newMessage: { username: string; msg: string }): void {
    this.messages = [...this.messages, newMessage];
  }
}
