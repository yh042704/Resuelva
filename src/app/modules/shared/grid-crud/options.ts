import { exportDataGrid } from 'devextreme/excel_exporter';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';
import _ from 'lodash';
import moment from 'moment';
import { Command, DispatchShared, optionsMenu, registerCommand } from '../../shared/options';

const commands: any = {}
export function Dispatch(this: any, name: string, instance: any = null, eventAfterAction: any = null, showMessage: boolean = true) {
    DispatchShared.call(this, commands, name, instance, eventAfterAction, showMessage)
}

export const GenerateOptionsMenu = (addNewMenu: optionsMenu[] | null = null) => {
    if (addNewMenu)
        addNewMenu.forEach((optionMenu: optionsMenu) => registerCommand(commands, optionMenu.nameMenu, optionMenu.callBack))
    else {
        registerCommand(commands, 'save', SaveCommand);
        registerCommand(commands, 'add', AddRowCommand);
        registerCommand(commands, 'About', AboutCommand);
        registerCommand(commands, 'filter', FilterCommand);
        registerCommand(commands, 'Attach', AttachCommand);
        registerCommand(commands, 'cancel', CancelCommand);
        registerCommand(commands, 'refresh', RefreshCommand);
        registerCommand(commands, 'cancel1', Cancel1Command);
        registerCommand(commands, 'exportxlsx', ExportxlsxCommand);
        registerCommand(commands, 'Clearfilter', ClearfilterCommand);
        registerCommand(commands, 'columnchooser', ColumnchooserCommand);
    }
}

const AddRowCommand: Command = function (this: any) {
    this.form?.clear();

    let DTO = {};
    for (let i = 0; i < this.gridParamCrud.columnsRecords.length; i++)
        if (this.gridParamCrud.columnsRecords[i].dataField != undefined && (this.gridParamCrud.columnsRecords[i].editVisible || this.gridParamCrud.columnsRecords[i]?.editVisible === undefined) && this.gridParamCrud.columnsRecords[i]?.default !== undefined)
            DTO = { ...DTO, [this.gridParamCrud.columnsRecords[i].dataField]: this.gridParamCrud.columnsRecords[i].default };

    if (this.editFormsTemplate || this.gridParamCrud.createUrl !== '')
        this.NoPageComponent.set(2);

    this.isNewElement = true;
    this.selectedRecord = DTO;
    this.disabledCancelEdit = false;
    this.gridParamCrud.onBeforeEdit(this.selectedRecord, this.isNewElement);
    this.settingFormInstance();
};

const RefreshCommand: Command = function (this: any) {
    this.dataSource?.reload();
};

const ClearfilterCommand: Command = function (this: any, instance: any) {
    instance?.clearFilter();
};

const FilterCommand: Command = function (this: any, instance: any) {
    instance?.option("filterRow.visible", !instance.option("filterRow.visible"));
};

const ColumnchooserCommand: Command = function (this: any, instance: any) {
    instance?.showColumnChooser();
};

const AttachCommand: Command = function () {
    // alert('Attach');
};

const AboutCommand: Command = function () {
    // alert('About');
};

const SaveCommand: Command = async function (this: any, instance: any, eventAfterAction: any, showMessage: boolean) {
    if (this.form === undefined) {
        await this.settingFormInstance();
        this.notifications.showMessage('Se está inicializando el formulario intente nuevamente...', 'error');

        return;
    }

    let responseValidation: any;
    const validationResultIsValid = (this.form === undefined ? true : this.form.validate().isValid);
    if (validationResultIsValid) {
        const onValidate = this.gridParamCrud.onValidateSave(this.selectedRecord, this.isNewElement);
        responseValidation = onValidate instanceof Promise ? await onValidate : onValidate;
    }

    if (Array.isArray(responseValidation)) {
        const [valid, message] = responseValidation;
        if (!valid) {
            if (Array.isArray(message))
                this.notifications.showSummaryError(message);
            else if (message !== '')
                this.notifications.showMessage(message, 'error');

            return;
        }
    } else if (!responseValidation) {
        this.notifications.showMessage('El formulario tiene algunas inconsistencias, favor verificar', 'error');

        return;
    }

    this.loadingVisible = true;
    let resultOperation: any = undefined;
    if (this.isNewElement) {
        if (this.gridParamCrud.createUrl !== '')
            resultOperation = this.dataSource?.store().insert(this.selectedRecord);
    } else {
        if (this.gridParamCrud.updateUrl !== '')
            resultOperation = this.dataSource?.store().update(0, this.selectedRecord);
    }

    if (resultOperation !== undefined) {
        return resultOperation.then(async (data: any) => {
            if (data !== undefined) {
                if (showMessage)
                    this.notifications.showMessage(data?.message ?? "Registro " + (this.isNewElement ? 'creado' : 'actualizado') + " satisfactoriamente", 'success');

                setTimeout(async () => {
                    if (this.isNewElement) {
                        if (this.NoPageComponent() !== 0 && !(this.selectedRecord?.callOnBeforeEdit ?? false))
                            this.onButtonClick('cancel1');
                        else
                            this.isNewElement = false;

                        await this.dataGrid()?.instance.refresh(true);
                    }
                    // else
                    //     this.dataGrid()?.instance.refresh();

                    //Actualizar las propiedad de tipo array y que el tipo sea un objeto
                    Object.entries(data.result).forEach(([key, value]) => {
                        if (Array.isArray(value))
                            if (value.length > 0)
                                if (typeof value[0] === 'object' && value[0] !== null) {
                                    const newValues = value.filter((x: any) => x?.action !== 'del');
                                    this.selectedRecord[key] = _.merge(this.selectedRecord[key], newValues);
                                }
                    });

                    if (data.result[this.gridParamCrud.key] !== undefined && this.NoPageComponent() === 0 || (this.selectedRecord?.callOnBeforeEdit ?? false))
                        this.selectedRecord[this.gridParamCrud.key] = data.result[this.gridParamCrud.key];

                    if ((this.selectedRecord?.callOnBeforeEdit ?? false))
                        data.callOnBeforeEdit = this.selectedRecord.callOnBeforeEdit

                    if (!this.isNewElement && (this.selectedRecord?.callOnBeforeEdit ?? false))
                        this.gridParamCrud.onBeforeEdit(data, this.isNewElement);

                    if (eventAfterAction != null && eventAfterAction?.actionValue !== undefined)
                        eventAfterAction.actionValue();
                }, 0);
            } else
                this.notifications.showMessage(JSON.stringify(JSON.parse(data).errors), 'error');
        }).catch((error: Error) => { })
            .done(() => {
                this.loadingVisible = false;
            });
    } else {
        setTimeout(() => {
            if (this.isNewElement) {
                if (this.NoPageComponent() !== 0)
                    this.onButtonClick('cancel1');
                else
                    this.isNewElement = false;

                this.dataGrid()?.instance.refresh(true);
            }
        }, 0);

        this.loadingVisible = false;
    }
};

const CancelCommand: Command = function (this: any, instance: any, eventAfterAction: any, showMessage: boolean) {
    if (!this.gridParamCrud.onValidateCancel(this.selectedRecord, this.isNewElement)) {
        this.notifications.showMessage('El formulario tiene algunas inconsistencias, favor verificar', 'error');

        return;
    }

    this.dataGrid()?.instance.refresh(true);
    Dispatch.call(this, 'cancel1', instance, eventAfterAction, showMessage);
};


const Cancel1Command: Command = function (this: any) {
    setTimeout(() => {
        this.selectedRecord = undefined;
        this.isNewElement = false;

        if (this.NoPageComponent() > 0)
            this.NoPageComponent.set(1);
    }, 0);
};

const ExportxlsxCommand: Command = function (this: any, instance: any) {
    if (instance?.totalCount() === 0) return;

    if (this.customFunctionExport === undefined) {
        this.loadingVisibleExport = true;
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet('GridData');

        exportDataGrid({
            component: instance,
            worksheet,
            autoFilterEnabled: true,
        }).then(() => {
            worksheet.columns.forEach(column => {
                const lengths: number[] = column.values === undefined ? [25] : column.values.map(v => (v ?? '').toString().length);
                const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
                column.width = maxLength;
            })

            workbook.xlsx.writeBuffer().then((buffer) => {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'DataGrid.xlsx');
            });
        }).finally(() => this.loadingVisibleExport = false);
    } else {
        const exportDataExcel = new Promise((resolve, reject) => {
            this.loadingVisibleExport = true;
            if (this.customFunctionExport !== undefined) {
                if ((this.customArrayDatasource()?.length ?? 0) > 0)
                    this.customFunctionExport(this.customArrayDatasource(), resolve, reject);
                else
                    this.customFunctionExport(this.filterDatagrid, resolve, reject);
            }
        });

        exportDataExcel.catch((error) => this.notifications.showMessage(error, 'error')).finally(() => this.loadingVisibleExport = false);
    }
};

export const basicRulesetToODataFilter = (ruleset: any) => {
    return ruleset.rules.map((rule: any) => {
        if (rule.rules)
            return "(" + basicRulesetToODataFilter(rule) + ")";

        let column = rule.field, operator, value, customColumn = '';
        if (column.includes('/any(')) {
            let splitColumn = column.split('@');
            [customColumn, column] = splitColumn;
        };

        switch (rule.operator) {
            case "=":
                operator = 'eq';
                value = valueToSQL(Array.isArray(rule.value) ? rule.value[0] : rule.value);
                break;
            case "!=":
                operator = 'ne';
                value = valueToSQL(rule.value);
                break;
            case ">":
                operator = 'gt';
                value = valueToSQL(rule.value);
                break;
            case ">=":
                operator = 'ge';
                value = valueToSQL(rule.value);
                break;
            case "<":
                operator = 'lt';
                value = valueToSQL(rule.value);
                break;
            case "<=":
                operator = 'le';
                value = valueToSQL(rule.value);
                break;
            case "contains":
                operator = '';
                value = "(contains(tolower(" + column + ")," + valueToSQL(rule.value) + "))";
                column = '';

                break;
            case "is null":
            case "is not null":
                operator = rule.operator;
                value = "";
                break;
            case "in":
            case "not in":
                operator = rule.operator;
                if (Array.isArray(rule.value) && rule.value.length)
                    value = "(" + rule.value.map(valueToSQL).filter(isDefined).join(", ") + ")";

                if (operator.startsWith('not')) {
                    operator = 'in';
                    column = 'not(' + column;
                    value = value + ')';
                }
                break;
            default:
                operator = rule.operator;
                value = valueToSQL(rule.value);
                break;
        }

        if (isDefined(column) && isDefined(value) && isDefined(operator)) {
            if (customColumn !== '') {
                value = customColumn + column + " " + operator + " " + value + ')';
                operator = '';
                column = '';
            }

            return (column + " " + operator + " " + value).trim();
        } else {
            return undefined;
        }
    }).filter(isDefined).join(" " + ruleset.condition + " ");
}

const valueToSQL = (value: any, onlyDate: boolean = true) => {
    switch (typeof value) {
        case 'object':
            if (moment(value, 'YYYY-MM-DD LT', true).isValid() && !onlyDate)
                return "'" + moment(value).format("YYYYMMDD HH:mm") + "'"
            else if (moment(value, 'YYYY-MM-DD', true).isValid())
                return moment(value).format("YYYY-MM-DD") + "Z"

            return null;
        case 'string':
            return "'" + value + "'";
        case 'boolean':
            return value ? 'true' : 'false';
        case 'number':
            if (isFinite(value)) return value;
    }

    return null;
}

const isDefined = (value: any) => {
    return value !== undefined;
}

export const convertOData = (fieldName: string, operator: string, value: any) => {
    switch (operator) {
        case "=":
            operator = 'eq';
            break;
        case "!=":
            operator = 'ne';
            break;
        case ">":
            operator = 'gt';
            break;
        case ">=":
            operator = 'ge';
            break;
        case "<":
            operator = 'lt';
            break;
        case "<=":
            operator = 'le';
            break;
    }

    return operator === 'contains' ? `contains(${fieldName}, '${value}')` : (fieldName + " " + operator + " " + valueToSQL(value, false));
}
