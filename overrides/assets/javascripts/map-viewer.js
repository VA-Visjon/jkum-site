//import Map from './ol@9.1.0.js/Map';
//import OSM from './ol@9.1.0.js/source/OSM';
//import TileLayer from './ol@9.1.0.js/layer/Tile';
//import View from './ol@9.1.0.js/View';

import {jkumStyleFunction} from './map-styles.js';

// Apply coordinate systems
proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
proj4.defs('EPSG:25833', '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs');
proj4.defs("EPSG:5110", "+proj=tmerc +lat_0=58 +lon_0=10.5 +k=1 +x_0=100000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
ol.proj.proj4.register(proj4);

// declare variables
let manholeData = [];
let vectorLayer = null;

const viewCenter = [1567682, 9696830];
const originalView = new ol.View({
    projection: 'EPSG:3857',
    center: viewCenter,
    zoom: 5,
});

// Initialize the map
const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: originalView,
});

// Add norges grunnkart to the map
const NORGES_GRUNNKART = {
    type: 'WMS',
    url: 'https://openwms.statkart.no/skwms1/wms.norges_grunnkart',
    getCapabilitiesUrl: 'https://openwms.statkart.no/skwms1/wms.norges_grunnkart?request=GetCapabilities&service=WMS',
    serverType: 'mapserver',
    entries: ['Norges_grunnkart'],
    name: 'Norges grunnkart',
  };
const NORGES_GRUNNKART_WMS_LAYER = new ol.layer.Image({
    extent: map.getView().calculateExtent(),
    source: new ol.source.ImageWMS({
      url: NORGES_GRUNNKART.url,
      params: { LAYERS: NORGES_GRUNNKART.entries },
      serverType: NORGES_GRUNNKART.serverType,
    }),
    name: NORGES_GRUNNKART.name,
});
map.addLayer(NORGES_GRUNNKART_WMS_LAYER);

const element = document.getElementById('popup');

const popup = new ol.Overlay({
  element: element,
  positioning: 'bottom-center',
  stopEvent: false,
});
map.addOverlay(popup);

let popover;
function disposePopover() {
  if (popover) {
    popover.dispose();
    popover = undefined;
  }
}


function populateDrawer(manhole) {
    console.log(manhole);
    document.getElementById("manhole_details_sid").innerHTML = manhole.sid;
    document.getElementById("manhole_details_guid").innerHTML = manhole.guid;
    document.getElementById("manhole_details_shape").innerHTML = manhole.shape;
    document.getElementById("manhole_details_diameter").innerHTML = manhole.diameter ? manhole.diameter : '';
    document.getElementById("manhole_details_width").innerHTML = manhole.width ? manhole.width : '';
    document.getElementById("manhole_details_length").innerHTML = manhole.length ? manhole.length : '';
    document.getElementById("manhole_details_material").innerHTML = manhole.material ? manhole.material : '';
    document.getElementById("manhole_details_topsolution").innerHTML = manhole.topSolution ? manhole.topSolution : '';

    const fullPage = document.getElementById('fullpage_modal');

    const images = document.getElementById("manhole_details_images");
    images.innerHTML = "";
    if(manhole.images?.length > 0){
        for (const image of manhole.images){
            const img = document.createElement("img");

            if(image.base64String){
                img.src = "data:" + image.mediaType + ";base64," + image.base64String;
            } else{
                img.src = image.imageUrl;
            }

            img.addEventListener('click', function() {
                fullPage.style.backgroundImage = 'url(' + img.src + ')';
                fullPage.style.display = 'block';
             });
            images.appendChild(img);
        }
    }
    const lids = document.getElementById("manhole_details_lids");
    lids.innerHTML = "";
    if(manhole.lids?.length > 0){
        for (const lid of manhole.lids){
            const container = document.createElement("div");
            container.classList.add("lid-card");
            const dl = document.createElement("dl");

            const propKeys = ["guid", "diameter", "classification", "ladder", "position"];
            for (const key of propKeys){
                const dt = document.createElement("dt");
                dt.innerHTML = key.charAt(0).toUpperCase() + key.slice(1)
                dl.appendChild(dt);
                const dd = document.createElement("dd");
                if(lid[key]){
                    dd.innerHTML = lid[key];
                }
                dl.appendChild(dd);
            }
            container.appendChild(dl);
            lids.appendChild(container);
        }
    }
    const pipes = document.getElementById("manhole_details_pipes");
    pipes.innerHTML = "";
    if(manhole.pipes?.length > 0){
        for (const pipe of manhole.pipes){
            const container = document.createElement("div");
            container.classList.add("lid-card");
            const dl = document.createElement("dl");

            const propKeys = ["sid", "guid", "medium", "direction", "diameter", "material", "pressurized", "elevation", "clockPosition"];
            for (const key of propKeys){
                const dt = document.createElement("dt");
                dt.innerHTML = key.charAt(0).toUpperCase() + key.slice(1)
                dl.appendChild(dt);
                const dd = document.createElement("dd");
                if(pipe[key]){
                    dd.innerHTML = pipe[key];
                }
                dl.appendChild(dd);
            }
            container.appendChild(dl);
            pipes.appendChild(container);
        }
    }
}

function selectStyle(feature, resolution) {
  const color = '#3399cc';
  const style = jkumStyleFunction(feature, resolution);
  style[0].getImage().getFill().setColor(color);
  return style;
}

// select interaction working on "singleclick"
const selectSingleClick = new ol.interaction.Select({style: selectStyle});
map.addInteraction(selectSingleClick);

selectSingleClick.on('select', function (e) {
  console.log(e);
  if(e.selected.length > 0){
      const m = e.selected[0].get("properties");
      populateDrawer(m);
      openNav();
  } else{
      closeNav();
  }
});

//// display popup on click
//map.on('click', function (evt) {
//  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
//    return feature;
//  });
////  disposePopover();
//  if (!feature) {
//    closeNav();
//    return;
//  }
////  popup.setPosition(evt.coordinate);
////  popover = new bootstrap.Popover(element, {
////    placement: 'top',
////    html: true,
////    content: feature.get('properties').sid,
////  });
////  popover.show();
//
//  const m = feature.get("properties");
//  populateDrawer(m);
//  openNav();
//});

// change mouse cursor when over marker
map.on('pointermove', function (e) {
  if(!vectorLayer) return;
  const pixel = map.getEventPixel(e.originalEvent);

  vectorLayer.getFeatures(pixel).then(function (features) {
    const t = map.getTarget();
    const mapDiv = document.getElementById(t);
    if(features.length > 0){
      mapDiv.style.cursor = 'pointer';
    } else{
      mapDiv.style.cursor = '';
    }
  });
//  const hit = map.hasFeatureAtPixel(pixel);
//  const t = map.getTarget();
//  const mapDiv = document.getElementById(t);
//  mapDiv.style.cursor = hit ? 'pointer' : '';
});

// Close the popup when the map is moved
map.on('movestart', disposePopover);


// ------------------------------------
// Feature handling
// -----------------------------------



// identify an element to observe
const elementToObserve = document.getElementById('file_contents');

// create a new instance of 'MutationObserver' named 'observer',
// passing it a callback function
const observer = new MutationObserver(function(mutationsList, observer) {
    const text = elementToObserve.innerHTML;
    const json = JSON.parse(text);

    const features = [];
    manholeData = [];
    let i = 1;
    for (const manhole of json.manholes) {
      const m = Object.assign({}, manhole);
      m.epsg = json.head.epsg;
      manholeData.push(m);

      const point = new ol.geom.Point([m.lids[0].position.east, m.lids[0].position.north]);
      point.transform('EPSG:' + m.epsg, 'EPSG:3857'); // Transformed in place

      const feature = new ol.Feature({
        "geometry": point,
        "properties": m,
        "size": i
      });

      features.push(feature);
      i += 1;
    }

    // Populate all divs
    const manholeListDom = document.getElementById('manhole_list');
    manholeListDom.innerHTML = "";
    for (const manhole of manholeData) {
        const wrap = document.createElement("div");
        wrap.classList.add("manhole-item");
        const head = document.createElement("h4");
        head.innerHTML = "SID: <b>" + manhole.sid + "</b>";
        wrap.appendChild(head);

        manholeListDom.appendChild(wrap);
    }

    // Add to map
    const vectorSource = new ol.source.Vector({
        features: features,
        wrapX: false,
    });

    vectorLayer = new ol.layer.Vector({
      name: 'points',
      source: vectorSource,
      style: jkumStyleFunction,
    });

    // First remove the points layer
    map.getLayers().forEach(function (layer) {
        if (layer.get('name') != undefined & layer.get('name') === 'points') {
            map.removeLayer(layer);
        }
    });
    // Then add it
    map.addLayer(vectorLayer);

//    vectorLayer.on('postrender', function (evt) {
//      const vectorContext = ol.render.getVectorContext(evt);
//      vectorContext.setStyle(pointerStyle);
//      console.log(evt);
////      if (point !== null) {
////        vectorContext.drawGeometry(point);
////      }
////      if (line !== null) {
////        vectorContext.drawGeometry(line);
////      }
//    });

    // And zoom
    const extent = vectorSource.getExtent();
    map.getView().fit(extent, { size: map.getSize(), padding: [200, 200, 200, 200] });

    console.log(manholeData);
});


// call 'observe' on that MutationObserver instance,
// passing it the element to observe, and the options object
observer.observe(elementToObserve, {characterData: false, childList: true, attributes: false});

