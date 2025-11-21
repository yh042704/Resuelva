import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    selector: 'app-skeleton',
    standalone: true,
    imports: [SkeletonModule],
    template: `<div style="margin-top: 16px">
                <ul class="m-0 p-0 list-none">
                    @for(number of "1234567"; track number){
                    <li class="mb-3">
                        <div class="flex">
                            <p-skeleton shape="circle" size="4rem" styleClass="mr-2" />
                            <div style="flex: 1">
                                <p-skeleton width="100%" styleClass="mb-2" />
                                <p-skeleton width="75%" />
                            </div>
                        </div>
                    </li>
                    }
                </ul>
                </div>`
})
export class SkeletonComponent {

}
