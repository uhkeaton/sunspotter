import { useEffect, useRef } from "react";

import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { useEarth } from "./useEarth";

const SQUIRTLE_PATH = "/~georgekw/SUNSPOTTER/squirtle.glb";
const EARTH_PATH = "/~georgekw/SUNSPOTTER/earth_lat_long.glb";
const SUN_PATH = "/~georgekw/SUNSPOTTER/sun.glb";

const HDR_PATH =
  //   "https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.hdr";
  "/~georgekw/SUNSPOTTER/countryside_sunny_road_2k.hdr";

// const HELMET_PATH =
//   "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf";

const EARTH_TILT_RADIANS = degreesToRadians(-23.44);

let squirtle: THREE.Group<THREE.Object3DEventMap>;
let earth: THREE.Group<THREE.Object3DEventMap>;
let sun: THREE.Group<THREE.Object3DEventMap>;

let renderer = new THREE.WebGLRenderer({ antialias: true });
let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.25,
  20
);

function render() {
  renderer.render(scene, camera);
}

export function Earth3D() {
  const { observerLat, earthRotationDeg, sunPos } = useEarth();
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
            earth.rotation.y = earthRotationDeg;

            // rotation order is xyz
            // https://threejs.org/docs/#api/en/math/Euler.order
            earth.rotation.x = EARTH_TILT_RADIANS;

            await renderer.compileAsync(earth, camera, scene);
            scene.add(earth);
          });
          loader.load(SUN_PATH, async function (gltf) {
            sun = gltf.scene;
            const SCALE = 0.5;
            sun.scale.set(SCALE, SCALE, SCALE);
            sun.position.set(3, 0, 0);

            await renderer.compileAsync(sun, camera, scene);
            scene.add(sun);
            render();
          });

          const geoAxis = new THREE.CylinderGeometry(0.01, 0.01, 2.5);
          const matAxis = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          const axis = new THREE.Mesh(geoAxis, matAxis);
          axis.rotation.x = EARTH_TILT_RADIANS;
          axis.position.set(0, 0, 0);
          scene.add(axis);

          const geoEcliptic = new THREE.CylinderGeometry(3, 3, 0.01);
          const glassMat = new THREE.MeshPhysicalMaterial({
            metalness: 0.9,
            roughness: 0.05,
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
            // earth.rotation.y += degreesToRadians(0.05);
            squirtle.rotation.y += degreesToRadians(0.05);
            sun.rotation.y += degreesToRadians(0.05);
            render();
          };

          animate();
        });

      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      //   container.appendChild(renderer.domElement);

      refContainer.current &&
        refContainer.current.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.addEventListener("change", render); // use if there is no animation loop
      controls.minDistance = 0.5;
      controls.maxDistance = 20;
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
    // if (earth) {
    //   earth.rotation.y = degreesToRadians(observerLat);
    // }
    render();
  }, [observerLat]);

  useEffect(() => {
    if (earth) {
      earth.rotation.y = earthRotationDeg;
    }
    if (sun) {
      sun.position.set(sunPos.x, sunPos.y, sunPos.z);
    }
    render();
  }, [earthRotationDeg, sunPos]);

  return <div ref={refContainer}></div>;
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
