import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    selector: 'app-skeleton-card',
    standalone: true,
    imports: [SkeletonModule],
    template: `<div >
                <div class="flex mb-3">
                    <p-skeleton shape="circle" size="4rem" styleClass="mr-2" />
                    <div>
                        <p-skeleton width="10rem" styleClass="mb-2" />
                        <p-skeleton width="5rem" styleClass="mb-2" />
                        <p-skeleton height=".5rem" />
                    </div>
                </div>
                <p-skeleton width="100%" height="150px" />
                <div class="flex justify-content-between mt-3">
                    <p-skeleton width="4rem" height="2rem" />
                    <p-skeleton width="4rem" height="2rem" />
                </div>
            </div>`
})
export class SkeletonCardComponent {

}
