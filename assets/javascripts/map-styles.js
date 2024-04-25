import {clockPositionToRadians} from './utils.js';

const createTextStyle = (feature) => {
  const align = 'start';
  const baseline = 'middle';
  const size = '12px';
  const weight = 'normal';
  const placement = 'point';
  const offsetX = 10;
  const offsetY = -10;
  const overflow = true;
  const font = weight + ' ' + size + ' ' + 'Arial';
  const fillColor = 'black';
  const outlineColor = '#ffffff';
  const outlineWidth = 2;

  const props = feature.get('properties')
  let text = props.sid;
  if (text === '') {
    text = '-';
  }

  return new ol.style.Text({
    textAlign: align,
    textBaseline: baseline,
    font: font,
    text: text,
    fill: new ol.style.Fill({ color: fillColor }),
    // backgroundFill: new Fill({ color: outlineColor }),
    stroke: new ol.style.Stroke({ color: outlineColor, width: outlineWidth }),
    offsetX: offsetX,
    offsetY: offsetY,
    placement: placement,
    // maxAngle: maxAngle,
    // rotation: rotation,
    overflow: overflow,
    rotateWithView: true,
  });
};

//const manholeStyle = new ol.style.Style({
//  image: new ol.style.Circle({
//    radius: 10,
//    fill: new ol.style.Fill({color: [200, 220, 255]}),
//    stroke: new ol.style.Stroke({
//      color: [0, 100, 255], width: 2
//    })
//  }),
//  text: createTextStyle(feature),
//})

export function jkumStyleFunction(feature, resolution) {
    var width = 2;
    var styles = [
        new ol.style.Style({
          image: new ol.style.Circle({
            radius: 10,
            fill: new ol.style.Fill({color: [200, 220, 255]}),
            stroke: new ol.style.Stroke({
              color: [0, 100, 255], width: 2
            })
          }),
          text: createTextStyle(feature),
        })
    ];
    var geom = feature.getGeometry();

    const props = feature.get("properties");
    const pipes = props.pipes;
    if(pipes){
        for (const pipe of pipes){
            const coordinates = [];
            if(!pipe.clockPosition){
                continue;
            }
            const radians = clockPositionToRadians(pipe.clockPosition);

            const x = props.lids[0].position.east;
            const y = props.lids[0].position.north;
            const dist = 20 * resolution;
            var newFrom = [
                x,
                y
            ];
            var newTo = [
                Math.cos(radians) * dist + x,
                Math.sin(radians) * dist + y
            ];
            coordinates.push(newFrom);
            coordinates.push(newTo);

            const line = new ol.geom.LineString(coordinates).transform('EPSG:' + props.epsg, 'EPSG:3857');

            styles.push(
                new ol.style.Style({
                    geometry: line,
                    stroke: new ol.style.Stroke({
                        color: "black",
                        width: width
                    })
                })
            );
        }
    }
    return styles;
};