import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { Chatbot } from '../chatbot/chatbot';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, Chatbot, ConfirmDialog],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {}
