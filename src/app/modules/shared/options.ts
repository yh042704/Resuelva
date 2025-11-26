import dxToolbar from "devextreme/ui/toolbar";
import Guid from 'devextreme/core/guid';

export const generateUUID = () => {

    return new Guid().toString();
};

export interface Command {
    (this: any, instance: any, eventAfterAction: any, showMessage: boolean): any
}

export type optionsMenu = { nameMenu: string, callBack: Command };

export const changeStatusEditButton = (instance?: dxToolbar) => {
    instance?.option('items')!.forEach((button: any) => {
        if (button?.validation !== undefined)
            button.visible = button.validation();

        if (button.options?.validation !== undefined)
            button.options.visible = button.options.validation();
    });

    instance?.repaint();
}

export const registerCommand = (commands: any, name: string, callback: Command) => {
    // if (commands[name]) commands[name].push(callback)
    // else
    commands[name] = [callback]
}

export function DispatchShared(this: any, commands: any, name: string, instance: any, eventAfterAction: any, showMessage: boolean) {
    commands[name]?.forEach?.((fn: Command) => fn?.call(this, instance, eventAfterAction, showMessage))
}
