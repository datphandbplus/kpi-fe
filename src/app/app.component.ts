import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from './_services';
import {ROLES} from "./_helpers/constants";

@Component({ selector: 'app', templateUrl: 'app.component.html' })
export class AppComponent {
    currentUser: any;
    sidebars: any[] = [];
    dropdowns: any[] = [];

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {
        this.sidebars = [
            {
                path: '/',
                title: 'Home',
                active: true
            },
            {
                path: '/#/surveys',
                title: 'Thiết lập',
                active: false
            },
            {
                path: '/#/reminds',
                title: 'Gởi Email',
                active: false
            }
        ];
        this.dropdowns = [
            {
                id: 0,
                path: '/',
                title: 'Đăng xuất'
            }
        ];
        this.authenticationService.currentUser.subscribe(x => {
            this.currentUser = x;
            if (this.currentUser) {
                if (this.currentUser.avatar) {
                    this.currentUser.avatar = 'https://api-lezo.dbplus.com.vn/' + this.currentUser.avatar;
                } else {
                    this.currentUser.avatar = './assets/icons/no-avatar.png';
                }
            }
        });
        this.initActivatedSidebar();
    }

    public initActivatedSidebar() {
        this.sidebars.forEach((sb: any) => {
            sb.active = false;
        });
        if (location.href.endsWith('reminds')) {
            this.sidebars[2].active = true;
        } else if (location.href.endsWith('surveys')) {
            this.sidebars[1].active = true;
        } else {
            this.sidebars[0].active = true;
        }
    }

    public logout() {
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }

    public selectSidebar(sidebar: any) {
        this.sidebars.forEach((sb: any) => {
           sb.active = false;
        });
        sidebar.active = true;
        window.location.href = '.' + sidebar.path;
    }

    public selectDropdown(dropdown: any) {
        if (dropdown.id === 0) {
            this.logout();
        }
    }

    public checkAdmin() {
        if (this.currentUser.roles &&
            (this.currentUser.roles.indexOf(ROLES.ADMIN) !== -1 || this.currentUser.roles.indexOf(ROLES.MANAGER) !== -1)
        ) {
            return true;
        }
        return false;
    }
}