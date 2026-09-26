import { AfterViewInit, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { Sky } from 'three/addons/objects/Sky.js';

const TEXTURES = 'assets/textures/haunted-house';

interface TextureOptions {
  srgb?: boolean;
  repeat?: [number, number];
  wrapS?: boolean;
  wrapT?: boolean;
}

@Component({
  selector: 'app-haunted-house',
  imports: [],
  templateUrl: './haunted-house.html',
  styleUrl: './haunted-house.scss',
})
export class HauntedHouse implements AfterViewInit, OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('webgl');
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private orbitControls?: OrbitControls;
  private gui?: GUI;
  private timer?: THREE.Timer;
  private animationFrameId = 0;
  private readonly listeners = new AbortController();

  ngAfterViewInit(): void {
    const canvas = this.canvas().nativeElement;

    // Textures
    const textureLoader = new THREE.TextureLoader();
    const loadTexture = (path: string, { srgb, repeat, wrapS, wrapT }: TextureOptions = {}) => {
      const texture = textureLoader.load(`${TEXTURES}/${path}`);
      if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
      if (repeat) texture.repeat.set(...repeat);
      if (wrapS) texture.wrapS = THREE.RepeatWrapping;
      if (wrapT) texture.wrapT = THREE.RepeatWrapping;
      return texture;
    };

    // Floor Textures
    const floorTiling: TextureOptions = { repeat: [8, 8], wrapS: true, wrapT: true };
    const floorDir = 'floor/coast_sand_rocks_02_1k/coast_sand_rocks_02';
    const floorAlphaTexture = loadTexture('floor/alpha.jpg');
    const floorColorTexture = loadTexture(`${floorDir}_diff_1k.jpg`, { ...floorTiling, srgb: true });
    const floorARMTexture = loadTexture(`${floorDir}_arm_1k.jpg`, floorTiling);
    const floorNormalTexture = loadTexture(`${floorDir}_nor_gl_1k.jpg`, floorTiling);
    const floorDisplacementTexture = loadTexture(`${floorDir}_disp_1k.jpg`, floorTiling);

    // Wall Textures
    const wallDir = 'wall/castle_brick_broken_06_1k/castle_brick_broken_06';
    const wallColorTexture = loadTexture(`${wallDir}_diff_1k.jpg`, { srgb: true });
    const wallARMTexture = loadTexture(`${wallDir}_arm_1k.jpg`);
    const wallNormalTexture = loadTexture(`${wallDir}_nor_gl_1k.jpg`);

    // Roof Textures
    const roofTiling: TextureOptions = { repeat: [3, 1], wrapS: true };
    const roofDir = 'roof/roof_slates_02_1k/roof_slates_02';
    const roofColorTexture = loadTexture(`${roofDir}_diff_1k.jpg`, { ...roofTiling, srgb: true });
    const roofARMTexture = loadTexture(`${roofDir}_arm_1k.jpg`, roofTiling);
    const roofNormalTexture = loadTexture(`${roofDir}_nor_gl_1k.jpg`, roofTiling);

    // Bushes Textures
    const bushTiling: TextureOptions = { repeat: [2, 1], wrapS: true };
    const bushDir = 'bushes/leaves_forest_ground_1k/leaves_forest_ground';
    const bushColorTexture = loadTexture(`${bushDir}_diff_1k.jpg`, { ...bushTiling, srgb: true });
    const bushARMTexture = loadTexture(`${bushDir}_arm_1k.jpg`, bushTiling);
    const bushNormalTexture = loadTexture(`${bushDir}_nor_gl_1k.jpg`, bushTiling);

    // Graves Textures
    const graveTiling: TextureOptions = { repeat: [0.3, 0.4] };
    const graveDir = 'graves/plastered_stone_wall_1k/plastered_stone_wall';
    const graveColorTexture = loadTexture(`${graveDir}_diff_1k.jpg`, { ...graveTiling, srgb: true });
    const graveARMTexture = loadTexture(`${graveDir}_arm_1k.jpg`, graveTiling);
    const graveNormalTexture = loadTexture(`${graveDir}_nor_gl_1k.jpg`, graveTiling);

    // Door Textures
    const doorColorTexture = loadTexture('door/color.jpg', { srgb: true });
    const doorAlphaTexture = loadTexture('door/alpha.jpg');
    const doorAmbientOcclusionTexture = loadTexture('door/ambientOcclusion.jpg');
    const doorHeightTexture = loadTexture('door/height.jpg');
    const doorNormalTexture = loadTexture('door/normal.jpg');
    const doorMetalnessTexture = loadTexture('door/metalness.jpg');
    const doorRoughnessTexture = loadTexture('door/roughness.jpg');

    // gui for tweaks
    const gui = (this.gui = new GUI());

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    const sizes = { width: window.innerWidth, height: window.innerHeight };
    this.camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    this.camera.position.set(4, 2, 5);
    this.scene.add(this.camera);

    // orbitControls
    const orbitControls = (this.orbitControls = new OrbitControls(this.camera, canvas));
    orbitControls.enableDamping = true;

    // Resizing
    const { signal } = this.listeners;
    window.addEventListener('resize', () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      this.camera.aspect = sizes.width / sizes.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(sizes.width, sizes.height);
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    }, { signal });

    // FullScreen
    window.addEventListener('dblclick', () => {
      if (!document.fullscreenElement) {
        canvas.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }, { signal });

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20, 100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({
      alphaMap: floorAlphaTexture,
      transparent: true,
      map: floorColorTexture,
      aoMap: floorARMTexture,
      metalnessMap: floorARMTexture,
      roughnessMap: floorARMTexture,
      normalMap: floorNormalTexture,
      displacementMap: floorDisplacementTexture,
      displacementScale: 0.3,
      displacementBias: -0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI * 0.5;
    this.scene.add(floor);

    // House Group
    const house = new THREE.Group();
    this.scene.add(house);

    // Walls of the house
    const wallGeometry = new THREE.BoxGeometry(4, 2.5, 4);
    const wallMaterial = new THREE.MeshStandardMaterial({
      map: wallColorTexture,
      aoMap: wallARMTexture,
      metalnessMap: wallARMTexture,
      roughnessMap: wallARMTexture,
      normalMap: wallNormalTexture
    });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.y = 1.25;
    house.add(wall);

    // Roof of the house
    const roofGeometry = new THREE.ConeGeometry(3.5, 1.5, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
      map: roofColorTexture,
      aoMap: roofARMTexture,
      roughnessMap: roofARMTexture,
      metalnessMap: roofARMTexture,
      normalMap: roofNormalTexture
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 3.25;
    roof.rotation.y = Math.PI * 0.25;
    house.add(roof);

    // Door of the house
    const doorGeometry = new THREE.PlaneGeometry(2.2, 2.2, 100, 100);
    const doorMaterial = new THREE.MeshStandardMaterial({
      map: doorColorTexture,
      transparent: true,
      alphaMap: doorAlphaTexture,
      aoMap: doorAmbientOcclusionTexture,
      displacementMap: doorHeightTexture,
      displacementScale: 0.15,
      displacementBias: -0.04,
      normalMap: doorNormalTexture,
      metalnessMap: doorMetalnessTexture,
      roughnessMap: doorRoughnessTexture
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.y = 1.1;
    door.position.z = 2.001;
    house.add(door);

    // Instancing helper: one draw call (and one per shadow pass) instead of one per object
    const dummy = new THREE.Object3D();
    const setInstance = (mesh: THREE.InstancedMesh, index: number) => {
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    };

    // Bushes
    const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
    const bushMaterial = new THREE.MeshStandardMaterial({
      color: '#ccffcc',
      map: bushColorTexture,
      aoMap: bushARMTexture,
      roughnessMap: bushARMTexture,
      metalnessMap: bushARMTexture,
      normalMap: bushNormalTexture
    });
    const bushData: { scale: number; position: [number, number, number] }[] = [
      { scale: 0.5, position: [0.8, 0.2, 2.2] },
      { scale: 0.25, position: [1.4, 0.1, 2.1] },
      { scale: 0.4, position: [-0.8, 0.1, 2.2] },
      { scale: 0.15, position: [-1, 0.05, 2.6] },
    ];
    const bushes = new THREE.InstancedMesh(bushGeometry, bushMaterial, bushData.length);
    dummy.rotation.set(-0.75, 0, 0);
    bushData.forEach(({ scale, position }, i) => {
      dummy.scale.setScalar(scale);
      dummy.position.set(...position);
      setInstance(bushes, i);
    });
    bushes.computeBoundingSphere();
    house.add(bushes);

    // Graves
    const graveCount = 30;
    const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
    const graveMaterial = new THREE.MeshStandardMaterial({
      map: graveColorTexture,
      aoMap: graveARMTexture,
      roughnessMap: graveARMTexture,
      metalnessMap: graveARMTexture,
      normalMap: graveNormalTexture
    });
    const graves = new THREE.InstancedMesh(graveGeometry, graveMaterial, graveCount);
    dummy.scale.setScalar(1);
    for (let i = 0; i < graveCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 4;
      dummy.position.set(Math.sin(angle) * radius, Math.random() * 0.4, Math.cos(angle) * radius);
      dummy.rotation.set(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      );
      setInstance(graves, i);
    }
    graves.computeBoundingSphere();
    this.scene.add(graves);

    // Nothing above moves, so skip recomputing their world matrices every frame
    this.scene.updateMatrixWorld();
    for (const object of [floor, house, wall, roof, door, bushes, graves]) {
      object.matrixAutoUpdate = false;
    }

    // Ambient Light
    const ambientLight = new THREE.AmbientLight('#86cdff', 0.275);
    this.scene.add(ambientLight);

    // Directional Light
    const directionalLight = new THREE.DirectionalLight('#86cdff', 1);
    // Aligned with the Sky's sunPosition (0.3, -0.037, -0.95) so the scene is lit
    // from the same direction as the glow on the horizon.
    directionalLight.position.set(3, 2, -8);
    this.scene.add(directionalLight);

    // Point Light
    const pointLight = new THREE.PointLight('#ff7d46', 7);
    pointLight.position.set(0, 2.5, 2.2);
    this.scene.add(pointLight);

    // Ghosts
    const ghosts = [
      { light: new THREE.PointLight('#8800ff', 9), speed: 0.5, radius: 4 },
      { light: new THREE.PointLight('#ff0088', 9), speed: -0.36, radius: 5 },
      { light: new THREE.PointLight('#ff0000', 9), speed: 0.23, radius: 6 },
    ];
    for (const { light } of ghosts) {
      this.scene.add(light);
    }

    // Tweaks
    const lightsFolder = gui.addFolder('Lights');
    lightsFolder.add(ambientLight, 'intensity').min(0).max(4).step(0.01).name('AmbientLight');
    lightsFolder.add(directionalLight, 'intensity').min(0).max(4).step(0.01).name('DirectionalLight');
    const materialTweaks = gui.addFolder('MaterialTweaks');
    materialTweaks.add(floorMaterial, 'displacementScale').min(0).max(1).step(0.001).name('DisplacementScale');
    materialTweaks.add(floorMaterial, 'displacementBias').min(-1).max(1).step(0.001).name('DisplacementBias');

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, powerPreference: 'high-performance' });
    this.renderer.setSize(sizes.width, sizes.height);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Shadows
    wall.castShadow = true;
    wall.receiveShadow = true;
    roof.castShadow = true;
    floor.receiveShadow = true;
    graves.castShadow = true;
    graves.receiveShadow = true;

    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(256, 256);
    directionalLight.shadow.camera.top = 8;
    directionalLight.shadow.camera.right = 8;
    directionalLight.shadow.camera.bottom = -8;
    directionalLight.shadow.camera.left = -8;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 20;

    for (const { light } of ghosts) {
      light.castShadow = true;
      light.shadow.mapSize.set(256, 256);
      light.shadow.camera.far = 10;
    }

    // Sky
    const sky = new Sky();
    sky.scale.setScalar(100);

    // three r167+ removed the legacy tone curve from Sky's fragment shader in favour
    // of the renderer's tone mapping. `tonemapping_fragment` is compiled out entirely
    // when renderer.toneMapping is NoToneMapping (the default), so the raw Preetham
    // values -- (Lin + L0) * 0.04, i.e. ~0.04 -- reach the framebuffer almost black.
    // Only the sun disc survives, because of its * 19000.0 term. Restoring the old
    // pow() brings the blue back without disturbing the rest of the scene's lighting.
    sky.material.fragmentShader = sky.material.fragmentShader
      .replace('varying float vSunE;', 'varying float vSunE;\n\t\tvarying float vSunfade;')
      .replace(
        'gl_FragColor = vec4( texColor, 1.0 );',
        'gl_FragColor = vec4( pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) ), 1.0 );'
      );

    this.scene.add(sky);

    sky.material.uniforms['turbidity'].value = 10;
    sky.material.uniforms['rayleigh'].value = 3;
    sky.material.uniforms['mieCoefficient'].value = 0.1;
    sky.material.uniforms['mieDirectionalG'].value = 0.95;
    sky.material.uniforms['sunPosition'].value.set(0.3, -0.037, -0.95);
    // three r185+ adds procedural clouds to Sky (coverage/density default to 0.4).
    // Disable them to get the clean gradient the lesson expects.
    sky.material.uniforms['cloudCoverage'].value = 0;

    // Fog
    this.scene.fog = new THREE.FogExp2('#04343f', 0.1);

    // Timer
    const timer = (this.timer = new THREE.Timer());
    // Animation
    const tick = () => {
      timer.update();
      const elapsedTime = timer.getElapsed();
      for (const { light, speed, radius } of ghosts) {
        const angle = elapsedTime * speed;
        light.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * Math.sin(angle * 2.34) * Math.sin(angle * 3.45),
          Math.sin(angle) * radius
        );
      }
      orbitControls.update();
      this.renderer.render(this.scene, this.camera);
      this.animationFrameId = requestAnimationFrame(tick);
    };

    tick();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.listeners.abort();
    this.orbitControls?.dispose();
    this.gui?.destroy();
    this.timer?.dispose();

    // Free GPU resources: geometries, materials and every texture they reference
    const disposed = new Set<{ dispose(): void }>();
    this.scene?.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      disposed.add(object.geometry);
      const materials: THREE.Material[] = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        disposed.add(material);
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) disposed.add(value);
        }
      }
    });
    disposed.forEach((resource) => resource.dispose());

    this.renderer?.dispose();
  }
}
