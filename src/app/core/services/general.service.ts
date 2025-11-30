import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { Observable, catchError, firstValueFrom, map, take, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IResponseWrapperDTO } from '../interfaces/responseWrapperDTO';
import { ResposeHandler } from '../utilities/responseHandler';

@Injectable({
  providedIn: 'root',
})
export class GeneralService {
  private urlEndpoint: string = environment.apiUrl;
  private http = inject(HttpClient);

  private httpConfigDefault: any = {
    'Accept': "application/json;odata=verbose,text/plain, */*; q=0.01",
    'pragma': 'no-cache',
    'cache-control': 'no-cache, no-store, must-revalidate',
    "Expires": '0',
    'Content-Encoding': "br,gzip,deflate",
    'Content-Type': 'application/json',
    'X-Tenant-Pais': localStorage.getItem('X-Tenant-Pais') ?? 'CR',
    'SMLV3': this.getSecurityLevel(),
    'SMLV4': this.getUser(),
    'Authorization': 'Bearer ' + (localStorage.getItem('token') ?? localStorage.getItem('access_token')),
  }

  private getSecurityLevel(): string {
    let numberSec = JSON.parse(sessionStorage.getItem('UserAssignment') ?? '{"SecurityLevel": "2"}').SecurityLevel;
    numberSec = Math.pow(parseInt(numberSec), 2);

    return btoa(numberSec.toString())
  }

  private getUser(): string {
    let numberSec = JSON.parse(sessionStorage.getItem('UserAssignment') ?? '{"UserId": "-1"}').UserId;

    return btoa(numberSec)
  }

  private httOptionsDefault: HttpHeaders = new HttpHeaders(this.httpConfigDefault);
  private httOptionsDefaultGeneric: HttpHeaders = this.httOptionsDefault.delete('Content-Type');

  private getHttpOptions(): HttpHeaders {
    return this.httOptionsDefault;
  }

  Get<T>(controller: string, action: string, queryParams?: HttpParams): Observable<T> {
    let path = controller + (action != "" ?  "/" + action : "");
    return this.http.get<IResponseWrapperDTO>(this.urlEndpoint + path, { params: queryParams, headers: this.getHttpOptions() }).pipe(
      take(1),
      map(response => ResposeHandler(response)),
      catchError(this.handleError)
    );
  }

  async GetFecth<T>(controller: string, action: string, queryParams?: HttpParams) {
    let path = controller + "/" + (action != "" ? action : "");
    if (queryParams ?? false)
      path += ('?' + queryParams?.toString());

    return fetch(this.urlEndpoint + path, {
      method: "GET",
      headers: this.httpConfigDefault
    })
      .then((response) => response.json())
      .then((dataResponse) => dataResponse.result)
      .catch(this.handleError);
  }

  GetWithPagination<T>(
    controller: string,
    action: string = '',
    queryParams?: HttpParams,
    pageNumber?: number,
    pageSize?: number
  ): Observable<T> {
    let path = controller + "/" + (action !== "" ? action : "");

    // Si se proporciona el número de página y el tamaño de la página, agréguelos a queryParams
    if (pageNumber != null && pageSize != null) {
      queryParams = queryParams || new HttpParams();
      queryParams = queryParams.append('pageNumber', pageNumber.toString());
      queryParams = queryParams.append('pageSize', pageSize.toString());
    }

    return this.http.get<IResponseWrapperDTO>(this.urlEndpoint + path, { params: queryParams, headers: this.getHttpOptions() }).pipe(
      take(1),
      map(response => this.ResponseHandler(response)),
      catchError(this.handleError)
    );
  }

  private ResponseHandler(response: IResponseWrapperDTO): any {
    return response;
  }

  GetODATA<T>(controller: string, queryParams?: HttpParams): Observable<T> {
    const path = controller + (queryParams?.toString().includes('?') ? '' : "?");

    return this.http.get<IResponseWrapperDTO>(this.urlEndpoint + path, { params: queryParams, headers: this.getHttpOptions() }).pipe(
      take(1),
      map(response => ResposeHandler(response)),
      catchError(this.handleError)
    );
  }

  Post<T>(controller: string, method: string, body: any, queryParams?: HttpParams, showSpinner: boolean = true): Observable<T> {
    // Obtener headers actualizados
    let httpHeaders = this.getHttpOptions();
    // Si el body es FormData, usa el conjunto de headers genérico, de lo contrario, usa httpHeaders
    httpHeaders = body instanceof FormData ? this.httOptionsDefaultGeneric : httpHeaders;
    // Agregar el header de Showspinner dinámicamente
    httpHeaders = httpHeaders.set('Showspinner', showSpinner.toString());
    let path = controller + "/" + (method != "" ? method  : "");
    return this.http.post<IResponseWrapperDTO>(this.urlEndpoint + path, body, { params: queryParams, headers: httpHeaders }).pipe(
      take(1),
      map(response => ResposeHandler(response)),
      catchError(this.handleError)
    )
  }

  Put<T>(controller: string, method: string, body: any, queryParams?: HttpParams, showSpinner: boolean = true): Observable<T> {
    // Obtener headers actualizados
    let httpHeaders = this.getHttpOptions();
    // Si el body es FormData, usa el conjunto de headers genérico, de lo contrario, usa httpHeaders
    httpHeaders = body instanceof FormData ? this.httOptionsDefaultGeneric : httpHeaders;
    // Agregar el header de Showspinner dinámicamente
    httpHeaders = httpHeaders.set('Showspinner', showSpinner.toString());

    let path = controller + "/" + (method != "" ? method  : "");
    return this.http.put<IResponseWrapperDTO>(this.urlEndpoint + path, body, { params: queryParams, headers: httpHeaders })
      .pipe(take(1),
        map(response => ResposeHandler(response)),
        catchError(this.handleError))
  }

  Delete<T>(controller: string, method: string, queryParams?: HttpParams, body?: any): Observable<T> {
    let path = controller + "/" + (method != "" ? method : "");
    return this.http.delete<IResponseWrapperDTO>(this.urlEndpoint + path, { body: body, params: queryParams, headers: this.getHttpOptions() })
      .pipe(take(1),
        map(response => ResposeHandler(response)),
        catchError(this.handleError))
  }

  loadFiles<T>(controller: string, method: string, body: any, queryParams?: HttpParams): Observable<T> {
    let path = controller + "/" + (method != "" ? method + "/" : "");
    return this.http.post<IResponseWrapperDTO>(this.urlEndpoint + path, body, { params: queryParams }).pipe(
      map(response => ResposeHandler(response)),
      catchError(this.handleError)
    )
  }


  DownloadFile<T>(controller: string, method: string): Observable<any> {
    let path = controller + "/" + (method != "" ? method + "/" : "");
    return this.http.get(this.urlEndpoint + path, { responseType: 'blob' }).pipe(
      map(response => response),
      catchError(this.handleError)
    )
  }

  sendWhatsappMessage(number: string, message: string) {

    return fetch('http://localhost:8001/v1/messages', {
      method: "POST",
      body: JSON.stringify({ number: number, message: message }),
      headers: { "Content-type": "application/json; charset=UTF-8", responseType: 'text' },
    })
  }

  async GetCarboneReport(reportBase64: string, reportCode: string, data: any) {

    return fetch(environment.apiReport, {
      method: "POST",
      body: JSON.stringify({ reportBase64: reportBase64, reportCode: reportCode, data: data }),
      headers: { "Content-type": "application/json; charset=UTF-8", responseType: 'text' },
    }).then((response) => response.text())
      .then((dataResponse) => {
        if (dataResponse.includes('ECONNREFUSED'))
          return Promise.reject('Servidor de reportes no está iniciado...')
        else
          return Promise.resolve(dataResponse);
      });
  }

  GetDatasourceList(controller: string, select: any[], orderBy: string, expand: any[] | undefined = undefined, customQuery: string = '', desc: boolean = true): ODataDatasourceList {

    return new ODataDatasourceList(this, controller, '', select, orderBy, customQuery, desc, '', expand);
  }

  GetDatasourceListCustomParameter(controller: string, select: any[], orderBy: string, desc: boolean = true, customParameter: string = '', customQuery: string = '', expand: any[] | undefined = undefined): ODataDatasourceList {

    return new ODataDatasourceList(this, controller, '', select, orderBy, customQuery, desc, customParameter, expand);
  }

  GetDatasourceListUsingMethod(controller: string, method: string, select: any[], orderBy: string, expand: any[] | undefined = undefined, customQuery: string = '', desc: boolean = true, customParameter: string = ''): ODataDatasourceList {

    return new ODataDatasourceList(this, controller, method, select, orderBy, customQuery, desc, customParameter, expand);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('Ha ocurrido un error:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Codigo retornado por el servidor ${error.status}, Error: `, error.error);
    }
    console.log(error);

    const message = (error?.error as any)?.message
    if (message === '')
      error.error.message = error.statusText;

    // Return an observable with a user-facing error message.
    // throw error;
    return throwError(() => (error?.error as any)?.message ?? error?.error);
    // return throwError(() => new Error('Algo salió mal; favor intente nuevamente más tarde.'));
  }

  handleMessageError(error: any) {
    if (error !== null) {
      let message = error.message;
      if (error.error?.Message !== undefined)
        message = error.error.Message.split('@@@')[0].replaceAll("'", '').replaceAll('"', '').replaceAll('`', '') + ' - ' + message;

      if (message?.errors === undefined)
        message = error.errors;

      if (message === undefined)
        message = error.Message;

      if (message === undefined)
        message = error;

      return message;
    }
  }

  getHTTPOptionsDefaults() {

    return this.getHttpOptions();
  }
}

class ODataDatasourceList {
  private select: any[] = [];
  private orderBy: string = '';
  private dsList?: DataSource;
  private lastSkip: number = 0;
  private controller: string = '';
  private method: string = '';
  private customParameter: string = '';
  private lastListResult: any[] = [];
  private selectedKey: any | undefined = undefined;
  private service?: GeneralService = undefined;

  customQuery: string = '';
  refreshData: boolean = false;
  lastQueryFilter: string = '';

  constructor(service: GeneralService, controller: string, method: string, select: any[], orderBy: string, customQuery: string, desc: boolean, customParameter: string, expand: any[] | undefined) {
    this.service = service;
    this.controller = controller;
    this.method = method;
    this.select = select;
    this.orderBy = orderBy + (desc ? ' desc' : '');
    this.customQuery = customQuery; //-----;
    this.customParameter = customParameter;

    this.dsList = new DataSource({
      pageSize: 20,
      paginate: true,
      useDefaultSearch: true,
      select: this.select,
      byKey: (key, loadOptions: any) => {
        const isString = typeof key === 'string' ? "'" : '';
        let resolve: any, reject;
        const dsPromise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        });

        if (key.toString() !== '-1' && key.toString() !== '0' && key.toString() !== '') {
          let stringParam: string = `$select=${loadOptions.select.join(',')}&$filter=${loadOptions.select[0]} eq ${isString}${key}${isString}`;
          if (expand !== undefined) stringParam += `&$expand=${expand.join(',')}`;
          if (this.customParameter !== '') stringParam += this.customParameter;

          const searchKey = this.lastListResult.filter((obj: any) => obj[0][loadOptions.select[0]] === key);
          if (searchKey.length !== 0)
            resolve(searchKey[0]);
          else if (this.refreshData)
            this.lastListResult = [];
          else {
            this.selectedKey = key;
            firstValueFrom(this.service!.GetODATA(this.controller + (this.method !== '' ? '\\' + this.method : ''), new HttpParams({ fromString: stringParam })))
              .then((searchValue: any) => {
                if (searchValue.length !== 0)
                  this.lastListResult.push(searchValue);

                resolve(this.lastListResult.at(-1));
              });
          }
        }

        // return this.lastListResult.at(-1);
        return dsPromise;
      },
      load: async (loadOptions: any) => {
        if (this.selectedKey !== undefined) {
          this.lastListResult = [];
          this.selectedKey = undefined;
        }

        let filters = loadOptions['filter'];
        if (filters !== undefined) {
          let [[fieldName]] = filters;

          if (!loadOptions.select.includes(fieldName) && expand === undefined) return [];
          this.lastQueryFilter = "&$filter=(" + this.valueTypeOfData(fieldName, filters[0][2]);
          for (let i = 1; i < filters.length; i++) {
            if (filters[i] === "or")
              this.lastQueryFilter += " or ";
            else {
              fieldName = filters[i][0];
              this.lastQueryFilter += (this.valueTypeOfData(fieldName, filters[i][2]));
            };
          }

          this.lastQueryFilter += this.customQuery + ")";
          this.lastListResult = [];
        } else
          if ((this.customQuery ?? '') !== '') this.lastQueryFilter = "&$filter=( 1 eq 1 " + this.customQuery + ")"

        if (this.lastQueryFilter === '' && this.customQuery !== '') this.lastQueryFilter = "&$filter=(1 eq 1" + this.customQuery + ")"

        if (this.lastSkip !== loadOptions.skip) this.lastListResult = [];
        if (this.lastListResult.length == 0) {
          if (loadOptions.skip === undefined || loadOptions.take === undefined) {
            loadOptions.skip = 0;
            loadOptions.take = 20;
          }

          this.lastSkip = loadOptions.skip;
          let stringParam = `$top=${loadOptions.take}&$skip=${loadOptions.skip}&$select=${loadOptions.select.join(',')}&$orderby=${this.orderBy}` + this.lastQueryFilter + this.customParameter;
          if (expand !== undefined) stringParam += `&$expand=${expand.join(',')}`;
          this.lastListResult = await firstValueFrom(this.service!.GetODATA(this.controller + (this.method !== '' ? '\\' + this.method : ''), new HttpParams({ fromString: stringParam })));;
        }

        return this.lastListResult;
      }
    });
  }

  private valueTypeOfData(fieldName: string, value: any) {
    switch (typeof value) {
      case 'string':
        return "(contains(tolower(" + fieldName + "),'" + value + "'))";
      case 'boolean':
        return fieldName + " eq " + (value ? 'true' : 'false');
      case 'number':
        if (isFinite(value)) return fieldName + " eq " + value;
    }

    return '';
  }

  public GetLastListResult(): any[] {

    return this.lastListResult
  }

  public GetSelectedKey(): any {

    return this.selectedKey
  }

  public GetDatasourceList(): DataSource {

    return this.dsList!;
  }
}
