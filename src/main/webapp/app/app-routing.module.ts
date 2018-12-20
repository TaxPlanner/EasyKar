import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { errorRoute, navbarRoute } from './layouts';
import { DEBUG_INFO_ENABLED } from './app.constants';

const LAYOUT_ROUTES: Routes = [navbarRoute, ...errorRoute];

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                ...LAYOUT_ROUTES,
                {
                    path: 'pages',
                    loadChildren: './main/pages/pages.module#PagesModule'
                },
                {
                    path: 'admin',
                    loadChildren: './admin/admin.module#EazykarAdminModule'
                }
            ],
            { useHash: true, enableTracing: DEBUG_INFO_ENABLED }
        )
    ],
    exports: [RouterModule]
})
export class EazykarAppRoutingModule {
}
