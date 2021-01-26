import { Injectable } from '@angular/core';

@Injectable()

export class PaginationService {
    //Pagination Variables

    tempPage: number = 0;
    pageField = [];
    exactPageList: any;

    constructor() {
    }

    // On page load
    pageOnLoad() {
        if (this.tempPage == 0) {

            this.pageField = [];
            for (var a = 0; a < this.exactPageList; a++) {
                this.pageField[a] = this.tempPage + 1;
                this.tempPage = this.tempPage + 1;
            }
        }
    }

}