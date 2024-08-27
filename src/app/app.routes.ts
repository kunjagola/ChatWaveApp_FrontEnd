import { Routes } from '@angular/router';
import { ChatroomComponent } from './Components/chatroom/chatroom.component';
import { WaitingroomComponent } from './Components/waitingroom/waitingroom.component';

export const routes: Routes = [
    {path:'', component:WaitingroomComponent},
    {path:'chat-room',component:ChatroomComponent}
];
