import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LeafletService {

  // リーフレットの準備について
  // リーフレットAPIの読み込み
  // リーフレットAPIの読み込み後
  // leaflet routing machineの読み込み
  // leaflet marker clusterの読み込み
  // その他leaflet関係の読み込み

  constructor() { }

  prepareLeaflet(): Promise<any> {
    console.log('prepareLeaflet:');
    const win = window as any;
    // leafletAPIを読み込む
    // 読み込むまで待つ
    // その他のleaflet関係を読み込む
    return new Promise((resolve, reject) => {
      // leaflet
      const leaflet_script = this.setLeafletLinkSrcToDocument();
      // leaflet routing machine
      this.setLeafletRoutingMachineLinkSrcToDocument();
      // leaflet marker cluster
      this.setLeafletMarkerClusterLinkSrcToDocument();
      // leaflet easy button
      this.setLeafletEasyButtonLinkSrcToDocument();

      leaflet_script.onload = () => {
        console.log('win in prepare leaflet:', win);
        console.log('win.L in prepare leaflet:', win.L);

        if (win.L) {
          resolve(win.L);
        } else {
          reject('Leaflet maps not available');
        }
      };

    })
  }

  includeAllLeaflet(): Promise<any> {
    console.log('prepareLeaflet:');
    const win = window as any;
    // leafletAPIを読み込む
    // 読み込むまで待つ
    // その他のleaflet関係を読み込む
    return new Promise(async (resolve, reject) => {
      // leaflet
      await this.includeLeaflet();
      await Promise.all([
        // leaflet関連のプラグインの読み込みの並列処理
        // leaflet routing machine
        this.includeLeafletRoutingMachine(),
        // leaflet marker cluster
        this.includeLeafletMarkerCluster(),
        // leaflet easy button
        this.includeLeafletEasyButton()
      ]);
      if (win.L) {
        resolve(win.L);
      } else {
        reject('Leaflet not available');
      }
    })
  }

  includeLeaflet(): Promise<any> {
    console.log('start setLeafletLinkSrcToDocument');
    const win = window as any;
    console.log('end setLeafletLinkSrcToDocument');

    return new Promise((resolve, reject) => {
      // if (win.L) {  // すでに読み込まれていた場合
      //   resolve(win.L);
      // }
      const leaflet_link = document.createElement('link');
      leaflet_link.rel = "stylesheet";
      leaflet_link.href = "https://unpkg.com/leaflet@1.3.0/dist/leaflet.css";
      document.body.appendChild(leaflet_link);

      const leaflet_script = document.createElement('script');
      leaflet_script.src = "https://unpkg.com/leaflet@1.3.0/dist/leaflet.js";
      leaflet_script.async = true;
      leaflet_script.defer = true;
      document.body.appendChild(leaflet_script);

      leaflet_script.onload = () => {
        if (win.L) {
          resolve(win.L);
        } else {
          reject('Leaflet maps not available');
        }
      }
    });
  }

  includeLeafletRoutingMachine() {
    const win = window as any;

    return new Promise((resolve, reject) => {
      // if (win.L.Routing) {  // すでに読み込まれていた場合
      //   resolve(win.L.Routing);
      // }    
      const leaflet_routing_link = document.createElement('link');
      leaflet_routing_link.rel = "stylesheet";
      leaflet_routing_link.href = "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css";
      document.body.appendChild(leaflet_routing_link);

      const leaflet_routing_script = document.createElement('script');
      leaflet_routing_script.src = "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js";      
      document.body.appendChild(leaflet_routing_script);
      
      leaflet_routing_script.onload = () => {
        if (win.L.Routing) {
          resolve(win.L.Routing);
        } else {
          reject('Leaflet Routin Machine not available');
        }
      }
    });
  }

  includeLeafletMarkerCluster() {
    const win = window as any;

    return new Promise((resolve, reject) => {
      // if (win.L.markerClusterGroup) {  // すでに読み込まれていた場合
      //   resolve(win.L.markerClusterGroup);
      // }
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
        if (win.L.markerClusterGroup) {
          resolve(win.L.markerClusterGroup);
        } else {
          reject('Leaflet Marker Cluster not available');
        }
      }
    });
  }

  includeLeafletEasyButton() {
    const win = window as any;

    return new Promise((resolve, reject) => {
      // if (win.L.easyButton) {  // すでに読み込まれていた場合
      //   resolve(win.L.easyButton);
      // }
      // <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet-easybutton@2/src/easy-button.css">
      // <script src="https://cdn.jsdelivr.net/npm/leaflet-easybutton@2/src/easy-button.js"></script>
      const leaflet_easy_button_link = document.createElement('link');
      leaflet_easy_button_link.rel = "stylesheet";
      leaflet_easy_button_link.href = "https://cdn.jsdelivr.net/npm/leaflet-easybutton@2/src/easy-button.css";
      document.body.appendChild(leaflet_easy_button_link);
      const leaflet_easy_button_script = document.createElement('script');
      leaflet_easy_button_script.src = "https://cdn.jsdelivr.net/npm/leaflet-easybutton@2/src/easy-button.js";
      document.body.appendChild(leaflet_easy_button_script);
      leaflet_easy_button_script.onload = () => {
        if (win.L.easyButton) {
          resolve(win.L.easyButton);
        } else {
          reject('Leaflet Marker Cluster not available');
        }
      }
    });
  }

  setLeafletLinkSrcToDocument() {
    const leaflet_link = document.createElement('link');
    leaflet_link.rel = "stylesheet";
    leaflet_link.href = "https://unpkg.com/leaflet@1.3.0/dist/leaflet.css";
    document.body.appendChild(leaflet_link);

    const leaflet_script = document.createElement('script');
    leaflet_script.src = "https://unpkg.com/leaflet@1.3.0/dist/leaflet.js";
    leaflet_script.async = true;
    leaflet_script.defer = true;
    document.body.appendChild(leaflet_script);

    return leaflet_script;
  }

  setLeafletRoutingMachineLinkSrcToDocument() {
    const leaflet_routing_link = document.createElement('link');
    leaflet_routing_link.rel = "stylesheet";
    leaflet_routing_link.href = "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css";
    document.body.appendChild(leaflet_routing_link);

    const leaflet_routing_script = document.createElement('script');
    leaflet_routing_script.src = "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js";      
    document.body.appendChild(leaflet_routing_script);
  }

  setLeafletMarkerClusterLinkSrcToDocument() {
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
  }

  setLeafletEasyButtonLinkSrcToDocument() {
    // <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet-easybutton@2/src/easy-button.css">
    // <script src="https://cdn.jsdelivr.net/npm/leaflet-easybutton@2/src/easy-button.js"></script>
    const leaflet_easy_button_link = document.createElement('link');
    leaflet_easy_button_link.rel = "stylesheet";
    leaflet_easy_button_link.href = "https://cdn.jsdelivr.net/npm/leaflet-easybutton@2/src/easy-button.css";
    document.body.appendChild(leaflet_easy_button_link);
    const leaflet_easy_button_script = document.createElement('script');
    leaflet_easy_button_script.src = "https://cdn.jsdelivr.net/npm/leaflet-easybutton@2/src/easy-button.js";
    document.body.appendChild(leaflet_easy_button_script);
  }

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
      leaflet_script.async = true;
      leaflet_script.defer = true;
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

  getLeafletEasyButton() {
    const win = window as any;
    if (win.L.easyButton) {
      return new Promise((resolve, reject) => {
        resolve(win.L.easyButton);
      });
    }

    return new Promise((resolve, reject) => {
      const leaflet_easy_button_link = document.createElement('link');
      leaflet_easy_button_link.rel = "stylesheet";
      leaflet_easy_button_link.href = "https://cdn.jsdelivr.net/npm/leaflet-easybutton@2/src/easy-button.css";
      document.body.appendChild(leaflet_easy_button_link);
      const leaflet_easy_button_script = document.createElement('script');
      leaflet_easy_button_script.src = "https://cdn.jsdelivr.net/npm/leaflet-easybutton@2/src/easy-button.js";
      document.body.appendChild(leaflet_easy_button_script);
      leaflet_easy_button_script.onload = () => {
        resolve(win.L.easyButton);
      };
    });
  }

  async getCurrentPositionIcon() {
    const win = window as any;
    if (!win.L) {
      console.log('leaflet is not available');
      await this.includeLeaflet();
    }
    return new win.L.Icon({
      // http://pluspng.com/img-png/you-are-here-png-hd-you-are-here-icon-512.png
      // https://pictogram-free.com/highresolution/001-free-pictogram.png
      iconUrl: 'https://pictogram-free.com/highresolution/001-free-pictogram.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -25]
    });
  }

  async getDepartureIcon() {
    const win = window as any;
    if (!win.L) {
      console.log('leaflet is not available');
      await this.getLeafletMaps();
    }
    return new win.L.Icon({
      // iconUrl: 'https://unpkg.com/leaflet@1.3.0/dist/images/marker-icon-2x.png'
      // icon hadow = 'https://unpkg.com/leaflet@1.3.0/dist/images/marker-shadow.png'
      iconUrl: '../../../assets/img/place_start.png',
      iconSize: [25, 30],
      iconAnchor: [12, 30],
      popupAnchor: [0, -25]
    });
  }

  async getDestinationIcon() {
    const win = window as any;
    if (!win.L) {
      await this.getLeafletMaps();
    }
    return new win.L.Icon({
      // iconUrl: 'https://unpkg.com/leaflet@1.3.0/dist/images/marker-icon-2x.png'
      // icon hadow = 'https://unpkg.com/leaflet@1.3.0/dist/images/marker-shadow.png'
      iconUrl: '../../../assets/img/place_goal.png',
      iconSize: [25, 30],
      iconAnchor: [12, 30],
      popupAnchor: [0, -25]
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
