import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  LayerType,
  PainPointMarker,
  AnimatedModelPayload,
  TsuboPointInfo,
  SenLineInfo,
  TriggerPointInfo,
} from '../types/clinical';
import { TSUDO_POINTS, THAI_SEN_LINES, TRIGGER_POINTS, MUSCLE_ANATOMY_DETAILS } from '../data/anatomicalData';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Bone,
  Flame,
  Activity,
  Compass,
  Play,
  Pause,
} from 'lucide-react';

interface ThreeBodyModelProps {
  activeLayers: Record<LayerType, boolean>;
  showSkeleton: boolean;
  painMarkers: PainPointMarker[];
  onAddMarker: (marker: Omit<PainPointMarker, 'id'>) => void;
  onRemoveMarker: (id: string) => void;
  onSelectTsubo: (tsubo: TsuboPointInfo | null) => void;
  onSelectTrigger: (tp: TriggerPointInfo | null) => void;
  onSelectSenLine: (sen: SenLineInfo | null) => void;
  onSelectAiVector: (vec: any | null) => void;
  aiPayload?: AnimatedModelPayload | null;
  interactiveMode?: 'inspect' | 'add_symptom' | 'add_trigger';
}

export const ThreeBodyModel: React.FC<ThreeBodyModelProps> = ({
  activeLayers,
  showSkeleton,
  painMarkers,
  onAddMarker,
  onRemoveMarker,
  onSelectTsubo,
  onSelectTrigger,
  onSelectSenLine,
  onSelectAiVector,
  aiPayload,
  interactiveMode = 'inspect',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [cameraView, setCameraView] = useState<'anterior' | 'posterior' | 'lateral_r' | 'lateral_l' | 'isometric'>('anterior');

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsState = useRef({
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    rotationX: 0,
    rotationY: 0,
    distance: 18,
    targetY: 0.5,
  });

  // Layer groups for dynamic toggling
  const triggerGroupRef = useRef<THREE.Group | null>(null);
  const meridianGroupRef = useRef<THREE.Group | null>(null);
  const senLineGroupRef = useRef<THREE.Group | null>(null);
  const skeletonGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const aiVectorGroupRef = useRef<THREE.Group | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 580;

    // SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060911); // Deep clinical slate
    scene.fog = new THREE.FogExp2(0x060911, 0.022);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 18);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // LIGHTING SETUP (Studio medical lighting with cyan/amber rim lights)
    const ambientLight = new THREE.AmbientLight(0x334155, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 10, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8); // Cyan soft fill
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 0.9); // Warm amber rim
    rimLight.position.set(0, 8, -10);
    scene.add(rimLight);

    // SUBTLE PEDESTAL GRID
    const gridHelper = new THREE.GridHelper(16, 24, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -7.5;
    scene.add(gridHelper);

    // BODY ROOT CONTAINER
    const bodyRoot = new THREE.Group();
    scene.add(bodyRoot);

    // 1. ANATOMICAL 3D HUMAN GEOMETRY (Contoured organic meshes)
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x182438,
      metalness: 0.15,
      roughness: 0.45,
      clearcoat: 0.35,
      clearcoatRoughness: 0.2,
      sheen: 0.5,
      sheenColor: 0x38bdf8,
      transmission: 0.1, // Subtle skin subsurface depth
      transparent: true,
      opacity: 0.92,
    });

    // Cranium / Head
    const headGeom = new THREE.SphereGeometry(1.0, 32, 24);
    headGeom.scale(0.85, 1.15, 0.95);
    const headMesh = new THREE.Mesh(headGeom, bodyMaterial);
    headMesh.position.set(0, 6.8, 0.05);
    bodyRoot.add(headMesh);

    // Neck / Cervical
    const neckGeom = new THREE.CylinderGeometry(0.5, 0.65, 0.9, 24);
    const neckMesh = new THREE.Mesh(neckGeom, bodyMaterial);
    neckMesh.position.set(0, 5.65, 0);
    bodyRoot.add(neckMesh);

    // Upper Torso / Pectorals / Trapezius
    const upperTorsoGeom = new THREE.CylinderGeometry(1.65, 1.35, 2.0, 24);
    upperTorsoGeom.scale(1.2, 1.0, 0.7);
    const upperTorsoMesh = new THREE.Mesh(upperTorsoGeom, bodyMaterial);
    upperTorsoMesh.position.set(0, 4.35, 0.08);
    bodyRoot.add(upperTorsoMesh);

    // Lower Torso / Core / Abdomen & Lumbar
    const lowerTorsoGeom = new THREE.CylinderGeometry(1.35, 1.48, 1.7, 24);
    lowerTorsoGeom.scale(1.1, 1.0, 0.65);
    const lowerTorsoMesh = new THREE.Mesh(lowerTorsoGeom, bodyMaterial);
    lowerTorsoMesh.position.set(0, 2.65, 0.04);
    bodyRoot.add(lowerTorsoMesh);

    // Pelvis & Gluteals
    const pelvisGeom = new THREE.CylinderGeometry(1.48, 1.35, 1.3, 24);
    pelvisGeom.scale(1.15, 1.0, 0.75);
    const pelvisMesh = new THREE.Mesh(pelvisGeom, bodyMaterial);
    pelvisMesh.position.set(0, 1.35, 0);
    bodyRoot.add(pelvisMesh);

    // Shoulders (Deltoids L & R)
    const deltoidGeom = new THREE.SphereGeometry(0.68, 24, 16);
    deltoidGeom.scale(0.9, 1.1, 0.85);

    const leftDeltoid = new THREE.Mesh(deltoidGeom, bodyMaterial);
    leftDeltoid.position.set(2.2, 5.0, 0.05);
    bodyRoot.add(leftDeltoid);

    const rightDeltoid = new THREE.Mesh(deltoidGeom, bodyMaterial);
    rightDeltoid.position.set(-2.2, 5.0, 0.05);
    bodyRoot.add(rightDeltoid);

    // Upper Arms (Biceps / Triceps)
    const armGeom = new THREE.CylinderGeometry(0.42, 0.36, 2.1, 18);
    armGeom.scale(1.0, 1.0, 0.85);

    const leftArm = new THREE.Mesh(armGeom, bodyMaterial);
    leftArm.position.set(2.4, 3.75, 0.02);
    leftArm.rotation.z = -0.15;
    bodyRoot.add(leftArm);

    const rightArm = new THREE.Mesh(armGeom, bodyMaterial);
    rightArm.position.set(-2.4, 3.75, 0.02);
    rightArm.rotation.z = 0.15;
    bodyRoot.add(rightArm);

    // Forearms
    const forearmGeom = new THREE.CylinderGeometry(0.35, 0.28, 2.0, 18);
    const leftForearm = new THREE.Mesh(forearmGeom, bodyMaterial);
    leftForearm.position.set(2.7, 1.85, 0.1);
    leftForearm.rotation.z = -0.18;
    bodyRoot.add(leftForearm);

    const rightForearm = new THREE.Mesh(forearmGeom, bodyMaterial);
    rightForearm.position.set(-2.7, 1.85, 0.1);
    rightForearm.rotation.z = 0.18;
    bodyRoot.add(rightForearm);

    // Thighs (Quadriceps & Hamstrings)
    const thighGeom = new THREE.CylinderGeometry(0.82, 0.62, 3.6, 24);
    thighGeom.scale(1.0, 1.0, 0.9);

    const leftThigh = new THREE.Mesh(thighGeom, bodyMaterial);
    leftThigh.position.set(0.9, -1.0, 0.02);
    leftThigh.rotation.z = 0.04;
    bodyRoot.add(leftThigh);

    const rightThigh = new THREE.Mesh(thighGeom, bodyMaterial);
    rightThigh.position.set(-0.9, -1.0, 0.02);
    rightThigh.rotation.z = -0.04;
    bodyRoot.add(rightThigh);

    // Knees
    const kneeGeom = new THREE.SphereGeometry(0.55, 18, 14);
    kneeGeom.scale(0.9, 0.9, 0.8);

    const leftKnee = new THREE.Mesh(kneeGeom, bodyMaterial);
    leftKnee.position.set(0.88, -2.85, 0.06);
    bodyRoot.add(leftKnee);

    const rightKnee = new THREE.Mesh(kneeGeom, bodyMaterial);
    rightKnee.position.set(-0.88, -2.85, 0.06);
    bodyRoot.add(rightKnee);

    // Calves & Shins (Gastrocnemius & Tibialis)
    const calfGeom = new THREE.CylinderGeometry(0.56, 0.36, 3.4, 20);
    calfGeom.scale(0.95, 1.0, 0.88);

    const leftCalf = new THREE.Mesh(calfGeom, bodyMaterial);
    leftCalf.position.set(0.85, -4.65, -0.02);
    bodyRoot.add(leftCalf);

    const rightCalf = new THREE.Mesh(calfGeom, bodyMaterial);
    rightCalf.position.set(-0.85, -4.65, -0.02);
    bodyRoot.add(rightCalf);

    // Feet
    const footGeom = new THREE.BoxGeometry(0.65, 0.45, 1.5);
    const leftFoot = new THREE.Mesh(footGeom, bodyMaterial);
    leftFoot.position.set(0.85, -6.55, 0.35);
    bodyRoot.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeom, bodyMaterial);
    rightFoot.position.set(-0.85, -6.55, 0.35);
    bodyRoot.add(rightFoot);

    // 2. SKELETAL LANDMARKS LAYER (X-Ray Luminous Bones)
    const skeletonGroup = new THREE.Group();
    skeletonGroupRef.current = skeletonGroup;
    bodyRoot.add(skeletonGroup);

    const boneMaterial = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.2,
      wireframe: true,
    });

    // Vertebral Column C1 to Coccyx
    const spinePoints: THREE.Vector3[] = [];
    for (let y = 6.2; y >= 1.0; y -= 0.25) {
      // Natural cervical lordosis, thoracic kyphosis, lumbar lordosis curve
      const zOffset = -0.45 + (y > 4.5 ? Math.sin((y - 4.5) * 1.5) * 0.12 : -Math.sin((y - 1.0) * 1.2) * 0.15);
      spinePoints.push(new THREE.Vector3(0, y, zOffset));
    }
    const spineCurve = new THREE.CatmullRomCurve3(spinePoints);
    const spineTubeGeom = new THREE.TubeGeometry(spineCurve, 40, 0.14, 8, false);
    const spineMesh = new THREE.Mesh(spineTubeGeom, boneMaterial);
    skeletonGroup.add(spineMesh);

    // Individual vertebrae disks
    spinePoints.forEach((pt) => {
      const vertDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8), boneMaterial);
      vertDisk.position.copy(pt);
      skeletonGroup.add(vertDisk);
    });

    // Rib cage hoops
    for (let rY = 5.0; rY >= 3.6; rY -= 0.35) {
      const radiusX = 1.6 - (5.0 - rY) * 0.2;
      const radiusZ = 0.85 - (5.0 - rY) * 0.1;
      const ribGeom = new THREE.TorusGeometry(radiusX, 0.05, 6, 24);
      ribGeom.scale(1.0, 0.4, radiusZ / radiusX);
      const ribMesh = new THREE.Mesh(ribGeom, boneMaterial);
      ribMesh.position.set(0, rY, 0.05);
      skeletonGroup.add(ribMesh);
    }

    // Pelvic Crest
    const pelvicRim = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.08, 8, 24), boneMaterial);
    pelvicRim.position.set(0, 1.8, 0);
    pelvicRim.scale.set(1.0, 0.3, 0.8);
    skeletonGroup.add(pelvicRim);

    // Scapulae (Bilateral shoulder blades)
    const scapulaGeom = new THREE.BoxGeometry(0.8, 1.2, 0.08);
    const leftScapula = new THREE.Mesh(scapulaGeom, boneMaterial);
    leftScapula.position.set(0.95, 4.4, -0.65);
    leftScapula.rotation.y = 0.2;
    skeletonGroup.add(leftScapula);

    const rightScapula = new THREE.Mesh(scapulaGeom, boneMaterial);
    rightScapula.position.set(-0.95, 4.4, -0.65);
    rightScapula.rotation.y = -0.2;
    skeletonGroup.add(rightScapula);

    // 3. TCM MERIDIANS & TSUDO ACUPRESSURE NODES
    const meridianGroup = new THREE.Group();
    meridianGroupRef.current = meridianGroup;
    bodyRoot.add(meridianGroup);

    const meridianMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: false,
    });

    // Urinary Bladder Channel (Left & Right paraspinal tracts descending to feet)
    const createBLChannel = (isRight: boolean) => {
      const sign = isRight ? 1 : -1;
      const pts = [
        new THREE.Vector3(sign * 0.45, 6.2, -0.5), // BL10
        new THREE.Vector3(sign * 0.55, 4.8, -0.6), // Upper back
        new THREE.Vector3(sign * 0.55, 3.2, -0.55), // BL23 Shenshu
        new THREE.Vector3(sign * 0.65, 1.5, -0.6), // Sacral BL
        new THREE.Vector3(sign * 0.85, -1.0, -0.65), // Hamstrings
        new THREE.Vector3(sign * 0.88, -2.85, -0.55), // BL40 Weizhong
        new THREE.Vector3(sign * 0.85, -4.65, -0.65), // BL57
        new THREE.Vector3(sign * 0.75, -6.5, -0.3), // BL60 Kunlun
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.TubeGeometry(curve, 48, 0.045, 8, false);
      const mesh = new THREE.Mesh(tube, meridianMaterial);
      meridianGroup.add(mesh);
    };
    createBLChannel(false); // Left
    createBLChannel(true); // Right

    // Gallbladder Channel (Lateral kinetic chain)
    const createGBChannel = (isRight: boolean) => {
      const sign = isRight ? 1 : -1;
      const pts = [
        new THREE.Vector3(sign * 0.65, 6.4, -0.4), // GB20 Fengchi
        new THREE.Vector3(sign * 1.5, 5.2, -0.1), // Lateral shoulder
        new THREE.Vector3(sign * 1.6, 3.5, 0.0), // Lateral ribcage
        new THREE.Vector3(sign * 1.5, 1.5, -0.15), // GB30 Huantiao
        new THREE.Vector3(sign * 1.35, -1.0, 0.0), // IT Band
        new THREE.Vector3(sign * 1.15, -2.9, 0.1), // GB34 Yanglingquan
        new THREE.Vector3(sign * 1.0, -5.2, 0.05), // Fibular shaft
        new THREE.Vector3(sign * 0.9, -6.5, 0.3), // Ankle
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.TubeGeometry(curve, 48, 0.04, 8, false);
      const gbMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const mesh = new THREE.Mesh(tube, gbMat);
      meridianGroup.add(mesh);
    };
    createGBChannel(false);
    createGBChannel(true);

    // Tsubo Acupressure Spheres in 3D
    TSUDO_POINTS.forEach((tsubo) => {
      let pos = new THREE.Vector3(0, 0, 0);
      if (tsubo.code === 'GB20') pos.set(-0.65, 6.35, -0.42);
      else if (tsubo.code === 'BL10') pos.set(-0.45, 6.15, -0.48);
      else if (tsubo.code === 'BL23') pos.set(-0.55, 3.15, -0.58);
      else if (tsubo.code === 'BL40') pos.set(-0.85, -2.85, -0.58);
      else if (tsubo.code === 'GB30') pos.set(-1.45, 1.5, -0.2);
      else if (tsubo.code === 'GB34') pos.set(-1.12, -2.9, 0.15);
      else if (tsubo.code === 'LI4') pos.set(-2.8, 1.1, 0.25);
      else if (tsubo.code === 'KD3') pos.set(-0.65, -6.35, -0.1);
      else if (tsubo.code === 'SP6') pos.set(-0.65, -5.4, 0.05);
      else if (tsubo.code === 'GV20') pos.set(0, 7.85, 0.05);

      const tsuboGeom = new THREE.SphereGeometry(0.18, 16, 16);
      const tsuboMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.5,
      });
      const tsuboMesh = new THREE.Mesh(tsuboGeom, tsuboMat);
      tsuboMesh.position.copy(pos);
      (tsuboMesh as any).userData = { type: 'tsubo', data: tsubo };
      meridianGroup.add(tsuboMesh);

      // Glowing pulse ring
      const ringGeom = new THREE.RingGeometry(0.22, 0.3, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.position.z += pos.z > 0 ? 0.04 : -0.04;
      meridianGroup.add(ringMesh);
    });

    // 4. THAI SIB SEN LINES (Traction Vectors in 3D)
    const senGroup = new THREE.Group();
    senLineGroupRef.current = senGroup;
    bodyRoot.add(senGroup);

    // Sen Sumana (Central Axial Core)
    const sumanaPts = [
      new THREE.Vector3(0, 2.7, 0.45), // Navel origin
      new THREE.Vector3(0, 3.8, 0.5),
      new THREE.Vector3(0, 5.0, 0.45), // Chest / throat
      new THREE.Vector3(0, 6.2, 0.35),
    ];
    const sumanaCurve = new THREE.CatmullRomCurve3(sumanaPts);
    const sumanaTube = new THREE.TubeGeometry(sumanaCurve, 24, 0.05, 8, false);
    const sumanaMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.2 });
    senGroup.add(new THREE.Mesh(sumanaTube, sumanaMat));

    // Sen Kalathari (Crossing diagonal limb spirals)
    const kalathariPts1 = [
      new THREE.Vector3(0, 2.7, 0.45),
      new THREE.Vector3(-1.2, 3.8, 0.35),
      new THREE.Vector3(-2.4, 4.8, 0.2),
      new THREE.Vector3(-2.8, 1.2, 0.25), // Hand
    ];
    const kalathariCurve1 = new THREE.CatmullRomCurve3(kalathariPts1);
    const kalathariMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 1.2 });
    senGroup.add(new THREE.Mesh(new THREE.TubeGeometry(kalathariCurve1, 32, 0.045, 8, false), kalathariMat));

    const kalathariPts2 = [
      new THREE.Vector3(0, 2.7, 0.45),
      new THREE.Vector3(1.2, 3.8, 0.35),
      new THREE.Vector3(2.4, 4.8, 0.2),
      new THREE.Vector3(2.8, 1.2, 0.25),
    ];
    const kalathariCurve2 = new THREE.CatmullRomCurve3(kalathariPts2);
    senGroup.add(new THREE.Mesh(new THREE.TubeGeometry(kalathariCurve2, 32, 0.045, 8, false), kalathariMat));

    // 5. KINETIC TRIGGER POINT NODULES & REFERRED ARCS IN 3D
    const triggerGroup = new THREE.Group();
    triggerGroupRef.current = triggerGroup;
    bodyRoot.add(triggerGroup);

    TRIGGER_POINTS.forEach((tp) => {
      let origin = new THREE.Vector3(0, 0, 0);
      let target = new THREE.Vector3(0, 0, 0);

      if (tp.muscle.includes('Trapezius')) {
        origin.set(-1.1, 5.15, -0.42);
        target.set(-0.7, 6.7, -0.1); // Temple / mastoid
      } else if (tp.muscle.includes('Levator')) {
        origin.set(-0.85, 4.85, -0.55);
        target.set(-0.95, 3.8, -0.6); // Medial border of scapula
      } else if (tp.muscle.includes('Suboccipitals')) {
        origin.set(-0.45, 6.2, -0.48);
        target.set(-0.4, 7.2, 0.35); // Retro-orbital
      } else if (tp.muscle.includes('Quadratus')) {
        origin.set(-0.95, 3.0, -0.52);
        target.set(-1.15, 1.4, -0.5); // SI joint
      } else if (tp.muscle.includes('Piriformis')) {
        origin.set(-1.0, 1.4, -0.58);
        target.set(-0.85, -2.85, -0.55); // Sciatic posterior thigh
      } else if (tp.muscle.includes('Psoas')) {
        origin.set(-0.45, 2.8, 0.25);
        target.set(-0.65, 0.5, 0.3);
      } else {
        origin.set(-1.4, 1.5, 0.1);
        target.set(-1.1, -2.8, 0.15); // Lateral knee
      }

      // 3D Hyperirritable Nodule Sphere
      const trigGeom = new THREE.SphereGeometry(0.2, 16, 16);
      const trigMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 2.0,
      });
      const trigMesh = new THREE.Mesh(trigGeom, trigMat);
      trigMesh.position.copy(origin);
      (trigMesh as any).userData = { type: 'trigger', data: tp };
      triggerGroup.add(trigMesh);

      // 3D Referred Pain Vector Arc
      const arcMid = new THREE.Vector3()
        .addVectors(origin, target)
        .multiplyScalar(0.5);
      arcMid.z += origin.z < 0 ? -0.4 : 0.4; // Arc out from body surface

      const arcCurve = new THREE.QuadraticBezierCurve3(origin, arcMid, target);
      const arcGeom = new THREE.TubeGeometry(arcCurve, 20, 0.035, 6, false);
      const arcMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.85 });
      triggerGroup.add(new THREE.Mesh(arcGeom, arcMat));

      // Referred target sphere
      const targetMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xfca5a5, transparent: true, opacity: 0.6 })
      );
      targetMesh.position.copy(target);
      triggerGroup.add(targetMesh);
    });

    // 6. OPERATOR PLACED PAIN MARKERS GROUP
    const markersGroup = new THREE.Group();
    markersGroupRef.current = markersGroup;
    bodyRoot.add(markersGroup);

    // MOUSE DRAG & ORBIT ROTATION CONTROLS
    let isMouseDown = false;
    let startX = 0;
    let startY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      startX = e.clientX;
      startY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = e.clientX;
      startY = e.clientY;

      controlsState.current.rotationY += dx * 0.008;
      controlsState.current.rotationX = Math.max(-0.6, Math.min(0.6, controlsState.current.rotationX + dy * 0.008));
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      controlsState.current.distance = Math.max(9, Math.min(28, controlsState.current.distance + e.deltaY * 0.015));
    };

    // RAYCASTING FOR INTERACTIVE MARKING & INSPECTION
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check click on tsubos or triggers
      const interactiveTargets: THREE.Object3D[] = [];
      meridianGroup.traverse((obj) => {
        if ((obj as any).userData?.type === 'tsubo') interactiveTargets.push(obj);
      });
      triggerGroup.traverse((obj) => {
        if ((obj as any).userData?.type === 'trigger') interactiveTargets.push(obj);
      });

      const nodeIntersects = raycaster.intersectObjects(interactiveTargets);
      if (nodeIntersects.length > 0) {
        const hit = nodeIntersects[0].object as any;
        if (hit.userData?.type === 'tsubo') {
          onSelectTsubo(hit.userData.data);
          return;
        } else if (hit.userData?.type === 'trigger') {
          onSelectTrigger(hit.userData.data);
          return;
        }
      }

      // Check click on body for placing markers
      if (interactiveMode !== 'inspect') {
        const bodyIntersects = raycaster.intersectObjects(bodyRoot.children, true);
        if (bodyIntersects.length > 0) {
          const hitPoint = bodyIntersects[0].point;
          // Determine anterior vs posterior from z
          const hitView = hitPoint.z >= 0 ? 'anterior' : 'posterior';
          const xNorm = Math.round(((hitPoint.x + 3) / 6) * 100);
          const yNorm = Math.round(((8 - hitPoint.y) / 15) * 100);

          onAddMarker({
            x: Math.max(10, Math.min(90, xNorm)),
            y: Math.max(5, Math.min(95, yNorm)),
            view: hitView,
            type: interactiveMode === 'add_symptom' ? 'symptom' : 'suspected_trigger',
            label: interactiveMode === 'add_symptom' ? '3D Marked Pain' : '3D Trigger Knot',
          });
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);

    // RESIZE LISTENER
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 580;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Auto rotation if enabled
      if (autoRotate && !isMouseDown) {
        controlsState.current.rotationY += 0.4 * delta;
      }

      // Smooth camera position from spherical coords
      const dist = controlsState.current.distance;
      const rotY = controlsState.current.rotationY;
      const rotX = controlsState.current.rotationX;

      const camX = dist * Math.sin(rotY) * Math.cos(rotX);
      const camY = controlsState.current.targetY + dist * Math.sin(rotX);
      const camZ = dist * Math.cos(rotY) * Math.cos(rotX);

      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, controlsState.current.targetY, 0);

      // Pulse trigger nodules
      if (triggerGroupRef.current) {
        const pulse = 1.0 + Math.sin(time * 3.5) * 0.15;
        triggerGroupRef.current.children.forEach((child) => {
          if ((child as any).userData?.type === 'trigger') {
            child.scale.set(pulse, pulse, pulse);
          }
        });
      }

      // Gentle glow pulse on meridians
      if (meridianGroupRef.current) {
        const tPulse = 1.0 + Math.sin(time * 2.5) * 0.1;
        meridianGroupRef.current.children.forEach((child) => {
          if ((child as any).userData?.type === 'tsubo') {
            child.scale.set(tPulse, tPulse, tPulse);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Layer Visibility
  useEffect(() => {
    if (triggerGroupRef.current) triggerGroupRef.current.visible = activeLayers.kinetic;
    if (meridianGroupRef.current) meridianGroupRef.current.visible = activeLayers.meridian;
    if (senLineGroupRef.current) senLineGroupRef.current.visible = activeLayers.sen_line;
    if (skeletonGroupRef.current) skeletonGroupRef.current.visible = showSkeleton;
  }, [activeLayers, showSkeleton]);

  // Update Operator Pain Markers in 3D
  useEffect(() => {
    const group = markersGroupRef.current;
    if (!group) return;

    // Clear old markers
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    painMarkers.forEach((m) => {
      const x3D = ((m.x - 50) / 50) * 2.6;
      const y3D = 8 - (m.y / 100) * 14.5;
      const z3D = m.view === 'anterior' ? 0.65 : -0.65;

      const markerGeom = new THREE.SphereGeometry(0.24, 16, 16);
      const markerMat = new THREE.MeshStandardMaterial({
        color: m.type === 'symptom' ? 0xf59e0b : 0xef4444,
        emissive: m.type === 'symptom' ? 0xd97706 : 0xdc2626,
        emissiveIntensity: 2.2,
      });
      const mesh = new THREE.Mesh(markerGeom, markerMat);
      mesh.position.set(x3D, y3D, z3D);
      group.add(mesh);

      // Pulsing outer ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.3, 0.4, 16),
        new THREE.MeshBasicMaterial({ color: m.type === 'symptom' ? 0xf59e0b : 0xef4444, side: THREE.DoubleSide })
      );
      ring.position.set(x3D, y3D, z3D + (z3D > 0 ? 0.05 : -0.05));
      group.add(ring);
    });
  }, [painMarkers]);

  // Camera Presets
  const setPresetView = (preset: 'anterior' | 'posterior' | 'lateral_r' | 'lateral_l' | 'isometric') => {
    setCameraView(preset);
    if (!controlsState.current) return;

    if (preset === 'anterior') {
      controlsState.current.rotationY = 0;
      controlsState.current.rotationX = 0;
    } else if (preset === 'posterior') {
      controlsState.current.rotationY = Math.PI;
      controlsState.current.rotationX = 0;
    } else if (preset === 'lateral_r') {
      controlsState.current.rotationY = Math.PI / 2;
      controlsState.current.rotationX = 0;
    } else if (preset === 'lateral_l') {
      controlsState.current.rotationY = -Math.PI / 2;
      controlsState.current.rotationX = 0;
    } else if (preset === 'isometric') {
      controlsState.current.rotationY = Math.PI / 4;
      controlsState.current.rotationX = 0.25;
    }
  };

  const handleZoom = (delta: number) => {
    controlsState.current.distance = Math.max(9, Math.min(28, controlsState.current.distance + delta));
  };

  const resetView = () => {
    controlsState.current.distance = 18;
    controlsState.current.rotationX = 0;
    controlsState.current.rotationY = 0;
    setCameraView('anterior');
  };

  return (
    <div className="relative w-full h-full flex flex-col min-h-[540px] select-none bg-slate-950 overflow-hidden">
      {/* WebGL Canvas Container */}
      <div
        ref={mountRef}
        className={`w-full flex-1 ${interactiveMode !== 'inspect' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
      />

      {/* Floating 3D Navigation Compass / Presets Bar */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg z-10">
        <button
          onClick={() => setPresetView('anterior')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            cameraView === 'anterior'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Anterior (Front)
        </button>
        <button
          onClick={() => setPresetView('posterior')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            cameraView === 'posterior'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Posterior (Back)
        </button>
        <button
          onClick={() => setPresetView('lateral_r')}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
            cameraView === 'lateral_r'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Lat Right
        </button>
        <button
          onClick={() => setPresetView('lateral_l')}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
            cameraView === 'lateral_l'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Lat Left
        </button>
        <button
          onClick={() => setPresetView('isometric')}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
            cameraView === 'isometric'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          3D Angle
        </button>
      </div>

      {/* Floating 3D Controls Bar (Top Right) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg z-10">
        {/* Auto Rotate Toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
            autoRotate
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={autoRotate ? 'Pause 360° Auto-Rotation' : 'Auto 360° Table Orbit'}
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="text-[10px]">360° Orbit</span>
        </button>

        {/* Zoom In */}
        <button
          onClick={() => handleZoom(-2.5)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => handleZoom(2.5)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Reset Camera */}
        <button
          onClick={resetView}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-all"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive 3D Instruction Banner (Bottom Right) */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 pointer-events-none backdrop-blur-md z-10">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>Drag to rotate 360° • Scroll to zoom • Click nodes to inspect</span>
      </div>
    </div>
  );
};
