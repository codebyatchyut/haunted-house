import { AfterViewInit, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { TextureLoader } from 'three';
import { Sky } from 'three/addons/objects/Sky.js';


@Component({
  selector: 'app-haunted-house',
  imports: [],
  templateUrl: './haunted-house.html',
  styleUrl: './haunted-house.scss',
})
export class HauntedHouse implements AfterViewInit, OnDestroy{
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('webgl');
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;

  ngAfterViewInit(): void {

    // Textures
    const textureLoader = new TextureLoader();

    // Floor Textures
    const floorAlphaTexture = textureLoader.load('assets/textures/haunted-house/floor/alpha.jpg');
    const floorColorTexture = textureLoader.load('assets/textures/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.jpg');
    const floorARMTexture = textureLoader.load('assets/textures/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.jpg');
    const floorNormalTexture = textureLoader.load('assets/textures/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.jpg')
    const floorDisplacementTexture = textureLoader.load('assets/textures/haunted-house/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.jpg')

    floorColorTexture.repeat.set(8, 8);
    floorARMTexture.repeat.set(8, 8);
    floorNormalTexture.repeat.set(8, 8);
    floorDisplacementTexture.repeat.set(8, 8);
    floorColorTexture.wrapS = THREE.RepeatWrapping;
    floorARMTexture.wrapS = THREE.RepeatWrapping;
    floorNormalTexture.wrapS = THREE.RepeatWrapping;
    floorDisplacementTexture.wrapS = THREE.RepeatWrapping;
    floorColorTexture.wrapT = THREE.RepeatWrapping;
    floorARMTexture.wrapT = THREE.RepeatWrapping;
    floorNormalTexture.wrapT = THREE.RepeatWrapping;
    floorDisplacementTexture.wrapT = THREE.RepeatWrapping;

    floorColorTexture.colorSpace = THREE.SRGBColorSpace;

    // Wall Textures
    const wallColorTexture = textureLoader.load('assets/textures/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_diff_1k.jpg');
    const wallARMTexture = textureLoader.load('assets/textures/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_arm_1k.jpg');
    const wallNormalTexture = textureLoader.load('assets/textures/haunted-house/wall/castle_brick_broken_06_1k/castle_brick_broken_06_nor_gl_1k.jpg');
    wallColorTexture.colorSpace = THREE.SRGBColorSpace;

    // Roof Textures
    const roofColorTexture = textureLoader.load('assets/textures/haunted-house/roof/roof_slates_02_1k/roof_slates_02_diff_1k.jpg');
    const roofARMTexture = textureLoader.load('assets/textures/haunted-house/roof/roof_slates_02_1k/roof_slates_02_arm_1k.jpg');
    const roofNormalTexture = textureLoader.load('assets/textures/haunted-house/roof/roof_slates_02_1k/roof_slates_02_nor_gl_1k.jpg');

    roofColorTexture.repeat.set(3, 1);
    roofARMTexture.repeat.set(3, 1);
    roofNormalTexture.repeat.set(3, 1);

    roofColorTexture.wrapS = THREE.RepeatWrapping;
    roofARMTexture.wrapS = THREE.RepeatWrapping;
    roofNormalTexture.wrapS = THREE.RepeatWrapping;

    roofColorTexture.colorSpace = THREE.SRGBColorSpace;

    // Bushes Textures
    const bushColorTexture = textureLoader.load('assets/textures/haunted-house/bushes/leaves_forest_ground_1k/leaves_forest_ground_diff_1k.jpg');
    const bushARMTexture = textureLoader.load('assets/textures/haunted-house/bushes/leaves_forest_ground_1k/leaves_forest_ground_arm_1k.jpg');
    const bushNormalTexture = textureLoader.load('assets/textures/haunted-house/bushes/leaves_forest_ground_1k/leaves_forest_ground_nor_gl_1k.jpg');
    
    bushColorTexture.repeat.set(2, 1);
    bushARMTexture.repeat.set(2, 1);
    bushNormalTexture.repeat.set(2, 1);

    bushColorTexture.wrapS = THREE.RepeatWrapping;
    bushARMTexture.wrapS = THREE.RepeatWrapping;
    bushNormalTexture.wrapS = THREE.RepeatWrapping;

    bushColorTexture.colorSpace = THREE.SRGBColorSpace;

    // Graves Textures
    const graveColorTexture = textureLoader.load('assets/textures/haunted-house/graves/plastered_stone_wall_1k/plastered_stone_wall_diff_1k.jpg');
    const graveARMTexture = textureLoader.load('assets/textures/haunted-house/graves/plastered_stone_wall_1k/plastered_stone_wall_arm_1k.jpg');
    const graveNormalTexture = textureLoader.load('assets/textures/haunted-house/graves/plastered_stone_wall_1k/plastered_stone_wall_nor_gl_1k.jpg');

    graveColorTexture.repeat.set(0.3, 0.4)
    graveARMTexture.repeat.set(0.3, 0.4)
    graveNormalTexture.repeat.set(0.3, 0.4)

    graveColorTexture.colorSpace = THREE.SRGBColorSpace;

    // Door Textures
    const doorColorTexture = textureLoader.load('assets/textures/haunted-house/door/color.jpg')
    const doorAlphaTexture = textureLoader.load('assets/textures/haunted-house/door/alpha.jpg')
    const doorAmbientOcclusionTexture = textureLoader.load('assets/textures/haunted-house/door/ambientOcclusion.jpg')
    const doorHeightTexture = textureLoader.load('assets/textures/haunted-house/door/height.jpg')
    const doorNormalTexture = textureLoader.load('assets/textures/haunted-house/door/normal.jpg')
    const doorMetalnessTexture = textureLoader.load('assets/textures/haunted-house/door/metalness.jpg')
    const doorRoughnessTexture = textureLoader.load('assets/textures/haunted-house/door/roughness.jpg')

    doorColorTexture.colorSpace = THREE.SRGBColorSpace

    // gui for tweaks
    const gui = new GUI();

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    const aspectRatio = {x: window.innerWidth, y: window.innerHeight};
    this.camera = new THREE.PerspectiveCamera(75, aspectRatio.x / aspectRatio.y, 0.1, 100);
    this.camera.position.set(4, 2, 5);
    this.scene.add(this.camera);

    // orbitControls
    const orbitControls = new OrbitControls(this.camera, this.canvas().nativeElement);
    orbitControls.enableDamping = true;

    // Resizing
    addEventListener('resize', () => {
        aspectRatio.x = window.innerWidth;
        aspectRatio.y = window.innerHeight;

        this.camera.aspect = aspectRatio.x / aspectRatio.y;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(aspectRatio.x, aspectRatio.y);
        this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      });

    // FullScreen
    addEventListener('dblclick', () => {
      if (!document.fullscreenElement) {
        this.canvas().nativeElement.requestFullscreen();
      }
      else {
        document.exitFullscreen();
      }
    })

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
      // wireframe: true
    });
    floorMaterial.side = THREE.DoubleSide;
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.scene.add(floor);
    floor.rotation.x = -Math.PI * 0.5;

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

    // Bushes
    const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
    const bushMaterial = new THREE.MeshStandardMaterial({
      color: '#ccffcc',
      map: bushColorTexture,
      aoMap: bushARMTexture,
      roughnessMap: bushARMTexture,
      metalnessMap: bushARMTexture,
      normalMap: bushNormalTexture
    })
    const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
    bush1.scale.set(0.5, 0.5, 0.5)
    bush1.position.set(0.8, 0.2, 2.2)
    bush1.rotation.x = - 0.75

    const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
    bush2.scale.set(0.25, 0.25, 0.25)
    bush2.position.set(1.4, 0.1, 2.1)
    bush2.rotation.x = - 0.75

    const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
    bush3.scale.set(0.4, 0.4, 0.4)
    bush3.position.set(- 0.8, 0.1, 2.2)
    bush3.rotation.x = - 0.75

    const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
    bush4.scale.set(0.15, 0.15, 0.15)
    bush4.position.set(- 1, 0.05, 2.6)
    bush4.rotation.x = - 0.75

    house.add(bush1, bush2, bush3, bush4)

    // Graves
    const graves = new THREE.Group()
    const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
    const graveMaterial = new THREE.MeshStandardMaterial({
      map: graveColorTexture,
      aoMap: graveARMTexture,
      roughnessMap: graveARMTexture,
      metalnessMap: graveARMTexture,
      normalMap: graveNormalTexture
    });
    for (let i = 0; i < 30; i++) {
      const grave = new THREE.Mesh(graveGeometry, graveMaterial);
      graves.add(grave);
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 4;
      const x = Math.sin(angle) * radius;
      const y = Math.random() * 0.4;
      const z = Math.cos(angle) * radius;
      grave.position.set(x, y, z);

      // Rotation
      grave.rotation.x = (Math.random() - 0.5) * 0.4;
      grave.rotation.y = (Math.random() - 0.5) * 0.4;
      grave.rotation.z = (Math.random() - 0.5) * 0.4;
    }
    this.scene.add(graves);

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
    this.scene.add(pointLight);
    pointLight.position.y = 2.5;
    pointLight.position.z = 2.2;

    // Ghosts
    const ghost1 = new THREE.PointLight('#8800ff', 9)
    const ghost2 = new THREE.PointLight('#ff0088', 9)
    const ghost3 = new THREE.PointLight('#ff0000', 9)
    this.scene.add(ghost1, ghost2, ghost3)

    // Tweaks
    const lightsFolder = gui.addFolder('Lights');
    lightsFolder.add(ambientLight, 'intensity').min(0).max(4).step(0.01).name('AmbientLight');
    lightsFolder.add(directionalLight, 'intensity').min(0).max(4).step(0.01).name('DirectionalLight');
    const materialTweaks = gui.addFolder('MaterialTweaks');
    materialTweaks.add(floor.material, 'displacementScale').min(0).max(1).step(0.001).name('DisplacementScale');
    materialTweaks.add(floor.material, 'displacementBias').min(-1).max(1).step(0.001).name('DisplacementBias');

    // Renderer
    this.renderer = new THREE.WebGLRenderer({'canvas': this.canvas().nativeElement});
    this.renderer.setSize(aspectRatio.x, aspectRatio.y);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.render(this.scene, this.camera);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Shadows
    directionalLight.castShadow = true;
    ghost1.castShadow = true;
    ghost2.castShadow = true;
    ghost3.castShadow = true;

    wall.castShadow = true;
    wall.receiveShadow = true;
    roof.castShadow = true;
    floor.receiveShadow = true;

    for (const grave of graves.children) {
      grave.castShadow = true;
      grave.receiveShadow = true;
    }

    // Mappings
    directionalLight.shadow.mapSize.width = 256
    directionalLight.shadow.mapSize.height = 256
    directionalLight.shadow.camera.top = 8
    directionalLight.shadow.camera.right = 8
    directionalLight.shadow.camera.bottom = - 8
    directionalLight.shadow.camera.left = - 8
    directionalLight.shadow.camera.near = 1
    directionalLight.shadow.camera.far = 20

    ghost1.shadow.mapSize.width = 256
    ghost1.shadow.mapSize.height = 256
    ghost1.shadow.camera.far = 10

    ghost2.shadow.mapSize.width = 256
    ghost2.shadow.mapSize.height = 256
    ghost2.shadow.camera.far = 10

    ghost3.shadow.mapSize.width = 256
    ghost3.shadow.mapSize.height = 256
    ghost3.shadow.camera.far = 10

    // Sky
    const sky = new Sky();
    sky.scale.set(100, 100, 100);

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
    // this.scene.fog = new THREE.Fog('#ff0000', 1, 13);
    this.scene.fog = new THREE.FogExp2('#04343f', 0.1)

    // Timer
    const timer = new THREE.Timer();
    // Animation
    const tick = () => {
      timer.update();
      const elapsedTime = timer.getElapsed();
      const angle = elapsedTime * 0.5;
      ghost1.position.x = Math.cos(angle) * 4;
      ghost1.position.z = Math.sin(angle)* 4;
      ghost1.position.y = Math.sin(angle) * Math.sin(angle * 2.34) * Math.sin(angle * 3.45);
      const ghost2Angle = - elapsedTime * 0.36;
      ghost2.position.x = Math.cos(ghost2Angle) * 5;
      ghost2.position.z = Math.sin(ghost2Angle) * 5;
      ghost2.position.y = Math.sin(ghost2Angle) * Math.sin(ghost2Angle * 2.34) * Math.sin(ghost2Angle * 3.45);
      const ghost3Angle = elapsedTime * 0.23;
      ghost3.position.x = Math.cos(ghost3Angle) * 6;
      ghost3.position.z = Math.sin(ghost3Angle) * 6;
      ghost3.position.y = Math.sin(ghost3Angle) * Math.sin(ghost3Angle * 2.34) * Math.sin(ghost3Angle * 3.45);
      orbitControls.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(tick);
    }

    tick();
  }

  

  ngOnDestroy(): void {
    
  }
}
