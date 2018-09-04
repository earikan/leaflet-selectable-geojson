import { Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { DEFAULT, HIGHLIGHT, SELECTED } from './app.component.interface';

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private map;
  private geoLayerAreas = L.featureGroup();
  private selecteds = [];


  // leaflet basic options
  options = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, minZoom: 6, attribution: 'Open Street Map' })
    ],
    zoom: 6,
    center: L.latLng({ lat: 38.9612, lng: 35.4355 }),
    maxBounds: [[36, 26], [42, 45]],
  };



  // ngAfterViewInit
  ngAfterViewInit() {
    var self = this;
    this.deleteFromselecteds(self);
    this.highlightAreaFromselecteds();
  }



  // onMapReady
  onMapReady(map: L.Map) {
    // initilaze map
    this.map = map;

    // init areas
    this.initilazeAreas("assets/turkey.json", this.geoLayerAreas, this.map);

    // add layer to map
    this.map.addLayer(this.geoLayerAreas);
  }



  // init areas
  initilazeAreas(url: String, layer, map) {
    var self = this;
    var geoLayerAreas = L.geoJson();

    // get geojson datas and add to geoLayerAreas
    $.getJSON(url, function (json) {
      var geoLayer = L.geoJson(json, {
        onEachFeature: self.onEachFeatureArea(map, self),
      });

      geoLayerAreas = geoLayer;
      geoLayerAreas.eachLayer(function (layer) {
        layer.addTo(self.geoLayerAreas);
      });
    });
  }



  // on each area
  onEachFeatureArea(map, self) {
    return function (feature, layer) {
      layer.setStyle(DEFAULT);
      layer.bindTooltip(layer.feature.properties.name, { direction: 'top', sticky: true });

      // events
      layer.on('mouseover', self.areaMouseOver(layer, map, self));
      layer.on('mouseout', self.areaMouseOut(layer, self));
      layer.on('click', self.areaOnClick(layer, map, self));
    }
  }



  // onClick event
  areaOnClick(layer, map, self) {
    return function () {
      if (!self.checkExistsLayersArea(layer.feature)) {
        layer.setStyle(SELECTED);
        self.areaAddToselecteds(layer.feature, layer);
      }
    }
  }



  // mouseOver event
  areaMouseOver(layer, map, self) {
    return function () {
      if (self.checkExistsLayersArea(layer.feature)) {
        layer.setStyle(SELECTED);
      }
      else
        layer.setStyle(HIGHLIGHT);
    }
  }



  // mouseOut event
  areaMouseOut(layer, self) {
    return function () {
      if (self.checkExistsLayersArea(layer.feature)) {
        layer.setStyle(SELECTED);
      }
      else
        layer.setStyle(DEFAULT);
    }
  }



  // check is it selected before
  checkExistsLayersArea(feature) {
    var result = false
    for (var i = 0; i < this.selecteds.length; i++) {
      if (this.selecteds[i].feature.id == feature.id) {
        result = true;
        break;
      }
    };
    return result
  }



  // add area to selecteds
  areaAddToselecteds(feature, layer) {
    this.selecteds.push({
      feature: feature
    })

    var area = this.selecteds[this.selecteds.length - 1].feature.properties.name + " ";
    if (area.length) {
      $("ol").append('<li class="highlight"  style="margin-top:20px">' + '<h6 style = "display: inline;">' + area + '</h6>' + '<button type="button" class="delete" style="float: right; margin-right: 20px; border-radius: 12px;  background-color: #FFFFFF" >' + '<i class="material-icons">delete</i>' + '</button>' + '</li>');
    }
  }



  // delete from selected list
  deleteFromselecteds(self) {
    $("ol").on('click', '.delete', function () {

      var index = $(this).parent().index();
      self.changeDeletedAreaLayerStyle(index, self);

      self.selecteds.splice(index, 1);
      $(this).parent().remove();
    });
  }



  // change deleted layer style
  changeDeletedAreaLayerStyle(index, self) {
    self.geoLayerAreas.eachLayer(function (layer) {
      if (layer.feature.id == self.selecteds[index].feature.id) {
        layer.setStyle(DEFAULT);
      }
    });
  }



  // highlight area item from selected list mouseover
  highlightAreaFromselecteds() {
    $('ol').css('cursor', 'pointer');
    this.highlightAreaFromSelectedsMouseOver();
    this.unhighlightAreaFromSelectedsMouseOut();
  }



  // highligh area
  highlightAreaFromSelectedsMouseOver() {
    var self = this;
    $('ol').on('mouseover', 'li.highlight', function () {
      // get index
      var index = $(this).index();

      // highlight area
      self.geoLayerAreas.eachLayer(function (layer) {
        if (layer.feature.id == self.selecteds[index].feature.id) {
          layer.setStyle(HIGHLIGHT);
        }
      });
    })
  }



  // unhighlight area
  unhighlightAreaFromSelectedsMouseOut() {
    var self = this;
    $('ol').on('mouseout', 'li.highlight', function () {
      // get index
      var index = $(this).index();

      // unhighlight area
      self.geoLayerAreas.eachLayer(function (layer) {
        if (layer.feature.id == self.selecteds[index].feature.id) {
          if (self.checkExistsLayersArea(layer.feature)) {
            layer.setStyle(SELECTED);
          }
          else
            layer.setStyle(DEFAULT);
        }
      });
    });
  }

}