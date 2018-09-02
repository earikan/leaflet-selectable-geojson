import { Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { DEFAULT, HIGHLIGHT } from './app.component.interface';

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  map;
  geoLayerGroupProvince = L.featureGroup();
  featureGroup = L.featureGroup();


  //leaflet basic options
  options = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'Open Street Map' })
    ],
    zoom: 6,
    center: L.latLng({ lat: 38.961228, lng: 35.435546 }),

  };


  onMapReady(map: L.Map) {
    //initilaze map
    this.map = map;

    this.initilazeProvinces("/assets/provinces.json", this.geoLayerGroupProvince, this.map);
    this.map.addLayer(this.geoLayerGroupProvince);

  }


  initilazeProvinces(url: String, layer, map) {
    var self = this;
    this.map.invalidateSize();
    $.getJSON(url, function (json) {
      var geoLayerProvince = L.geoJson(json, {
        onEachFeature: self.onEachFeatureProvince(map),
      }).addTo(self.geoLayerGroupProvince);
    });
  }


  onEachFeatureProvince(map) {
    return function (feature, layer) {
      layer.setStyle(DEFAULT);
      layer.bindTooltip(layer.feature.properties.name, { direction: 'top', sticky: true });

      layer.on('mouseover', function () { layer.setStyle(HIGHLIGHT); });
      layer.on('mouseout', function () { layer.setStyle(DEFAULT); });
    }
  }
}
