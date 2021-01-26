import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { routing } from './app.routing';

import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { HomeComponent } from './home';
import { LoginComponent } from './login';
import {PaginationService} from "./_services/pagination.service";

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTabsModule} from "@angular/material/tabs";
import {MatSliderModule} from "@angular/material/slider";
import {SurveysComponent} from "./surveys";
import {RemindsComponent} from "./reminds";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {ModalComponent} from "./modal/modal.component";
import { CKEditorModule } from 'ngx-ckeditor';
import {SafeHtmlPipe} from "./safe-html.pipe";
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

@NgModule({
    exports: [
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatTooltipModule,
        MatTooltipModule,
        MatSortModule,
        MatPaginatorModule,
        MatDialogModule,
        MatFormFieldModule
    ]
})
@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        HttpClientModule,
        routing,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatTooltipModule,
        MatTooltipModule,
        MatSortModule,
        MatPaginatorModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatSliderModule,
        MatCheckboxModule,
        CKEditorModule
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        SurveysComponent,
        RemindsComponent,
        ModalComponent,
        SafeHtmlPipe
    ],
    providers: [
        PaginationService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        {provide: LocationStrategy, useClass: HashLocationStrategy}
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }