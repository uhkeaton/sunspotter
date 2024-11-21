import { useCallback, useEffect, useRef } from "react";

import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { scaleVector, Vector3D, useEarth, SUN_DIST_MODEL } from "./useEarth";

const SQUIRTLE_PATH = "/~georgekw/SUNSPOTTER/squirtle.glb";
const EARTH_PATH = "/~georgekw/SUNSPOTTER/earth.glb";
const SUN_PATH = "/~georgekw/SUNSPOTTER/sun.glb";
const HDR_PATH = "/~georgekw/SUNSPOTTER/starry.hdr";

// example hdri path
// "https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.hdr";

// example geometry path
// "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf";

export const ECLIPTIC_TILT_DEGREES = 23.44;
const ECLIPTIC_TILT_RADIANS = degreesToRadians(23.44);

let squirtle: THREE.Group<THREE.Object3DEventMap>;
let earth: THREE.Group<THREE.Object3DEventMap>;
let sun: THREE.Group<THREE.Object3DEventMap>;
let sunLight: THREE.PointLight;
let axisCrossA: THREE.Mesh;
let axisCrossB: THREE.Mesh;

// let axisCrossC: THREE.Mesh;
let axisX: THREE.Mesh;
let axisY: THREE.Mesh;
let axisZ: THREE.Mesh;
let ecliptic: THREE.Mesh;

let renderer = new THREE.WebGLRenderer({ antialias: true });
let scene = new THREE.Scene();
let controls: OrbitControls;

let camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.25,
  100
);

function render() {
  renderer.render(scene, camera);
}

function updateSun(sunPosition: Vector3D) {
  if (sun && sunLight) {
    sun.position.set(sunPosition.x, sunPosition.y, sunPosition.z);
    //
    const lightPos = scaleVector(sunPosition, 30);
    sunLight.position.set(lightPos.x, lightPos.y, lightPos.z);
    //
    const crossPos = scaleVector(sunPosition, 1 / SUN_DIST_MODEL);
    axisCrossA.position.set(crossPos.x, crossPos.y, crossPos.z);
    axisCrossB.position.set(crossPos.x, crossPos.y, crossPos.z);
    // axisCrossC.position.set(crossPos.x, crossPos.y, crossPos.z);
  }
}
function updateObserver(
  observerPosition: Vector3D,
  sunPosition: Vector3D,
  observerSunCross: Vector3D,
  eclipticTiltSunCross: Vector3D
) {
  if (squirtle) {
    const { x, y, z } = scaleVector(observerPosition, 1.15);
    squirtle.position.set(x, y, z);
    squirtle.up.set(x, y, z);

    const farSunPos = scaleVector(sunPosition, 9999);

    squirtle.lookAt(farSunPos.x, farSunPos.y, farSunPos.z);

    const lookAtA = scaleVector(observerSunCross, 9999);
    const lookAtB = scaleVector(eclipticTiltSunCross, 9999);

    axisCrossA.lookAt(lookAtA.x, lookAtA.y, lookAtA.z);
    axisCrossB.lookAt(lookAtB.x, lookAtB.y, lookAtB.z);
    // axisCrossC.lookAt(farSunPos.x, farSunPos.y, farSunPos.z);
  }
}

export function Earth3D() {
  const {
    earthRotationDeg,
    sunPosition,
    observerPosition,
    observerSunCross,
    eclipticTiltSunCross,
  } = useEarth();
  const refContainer = useRef<HTMLDivElement | null>(null);

  const update = useCallback(() => {
    if (earth) {
      earth.rotation.y = degreesToRadians(earthRotationDeg);
    }
    updateSun(sunPosition);
    updateObserver(
      observerPosition,
      sunPosition,
      observerSunCross,
      eclipticTiltSunCross
    );
    render();
  }, [
    earthRotationDeg,
    sunPosition,
    observerPosition,
    observerSunCross,
    eclipticTiltSunCross,
  ]);

  useEffect(() => update(), [update]);

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

          const loader = new GLTFLoader();
          //   .setPath(
          //     "models/gltf/DamagedHelmet/glTF/"
          //   );

          loader.load(SQUIRTLE_PATH, async function (gltf) {
            if (squirtle) return;
            squirtle = gltf.scene;
            const SCALE = 0.04;
            squirtle.scale.set(SCALE, SCALE, SCALE);
            squirtle.position.set(0, 1.1, 0);
            squirtle.receiveShadow = true;
            squirtle.castShadow = true;
            await renderer.compileAsync(squirtle, camera, scene);
            scene.add(squirtle);
            update();
          });

          loader.load(EARTH_PATH, async function (gltf) {
            if (earth) return;
            earth = gltf.scene;
            let SCALE = 0.05;
            SCALE = 1;
            earth.scale.set(SCALE, SCALE, SCALE);
            earth.position.set(0, 0, 0);
            earth.rotation.y = degreesToRadians(earthRotationDeg);
            earth.castShadow = true;

            await renderer.compileAsync(earth, camera, scene);
            scene.add(earth);
            update();
          });

          loader.load(SUN_PATH, async function (gltf) {
            if (sun) return;
            sun = gltf.scene;
            const SCALE = 0.5;
            sun.scale.set(SCALE, SCALE, SCALE);
            sun.rotation.x = ECLIPTIC_TILT_RADIANS;
            sunLight = new THREE.PointLight("#fdfbd3", 20, 100, 0);
            sunLight.castShadow = true;

            //Set up shadow properties for the light
            // sunLight.shadow.mapSize.width = 512; // default
            // sunLight.shadow.mapSize.height = 512; // default
            // sunLight.shadow.camera.near = 0.5; // default
            // sunLight.shadow.camera.far = 500; // default

            updateSun(sunPosition);

            scene.add(sun);
            scene.add(sunLight);

            await renderer.compileAsync(sun, camera, scene);

            const ambientLight = new THREE.AmbientLight(0x404040, 5); // soft white light
            scene.add(ambientLight);
            update();
          });

          const W = 0.004;
          const L = 1.25;

          const geoAxisX = new THREE.CylinderGeometry(W, W, L);
          const geoAxisY = new THREE.CylinderGeometry(W, W, L);
          const geoAxisZ = new THREE.CylinderGeometry(W, W, L);

          const matRed = new THREE.MeshBasicMaterial({ color: 0xff0000 });
          const matGreen = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          const matBlue = new THREE.MeshBasicMaterial({ color: 0x0000ff });

          if (!axisX) {
            axisX = new THREE.Mesh(geoAxisX, matRed);
            axisX.rotation.set(0, 0, degreesToRadians(90));
            axisX.position.set(L / 2, 0, 0);
            scene.add(axisX);
          }

          if (!axisY) {
            axisY = new THREE.Mesh(geoAxisY, matGreen);
            axisY.position.set(0, L / 2, 0);
            scene.add(axisY);
          }

          if (!axisZ) {
            axisZ = new THREE.Mesh(geoAxisZ, matBlue);
            axisZ.rotation.set(degreesToRadians(90), 0, 0);
            axisZ.position.set(0, 0, L / 2);
            scene.add(axisZ);
          }

          // cross product vectors a
          const ARROW_LEN = 0.15;
          const geoAxisCross = new THREE.BoxGeometry(0.01, 0.01, ARROW_LEN);
          geoAxisCross.translate(0, 0, ARROW_LEN / 2);

          if (!axisCrossA) {
            axisCrossA = new THREE.Mesh(geoAxisCross, matRed);
            axisCrossA.position.set(0, 0, 0);
            scene.add(axisCrossA);
          }

          if (!axisCrossB) {
            axisCrossB = new THREE.Mesh(geoAxisCross, matBlue);
            axisCrossB.position.set(0, 0, 0);
            scene.add(axisCrossB);
          }

          // if (!axisCrossC) {
          //   axisCrossC = new THREE.Mesh(geoAxisCross, matGreen);
          //   axisCrossC.position.set(0, 0, 0);
          //   scene.add(axisCrossC);
          // }

          if (!ecliptic) {
            const geoEcliptic = new THREE.CylinderGeometry(
              SUN_DIST_MODEL,
              SUN_DIST_MODEL,
              0.01
            );
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
            ecliptic = new THREE.Mesh(geoEcliptic, glassMat);
            // rotation order is xyz
            // https://threejs.org/docs/#api/en/math/Euler.order
            ecliptic.rotation.x = ECLIPTIC_TILT_RADIANS;
            ecliptic.position.set(0, 0, 0);
            scene.add(ecliptic);
          }

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

      if (!controls) {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.addEventListener("change", render); // use if there is no animation loop
        controls.minDistance = 0.5;
        controls.maxDistance = 100;
        controls.target.set(0, 0, 0);
        controls.update();
      }

      window.addEventListener("resize", onWindowResize);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      render();
    }

    // Cleanup function
    return () => {
      // Stop animation loop
      // cancelAnimationFrame(animationFrame);
      // while (scene.children.length > 0) {
      //   scene.remove(scene.children[0]);
      // }
      window.removeEventListener("resize", onWindowResize);
      renderer.dispose();
    };
  }, []);

  return <div ref={refContainer}></div>;
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
