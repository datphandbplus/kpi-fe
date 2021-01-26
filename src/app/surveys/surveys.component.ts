import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {EmloyeeService} from '../_services';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators/catchError';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {switchMap} from 'rxjs/operators/switchMap';
import {ModalService} from "../modal/modal.service";

// @ts-ignore
@Component({
    templateUrl: 'surveys.component.html',
    styleUrls: ['surveys.component.css']
})

export class SurveysComponent implements AfterViewInit {
    displayedColumns = ['id', 'name', 'description', 'action'];
    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort, {}) sort: MatSort;
    resultsLength = 0;
    search: '';
    loading: boolean = false;
    selectedSurvey: any;

    categoriesPerPage: any = 10;
    pageSizeOptions: number[] = [5, 10, 15, 20, 25, 50, 100];

    assessments: any[] = [];
    user: any = {};

    constructor(public service: EmloyeeService, private modalService: ModalService) {
        this.dataSource.sort = this.sort;
        this.user = JSON.parse(localStorage.getItem('currentUser'));
    }


    getAllSurveys() {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.loading = true;
                    return this.service.getSurveys(this.sort.active, this.sort.direction, this.paginator.pageIndex + 1, this.paginator.pageSize, this.search);
                }),
                map(data => {
                    this.loading = false;
                    return data;
                }),
                catchError(() => {
                    this.loading = false;
                    return observableOf([]);
                })
            ).subscribe((data: any) => {
            if (data.data) {
                this.dataSource.data = data.data.surveys;
                this.resultsLength = data.data.totalItems;
            }
        });
    }

    ngAfterViewInit() {
        this.getAllSurveys();
    }

    public checkSearch(event: KeyboardEvent) {
        if (event.key.toLowerCase() === 'enter') {
            this.getAllSurveys();
        }
    }

    openSurvey(survey: any) {
        this.selectedSurvey = JSON.parse(JSON.stringify(survey));
        this.openModal('survey-info');
    }

    updateSurvey() {
        const formData = {
            id: this.selectedSurvey.id,
            name: this.selectedSurvey.name,
            description: this.selectedSurvey.description
        };
        this.service.updateSurvey(formData).subscribe(() => {
            location.reload(true);
        });
        this.closeModal('survey-info');
    }

    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.selectedSurvey = undefined;
        this.modalService.close(id);
    }
}