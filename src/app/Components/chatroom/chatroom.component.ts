import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignalRServiceService } from '../../Services/signal-rservice.service';

@Component({
  selector: 'app-chatroom',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.css']
})
export class ChatroomComponent implements OnInit {
  messages: { username: string; msg: string }[] = [];
  newMessage: string = '';
  connectionLogs: string = '';

  constructor(private router: Router, private signalRService: SignalRServiceService) {}

  ngOnInit(): void {
    // Retrieve state passed from WaitingroomComponent or another source
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { messages: { username: string; msg: string }[] };
    if (state) {
      this.messages = state.messages;
    }

    this.signalRService.setHandlers((username: string, msg: string) => {
      this.messages.push({ username, msg });
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.signalRService.sendMessage(this.newMessage)
        .then(() => {
          // this.messages.push({ username: 'You', msg: this.newMessage });
          this.newMessage = ''; // Clear input field
        })
        .catch(err => this.connectionLogs += `Error while sending message: ${err}\n`);
    }
  }
}
