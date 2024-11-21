import { useEffect, useRef } from "react";

import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import {
  GeographicLocation,
  geographicToCartesian,
  scaleVector,
  SimpleVector,
  toThreeVector,
  useEarth,
} from "./useEarth";

const SQUIRTLE_PATH = "/~georgekw/SUNSPOTTER/squirtle.glb";
const EARTH_PATH = "/~georgekw/SUNSPOTTER/earth_lat_long.glb";
const SUN_PATH = "/~georgekw/SUNSPOTTER/sun.glb";

const HDR_PATH =
  //   "https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.hdr";
  // "/~georgekw/SUNSPOTTER/countryside_sunny_road_2k.hdr";
  "/~georgekw/SUNSPOTTER/starry.hdr";

// const HELMET_PATH =
//   "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf";

const ECLIPTIC_TILT_RADIANS = degreesToRadians(23.44);

let squirtle: THREE.Group<THREE.Object3DEventMap>;
let earth: THREE.Group<THREE.Object3DEventMap>;
let sun: THREE.Group<THREE.Object3DEventMap>;
let sunLight: THREE.PointLight;

let renderer = new THREE.WebGLRenderer({ antialias: true });
let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.25,
  100
);

function render() {
  renderer.render(scene, camera);
}

function updateSun(sunPosAE: SimpleVector) {
  if (sun && sunLight) {
    sun.position.set(sunPosAE.x, sunPosAE.y, sunPosAE.z);
    const lightPos = scaleVector(sunPosAE, 30);
    sunLight.position.set(lightPos.x, lightPos.y, lightPos.z);
  }
}
function updateObserver(
  observerLocation: GeographicLocation,
  earthRotationDeg: number,
  sunPosAE: SimpleVector
) {
  if (squirtle) {
    const infinitelyFarSunPos = scaleVector(sunPosAE, 9999);
    squirtle.lookAt(
      infinitelyFarSunPos.x,
      infinitelyFarSunPos.y,
      infinitelyFarSunPos.z
    );

    const { lat, long } = observerLocation;
    const { x, y, z } = scaleVector(
      toThreeVector(
        geographicToCartesian({
          lat: lat,
          long: -earthRotationDeg - long,
        })
      ),
      1.2
    );
    squirtle.position.set(x, y, z);
  }
}

export function Earth3D() {
  const { observerLocation, earthRotationDeg, sunPosAE } = useEarth();
  const refContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    init();
    function init() {
      const container = document.createElement("div");
      document.body.appendChild(container);

      camera.position.set(
        4.8738205211455305,
        0.7157103674048134,
        -6.206833786959452
      );

      new RGBELoader()
        // .setPath("textures/equirectangular/")
        .load(HDR_PATH, function (texture) {
          texture.mapping = THREE.EquirectangularReflectionMapping;

          scene.background = texture;
          scene.environment = texture;

          render();

          // model

          const loader = new GLTFLoader();
          //   .setPath(
          //     "models/gltf/DamagedHelmet/glTF/"
          //   );

          loader.load(SQUIRTLE_PATH, async function (gltf) {
            squirtle = gltf.scene;
            const SCALE = 0.04;
            squirtle.scale.set(SCALE, SCALE, SCALE);
            squirtle.position.set(0, 1.1, 0);
            squirtle.receiveShadow = true;
            squirtle.castShadow = true;
            await renderer.compileAsync(squirtle, camera, scene);
            scene.add(squirtle);
            render();
          });

          loader.load(EARTH_PATH, async function (gltf) {
            earth = gltf.scene;
            let SCALE = 0.05;
            SCALE = 1;
            earth.scale.set(SCALE, SCALE, SCALE);
            earth.position.set(0, 0, 0);
            earth.rotation.y = degreesToRadians(earthRotationDeg);
            earth.castShadow = true;

            await renderer.compileAsync(earth, camera, scene);
            scene.add(earth);
          });

          loader.load(SUN_PATH, async function (gltf) {
            sun = gltf.scene;
            const SCALE = 0.5;
            sun.scale.set(SCALE, SCALE, SCALE);
            sun.rotation.x = ECLIPTIC_TILT_RADIANS;
            sunLight = new THREE.PointLight("#fdfbd3", 20, 100, 0);
            sunLight.castShadow = true;

            //Set up shadow properties for the light
            sunLight.shadow.mapSize.width = 512; // default
            sunLight.shadow.mapSize.height = 512; // default
            sunLight.shadow.camera.near = 0.5; // default
            sunLight.shadow.camera.far = 500; // default

            //Create a helper for the shadow camera (optional)
            const helper = new THREE.CameraHelper(sunLight.shadow.camera);
            scene.add(helper);

            // const { x, y, z } = sunPosAE;

            updateSun(sunPosAE);

            // sun.position.set(x, y, z);
            scene.add(sun);
            scene.add(sunLight);

            await renderer.compileAsync(sun, camera, scene);

            const ambientLight = new THREE.AmbientLight(0x404040, 5); // soft white light
            scene.add(ambientLight);
            render();
          });

          const geoAxisX = new THREE.CylinderGeometry(0.01, 0.01, 1);
          const geoAxisY = new THREE.CylinderGeometry(0.01, 0.01, 1);
          const geoAxisZ = new THREE.CylinderGeometry(0.01, 0.01, 1);

          const matAxisX = new THREE.MeshBasicMaterial({ color: 0xff0000 });
          const matAxisY = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          const matAxisZ = new THREE.MeshBasicMaterial({ color: 0x0000ff });

          const axisX = new THREE.Mesh(geoAxisX, matAxisX);
          const axisY = new THREE.Mesh(geoAxisY, matAxisY);
          const axisZ = new THREE.Mesh(geoAxisZ, matAxisZ);

          axisX.rotation.set(0, 0, degreesToRadians(90));
          axisX.position.set(1, 0, 0);

          axisY.position.set(0, 1, 0);

          axisZ.rotation.set(degreesToRadians(90), 0, 0);
          axisZ.position.set(0, 0, 1);

          scene.add(axisX);
          scene.add(axisY);
          scene.add(axisZ);

          const geoEcliptic = new THREE.CylinderGeometry(3, 3, 0.01);
          const glassMat = new THREE.MeshPhysicalMaterial({
            metalness: 0.5,
            roughness: 0.1,
            envMapIntensity: 0.9,
            clearcoat: 1,
            transparent: true,
            // transmission: .95,
            opacity: 0.5,
            reflectivity: 0.2,
            // refractionRatio: 0.985,
            ior: 0.9,
            side: THREE.BackSide,
          });

          const ecliptic = new THREE.Mesh(geoEcliptic, glassMat);
          // rotation order is xyz
          // https://threejs.org/docs/#api/en/math/Euler.order
          ecliptic.rotation.x = ECLIPTIC_TILT_RADIANS;
          ecliptic.position.set(0, 0, 0);
          scene.add(ecliptic);

          // const geometry = new THREE.BoxGeometry(0.01, 2.5, 0.01);
          // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          // const axis = new THREE.Mesh(geometry, material);
          // axis.rotation.x = EARTH_TILT_RADIANS;
          // axis.position.set(0, 0, 0);
          // scene.add(axis);

          var animate = function () {
            requestAnimationFrame(animate);
            sun.rotation.y += degreesToRadians(0.05);
            render();
          };

          animate();
        });

      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      // https://threejs.org/docs/#api/en/lights/shadows/DirectionalLightShadow
      renderer.shadowMap.enabled = true;
      //   container.appendChild(renderer.domElement);

      refContainer.current &&
        refContainer.current.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.addEventListener("change", render); // use if there is no animation loop
      controls.minDistance = 0.5;
      controls.maxDistance = 100;
      controls.target.set(0, 0, 0);
      controls.update();

      window.addEventListener("resize", onWindowResize);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);

      render();
    }
  }, []);

  useEffect(() => {
    if (earth) {
      earth.rotation.y = degreesToRadians(earthRotationDeg);
    }
    updateSun(sunPosAE);
    updateObserver(observerLocation, earthRotationDeg, sunPosAE);
    render();
  }, [earthRotationDeg, sunPosAE, observerLocation]);

  return <div ref={refContainer}></div>;
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
