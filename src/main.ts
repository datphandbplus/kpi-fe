import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';

if (!(window as any).Zone) {
    // @ts-ignore
    require('zone.js/dist/zone');
}
// Add favicon to <head>
const link: HTMLLinkElement = document.createElement( 'link' );
link.rel = 'icon';
link.type = 'image/x-icon';
link.href = './assets/icons/favicon.ico';
document.head.appendChild( link );
platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then(() => {
    })
    .catch(err => console.error(err));