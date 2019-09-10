import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LeafletService {

  constructor() { }

  getLeafletMaps(): Promise<any>  {
    const win = window as any;
    // console.log('win:', win);
    // console.log('win.google:', win.google);
    // const googleModule = win.google;
    // if (googleModule && googleModule.maps) {
    //   return Promise.resolve(googleModule.maps);
    // }

    return new Promise((resolve, reject) => {

      const link = document.createElement('link');
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.3.0/dist/leaflet.css";
      document.body.appendChild(link);

      const script = document.createElement('script');
      script.src = "https://unpkg.com/leaflet@1.3.0/dist/leaflet.js";
      document.body.appendChild(script);

      script.onload = () => {
        console.log('win:', win);
        console.log('win.L:', win.L);
        if (win.L) {
          resolve(win.L);
        } else {
          reject('Leaflet maps not available');
        }        
      };
    })
  }

    //   // const apiKey = 'AIzaSyB8pf6ZdFQj5qw7rc_HSGrhUwQKfIe9ICw';
    //   const script = document.createElement('script');
    //   // script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=3.31`;
    //   script.src = this.map_js_url + '?appid=' + this.appid;
    //   // script.async = true;
    //   // script.defer = true;
    //   document.body.appendChild(script);
    //   script.onload = () => {
    //     console.log('win(2):', win);
    //     console.log('win.google(2):', win.google);
    //     console.log('win.Y:', win.Y);
    //     // const googleModule2 = win.google;
    //     // if (googleModule2 && googleModule2.maps) {
    //     //   resolve(googleModule2.maps);
    //     if (win.Y) {
    //       resolve(win.Y);
    //     } else {
    //       reject('Yahoo maps not available');
    //     }
    //   };
    // });
  // }

}
