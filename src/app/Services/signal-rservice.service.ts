import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel, HubConnectionState } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalRServiceService {
  private hubConnection: HubConnection | null = null;
  username: string = '';

  constructor() {}

  public createConnection(): void {
    // If connection is already established or in progress, do not create a new one
    if (this.hubConnection && (this.hubConnection.state === HubConnectionState.Connecting ||
        this.hubConnection.state === HubConnectionState.Connected)) {
      console.log('SignalR connection already established or in progress.');
      return;
    }

    // Stop existing connection if not disconnected
    if (this.hubConnection && this.hubConnection.state !== HubConnectionState.Disconnected) {
      this.hubConnection.stop().catch((err) => console.error('Error while stopping connection: ', err));
    }

    // Create a new connection
    this.hubConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7241/chat")
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR connection established.'))
      .catch(err => console.error('Error while starting connection: ', err));

    this.hubConnection.onclose((error) => {
      console.log('SignalR connection closed', error);
    });
  }

  public async ensureConnection(): Promise<void> {
    if (this.hubConnection) {
      // Handle connection states
      if (this.hubConnection.state === HubConnectionState.Connected) {
        return;
      } else if (this.hubConnection.state === HubConnectionState.Connecting) {
        return new Promise((resolve, reject) => {
          const checkConnection = () => {
            if (this.hubConnection && this.hubConnection.state === HubConnectionState.Connected) {
              resolve();
            } else if (this.hubConnection && this.hubConnection.state === HubConnectionState.Disconnected) {
              this.hubConnection.start()
                .then(() => resolve())
                .catch(err => reject(err));
            } else {
              setTimeout(checkConnection, 100);
            }
          };
          checkConnection();
        });
      } else {
        await this.hubConnection.start();
      }
    } else {
      throw new Error('No hub connection available.');
    }
  }

  public destroyConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().catch((err) => console.error('Error while stopping connection: ', err));
      this.hubConnection = null;
    }
  }

  public getConnection(): HubConnection | null {
    return this.hubConnection;
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === HubConnectionState.Connected;
  }

  public setHandlers(onReceiveMessage: (username: string, msg: string) => void): void {
    if (this.hubConnection) {
      this.hubConnection.on("ReceiveSpecificMessage", (username: string, msg: string) => {
        if (username !== 'You') { // Only handle messages from others
          onReceiveMessage(username, msg);
        }
      });
    }
  }

  public sendMessage(message: string): Promise<void> {
    if (this.isConnected()) {
      return this.hubConnection!.invoke('SendMessage', message)
        .catch(err => console.error('Error while sending message: ', err));
    } else {
      return Promise.reject('Connection is not established.');
    }
  }
}
