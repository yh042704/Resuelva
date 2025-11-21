import { NgIf } from '@angular/common';
import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, } from '@angular/core';

import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

import { SkeletonCardComponent } from '@shared/skeleton-card/skeleton-card.component';

@Component({
    standalone: true,
    selector: 'app-reportViewer',
    templateUrl: './reportViewer.component.html',
    imports: [NgIf, NgxExtendedPdfViewerModule, SkeletonCardComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export default class ReportViewerComponent implements OnInit {
    @Input() pdfLoaded: boolean = false;
    @Input() reportB64!: string;

    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit() { }

    onEvent(parameter: string, e: any) { }

    triggerChangeDetection() {
        this.cd.markForCheck();
      }
}
