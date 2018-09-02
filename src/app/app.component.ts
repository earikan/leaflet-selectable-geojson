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

  map;
  geoLayerProvince = L.featureGroup();
  featureGroup = L.featureGroup();
  static selectedList = [];


  //leaflet basic options
  options = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, minZoom: 6, attribution: 'Open Street Map' })
    ],
    zoom: 6,
    center: L.latLng({ lat: 38.961228, lng: 35.435546 }),
    maxBounds: [[36, 26], [42, 45]],
  };



  ngAfterViewInit() {
    this.deleteFromSelectedList();
    this.highlightAreaFromSelectedList();
  }



  onMapReady(map: L.Map) {
    //initilaze map
    this.map = map;

    this.initilazeProvinces("/assets/provinces.json", this.geoLayerProvince, this.map);
    this.map.addLayer(this.geoLayerProvince);

  }



  initilazeProvinces(url: String, layer, map) {
    var self = this;
    var geoLayerProvince = L.geoJson();

    $.getJSON(url, function (json) {
      var geoLayer = L.geoJson(json, {
        onEachFeature: self.onEachFeatureProvince(map),
      });

      geoLayerProvince = geoLayer;
      geoLayerProvince.eachLayer(function (layer) {
        layer.addTo(self.geoLayerProvince);
      });
    });
  }



  onEachFeatureProvince(map) {
    var self = this;
    return function (feature, layer) {
      layer.setStyle(DEFAULT);
      layer.bindTooltip(layer.feature.properties.name, { direction: 'top', sticky: true });

      layer.on('mouseover', AppComponent.provinceMouseOver(layer, map));
      layer.on('mouseout', AppComponent.provinceMouseOut(layer));
      layer.on('click', AppComponent.provinceOnClick(layer, map));
    }
  }



  static provinceOnClick(layer, map) {
    return function () {
      if (!AppComponent.checkExistsLayersProvince(layer.feature)) {
        layer.setStyle(SELECTED);
        AppComponent.provinceAddToSelectedList(layer.feature, layer);
      }
    }
  }



  static provinceMouseOver(layer, map) {
    return function () {
      if (AppComponent.checkExistsLayersProvince(layer.feature)) {
        layer.setStyle(SELECTED);
      }
      else
        layer.setStyle(HIGHLIGHT);
    }
  }



  static provinceMouseOut(layer) {
    return function () {
      if (AppComponent.checkExistsLayersProvince(layer.feature)) {
        layer.setStyle(SELECTED);
      }
      else
        layer.setStyle(DEFAULT);
    }
  }



  static checkExistsLayersProvince(feature) {
    var result = false
    for (var i = 0; i < this.selectedList.length; i++) {
      if (this.selectedList[i].feature.id == feature.id) {
        result = true;
        break;
      }
    };
    return result
  }



  static provinceAddToSelectedList(feature, layer) {
    AppComponent.selectedList.push({
      feature: feature
    })

    var province = AppComponent.selectedList[AppComponent.selectedList.length - 1].feature.properties.name + " ";
    if (province.length) {
      $("ol").append('<li class="highlight"  style="margin-top:20px">' + '<h6 style = "display: inline;">' + province + '</h6>' + '<button type="button" class="delete" style="float: right; margin-right: 20px; border-radius: 12px;  background-color: #FFFFFF" >' + '<i class="material-icons">delete</i>' + '</button>' + '</li>');
    }
  }



  deleteFromSelectedList() {
    var self = this;
    $("ol").on('click', '.delete', function () {
      var index = $(this).parent().index();
      self.changeDeletedProvinceLayerStyle(index);
      AppComponent.selectedList.splice(index, 1);
      $(this).parent().remove();
    });
  }



  changeDeletedProvinceLayerStyle(index) {
    var self = this;
    self.geoLayerProvince.eachLayer(function (layer) {
      if (layer.feature.id == AppComponent.selectedList[index].feature.id) {
        layer.setStyle(DEFAULT);
      }
    });
  }


  highlightAreaFromSelectedList() {
    $('ol').css('cursor', 'pointer');
    this.highlightAreaFromSelectedListMouseOver();
    this.highlightAreaFromSelectedListMouseOut();
  }



  highlightAreaFromSelectedListMouseOver() {
    var self = this;
    $('ol').on('mouseover', 'li.highlight', function () {
      var index = $(this).index();
      self.geoLayerProvince.eachLayer(function (layer) {
        if (layer.feature.id == AppComponent.selectedList[index].feature.id) {
          layer.setStyle(HIGHLIGHT);
        }
      });
    })
  }


  highlightAreaFromSelectedListMouseOut() {
    var self = this;
    $('ol').on('mouseout', 'li.highlight', function () {
      var index = $(this).index();
      self.geoLayerProvince.eachLayer(function (layer) {
        if (layer.feature.id == AppComponent.selectedList[index].feature.id) {
          if (AppComponent.checkExistsLayersProvince(layer.feature)) {
            layer.setStyle(SELECTED);
          }
          else
            layer.setStyle(HIGHLIGHT);
        }
      });

    });

  }

}