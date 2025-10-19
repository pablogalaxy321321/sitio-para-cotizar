import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";

const ThreeViewer = ({ flangeParams }) => {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const flangeMeshRef = useRef(null);

  // Create flange geometry
  const createFlange = useCallback(() => {
    if (!sceneRef.current) return;

    // Clean up previous mesh
    if (flangeMeshRef.current) {
      sceneRef.current.remove(flangeMeshRef.current);
      if (flangeMeshRef.current.geometry) {
        flangeMeshRef.current.geometry.dispose();
      }
      if (flangeMeshRef.current.material) {
        flangeMeshRef.current.material.dispose();
      }
    }

    const { innerDiameter, outerDiameter, thickness, boltCount, material } =
      flangeParams;
    const innerRadius = innerDiameter / 2;
    const outerRadius = outerDiameter / 2;
    const boltHoleRadius = (outerRadius - innerRadius) / 8;
    const boltCircleRadius = innerRadius + (outerRadius - innerRadius) / 1.5;

    if (innerRadius >= outerRadius || thickness <= 0) return;

    // Create shape
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    for (let i = 0; i < boltCount; i++) {
      const angle = (i / boltCount) * Math.PI * 2;
      const boltHole = new THREE.Path();
      boltHole.absarc(
        Math.cos(angle) * boltCircleRadius,
        Math.sin(angle) * boltCircleRadius,
        boltHoleRadius,
        0,
        Math.PI * 2,
        true
      );
      shape.holes.push(boltHole);
    }

    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 2,
      bevelSize: 2,
      bevelThickness: 2,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    geometry.computeVertexNormals();

    // Enhanced material properties for CAD-like appearance
    const materialProperties = {
      1: {
        color: 0x5a5a5a,
        metalness: 0.95,
        roughness: 0.3,
        clearcoat: 0.1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.5,
      },
      2: {
        color: 0xc8c8c8,
        metalness: 1.0,
        roughness: 0.15,
        clearcoat: 0.3,
        clearcoatRoughness: 0.05,
        envMapIntensity: 2.0,
      },
      3: {
        color: 0x8a9099,
        metalness: 0.9,
        roughness: 0.25,
        clearcoat: 0.2,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.8,
      },
    };

    const materialProps = materialProperties[material];
    const meshMaterial = new THREE.MeshPhysicalMaterial({
      ...materialProps,
      side: THREE.DoubleSide,
    });

    flangeMeshRef.current = new THREE.Mesh(geometry, meshMaterial);
    flangeMeshRef.current.rotation.x = -Math.PI / 2;
    flangeMeshRef.current.castShadow = true;
    flangeMeshRef.current.receiveShadow = true;
    sceneRef.current.add(flangeMeshRef.current);
  }, [flangeParams]);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(150, 150, 250);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: true,
      premultipliedAlpha: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });

    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const currentMount = mountRef.current;
    currentMount.appendChild(renderer.domElement);

    // Create professional environment map
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext("2d");

    const gradient = context.createRadialGradient(512, 300, 0, 512, 300, 800);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.3, "#e8e8e8");
    gradient.addColorStop(0.6, "#c0c0c0");
    gradient.addColorStop(0.8, "#808080");
    gradient.addColorStop(1, "#404040");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 1024, 1024);

    context.fillStyle = "rgba(255, 255, 255, 0.8)";
    context.beginPath();
    context.arc(256, 200, 80, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.arc(768, 300, 60, 0, Math.PI * 2);
    context.fill();

    const backgroundTexture = new THREE.CanvasTexture(canvas);
    backgroundTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = new THREE.Color(0x2a2a2a);
    scene.environment = backgroundTexture;
    setIsLoading(false);

    // Professional studio lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(200, 300, 200);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 1000;
    keyLight.shadow.camera.left = -200;
    keyLight.shadow.camera.right = 200;
    keyLight.shadow.camera.top = 200;
    keyLight.shadow.camera.bottom = -200;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-150, 200, 100);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(0, 100, -200);
    scene.add(rimLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 300);
    pointLight1.position.set(100, 150, 100);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 300);
    pointLight2.position.set(-100, 150, -100);
    scene.add(pointLight2);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.target.set(0, 0, 0);

    // Optimized post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Conditional effects based on performance
    const isHighPerformance =
      currentMount.clientWidth < 1920 && window.devicePixelRatio <= 2;

    if (isHighPerformance) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight),
        0.2,
        0.6,
        0.95
      );
      composer.addPass(bloomPass);

      const smaaPass = new SMAAPass(
        currentMount.clientWidth * renderer.getPixelRatio(),
        currentMount.clientHeight * renderer.getPixelRatio()
      );
      composer.addPass(smaaPass);
    }

    // Store references
    sceneRef.current = scene;
    rendererRef.current = { renderer, composer, controls };

    // Optimized animation loop
    let animationId;
    let lastTime = 0;
    const targetFPS = 60;
    const interval = 1000 / targetFPS;

    const animate = (currentTime) => {
      animationId = requestAnimationFrame(animate);

      if (currentTime - lastTime >= interval) {
        lastTime = currentTime;

        if (controls.enableDamping) {
          controls.update();
        }

        composer.render();
      }
    };

    animate(0);
    rendererRef.current.animationId = animationId;

    // Resize handler
    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      composer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      if (rendererRef.current?.animationId) {
        cancelAnimationFrame(rendererRef.current.animationId);
      }

      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }

      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }

      composer.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    createFlange();
  }, [createFlange]);

  return (
    <div
      id="renderer-container"
      className="w-full lg:w-2/3 h-1/2 lg:h-full relative"
    >
      <div ref={mountRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-80 flex justify-center items-center">
          <div className="text-center">
            <svg
              className="animate-spin h-8 w-8 text-orange-500 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-2 text-lg">Cargando visualizador...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeViewer;
