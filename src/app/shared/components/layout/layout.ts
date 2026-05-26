import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../footer/footer';
import { Chatbot } from '../chatbot/chatbot';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, Chatbot],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {}
