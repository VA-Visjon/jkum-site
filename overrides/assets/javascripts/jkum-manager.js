import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { ViewportGizmo } from "three/addons/libs/three-viewport-gizmo.js";
import { ViewHelper } from "three/addons/helpers/ViewHelper.js";
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

import { uuidv4, clockPositionToRadians } from './utils.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

import {CSG} from 'three/addons/libs/CSGMesh.js';

let container;
let camera, scene, renderer;
let viewportGizmo;
let viewHelper;
let labelRenderer;
let gui;
//const splineHelperObjects = [];
//let splinePointsLength = 4;
//const positions = [];
//const point = new THREE.Vector3();


const measurementMethods = {
    'Topp utv. rør': 'topOutsidePipe',
    'Bunn inv. rør': 'bottomInsidePipe',
    'Bunn renne': 'bottomGutter',
    'Bankett': 'banquet'
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();

//const geometry = new THREE.BoxGeometry( 20, 20, 20 );
let transformControl;

//const ARC_SEGMENTS = 200;

let lidElevation = 0;
let lowestElevation = 0;
let deltaH = 0;
let manholeData = null;
let bottomSectionHeight = 0;

let originalBottomConstruction;
let bottomConstruction;

// Define some materials
const matrTransparent = new THREE.MeshLambertMaterial( { color: 0xffffff, transparent: true, opacity: 0.1 } );
const matrGray = new THREE.MeshLambertMaterial( { color: 0x999999 } );
const matrGrayWireframe = new THREE.MeshLambertMaterial( { color: 0x999999, wireframe: true } );
const matrRed = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
const matrPipe = new THREE.MeshLambertMaterial( { color: 0x22ff22 } );
const matrRustIron = new THREE.MeshLambertMaterial( { color: 0xcc6633 } );

//const splines = {};

let pipes = {};
const pipeFolders = {};

const params = {
    addPipe: addPipe
};

//const params = {
//    uniform: true,
//    tension: 0.5,
//    centripetal: true,
//    chordal: true,
//    addPoint: addPoint,
//    removePoint: removePoint,
//    exportSpline: exportSpline
//};

export function clearJkumEditor() {
    container.innerHTML = "";
}

function doCSG(a,b,op,mat){
    let bspA = CSG.fromMesh( a );
    let bspB = CSG.fromMesh( b );
    let bspC = bspA[op]( bspB );
    let result = CSG.toMesh( bspC, a.matrix );
    result.material = mat;
    result.castShadow = result.receiveShadow = true;
    return result;
}

let timer;

function debounce(func, timeout = 400){
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

export function initJkumEditor(manhole, startControlsOpen) {
    console.log("MANHOLE", manhole);

    // Clear the pipes and reset for next init
    pipes = {};
    lidElevation = 0;
    lowestElevation = 0;
    deltaH = 0;
    bottomSectionHeight = 0;

    originalBottomConstruction = null;
    bottomConstruction = null;
    transformControl = null;

    manholeData = manhole;

    // Prepare manhole data
    lidElevation = manhole.lids[0].position.elevation;
    lowestElevation = lidElevation;
    if(manhole.pipes && manhole.pipes.length > 0){
        for (const pipe of manhole.pipes){
            if(pipe.elevation < lowestElevation){
                lowestElevation = pipe.elevation;
            }
        }
    }
    if(manhole.elevationBottom && manhole.elevationBottom < lowestElevation){
        lowestElevation = manhole.elevationBottom;
    }
    deltaH = (lidElevation - lowestElevation) * 100;
    console.log("TOP-BOT ELEV:", lidElevation, lowestElevation, deltaH);

    // Set the scene
    const gizmoContainer = document.getElementById( 'gizmo-container' );
    container = document.getElementById( 'container' );
    container.innerHTML = "";

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

//    camera = new THREE.PerspectiveCamera( 70, container.clientWidth / container.clientHeight, 1, 10000 );
    camera = new THREE.OrthographicCamera( - container.clientWidth / 2, container.clientWidth / 2,
                            container.clientHeight / 2, - container.clientHeight / 2, 1, 10000 );
    camera.position.set( 500, 500, 1000 );
    scene.add( camera );

    scene.add( new THREE.AmbientLight( 0xf0f0f0, 3 ) );
    const light = new THREE.SpotLight( 0xffffff, 4.5 );
    light.position.set( 0, 1500, 200 );
    light.angle = Math.PI * 0.2;
    light.decay = 0;
    light.castShadow = true;
    light.shadow.camera.near = 200;
    light.shadow.camera.far = 2000;
    light.shadow.bias = - 0.000222;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    scene.add( light );

    const planeGeometry = new THREE.PlaneGeometry( 2000, 2000 );
    planeGeometry.rotateX( - Math.PI / 2 );
    const planeMaterial = new THREE.ShadowMaterial( { color: 0x000000, opacity: 0.2 } );

    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.y = - 20;
    plane.receiveShadow = true;
    scene.add( plane );

    const helper = new THREE.GridHelper( 2000, 100 );
//    helper.position.y = deltaH;
    helper.position.y = -19;
    helper.material.opacity = 0.25;
    helper.material.transparent = true;
    scene.add( helper );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( container.clientWidth, container.clientHeight );
    renderer.shadowMap.enabled = true;
    renderer.autoClear = false;
    container.appendChild( renderer.domElement );

    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize( container.clientWidth, container.clientHeight );
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none'; // Important, otherwise blocks the navigation
    container.appendChild( labelRenderer.domElement );

//    const gizmoOptions = {
//        placement: "top-left"
//    };
//    viewportGizmo = new ViewportGizmo(camera, renderer, gizmoOptions);
//    scene.add(viewportGizmo);
    viewHelper = new ViewHelper(camera, container);
    scene.add(viewHelper);

    gui = new GUI({ autoPlace: false });
    gui.domElement.id = 'gui';

//    gui.add( params, 'uniform' ).onChange( render );
//    gui.add( params, 'tension', 0, 1 ).step( 0.01 ).onChange( function ( value ) {
//
//        splines.uniform.tension = value;
//        updateSplineOutline();
//        render();
//
//    } );
//    gui.add( params, 'centripetal' ).onChange( render );
//    gui.add( params, 'chordal' ).onChange( render );
//    gui.add( params, 'addPoint' );
//    gui.add( params, 'removePoint' );
//    gui.add( params, 'exportSpline' );
    gui.add( params, 'addPipe' );
    if(startControlsOpen){
        gui.open();
    } else{
        gui.close();
    }
    container.appendChild(gui.domElement);

    // Controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.damping = 0.2;
    controls.addEventListener( 'change', changeCamera );

//    transformControl = new TransformControls( camera, renderer.domElement );
//    transformControl.addEventListener( 'change', render );
//    transformControl.addEventListener( 'dragging-changed', function ( event ) {
//
//        controls.enabled = ! event.value;
//
//    } );
//    scene.add( transformControl );
//
//    transformControl.addEventListener( 'objectChange', function () {
//        updateSplineOutline();
//    } );


    document.addEventListener( 'pointerdown', onPointerDown );
    document.addEventListener( 'pointerup', onPointerUp );
    document.addEventListener( 'pointermove', onPointerMove );
    window.addEventListener( 'resize', onWindowResize );
//
//    /*******
//     * Curves
//     *********/
//
//    for ( let i = 0; i < splinePointsLength; i ++ ) {
//
//        addSplineObject( positions[ i ] );
//
//    }
//
//    positions.length = 0;
//
//    for ( let i = 0; i < splinePointsLength; i ++ ) {
//
//        positions.push( splineHelperObjects[ i ].position );
//
//    }

    // Add the top lid
    for(const lid of manhole.lids){
        const lidR = lid.diameter ? parseInt(lid.diameter) / 20 : 650 / 20;
        const h = 3;
        const geomLid = new THREE.CylinderGeometry( lidR, lidR, h, 32 );
        const lidGeom = new THREE.Mesh( geomLid, matrRustIron );
        lidGeom.position.set(0, deltaH - h/2.0, 0);
        scene.add(lidGeom);
    }

    // Create the bottom of the manhole
    const topHeight = 70;
    const bottomThickness = 15;
    bottomSectionHeight = deltaH - topHeight + bottomThickness;
    const radius = manhole.diameter ? manhole.diameter / 20 : 1200 / 20;
    const geomInner = new THREE.CylinderGeometry( radius, radius, bottomSectionHeight, 32 );
    const cylinderInner = new THREE.Mesh( geomInner, matrGray );

    const geomOuter = new THREE.CylinderGeometry( radius + 10, radius + 10, bottomSectionHeight, 32 );
    const cylinderOuter = new THREE.Mesh( geomOuter, matrGray );
    cylinderOuter.position.set(0, -bottomThickness, 0); // Using centimeters here, 15 cm down as is a regular precast concrete manhole

    cylinderInner.updateMatrix();
    cylinderOuter.updateMatrix();

    const bottom = doCSG(cylinderOuter, cylinderInner, "subtract", matrGray);
    originalBottomConstruction = bottom.clone();

    // Build top solution
    const coneInner = new THREE.CylinderGeometry( 65/2, radius, 50, 32 );
    const topInner = new THREE.Mesh( coneInner, matrGray );
    const coneOuter = new THREE.CylinderGeometry( 65/2 + 10, radius + 10, 50, 32 );
    const topOuter = new THREE.Mesh( coneOuter, matrGray );
    const coneMesh = doCSG(topOuter, topInner, "subtract", matrGray);
    coneMesh.position.set(0, deltaH - 45, 0);
    coneMesh.name = "topCone";
    scene.add(coneMesh);

    const adjustmentRingInner = new THREE.CylinderGeometry( 65/2, 65/2, 15, 32 );
    const adjustmentRing = new THREE.Mesh( adjustmentRingInner, matrGray );
    const adjustmentRingOuterGeom = new THREE.CylinderGeometry( 65/2 + 10, 65/2 + 10, 15, 32 );
    const adjustmentRingOuter = new THREE.Mesh( adjustmentRingOuterGeom, matrGray );
    const adjustmentRingMesh = doCSG(adjustmentRingOuter, adjustmentRing, "subtract", matrGray);
    adjustmentRingMesh.position.set(0, deltaH - 5 - 15/2.0, 0);
    adjustmentRingMesh.name = "topAdjustmentRing";
    scene.add(adjustmentRingMesh);

    // Create annotations
    const origoDiv = document.createElement( 'div' );
    origoDiv.className = 'label';
    origoDiv.textContent = 'kt +'+ lowestElevation;
    origoDiv.style.backgroundColor = 'transparent';

    const origoLabel = new CSS2DObject( origoDiv );
    origoLabel.position.set( 0, 0, 0 );
    origoLabel.center.set( 0, 0 );

    const point = new THREE.Object3D();
    const geometry = new THREE.SphereGeometry( 0.5, 12, 12 );
    const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    const sphere = new THREE.Mesh( geometry, material );
    point.add( sphere );
    point.layers.enableAll();
    scene.add(point);

    point.add( origoLabel );
    origoLabel.layers.set( 0 );

    loadPipes();
    prepareForView();

//
//    const geometry = new THREE.BufferGeometry();
//    geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( ARC_SEGMENTS * 3 ), 3 ) );
//
//    let curve = new THREE.CatmullRomCurve3( positions );
//    curve.curveType = 'catmullrom';
//    curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
//        color: 0xff0000,
//        opacity: 0.35
//    } ) );
//    curve.mesh.castShadow = true;
//    splines.uniform = curve;
//
//    curve = new THREE.CatmullRomCurve3( positions );
//    curve.curveType = 'centripetal';
//    curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
//        color: 0x00ff00,
//        opacity: 0.35
//    } ) );
//    curve.mesh.castShadow = true;
//    splines.centripetal = curve;
//
//    curve = new THREE.CatmullRomCurve3( positions );
//    curve.curveType = 'chordal';
//    curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
//        color: 0x0000ff,
//        opacity: 0.35
//    } ) );
//    curve.mesh.castShadow = true;
//    splines.chordal = curve;
//
//    for ( const k in splines ) {
//
//        const spline = splines[ k ];
//        scene.add( spline.mesh );
//
//    }

//    load( [ new THREE.Vector3( 289.76843686945404, 452.51481137238443, 56.10018915737797 ),
//        new THREE.Vector3( - 53.56300074753207, 171.49711742836848, - 14.495472686253045 ),
//        new THREE.Vector3( - 91.40118730204415, 176.4306956436485, - 6.958271935582161 ),
//        new THREE.Vector3( - 383.785318791128, 491.1365363371675, 47.869296953772746 ) ] );

    render();

}


function loadPipes() {

    // Start by hiding all pipe folders
    for (const [key, folder] of Object.entries(pipeFolders)){
        folder.hide();
    }

    let i = 1;
    for (const pipe of manholeData.pipes){

        var pipeObject = scene.getObjectByName(pipe.guid);
        scene.remove(pipeObject);
        pipeObject = scene.getObjectByName(pipe.guid+"cylinder");
        scene.remove(pipeObject);

        if(!pipe.wallThickness){
            pipe.wallThickness = 6;
        }
        if(!pipe.diameter){
            pipe.diameter = 160;
        }
        if(!pipe.clockPosition){
            pipe.clockPosition = 0;
        }

        const r = pipe.diameter / 20;
        const segmentLength = 50;
        const inset = 10;

        const geomInner = new THREE.CylinderGeometry( r, r, segmentLength, 32 );
        const cylinderInner = new THREE.Mesh( geomInner, matrPipe );

        const geomOuter = new THREE.CylinderGeometry( r + pipe.wallThickness, r + pipe.wallThickness, segmentLength, 32 );
        const cylinderOuter = new THREE.Mesh( geomOuter, matrTransparent );

        const pipeMesh = doCSG(cylinderOuter, cylinderInner, "subtract", matrPipe);
        pipeMesh.setRotationFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI / 2);
        pipeMesh.position.set(0, 0, manholeData.diameter / 20 + segmentLength / 2 - inset);
        cylinderOuter.setRotationFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI / 2);
        cylinderOuter.position.set(0, 0, manholeData.diameter / 20 + segmentLength / 2 - inset);

        const elevationRelativeToOrigo = calculateElevation(pipe);
        const point = new THREE.Object3D();
        point.add(pipeMesh);
        point.position.set(0, elevationRelativeToOrigo, 0);
        point.name = pipe.guid;
        point.updateMatrix();
        scene.add(point);

        // Prepare controls and update the object
        const cBase = new THREE.Object3D();
        cBase.add(cylinderOuter);
        cBase.position.set(0, elevationRelativeToOrigo, 0);
        cBase.name = pipe.guid + "cylinder";
        point.updateMatrix();
        scene.add(cBase);

        // Store objects for later
        pipe.mesh = point;
        pipe.cylinder = cBase;

        // Add functionality on the object
        pipe.removePipe = removePipe.bind(this, pipe);

        if(!pipeFolders[pipe.guid]){
            const pipeFolder = gui.addFolder('Pipe: ' + i);
            pipeFolders[pipe.guid] = pipeFolder;

            pipeFolder.add( pipe, 'measurementLocation', measurementMethods ).name( 'Measurement location' )
                .onFinishChange( function (value) {
                    updatePipeElevations();
                    render();
                }
            );
            pipeFolder.add(pipe, 'elevation', lowestElevation - 0.5, lidElevation).name("Elevation")
                .step( 0.01 ).listen().onChange(
               () => {
                    updatePipeElevations();
                    render();
               }
            )
            pipeFolder.add(pipe, 'clockPosition', 0, 360).name("Position relative to north").step( 1 ).listen().onChange(
               () => {
                    updatePipeAngles();
                    render();
               }
            )
            pipeFolder.add(pipe, "removePipe");
        } else{
            pipeFolders[pipe.guid].show();
        }


        pipes[pipe.guid] = pipe;
        i++;
    }

    updatePipeAngles();
}

function calculateElevation(pipe) {
    const r = pipe.diameter / 20
    let elevationRelativeToOrigo = 0;
    if(pipe.measurementLocation === "topOutsidePipe"){
        elevationRelativeToOrigo = (pipe.elevation - lowestElevation) * 100 - r - pipe.wallThickness;
    } else if(pipe.measurementLocation === "bottomInsidePipe"){
        elevationRelativeToOrigo = (pipe.elevation - lowestElevation) * 100 + r;
    } else{
        elevationRelativeToOrigo = (pipe.elevation - lowestElevation) * 100 + r;
    }

    return elevationRelativeToOrigo;
}

//
//function addSplineObject( position ) {
//
//    const material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
//    const object = new THREE.Mesh( geometry, material );
//
//    if ( position ) {
//
//        object.position.copy( position );
//
//    } else {
//
//        object.position.x = Math.random() * 1000 - 500;
//        object.position.y = Math.random() * 600;
//        object.position.z = Math.random() * 800 - 400;
//
//    }
//
//    object.castShadow = true;
//    object.receiveShadow = true;
//    scene.add( object );
//    splineHelperObjects.push( object );
//    return object;
//
//}
//
//function addPoint() {
//
//    splinePointsLength ++;
//
//    positions.push( addSplineObject().position );
//
//    updateSplineOutline();
//
//    render();
//
//}


function removePipe(pipe) {
    for (var i = manholeData.pipes.length - 1; i >= 0; --i) {
        if (manholeData.pipes[i].guid == pipe.guid) {
            manholeData.pipes.splice(i,1);
            delete(pipes[pipe.guid]);
            removeObjectByName(pipe.guid);
            removeObjectByName(pipe.guid+"cylinder");
        }
    }
    loadPipes();
    prepareForView();

}

function removeObjectByName(name){
    var selectedObject = scene.getObjectByName(name);
    scene.remove(selectedObject)
}

function addPipe() {

    const defaultPipeVals = {
        "guid": uuidv4(),
        "elevation": lowestElevation,
        "clockPosition": 0,
        "measurementLocation": "bottomInsidePipe",
        "diameter": 200,
        "material": "Concrete"
    }

    manholeData.pipes.push(defaultPipeVals);
    loadPipes();
    prepareForView();

}

//
//function removePoint() {
//
//    if ( splinePointsLength <= 4 ) {
//
//        return;
//
//    }
//
//    const point = splineHelperObjects.pop();
//    splinePointsLength --;
//    positions.pop();
//
//    if ( transformControl.object === point ) transformControl.detach();
//    scene.remove( point );
//
//    updateSplineOutline();
//
//    render();
//
//}

function prepareForView() {

    var selectedObject = scene.getObjectByName("bottomConstruction");
    let bottom = originalBottomConstruction.clone();
    scene.remove(selectedObject);

    const alpha = Math.atan2(camera.position.z, camera.position.x);
    const verticalAngle = Math.atan2(camera.position.y, camera.position.x);
    console.log(verticalAngle);

    var topCone = scene.getObjectByName("topCone");
    var topAdjustmentRing = scene.getObjectByName("topAdjustmentRing");
    if(verticalAngle > Math.PI/3 && verticalAngle < Math.PI - Math.PI/3){
        // Hide the top solution
//        topCone.visible = false;
//        topAdjustmentRing.visible = false;
        topCone.material = matrGrayWireframe;
        topAdjustmentRing.material = matrGrayWireframe;
    } else{
//        topCone.visible = true;
//        topAdjustmentRing.visible = true;
        topCone.material = matrGray;
        topAdjustmentRing.material = matrGray;
    }

    const posX = Math.cos(alpha) * manholeData.diameter / 20;
    const posZ = Math.sin(alpha) * manholeData.diameter / 20;

    const clippingBoxGeometry = new THREE.BoxGeometry( manholeData.diameter / 10, bottomSectionHeight, manholeData.diameter / 10 );
    const boxMesh = new THREE.Mesh( clippingBoxGeometry, matrGray );
    boxMesh.position.set(posX, 0, posZ);
    boxMesh.updateMatrix();

    bottomConstruction = doCSG(bottom, boxMesh, "subtract", matrGray);
    bottomConstruction.position.set(0, bottomSectionHeight / 2 - 15,0);
    bottomConstruction.updateMatrix();
    bottomConstruction.name = "bottomConstruction";
    scene.add(bottomConstruction);

    // Then cut the bottom
    cutBottomSection();

    render();
}

function cutBottomSection() {

    var selectedObject = scene.getObjectByName("bottomConstruction");
    let modified = selectedObject.clone();
    scene.remove(selectedObject);

    for ( const guid in pipes ) {

        const pipe = pipes[ guid ];
        const pipeMesh = pipe.mesh;
        const pipeCylinder = pipe.cylinder;

        const child = pipe.cylinder.children[0].clone();
        child.removeFromParent();
        child.applyMatrix4(pipeCylinder.matrixWorld);
        modified = doCSG(modified, child, "subtract", matrGray);
    }

    // Apply the name, since the CSG object no longer has the same properties
    modified.name = "bottomConstruction";
    scene.add(modified);

    render();
}

function updatePipeElevations() {

    for ( const guid in pipes ) {

        const pipe = pipes[ guid ];

        const pipeMesh = pipe.mesh;
        const pipeCylinder = pipe.cylinder;
        const pipeElevation = calculateElevation(pipe);

        pipeMesh.position.set(pipeMesh.position.x, pipeElevation, pipeMesh.position.z);
        pipeCylinder.position.set(pipeCylinder.position.x, pipeElevation, pipeCylinder.position.z);
        pipeMesh.updateMatrix();
        pipeCylinder.updateMatrix();

    }

    const processChange = debounce(() => prepareForView());
    processChange();

}

function updatePipeAngles() {

    for ( const guid in pipes ) {

        const pipe = pipes[ guid ];

        const pipeMesh = pipe.mesh;
        const pipeCylinder = pipe.cylinder;
        const radians = clockPositionToRadians(pipe.clockPosition) + Math.PI/2;
        pipeMesh.setRotationFromAxisAngle(new THREE.Vector3(0,1,0), radians);
        pipeCylinder.setRotationFromAxisAngle(new THREE.Vector3(0,1,0), radians);
        pipeMesh.updateMatrix();
        pipeCylinder.updateMatrix();
    }

    const processChange = debounce(() => prepareForView());
    processChange();

}
//
//function updateSplineOutline() {
//
//    for ( const k in splines ) {
//
//        const spline = splines[ k ];
//
//        const splineMesh = spline.mesh;
//        const position = splineMesh.geometry.attributes.position;
//
//        for ( let i = 0; i < ARC_SEGMENTS; i ++ ) {
//
//            const t = i / ( ARC_SEGMENTS - 1 );
//            spline.getPoint( t, point );
//            position.setXYZ( i, point.x, point.y, point.z );
//
//        }
//
//        position.needsUpdate = true;
//
//    }
//
//}
//
//function exportSpline() {
//
//    const strplace = [];
//
//    for ( let i = 0; i < splinePointsLength; i ++ ) {
//
//        const p = splineHelperObjects[ i ].position;
//        strplace.push( `new THREE.Vector3(${p.x}, ${p.y}, ${p.z})` );
//
//    }
//
//    console.log( strplace.join( ',\n' ) );
//    const code = '[' + ( strplace.join( ',\n\t' ) ) + ']';
//    prompt( 'copy and paste code', code );
//
//}

//function load( new_positions ) {
//
//    while ( new_positions.length > positions.length ) {
//
//        addPoint();
//
//    }
//
//    while ( new_positions.length < positions.length ) {
//
//        removePoint();
//
//    }
//
//    for ( let i = 0; i < positions.length; i ++ ) {
//
//        positions[ i ].copy( new_positions[ i ] );
//
//    }
//
//    updateSplineOutline();
//
//}

function render() {

//    splines.uniform.mesh.visible = params.uniform;
//    splines.centripetal.mesh.visible = params.centripetal;
//    splines.chordal.mesh.visible = params.chordal;

    labelRenderer.render( scene, camera );
    renderer.render( scene, camera );
    viewHelper.render(renderer);
//    viewportGizmo.update();
//    viewportGizmo.render();

}

function changeCamera() {
    const clipIt = debounce(() => prepareForView());
    clipIt();
    render();
}

function onPointerDown( event ) {

    onDownPosition.x = event.clientX;
    onDownPosition.y = event.clientY;

}

function onPointerUp( event ) {

    onUpPosition.x = event.clientX;
    onUpPosition.y = event.clientY;

    if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) {

//        transformControl.detach();
        render();

    }

}

function onPointerMove( event ) {

    pointer.x = ( event.offsetX / container.clientWidth ) * 2 - 1;
    pointer.y = - ( event.offsetY / container.clientHeight ) * 2 + 1;

    raycaster.setFromCamera( pointer, camera );

//    const intersects = raycaster.intersectObjects( splineHelperObjects, false );
//
//    if ( intersects.length > 0 ) {
//
//        const object = intersects[ 0 ].object;
//
//        if ( object !== transformControl.object ) {
//
//            transformControl.attach( object );
//            transformControl.setMode("rotate");
//            transformControl.showX = false;
//            transformControl.showZ = false;
//            transformControl.setRotationSnap(Math.PI / 6);
//
//        }
//
//    }

}

function onWindowResize() {
    container = document.getElementById( 'container' );

   renderer.setSize(container.clientWidth, container.clientHeight);
   labelRenderer.setSize(container.clientWidth, container.clientHeight);
   camera.aspect = container.clientWidth / container.clientHeight;
   camera.updateProjectionMatrix();

//    camera.aspect = window.innerWidth / window.innerHeight;
//    camera.updateProjectionMatrix();
//
//    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}
