import { ComponentRef, Type, ViewRef } from '@angular/core';

export interface ITab {
    header: string;
    uniqueCode: string;
    lastPageNumber: number;
    refreshButton(): any;
    label: string;
    content: ComponentRef<any> | null;
    view?: ViewRef,
    controlChange?: string
}

export interface ITabComponent {
    IsActive: boolean;
}

export interface MenuSelected {
    code: string;
    label?: string;
    canClose?: boolean;
    routerLink?(): any;
    idRef?: any;
    refreshButton?(): any;
    icon?: string;
    action?: string;
    targetTemplate?: string,

}
