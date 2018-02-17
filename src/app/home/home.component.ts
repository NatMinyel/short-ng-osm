import {Component, OnInit} from '@angular/core';

import {Http} from '@angular/http';
import xml2js from 'xml2js';
import {latLng, tileLayer, circle, marker, icon, Map, polyline, Util} from 'leaflet';
import 'rxjs/add/operator/map';
import {Graph} from "./utils";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public map: any;
  public options: any;
  public baselayers: any;
  private center: any;
  public xmlItems: any;
  public ways: any;
  public nodes: any;
  public found: any;
  private closest_node: any;
  private counter = 0;
  private g: Graph = new Graph();

  constructor(private http: Http) {
    this.baselayers = [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: 'Assignment'})
    ];

    this.options = {
      layers: [
        tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: ''})
      ],
      zoom: 15,
      center: latLng(9.032761783981412, 38.76333832740784)
    };
    this.http.get('/assets/data/map.osm').map(res => res.text()).subscribe((data) => {
      this.parseXML(data).then((data_res) => {
        this.g.getFromXML(data_res);
        this.xmlItems = data_res;
        this.ways = this.xmlItems.osm.way;
        this.nodes = this.xmlItems.osm.node;
      });
    });
  }

  ngOnInit() {

  }

  drawPathArray(paths) {
    if (!paths.empty) {
      let prev = paths[0].toString();
      let nodes = this.g.getVertices();
      for (let i = 1; i < paths.length; i++) {
        let curr = paths[i];

        let line = polyline([[nodes[prev].info.$.lat, nodes[prev].info.$.lon], [nodes[curr].info.$.lat, nodes[curr].info.$.lon]],
          {
            color: "blue"
          });
        prev = curr;
        this.baselayers.push(line);
      }
    }
  }


  searchNode(e) {
    return new Promise(resolve => {
      console.log("This", this.xmlItems.osm);
      let closest = 0, min_dist = 999;
      for (let i = 0; i < this.nodes.length; i++) {
        let dist = Graph.distance(this.xmlItems.osm.node[i].$.lat, this.xmlItems.osm.node[i].$.lon, e.lat, e.lng);
        if (dist < min_dist && this.xmlItems.osm.node[i] && this.g.getVertices()[this.xmlItems.osm.node[i].$.id].neighbors.length != 0) {
          console.log("DD", this.g.getVertices()[this.xmlItems.osm.node[i].$.id].neighbors);
          min_dist = dist;
          closest = i;
        }
      }

      // console.log(min_dist, this.nodes[closest]);
      // let id = this.nodes[closest].$.id, l = 0;
      // for (let j = 0; j < this.ways.length; j++) {
      //   for (let k = 0; k < this.ways[j].nd.length; k++) {
      //     if (id == this.ways[j].nd[k].$.ref) {
      //       console.log("way", this.ways[j]);
      //       ways.push(this.ways[j]);
      //       l = 1;
      //     }
      //   }
      // }
      // console.log("Finished", ways);
      return resolve({node: this.xmlItems.osm.node[closest]});
    });
  }

  getLatLang(e) {
    // console.log('Setting to ', e.lat, e.lng);
    this.center = latLng(e.lat, e.lng);
    if (this.counter === 0) {
      console.log('Counter is 0');

      this.baselayers.push(marker([e.lat, e.lng],
        {
          icon: icon({
            iconSize: [25, 41],
            iconAnchor: [13, 41],
            iconUrl: 'assets/marker-icon.png',
            shadowUrl: 'assets/marker-shadow.png'
          })
        }));
      this.searchNode(e).then((res) => {
        console.log(res);
        this.found = res;
        // console.log("WASDSDA", this.found.ways);
        // for (let i = 0; i < 1; i++) {
        //   console.log("this");
        //   // for (let j = 0; j < res['ways'][i].nd.length; j++) {
        //   //   // this.drawWay(res['ways'][i], 'blue');
        //   // }\
        //   this.drawWay(res['ways'][i], 'blue');
        // }
        this.closest_node = res['node'];
        // this.best_ways = res['ways'];
      });
      this.counter = 1;
    } else if (this.counter === 1) {
      // console.log('Counter is 1', this.closest_node);
      this.baselayers.push(marker([e.lat, e.lng],
        {
          icon: icon({
            iconSize: [25, 41],
            iconAnchor: [13, 41],
            iconUrl: 'assets/marker-icon.png',
            shadowUrl: 'assets/marker-shadow.png'
          })
        }));
      this.searchNode(e).then((res) => {
        let short = this.g.shortestPath(this.closest_node.$.id, res['node'].$.id);
        console.log(short);
        this.drawPathArray(short);
      });

      this.counter++;
    } else {
      console.log('Counter is 2');
      this.baselayers = this.baselayers.slice(0, 1);
      this.counter = 0;
      console.log(this.map);
    }
  }

  parseXML(data) {
    return new Promise(resolve => {
      let parser = new xml2js.Parser({
        trim: true,
        explicitArray: true
      });
      parser.parseString(data, function (err, result) {
        resolve(result);
      });
    });
  }

  onMapReady(map: Map) {
    this.map = map;
    const vm = this;
    // console.log(vm.xmlItems);
    // console.log(map.options);
    this.map.addEventListener('click', function (event) {
      vm.getLatLang(event.latlng);
      // console.log(event.latlng);
    });
  }

}
