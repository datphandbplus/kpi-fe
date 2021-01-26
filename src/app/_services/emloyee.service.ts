import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {config} from '../../config';
const options = {
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://kpi.dbplus.com.vn:3001',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, Access_Token, x-access-toke',
        'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT,DELETE'
    }
};

// @ts-ignore
@Injectable({providedIn: 'root'})

export class EmloyeeService {
    constructor(private http: HttpClient) {
    }

    getAll(sort: string = '', order: string = '', offset: number = 1, limit: number = 5, search: string = '', filter: string = '') {
        let url = `${config.apiUrl}/employees?${EmloyeeService.createUrlQuery({sort: {field: sort, order: order}, pagination: { offset, limit }, search, filter})}`;
        return this.http.get(url, options);
    }

    updateEmployee(data) {
        let url = `${config.apiUrl}/employees/update`;
        return this.http.post(url, data, options);
    }

    updateSurvey(data) {
        let url = `${config.apiUrl}/employees/surveys/update`;
        return this.http.post(url, data, options);
    }

    getEmployeesAssessmentList(sort: string = '', order: string = '', offset: number = 1, limit: number = 5, search: string = '', filter: string = '') {
        let url = `${config.apiUrl}/employees/employees_assessment_list?${EmloyeeService.createUrlQuery({sort: {field: sort, order: order}, pagination: { offset, limit }, search, filter})}`;
        return this.http.get(url, options);
    }

    getAssessmentServey(year: number = (new Date()).getFullYear()) {
        //assessment_servey
        let url = `${config.apiUrl}/employees/assessment_survey?assessment_year=${year}`;
        return this.http.get(url, options);
    }

    getAssessmentServeyByUserId(userId: number, year: number = (new Date()).getFullYear()) {
        //assessment_servey by user id
        let url = `${config.apiUrl}/employees/assessment_survey/${userId}?assessment_year=${year}`;
        return this.http.get(url, options);
    }

    getDepartments() {
        let url = `${config.apiUrl}/employees/departments`;
        return this.http.get(url, options);
    }


    sendEmail(departmentId: number = 6) {
        let url = `${config.apiUrl}/mail/send-email/${departmentId}`;
        return this.http.get(url, options);
    }

    sendEmails(emails: string = '') {
        let url = `${config.apiUrl}/mail/send-emails?emails=${emails}`;
        return this.http.get(url, options);
    }

    getSurveys(sort: string = '', order: string = '', offset: number = 1, limit: number = 5, search: string = '') {
        //assessment_servey
        let url = `${config.apiUrl}/employees/surveys?${EmloyeeService.createUrlQuery({sort: {field: sort, order: order}, pagination: { offset, limit }, search})}`;
        return this.http.get(url, options);
    }

    submitUserAssessments(data) {
        let url = `${config.apiUrl}/employees/assessment_survey_submit`;
        return this.http.post(url, data, options);
    }

    static createUrlQuery(params: any) {
        if (!params) {
            return "";
        }

        let offset;
        let limit;
        let field;
        let order;
        let query: any = {};
        if (params.pagination) {
            offset = params.pagination.offset;
            limit =  params.pagination.limit;
            query.offset = offset;
            query.limit = limit;
        }
        if (params.sort) {
            field = params.sort.field;
            order = params.sort.order;
            if (field && order) {
                query.sort = field;
                query.order = order;
            }
            else {
                query.sort = 'id';
                query.order = 'ASC';
            }
        }
        query.search = params.search;
        if (params.filter) {
            query.filter = params.filter;
        }
        let result: string = '';
        const keys: string[] = Object.keys(query);
        for (let i = 0; i < keys.length; i++) {
            result += `${(i !==0 ) ? '&' : ''}${keys[i]}=${query[keys[i]]}`;
        }
        return result;
    }
}