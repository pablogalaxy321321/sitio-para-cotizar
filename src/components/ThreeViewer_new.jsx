import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";
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
  const dragHandlesRef = useRef([]);

  // Create flange geometry
  const createFlange = useCallback(() => {
    if (!sceneRef.current) return;

    // Clean up previous mesh
    if (flangeMeshRef.current) {
      sceneRef.current.remove(flangeMeshRef.current);
      flangeMeshRef.current.geometry.dispose();
      flangeMeshRef.current.material.dispose();
    }
    dragHandlesRef.current.forEach((handle) => sceneRef.current.remove(handle));
    dragHandlesRef.current = [];

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
      bevelSegments: 5,
      steps: 1,
      bevelSize: 1,
      bevelThickness: 1,
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    // Material properties
    const materialProperties = {
      1: { color: 0x5a5a5a, metalness: 0.9, roughness: 0.45 },
      2: { color: 0xc0c0c0, metalness: 1.0, roughness: 0.2 },
      3: { color: 0x8a9099, metalness: 0.9, roughness: 0.3 },
    };

    const materialProps = materialProperties[material];
    const meshMaterial = new THREE.MeshStandardMaterial(materialProps);

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
    });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const currentMount = mountRef.current;
    currentMount.appendChild(renderer.domElement);

    // Create simple gradient background instead of HDRI
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(0.5, "#16213e");
    gradient.addColorStop(1, "#0f3460");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);

    const backgroundTexture = new THREE.CanvasTexture(canvas);
    scene.background = backgroundTexture;

    // Set basic environment for reflections
    scene.environment = backgroundTexture;
    setIsLoading(false);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight.position.set(100, 200, 150);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.target.set(0, 0, 0);

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight),
      0.5,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);

    const smaaPass = new SMAAPass(
      currentMount.clientWidth * renderer.getPixelRatio(),
      currentMount.clientHeight * renderer.getPixelRatio()
    );
    composer.addPass(smaaPass);

    // Store references
    sceneRef.current = scene;
    rendererRef.current = { renderer, composer, controls };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      composer.render();
    };
    animate();

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
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
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
