import { useEffect, useRef } from "react";

import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

const GLB_PATH = "/~georgekw/SUNSPOTTER/gold-sunspotter.glb";

const HDR_PATH =
  //   "https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.hdr";
  "/~georgekw/SUNSPOTTER/countryside_sunny_road_2k.hdr";

// const HELMET_PATH =
//   "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf";

export function Sunspotter3D() {
  const refContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let scene = new THREE.Scene();

    let camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.25,
      20
    );

    let renderer = new THREE.WebGLRenderer({ antialias: true });

    init();

    function init() {
      const container = document.createElement("div");
      document.body.appendChild(container);

      camera.position.set(
        1.6778852572668919,
        0.5487199549707827,
        0.7400039757699317
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
          loader.load(GLB_PATH, async function (gltf) {
            const model = gltf.scene;
            const SCALE = 80;
            model.scale.set(SCALE, SCALE, SCALE);
            model.rotateY(2.5);

            // wait until the model can be added to the scene without blocking due to shader compilation

            await renderer.compileAsync(model, camera, scene);

            scene.add(model);

            // function animate() {
            //   requestAnimationFrame(animate);

            //   time = Date.now() * 0.001;
            //   mesh.rotation.y = time;
            //   mesh.rotation.z = 0.5 * (1 + Math.sin(time));

            //   renderer.render(scene, camera);
            // }

            const DO_ANIMATION = false;

            if (DO_ANIMATION) {
              var animate = function () {
                requestAnimationFrame(animate);
                // model.rotation.x += 0.01;
                model.rotation.y += 0.002;
                render();
              };

              animate();
            } else {
              render();
            }
          });
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
      controls.minDistance = 2;
      controls.maxDistance = 10;
      controls.target.set(0, 0, -0.2);
      controls.update();

      window.addEventListener("resize", onWindowResize);
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);

      render();
    }

    function render() {
      renderer.render(scene, camera);
    }
  }, []);

  return <div ref={refContainer}></div>;
}
