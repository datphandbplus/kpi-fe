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
import {ExcelService} from "../_helpers/excel.service";
import {TableUtil} from "../_helpers/tableUtils";
import {ModalService} from "../modal/modal.service";

// @ts-ignore
@Component({
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.css']
})

export class HomeComponent implements AfterViewInit {
    displayedColumns = ['emp.id', 'emp.full_name', 'emp.email', 'dp.name', 'status', 'sa.assessment_year', 'employees'];
    dataSource: MatTableDataSource<any> = new MatTableDataSource();
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort, {}) sort: MatSort;
    resultsLength = 0;
    search: '';
    loading: boolean = false;
    departments: any[] = [];
    selectDepartment: number = -1;
    employeesPerPage: any = 50;
    pageSizeOptions: number[] = [5, 10, 15, 20, 25, 50, 100];
    assessmentsData: any;
    assessments: any[] = [];
    expands: boolean[] = [];
    year: number = (new Date()).getFullYear();
    user: any = {};
    listable: boolean = true;
    itemSurveyIndex: number = 0;
    itemSurveyIndexInfo: number = 0;
    totalSurveys: number = 0;
    totalSurveysInfo: number = 0;
    ending: boolean = false;
    selectedAssessmentSurvey: any;

    tutorials: any[] = [
        {
            value: '1-4',
            kind: 'Không đạt',
            description: 'Không đạt. Đi ngược lại văn hóa của công ty.'
        },
        {
            value: '5',
            kind: 'Trung bình',
            description: 'Trung bình. Bạn hiểu và đáp ứng được yêu cầu cơ bản của các chỉ tiêu.'
        },
        {
            value: '6-7',
            kind: 'Khá',
            description: 'Khá. Bạn đáp ứng được yêu cầu của chỉ tiêu và <strong><i style="color: #d86a1a">luôn có tinh thần bảo vệ giá trị văn hóa công ty.</i></strong>'
        },
        {
            value: '8-9',
            kind: 'Tốt',
            description: 'Tốt. <strong><i style="color: #d86a1a">Trong công việc bạn luôn đặt giá trị văn hóa công ty lên hàng đầu. Sẵn sàng lên án những hành vi trái với giá trị văn hóa của công ty.</i></strong>'
        },
        {
            value: '10',
            kind: 'Xuất sắc',
            description: 'Xuất sắc. <strong><i style="color: #d86a1a">Bạn vượt các chỉ tiêu đề ra. Bạn thường xuyên khơi gợi cho đồng nghiệp phát huy hết tinh thần làm việc theo đúng giá trị cốt lõi của công ty.</i></strong>'
        }
    ];

    constructor(public service: EmloyeeService, public excelService: ExcelService, private modalService: ModalService) {
        this.dataSource.sort = this.sort;
        this.user = JSON.parse(localStorage.getItem('currentUser'));
        if (this.user.roles.indexOf('admin') === -1) {
            this.listable = false;
        }
    }

    public getAllEmployees() {
        const filter = +this.selectDepartment !== -1 ? ('dp.id:' + this.selectDepartment) : '';
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        merge(this.sort.sortChange, this.paginator.page)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.loading = true;
                    return this.service.getEmployeesAssessmentList(this.sort.active, this.sort.direction, this.paginator.pageIndex + 1, this.paginator.pageSize, this.search, filter);
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
            } else {
                this.listable = false;
            }
        });
    }


    ngAfterViewInit() {
        if (this.user.roles.indexOf('admin') !== -1) {
            this.service.getDepartments().subscribe((data: any) => {
                this.departments = data.data || [];
                this.selectDepartment = -1;
            });
            this.getAllEmployees();
        }
        this.service.getAssessmentServey(this.year).subscribe((res: any) => {
            this.assessmentsData = res.data.items;
            this.expands = [];
            if (this.assessmentsData.assessments && this.assessmentsData.assessments.length) {
                this.totalSurveys = this.assessmentsData.assessments.length;
                for (let i = 0; i < this.assessmentsData.assessments.length; i++) {
                    this.expands.push(true);
                }
            }
        });
    }

    public romanize(num) {
        if (isNaN(num))
            return NaN;
        var digits = String(+num).split(""),
            key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
                "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
                "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
            roman = "",
            i = 3;
        while (i--)
            roman = (key[+digits.pop() + (i * 10)] || "") + roman;
        return Array(+digits.join("") + 1).join("M") + roman;
    }

    public previous() {
        this.itemSurveyIndex--;
        if (this.itemSurveyIndex <= 0) {
            this.itemSurveyIndex = 0;
        }
    }

    public previousInfo() {
        this.itemSurveyIndexInfo--;
        if (this.itemSurveyIndexInfo <= 0) {
            this.itemSurveyIndexInfo = 0;
        }
    }

    public next() {
        this.itemSurveyIndex++;
        if (this.itemSurveyIndex > this.assessmentsData.assessments.length - 1) {
            if (this.checkCanSubmit())
            this.submitAssessment();
        }
    }

    public nextInfo() {
        this.itemSurveyIndexInfo++;
        if (this.itemSurveyIndexInfo >= this.selectedAssessmentSurvey.assessments.length - 1) {
            this.itemSurveyIndexInfo = this.selectedAssessmentSurvey.assessments.length - 1;
        }
    }

    public checkSearch(event: KeyboardEvent) {
        if (event.key.toLowerCase() === 'enter') {
            this.getAllEmployees();
        }
    }

    public checkCanSubmit() {
        let check: boolean = false;
        for (let i = 0; i < this.assessmentsData.assessments.length; i++) {
            const survey: any = this.assessmentsData.assessments[i];
            for (let j = 0; j < survey.users.length; j++) {
                if (!survey.users[j].has_assessment) {
                    check = true;
                    break;
                }
            }
        }
        return (this.itemSurveyIndex < this.assessmentsData.assessments.length - 1) || check;
    }

    public submitAssessment() {
        const result: any[] = [];
        for (let i = 0; i < this.assessmentsData.assessments.length; i++) {
            const survey: any = this.assessmentsData.assessments[i];
            for (let j = 0; j < survey.users.length; j++) {
                const data: any = survey.users[j];
                const item: any = {
                    employee_id: +data.by,
                    survey_id: +survey.id,
                    assessment_year: +this.year,
                    assessments: [{
                        by: this.user.id,
                        score: +data.score || 1,
                        comment: data.comment || '',
                        has_assessment: true
                    }]
                };
                result.push(item);
            }
        }
        if (result.length > 0) {
            const formData = {
                data: result
            };
            this.service.submitUserAssessments(formData).subscribe(() => {
                // xu ly ket thuc danh gia
                // BAN DA HOAN THANH DANH GIA
                this.ending = true;
            });
        }
    }

    public stringify(item: any) {
        const content: any[] = item.employees || [];
        let result = '<div class="mygod">';
        content.forEach((ct: any) => {
            if (ct.id !== item.employee_id) {
                result += ((result) ? '' : '<br>') + ' - <strong>[' + ct.title + ']:</strong><br>';
                if (ct.surveys) {
                    ct.surveys.forEach((sv: any, ind: number) => {
                        result += `   + Title: ${sv.survey}  -  Score: ${sv.score}  -  Comment: ${sv.comment}<br>`;
                    });
                }
            }
        });
        result += '</div>'
        return result;
    }

    public genScores(max: number) {
        const result = [];
        for (let i = 0; i <= max; i++) {
            result.push(i);
        }
        return result;
    }

    public exportExcel() {
        const filter = +this.selectDepartment !== -1 ? ('dp.id:' + this.selectDepartment) : '';
        this.service.getEmployeesAssessmentList('dp.id', 'ASC', 0, this.resultsLength, this.search, filter)
            .subscribe((dataItem: any) => {
                if (dataItem.data) {
                    const data = dataItem.data.employees;
                    const headerSettings = [];
                    const titles: string[] = [];
                    const sheetNames = [];
                    const fileName = 'KPI_Report';
                    const exportDatas: any[] = [];
                    const temp: any[] = data.map((d: any) => {
                        return {
                            id: d.department_id,
                            name: d.department_name
                        };
                    });
                    const depts: any[] = [];
                    temp.forEach((t: any) => {
                        if (depts.length < 1 || (depts.map((dp: any) => dp.id).indexOf(t.id) === -1)) {
                            depts.push(t);
                        }
                    });
                    depts.forEach((dep: any) => {
                        titles.push('Thông tin');
                        sheetNames.push(dep.name);
                        const headerItem: any = {
                            header: [['STT', 'Họ Tên', 'Email', 'Phòng Ban'], ['', '', '', '']],
                            noData: 'Không có số liệu',
                            numOfRows: 2,
                            fgColor: 'ffffff',
                            bgColor: '00245A'
                        };
                        const exportData: any[] = [];
                        const dataForLoop: any[] = data.filter((dt: any) => dt.department_id === dep.id && dt.assessment_year === this.year);
                        const dataForInfo: any = dataForLoop[0] || {};
                        const contentInfo: any[] = dataForInfo.employees || [];
                        contentInfo.forEach((ct: any, memIndex: number) => {
                            ct.surveys.forEach((sv: any, ind: number) => {
                                headerItem.header[0].push((ind === 0) ? TableUtil.convertFullname(ct.title) : '');
                                headerItem.header[1].push(sv.survey);
                            });
                        });
                        if (contentInfo[contentInfo.length - 1]) {
                            contentInfo[contentInfo.length - 1].surveys.forEach((sv: any, ind: number) => {
                                headerItem.header[0].push((ind === 0) ? 'Điểm Trung Bình' : '');
                                headerItem.header[1].push(sv.survey);
                            });
                            contentInfo[contentInfo.length - 1].surveys.forEach((sv: any, ind: number) => {
                                headerItem.header[0].push((ind === 0) ? 'Bằng Chứng' : '');
                                headerItem.header[1].push(sv.survey);
                            });
                        }
                        dataForLoop.forEach((item: any, index: number) => {
                            const dataItem: any[] = [];
                            dataItem.push(TableUtil.pad(index + 1, 2));
                            dataItem.push(TableUtil.convertFullname(item.full_name || ''));
                            dataItem.push(item.email || '');
                            dataItem.push(item.department_name || '');
                            //dataItem.push(this.stringifyForExcel(item));
                            const dataExpend: any[] = [];
                            const content: any[] = item.employees || [];
                            const avgs: string[] = [];
                            const comments: any[] = [];
                            if (content[content.length - 1]) {
                                content[content.length - 1].surveys.forEach((sv: any, ind: number) => {
                                    let avg: number = 0;
                                    let comment: any = {
                                        richText: []
                                    };
                                    content.forEach((ct: any) => {
                                        if (ct.id !== item.employee_id) {
                                            if (ct.surveys) {
                                                const item = ct.surveys.filter((svSub: any) => svSub.survey === sv.survey)[0];
                                                avg += item.score;
                                                comment.richText.push({
                                                    text: ' - ' + (item.comment || 'N/A') + '\n'
                                                });
                                            }
                                        }
                                    });
                                    avgs.push(TableUtil.getNumberFormatForExcel(avg / (content.length - 1), 2));
                                    comments.push(comment)
                                });
                            }
                            content.forEach((ct: any, memIndex: number) => {
                                ct.surveys.forEach((sv: any, ind: number) => {
                                    dataExpend.push(sv.score);
                                });
                            });
                            avgs.forEach(avg => {
                                dataExpend.push(avg)
                            });
                            comments.forEach(comment => {
                                dataExpend.push(comment)
                            });
                            dataExpend.forEach((dat: any) => {
                                dataItem.push(dat);
                            });
                            exportData.push(dataItem);
                        });
                        headerSettings.push(headerItem);
                        exportDatas.push(exportData);
                    });
                    this.excelService.exportArraysToExcel(
                        exportDatas,
                        titles,
                        headerSettings,
                        sheetNames,
                        fileName,
                        [],
                        []
                    );
                }
            });

    }

    public checkScores(itemSurveyIndex) {
        for(let staff of this.assessmentsData.assessments[itemSurveyIndex].users) {
            if (+staff.score < 1) {
                return false;
            }
        }
        return true;
    }

    public pad(num, size) {
        return TableUtil.pad(num, size);
    }

    public checkAssessment(emp: any) {
        const employees: any[] = emp.employees || [];
        let check: boolean = true;
        if (employees.length) {
            const findIndex = employees.map(s => +s.id).indexOf(+emp.employee_id);
            if (findIndex !== -1) {
                employees.splice(findIndex, 1);
            }
            employees.forEach((emp: any) => {
               emp.surveys.forEach((sv: any) => {
                  if (+sv.score < 1) {
                      check = false;
                      return;
                  }
               });
            });
        }
        return check;
    }

    public unAssessmentList(emp: any) {
        const employees: any[] = emp.employees || [];
        const result: string[] = [];
        if (employees.length) {
            const findIndex = employees.map(s => +s.id).indexOf(+emp.employee_id);
            if (findIndex !== -1) {
                employees.splice(findIndex, 1);
            }
            employees.forEach((emp: any) => {
                let check: boolean = true;
                emp.surveys.forEach((sv: any) => {
                    if (+sv.score < 1) {
                        check = false;
                    }
                });
                if (!check) {
                    let name = TableUtil.convertFullname(emp.title);
                    result.push('\t' + name);
                }
            });
        }
        return 'Những người chưa hoàn thành đánh giá:\n' + result.join('\n');
    }

    public convertFullname(name: string) {
        return TableUtil.convertFullname(name);
    }

    openEmployeeSurvey(emp: any) {
        this.service.getAssessmentServeyByUserId(emp.employee_id, this.year).subscribe((res: any) => {
            this.itemSurveyIndexInfo = 0;
            this.selectedAssessmentSurvey = res.data.items;
            if (this.selectedAssessmentSurvey.assessments && this.selectedAssessmentSurvey.assessments.length) {
                this.totalSurveysInfo = this.selectedAssessmentSurvey.assessments.length;
            }
            this.openModal('employee-survey-info');
        });
    }

    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.selectedAssessmentSurvey = undefined;
        this.modalService.close(id);
    }

}