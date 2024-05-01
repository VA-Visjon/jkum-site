import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { ViewportGizmo } from "three/addons/libs/three-viewport-gizmo.js";
import { ViewHelper } from "three/addons/helpers/ViewHelper.js";
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

import { uuidv4, clockPositionToRadians } from './utils.js';
import { init } from 'three/addons/libs/edge_finder.js'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { PencilLinesPass } from 'three/addons/postprocessing/PencilLinePass.js';
import { CustomOutlinePass } from "three/addons/postprocessing/CustomOutlinePass.js";
import { CustomOutlinePassNoIndices } from "three/addons/postprocessing/CustomOutlinePassNoIndices.js";

import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
import { LuminosityShader } from 'three/addons/shaders/LuminosityShader.js';
import { SobelOperatorShader } from 'three/addons/shaders/SobelOperatorShader.js';

import CustomCylinderGeometry from "three/addons/helpers/CustomCylinderGeometry.js";
import FindSurfaces from "three/addons/helpers/FindSurfaces.js";

import {CSG} from 'three/addons/libs/CSGMesh.js';

let container;
let camera, scene, renderer, composer, finalComposer;
let effectFXAA, customOutline;
let viewportGizmo;
let viewHelper;
let outlinePass;
let labelRenderer;
let gui;

const mediumVariants = {
    "Water": "Water",
    "Sewer": "Sewer",
    "Combination sewer": "Combination sewer",
    "Storm water": "Storm water",
    "Drain": "Drain"
};

const measurementMethods = {
    'Topp utv. rør': 'topOutsidePipe',
    'Bunn inv. rør': 'bottomInsidePipe',
    'Senter rør': 'centerPipe',
};

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const onUpPosition = new THREE.Vector2();
const onDownPosition = new THREE.Vector2();
let hoverObject = [];
let allObjects = [];

let lidElevation = 0;
let lowestElevation = 0;
let deltaH = 0;
let manholeData = null;
let bottomSectionHeight = 0;
let manholeRadius = 0;
const topHeight = 70;
const bottomThickness = 15;

let originalBottomConstruction;
let bottomConstruction;

let surfaceFinder;

// Define some materials
const matrTransparent = new THREE.MeshLambertMaterial( { color: 0x000000, transparent: true, opacity: 0 } );
const matrGray = new THREE.MeshLambertMaterial( { color: 0x999999 } );
const matrGrayWireframe = new THREE.MeshLambertMaterial( { color: 0x999999, wireframe: true } );
const matrRed = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
const matrPipe = new THREE.MeshLambertMaterial( { color: 0xff22dd } );
const matrRustIron = new THREE.MeshLambertMaterial( { color: 0xcc6633 } );

const matrPipeDict = {
    "Water": new THREE.MeshLambertMaterial( { color: 0x0000ff } ),
    "Storm water": new THREE.MeshLambertMaterial( { color: 0x383838 } ),
    "Sewer": new THREE.MeshLambertMaterial( { color: 0x00ff00 } ),
    "Combination sewer": new THREE.MeshLambertMaterial( { color: 0xff0000 } ),
    "Drain": new THREE.MeshLambertMaterial( { color: 0x714423 } )
};

let pipes = {};
const pipeFolders = {};

const params = {
    addPipe: addPipe
};

export function clearJkumEditor() {
    // Clear all event listeners
    controls.removeEventListener( 'change', changeCamera );
    document.removeEventListener( 'pointerdown', onPointerDown );
    document.removeEventListener( 'pointerup', onPointerUp );
    document.removeEventListener( 'pointermove', onPointerMove );
    window.removeEventListener( 'resize', onWindowResize );

    // Empty the container and variables
    manholeData = null;
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
    manholeData = manhole;
    sanitizeManholeData();

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

    const light2 = new THREE.PointLight();
    light2.position.set(0, 50, 0);
    light2.castShadow = false;
    scene.add(light2);

    const planeGeometry = new THREE.PlaneGeometry( 2000, 2000 );
    planeGeometry.rotateX( - Math.PI / 2 );
    const planeMaterial = new THREE.ShadowMaterial( { color: 0x000000, opacity: 0.2 } );

    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.y = - 50;
    plane.receiveShadow = true;
    scene.add( plane );

    // Create navigation axis
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });
    let points = [];
    points.push( new THREE.Vector3( -300, -50, 0 ) );
    points.push( new THREE.Vector3( 300, -50, 0 ) );
    let geometry = new THREE.BufferGeometry().setFromPoints( points );
    let line = new THREE.Line( geometry, material );
    scene.add( line );

    points = [];
    points.push( new THREE.Vector3( 0, -50, -300 ) );
    points.push( new THREE.Vector3( 0, -50, 300 ) );
    geometry = new THREE.BufferGeometry().setFromPoints( points );
    line = new THREE.Line( geometry, material );
    scene.add( line );


    // Create annotations
    const origoDiv = document.createElement( 'div' );
    origoDiv.className = 'directions-label north-label';
    origoDiv.textContent = 'N';

    const origoLabel = new CSS2DObject( origoDiv );
    origoLabel.position.set( 0, 0, 0 );
    origoLabel.center.set( 0.5, 0.5 );

    const point = new THREE.Object3D();
    point.position.set( 0, -50, -300 );
    point.name = 'north_position';
    point.layers.enableAll();
    scene.add(point);

    point.add( origoLabel );
    origoLabel.layers.set( 0 );

//    const helper = new THREE.GridHelper( 2000, 100 );
//    helper.position.y = -19;
//    helper.material.opacity = 0.25;
//    helper.material.transparent = true;
//    scene.add( helper );

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

    viewHelper = new ViewHelper(camera, container);
    scene.add(viewHelper);

    // Setting up postprocessing
    const width = container.clientWidth;
    const height = container.clientHeight;

    const depthTexture = new THREE.DepthTexture();
    const renderTarget = new THREE.WebGLRenderTarget(
      width,
      height,
      {
        depthTexture: depthTexture,
        depthBuffer: true,
      }
    );

    // Postprocessing first run
    composer = new EffectComposer( renderer, renderTarget );

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
//
//    // Outline pass
//    customOutline = new CustomOutlinePassNoIndices(
//      new THREE.Vector2(width, height),
//      scene,
//      camera
//    );
//    composer.addPass(customOutline);
//
//    // Antialias pass
//    effectFXAA = new ShaderPass(FXAAShader);
//    effectFXAA.uniforms["resolution"].value.set(
//      1 / width,
//      1 / height
//    );
//    composer.addPass(effectFXAA);

    // Gui
    gui = new GUI({ autoPlace: false });
    gui.domElement.id = 'gui';
    gui.add(manholeData, 'elevationBottom').name("Elevation bottom").step( 0.01 ).onFinishChange(
       (value) => {
            rebuildEntireConstruction();
       }
    )
    gui.add(manholeData, 'isEccentric').name("Eccentric?").onFinishChange(
       (value) => {
            rebuildEntireConstruction();
       }
    )
    if(manholeData.isEccentric){
        gui.add(manholeData, 'rotation', 0, 360).name("Manhole rotation").step( 1 ).listen().onChange(
           (value) => {
                updateTopSolution();
           }
        )
    }
    gui.add( params, 'addPipe' ).name("Add pipe");
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
    document.addEventListener( 'pointerdown', onPointerDown );
    document.addEventListener( 'pointerup', onPointerUp );
    document.addEventListener( 'pointermove', onPointerMove );
    window.addEventListener( 'resize', onWindowResize );

    rebuildEntireConstruction();

}

function sanitizeManholeData() {

    // Clear the pipes and reset for next init
    pipes = {};
    lidElevation = 0;
    lowestElevation = 0;
    deltaH = 0;
    bottomSectionHeight = 0;

    originalBottomConstruction = null;
    bottomConstruction = null;

    // Prepare manhole data
    lidElevation = manholeData.lids[0].position.elevation;
    lowestElevation = lidElevation;
    if(manholeData.pipes && manholeData.pipes.length > 0){
        for (const pipe of manholeData.pipes){
            if(pipe.elevation < lowestElevation){
                lowestElevation = pipe.elevation;
            }
        }
    }
    if(manholeData.elevationBottom && manholeData.elevationBottom < lowestElevation){
        lowestElevation = manholeData.elevationBottom;
    }
    deltaH = (lidElevation - lowestElevation) * 100;

    // Prepare constants
    bottomSectionHeight = deltaH - topHeight + bottomThickness;
    manholeRadius = manholeData.diameter ? manholeData.diameter / 20 : 1200 / 20;

    if(!manholeData.hasOwnProperty('shape')){
        manholeData.shape = "Circular";
    }

    if(!manholeData.hasOwnProperty('elevationBottom')){
        manholeData.elevationBottom = lowestElevation;
    }

    if(!manholeData.hasOwnProperty('isEccentric')){
        if(manholeData.shape === "Circular"){
            manholeData.isEccentric = true;
        } else{
            manholeData.isEccentric = false;
        }
    }

    if(!manholeData.hasOwnProperty('rotation')){
        if(manholeData.isEccentric){
            manholeData.rotation = 0;
        }
    }

}

function rebuildEntireConstruction() {
    // Make sure we have what we need
    sanitizeManholeData();

    // Prepare geometries
    createBottomSolution();
    createTopSolution();
    loadPipes();
    prepareForView();

}


function createBottomSolution() {
    if(manholeData.shape === "Circular"){
        createBottomCircularSolution();
    } else {
        createBottomRectangularSolution();
    }
}

function createTopSolution() {
    if(manholeData.shape === "Circular"){
        createTopCircularSolution();
    } else {
        createTopRectangularSolution();
    }
}


function createBottomRectangularSolution() {

    // Create the bottom of the manhole
    const geomInner = new THREE.BoxGeometry( manholeData.sizeX / 10, bottomSectionHeight, manholeData.sizeY / 10 );
    const cylinderInner = new THREE.Mesh( geomInner, matrGray );

    const geomOuter = new THREE.BoxGeometry( manholeData.sizeX / 10 +20, bottomSectionHeight, manholeData.sizeY / 10 +20 );
    const cylinderOuter = new THREE.Mesh( geomOuter, matrGray );
    cylinderOuter.position.set(0, -bottomThickness, 0); // Using centimeters here, 15 cm down as is a regular precast concrete manhole

    cylinderInner.updateMatrix();
    cylinderOuter.updateMatrix();

    const bottom = doCSG(cylinderOuter, cylinderInner, "subtract", matrGray);
    originalBottomConstruction = bottom.clone();

    // Label cleanup
    const bottomLabels = document.getElementsByClassName("bottom-label");
    for (var j = bottomLabels.length-1; j >= 0; j--){
        bottomLabels[j].remove();
    }

    // Create annotations
    const origoDiv = document.createElement( 'div' );
    origoDiv.className = 'label bottom-label';
    origoDiv.textContent = 'kt +'+ lowestElevation.toFixed(2);

    const origoLabel = new CSS2DObject( origoDiv );
    origoLabel.position.set( 0, 0, 0 );
    origoLabel.center.set( -0.1, 0.5 );

    const point = new THREE.Object3D();
    const geometry = new THREE.SphereGeometry( 1, 12, 12 );
    const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    const sphere = new THREE.Mesh( geometry, material );
    point.add( sphere );
    point.layers.enableAll();
    scene.add(point);

    point.add( origoLabel );
    origoLabel.layers.set( 0 );
}

function createBottomCircularSolution() {

    // Create the bottom of the manhole
    const geomInner = new THREE.CylinderGeometry( manholeRadius, manholeRadius, bottomSectionHeight, 32 );
    const cylinderInner = new THREE.Mesh( geomInner, matrGray );

    const geomOuter = new THREE.CylinderGeometry( manholeRadius + 10, manholeRadius + 10, bottomSectionHeight, 32 );
    const cylinderOuter = new THREE.Mesh( geomOuter, matrGray );
    cylinderOuter.position.set(0, -bottomThickness, 0); // Using centimeters here, 15 cm down as is a regular precast concrete manhole

    cylinderInner.updateMatrix();
    cylinderOuter.updateMatrix();

    const bottom = doCSG(cylinderOuter, cylinderInner, "subtract", matrGray);
    originalBottomConstruction = bottom.clone();

    // Label cleanup
    removeObjectByName('bottom_point');
    let bottomLabels = document.getElementsByClassName("bottom-label");
    for (var j = bottomLabels.length-1; j >= 0; j--){
        bottomLabels[j].remove();
    }
    // Create annotations
    const origoDiv = document.createElement( 'div' );
    origoDiv.className = 'label bottom-label';
    origoDiv.textContent = 'kt +'+ lowestElevation.toFixed(2);

    const origoLabel = new CSS2DObject( origoDiv );
    origoLabel.position.set( 0, 0, 0 );
    origoLabel.center.set( -0.1, 0.5 );

    const point = new THREE.Object3D();
    const geometry = new THREE.SphereGeometry( 1, 12, 12 );
    const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    const sphere = new THREE.Mesh( geometry, material );
    point.add( sphere );
    point.layers.enableAll();
    point.name = 'bottom_point';
    scene.add(point);

    point.add( origoLabel );
    origoLabel.layers.set( 0 );
}

function createTopCircularSolution() {

    // Add the top lid
    const h = 3;
    let firstLid = null;

    // Cleanup
    removeObjectByName("lid");
    removeObjectByName("topCone");
    removeObjectByName("topAdjustmentRing");

    // Label cleanup
    const lidLabels = document.getElementsByClassName("lid-label");
    for (var j = lidLabels.length-1; j >= 0; j--){
        lidLabels[j].remove();
    }

    // Build lids
    for(const [index, lid] of manholeData.lids.entries()){

        const lidR = lid.diameter ? parseInt(lid.diameter) / 20 : 650 / 20;
        const geomLid = new THREE.CylinderGeometry( lidR, lidR, h, 32 );
        const lidGeom = new THREE.Mesh( geomLid, matrRustIron );
        let dx = 0;
        let dy = 0;
        if(index === 0 && manholeData.isEccentric){
            const dl = manholeData.diameter / 20 - lidR;
            const angle = clockPositionToRadians(manholeData.rotation);
            dx = Math.cos(angle) * dl;
            dy = Math.sin(angle) * dl;
            firstLid = {
                dx:dx,
                dy:dy,
                dl:dl,
                position: lid.position,
                centerManhole: {
                    x: lid.position.east - dx/10, // Convert to meters
                    y: lid.position.north + dy/10  // Convert to meters
                }
            };
        }

        lidGeom.position.set(dx, deltaH - h/2.0, -dy);
        lidGeom.name = "lid";

        // Create annotations
        const div = document.createElement( 'div' );
        div.className = 'label lid-label';
        div.textContent = 'kt +'+ lid.position.elevation.toFixed(2);

        const label = new CSS2DObject( div );
        label.position.set( 0, 0, 0 );
        label.center.set( -0.1, 0.5 );

        const geometry = new THREE.SphereGeometry( 1, 12, 12 );
        const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
        const sphere = new THREE.Mesh( geometry, material );

        sphere.position.set(0,h/2.0,0);
        sphere.layers.enableAll();

        sphere.add( label );
        label.layers.set( 0 );
        lidGeom.add(sphere);

        scene.add(lidGeom);
    }

    // Build top solution
    const coneHeight = 50;
    if(manholeData.isEccentric){
        // Excentric manhole
        const coordFun = (i, t) => {
            const j = i / t; // 0 .. 1
            const x = firstLid.dx / 2 - j * firstLid.dx;
            const y = -firstLid.dy / 2 - j * -firstLid.dy;
            return [x, coneHeight/2 - coneHeight * j, y, 65/2 + (manholeRadius-65/2) * j];
        };
        const geometry = new CustomCylinderGeometry(coordFun, 32, 8, false);
        const material = new THREE.MeshLambertMaterial({
            color: 0xff2200,
            wireframe: true,
            emissive: 0x33333
        });
        const topInner = new THREE.Mesh(geometry, material);

        const coordFunOuter = (i, t) => {
            const j = i / t; // 0 .. 1
            const x = firstLid.dx / 2 - j * firstLid.dx;
            const y = -firstLid.dy / 2 - j * -firstLid.dy;
            return [x, coneHeight/2 - coneHeight * j, y, 65/2 + 10 + (manholeRadius - 65/2) * j];
        };
        const geometryOuter = new CustomCylinderGeometry(coordFunOuter, 32, 8, false);
        const topOuter = new THREE.Mesh(geometryOuter, material);

        const coneMesh = doCSG(topOuter, topInner, "subtract", matrGray);
        coneMesh.position.set(firstLid.dx / 2, deltaH - 45, -firstLid.dy / 2);
        coneMesh.name = "topCone";
        scene.add(coneMesh);

        const adjustmentRingInner = new THREE.CylinderGeometry( 65/2, 65/2, 15, 32 );
        const adjustmentRing = new THREE.Mesh( adjustmentRingInner, matrGray );
        const adjustmentRingOuterGeom = new THREE.CylinderGeometry( 65/2 + 10, 65/2 + 10, 15, 32 );
        const adjustmentRingOuter = new THREE.Mesh( adjustmentRingOuterGeom, matrGray );
        const adjustmentRingMesh = doCSG(adjustmentRingOuter, adjustmentRing, "subtract", matrGray);
        adjustmentRingMesh.position.set(firstLid.dx, deltaH - 5 - 15/2.0, -firstLid.dy);
        adjustmentRingMesh.name = "topAdjustmentRing";
        scene.add(adjustmentRingMesh);

    } else{
        // Centric manhole
        const coneInner = new THREE.CylinderGeometry( 65/2, manholeRadius, coneHeight, 32 );
        const topInner = new THREE.Mesh( coneInner, matrGray );
        const coneOuter = new THREE.CylinderGeometry( 65/2 + 10, manholeRadius + 10, coneHeight, 32 );
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
    }

    render();
}


function createTopRectangularSolution() {

    // Add the top lid
    const h = 3;
    let firstLid = null;

    // Cleanup
    removeObjectByName("lid");
    removeObjectByName("topCone");
    removeObjectByName("topAdjustmentRing");

    // Label cleanup
    const lidLabels = document.getElementsByClassName("lid-label");
    for (var j = lidLabels.length-1; j >= 0; j--){
        lidLabels[j].remove();
    }

    // Build lids
    for(const [index, lid] of manholeData.lids.entries()){

        const lidR = lid.diameter ? parseInt(lid.diameter) / 20 : 650 / 20;
        const geomLid = new THREE.CylinderGeometry( lidR, lidR, h, 32 );
        const lidGeom = new THREE.Mesh( geomLid, matrRustIron );
        let dx = 0;
        let dy = 0;
        if(index === 0 && manholeData.isEccentric){
            const dl = manholeData.diameter / 20 - lidR;
            const angle = clockPositionToRadians(manholeData.rotation);
            dx = Math.cos(angle) * dl;
            dy = Math.sin(angle) * dl;
            firstLid = {
                dx:dx,
                dy:dy,
                dl:dl,
                position: lid.position,
                centerManhole: {
                    x: lid.position.east - dx/10, // Convert to meters
                    y: lid.position.north + dy/10  // Convert to meters
                }
            };
        }

        lidGeom.position.set(dx, deltaH - h/2.0, -dy);
        lidGeom.name = "lid";

        // Create annotations
        const div = document.createElement( 'div' );
        div.className = 'label lid-label';
        div.textContent = 'kt +'+ lid.position.elevation.toFixed(2);

        const label = new CSS2DObject( div );
        label.position.set( 0, 0, 0 );
        label.center.set( -0.1, 0.5 );

        const geometry = new THREE.SphereGeometry( 1, 12, 12 );
        const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
        const sphere = new THREE.Mesh( geometry, material );

        sphere.position.set(0,h/2.0,0);
        sphere.layers.enableAll();

        sphere.add( label );
        label.layers.set( 0 );
        lidGeom.add(sphere);

        scene.add(lidGeom);
    }

    // Build top solution
    const coneHeight = 50;

    // Centric manhole
    const topPlateGeom = new THREE.BoxGeometry( manholeData.sizeX / 10 + 20, 20, manholeData.sizeY / 10 + 20 );
    const topPlate = new THREE.Mesh( topPlateGeom, matrGray );
    topPlate.position.set(0, deltaH - topHeight + 10, 0);
    topPlate.name = "topCone";
    scene.add(topPlate);

    const adjustmentRingInner = new THREE.CylinderGeometry( 65/2, 65/2, topHeight - 20, 32 );
    const adjustmentRing = new THREE.Mesh( adjustmentRingInner, matrGray );
    const adjustmentRingOuterGeom = new THREE.CylinderGeometry( 65/2 + 10, 65/2 + 10, topHeight - 20, 32 );
    const adjustmentRingOuter = new THREE.Mesh( adjustmentRingOuterGeom, matrGray );
    const adjustmentRingMesh = doCSG(adjustmentRingOuter, adjustmentRing, "subtract", matrGray);
    adjustmentRingMesh.position.set(0, deltaH - 5 - (topHeight - 20)/2.0, 0);
    adjustmentRingMesh.name = "topAdjustmentRing";
    scene.add(adjustmentRingMesh);

    render();
}



function createMeasurementLocation(pipe, r, segmentLength){
    // Create annotations
    const origoDiv = document.createElement( 'div' );
    origoDiv.className = 'label pipe-label';
    origoDiv.textContent = 'kt +'+ pipe.elevation.toFixed(2);

    const origoLabel = new CSS2DObject( origoDiv );
    origoLabel.position.set( 0, 0, 0 );
    origoLabel.center.set( -0.1, 0.5 );

    const geometry = new THREE.SphereGeometry( 1, 12, 12 );
    const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    const sphere = new THREE.Mesh( geometry, material );
    let offset = 0;
    if(pipe.measurementLocation === "topOutsidePipe"){
        offset = -r - pipe.wallThickness;
    } else if(pipe.measurementLocation === "bottomInsidePipe"){
        offset = r;
    } else if(pipe.measurementLocation === 'centerPipe'){
        offset = 0;
    }
    sphere.position.set(0,-segmentLength/2,offset);
    sphere.layers.enableAll();

    sphere.add( origoLabel );
    origoLabel.layers.set( 0 );

    return sphere;
}

function loadPipes() {

    // Start by hiding all pipe folders
    for (const [key, folder] of Object.entries(pipeFolders)){
        folder.hide();
    }

    // Label cleanup
    const pipeLabels = document.getElementsByClassName("pipe-label");
    for (var j = pipeLabels.length-1; j >= 0; j--){
        pipeLabels[j].remove();
    }

    let i = 1;
    for (const pipe of manholeData.pipes){

        var pipeObject = scene.getObjectByName(pipe.guid);
        scene.remove(pipeObject);

        if(!pipe.wallThickness){
            pipe.wallThickness = 6;
        }
        if(!pipe.diameter || parseInt(pipe.diameter) === 0){
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

        let pipeMaterial = matrPipe;
        if(pipe.medium && matrPipeDict.hasOwnProperty(pipe.medium)){
            pipeMaterial = matrPipeDict[pipe.medium];
        }

        const pipeMesh = doCSG(cylinderOuter, cylinderInner, "subtract", pipeMaterial);

        const measurement = createMeasurementLocation(pipe, r, segmentLength);
        pipeMesh.add( measurement );

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

        // Prepare full cylinder for later use for cutting the bottom section
        const cBase = new THREE.Object3D();
        cBase.add(cylinderOuter);
        cBase.position.set(0, elevationRelativeToOrigo, 0);
        cBase.name = pipe.guid + "cylinder";
        cBase.updateMatrix(); // Do not add to the scene

        // Store objects for later
        pipe.mesh = point;
        pipe.cylinder = cBase;

        // Add functionality on the object
        pipe.removePipe = removePipe.bind(this, pipe);

        if(!pipeFolders[pipe.guid]){
            const pipeFolder = gui.addFolder('Pipe: ' + i);
            pipeFolders[pipe.guid] = pipeFolder;

            pipeFolder.add(pipe, 'medium', mediumVariants).name("Medium")
                .onFinishChange( (value) => {
                    const processChange = debounce(() => {loadPipes(); prepareForView()});
                    processChange();
               }
            )
            pipeFolder.add( pipe, 'measurementLocation', measurementMethods ).name( 'Measurement location' )
                .onFinishChange( (value) => {
                    const processChange = debounce(() => {loadPipes(); prepareForView()});
                    processChange();
                }
            );
            pipeFolder.add(pipe, 'elevation', lowestElevation - 0.5, lidElevation).name("Elevation")
                .step( 0.01 ).listen().onChange(
               () => {
                    updatePipeElevations();
                    render();
               }
            )
            pipeFolder.add(pipe, 'diameter', 110, 1200).name("Diameter")
                .step( 1 ).listen().onChange(
               () => {
                    const processChange = debounce(() => {loadPipes(); prepareForView()});
                    processChange();
               }
            )
            pipeFolder.add(pipe, 'clockPosition', 0, 360).name("Position relative to north").step( 1 ).listen().onChange(
               () => {
                    updatePipeAngles();
                    render();
               }
            )
            pipeFolder.add(pipe, "removePipe").name("Remove pipe");
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
    } else if(pipe.measurementLocation === "centerPipe"){
        elevationRelativeToOrigo = (pipe.elevation - lowestElevation) * 100;
    } else{
        elevationRelativeToOrigo = (pipe.elevation - lowestElevation) * 100;
    }

    return elevationRelativeToOrigo;
}

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

function prepareForView() {

    var selectedObject = scene.getObjectByName("bottomConstruction");
//    removeObjectByName("bottomConstructionEdges");
    let bottom = originalBottomConstruction.clone();
    scene.remove(selectedObject);

    const alpha = Math.atan2(camera.position.z, camera.position.x);
    const verticalAngle = Math.atan2(camera.position.y, camera.position.x);

    var topCone = scene.getObjectByName("topCone");
    var topAdjustmentRing = scene.getObjectByName("topAdjustmentRing");
    if(verticalAngle > Math.PI*7.5/18 && verticalAngle < Math.PI - Math.PI*7.5/18){
        // Hide the top solution
//        topCone.material = matrGrayWireframe;
//        topAdjustmentRing.material = matrGrayWireframe;
        topCone.visible = false;
        topAdjustmentRing.visible = false;
    } else{
//        topCone.material = matrGray;
//        topAdjustmentRing.material = matrGray;
        topCone.visible = true;
        topAdjustmentRing.visible = true;
    }

    let posX, posZ;
    let x, z;
    if(manholeData.shape === "Circular"){
        posX = Math.cos(alpha) * manholeData.diameter / 20;
        posZ = Math.sin(alpha) * manholeData.diameter / 20;
        x = manholeData.diameter;
        z = manholeData.diameter;
    } else if(manholeData.shape === "Rectangular"){
        posX = Math.cos(alpha) * manholeData.sizeX / 20;
        posZ = Math.sin(alpha) * manholeData.sizeY / 20;
        x = manholeData.sizeX;
        z = manholeData.sizeY;
    }

    const clippingBoxGeometry = new THREE.BoxGeometry( x / 10, bottomSectionHeight, z / 10 );
    const boxMesh = new THREE.Mesh( clippingBoxGeometry, matrGray );
    boxMesh.position.set(posX, 0, posZ);
    boxMesh.updateMatrix();

    bottomConstruction = doCSG(bottom, boxMesh, "subtract", matrGray);
    bottomConstruction.position.set(0, bottomSectionHeight / 2 - 15,0);
    bottomConstruction.updateMatrix();
    bottomConstruction.name = "bottomConstruction";
    scene.add(bottomConstruction);

    // Then cut the bottom
    if(manholeData.shape === "Circular"){
        cutBottomSection();
    }
    // TODO: Implement pipes for other shapes

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
        child.applyMatrix4(pipeCylinder.matrix);
        modified = doCSG(modified, child, "subtract", matrGray);
    }

    // Apply the name, since the CSG object no longer has the same properties
    modified.name = "bottomConstruction";
    scene.add(modified);

    render();
}

function updateTopSolution() {
    const processChange = debounce(() => createTopSolution());
    processChange();
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


function addHoverObject( object ) {
    hoverObject = [];
    hoverObject.push( object );
}



function render() {
    labelRenderer.render( scene, camera );
    renderer.render( scene, camera );

//    const allMeshes = []
//    scene.traverse( function( object ) {
//        if(object instanceof THREE.Mesh){
//            allMeshes.push(object);
//        }
//    } );
//    console.log(allMeshes);
//    outlinePass.selectedObjects = allMeshes;

    composer.render();
//    finalComposer.render();
    viewHelper.render(renderer);
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
        render();
    }
}

function onPointerMove( event ) {

    pointer.x = ( event.offsetX / container.clientWidth ) * 2 - 1;
    pointer.y = - ( event.offsetY / container.clientHeight ) * 2 + 1;

    raycaster.setFromCamera( pointer, camera );
//
//    const intersects = raycaster.intersectObject( scene, true );
//
//    if ( intersects.length > 0 ) {
//
//        const selectedObject = intersects[ 0 ].object;
//        addHoverObject( selectedObject );
//        outlinePass.selectedObjects = hoverObject;
//
//    } else {
//
//        // outlinePass.selectedObjects = [];
//
//    }
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
//    composer.render();
//    finalComposer.render();

}


//function convertThreeMeshToMeshObject(mesh) {
//    const positions = mesh.geometry.attributes.position.array;
//    const vertices = [];
//    for (let i = 0; i < positions.length; i += 3) {
//        vertices.push(new THREE.Point3d(positions[i], positions[i + 1], positions[i + 2]));
//    }
//
//    let indices = [];
//    if (mesh.geometry.index) {
//        indices = Array.from(mesh.geometry.index.array);
//    } else if(mesh.geometry.attributes.index){
//        indices = Array.from(mesh.geometry.attributes.index.array);
//    }
//    else if(mesh.geometry.index === null){
//        for(let i = 0; i< vertices.length;i++){
//            indices.push(i);
//        }
//    }
//    return new Mesh(vertices, indices);
//}
//
//function addSurfaceIdAttributeToMesh(scene) {
//  console.log("ONE");
//  if(!surfaceFinder){
//    surfaceFinder = new FindSurfaces();
//  }
//  surfaceFinder.surfaceId = 0;
//  console.log("TWO");
//
//  scene.traverse((node) => {
//    if (node.type === "Mesh") {
//      const m = convertThreeMeshToMeshObject(node);
//      console.log(m);
//      const colorsTypedArray = surfaceFinder.getSurfaceIdAttribute(m);
//      node.geometry.setAttribute(
//        "color",
//        new THREE.BufferAttribute(colorsTypedArray, 4)
//      );
//    }
//  });
//  console.log("THREE");
//
//  customOutline.updateMaxSurfaceId(surfaceFinder.surfaceId + 1);
//}

function onWindowResize() {
    container = document.getElementById( 'container' );
    const width = container.clientWidth;
    const height = container.clientHeight;

    renderer.setSize(width, height);
    composer.setSize(width, height);

    effectFXAA.setSize(width, height);
    customOutline.setSize(width, height);

    effectFXAA.uniforms["resolution"].value.set(
        1 / width,
        1 / height
    );

    labelRenderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
}
