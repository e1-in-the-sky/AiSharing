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

    if (win.L) {
      return new Promise((resolve, reject) => {
        resolve(win.L);
      });
    }

    return new Promise((resolve, reject) => {
      // leaflet
      const leaflet_link = document.createElement('link');
      leaflet_link.rel = "stylesheet";
      leaflet_link.href = "https://unpkg.com/leaflet@1.3.0/dist/leaflet.css";
      document.body.appendChild(leaflet_link);

      const leaflet_script = document.createElement('script');
      leaflet_script.src = "https://unpkg.com/leaflet@1.3.0/dist/leaflet.js";
      document.body.appendChild(leaflet_script);

      leaflet_script.onload = () => {
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

  getLeafletRouting(): Promise<any> {
    const win = window as any;

    if (win.L.Routing) {
      return new Promise((resolve, reject) => {
        resolve(win.L.Routing);
      });
    }

    return new Promise((resolve, reject) => {
      // leaflet-routing-machine
      const leaflet_routing_link = document.createElement('link');
      leaflet_routing_link.rel = "stylesheet";
      leaflet_routing_link.href = "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css";
      document.body.appendChild(leaflet_routing_link);

      const leaflet_routing_script = document.createElement('script');
      leaflet_routing_script.src = "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js";
      
      document.body.appendChild(leaflet_routing_script);
      leaflet_routing_script.onload = () => {
        console.log('win:', win);
        console.log('win.L:', win.L);
        console.log('win.L.Routing:', win.L.Routing);
        console.log('win.L.Routing.control:', win.L.Routing.control);
        resolve(win.L.Routing);
      };
    });
  }

  getLeafletMarkerCluster(): Promise<any> {
    const win = window as any;

    if (win.L.markerClusterGroup) {
      return new Promise((resolve, reject) => {
        resolve(win.L.markerClusterGroup);
      });
    }

    return new Promise((resolve, reject) => {
      const leaflet_marker_cluster_link = document.createElement('link');
      leaflet_marker_cluster_link.rel = "stylesheet";
      leaflet_marker_cluster_link.href = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css";
      document.body.appendChild(leaflet_marker_cluster_link);
      const leaflet_marker_cluster_default_link = document.createElement('link');
      leaflet_marker_cluster_default_link.rel = "stylesheet";
      leaflet_marker_cluster_default_link.href = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css";
      document.body.appendChild(leaflet_marker_cluster_default_link);
      const leaflet_marker_cluster_script = document.createElement('script');
      leaflet_marker_cluster_script.src = "https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js";
      document.body.appendChild(leaflet_marker_cluster_script);
      leaflet_marker_cluster_script.onload = () => {
        resolve(win.L.markerClusterGroup);
      };
    });
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
