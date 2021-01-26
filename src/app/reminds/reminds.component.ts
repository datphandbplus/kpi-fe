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
import {TableUtil} from "../_helpers/tableUtils";
import {SelectionModel} from '@angular/cdk/collections';
import {ModalService} from "../modal/modal.service";

// @ts-ignore
@Component({
    templateUrl: 'reminds.component.html',
    styleUrls: ['reminds.component.css']
})

export class RemindsComponent implements AfterViewInit {
    displayedColumns = ['select', 'emp.id', 'dp.name', 'emp.full_name', 'emp.email', 'emp.position', 'action'];
    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort, {}) sort: MatSort;
    resultsLength = 0;
    search: '';
    loading: boolean = false;
    selection = new SelectionModel<any>(true, []);
    departments: any[] = [];
    selectDepartment: number = -1;
    selectedEmployee: any;

    categoriesPerPage: any = 100;
    pageSizeOptions: number[] = [5, 10, 15, 20, 25, 50, 100];

    assessments: any[] = [];
    user: any = {};

    constructor(public service: EmloyeeService, private modalService: ModalService) {
        this.dataSource.sort = this.sort;
        this.user = JSON.parse(localStorage.getItem('currentUser'));
        try {
            this.paginator.page.subscribe(() => {
                this.selection.clear();
            });
        } catch (e) {
        }
    }

    getAll() {
        this.selection.clear();
        const filter = +this.selectDepartment !== -1 ? ('dp.id:' + this.selectDepartment) : '';
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.loading = true;
                    return this.service.getAll(this.sort.active, this.sort.direction, this.paginator.pageIndex + 1, this.paginator.pageSize, this.search, filter);
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
                this.dataSource.data = data.data.employees;
                this.resultsLength = data.data.totalItems;
            }
        });
    }

    ngAfterViewInit() {
        this.service.getDepartments().subscribe((data: any) => {
            this.departments = data.data || [];
            this.selectDepartment = -1;
        });
        this.getAll();
        this.closeModal('employee-info');
    }

    public checkSearch(event: KeyboardEvent) {
        if (event.key.toLowerCase() === 'enter') {
            this.getAll();
        }
    }

    public JSON(a: any) {
        return JSON.stringify(a);
    }

    public pad(num, size) {
        return TableUtil.pad(num, size);
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    sendEmails() {
        const emails: string[] = this.selection.selected.map((sl: any) => sl.email);
        if (emails.length < 1) {
            alert('Vui lòng chọn dữ liệu');
        }
        this.service.sendEmails(emails.filter(em => em).join(',')).subscribe(() => {
            alert('Đã gởi email thành công');
        });
    }

    openEmployee(emp: any) {
        this.selectedEmployee = JSON.parse(JSON.stringify(emp));
        this.openModal('employee-info');
    }

    updateEmployee() {
        const formData = {
            id: this.selectedEmployee.employee_id,
            full_name: this.selectedEmployee.full_name,
            email: this.selectedEmployee.email,
            position: this.selectedEmployee.position,
            department_id: this.selectedEmployee.department_id
        };
        this.service.updateEmployee(formData).subscribe(() => {
            location.reload(true);
        });
        this.closeModal('employee-info');
    }

    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.selectedEmployee = undefined;
        this.modalService.close(id);
    }

    public pageChange() {
        this.selection.clear();
    }
}