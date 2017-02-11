import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import { AngularFireModule } from 'angularfire2';

// Must export the config
export const firebaseConfig = {
    apiKey: 'AIzaSyDfLcVX0b6WcrC8e4Gd8DSbVcinHt1YH-k',
    authDomain: 'task-popoca.firebaseapp.com',
    databaseURL: 'https://task-popoca.firebaseio.com',
    storageBucket: 'task-popoca.appspot.com',
    messagingSenderId: '433987010305'
};

import {AppComponent} from './app.component';

import {FiltroListadoPipe} from './app.component'
@NgModule({
    declarations: [
        AppComponent,
        FiltroListadoPipe
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AngularFireModule.initializeApp(firebaseConfig)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
