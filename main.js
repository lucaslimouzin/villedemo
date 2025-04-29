// Initialisation de la scène
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Ciel bleu

// Initialisation de la caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 50);

// Initialisation du renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Ajout des contrôles de caméra
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 20;
controls.maxDistance = 100;
controls.maxPolarAngle = Math.PI / 2;

// Lumière ambiante
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Lumière directionnelle (soleil)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 200, 100);
scene.add(directionalLight);

// Création du sol
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a5f0b,
    roughness: 0.8,
    metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Fonction pour créer un bâtiment lowpoly
function createBuilding(x, z, width, depth, height) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
        roughness: 0.7,
        metalness: 0.1
    });
    const building = new THREE.Mesh(geometry, material);
    building.position.set(x, height/2, z);
    return building;
}

// Fonction pour créer un arbre
function createTree(x, z) {
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 6);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    
    const leavesGeometry = new THREE.ConeGeometry(2, 4, 6);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 4;
    
    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(leaves);
    tree.position.set(x, 0, z);
    return tree;
}

// Fonction pour créer une voiture
function createCar(x, z) {
    const carGroup = new THREE.Group();
    
    // Corps de la voiture
    const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: Math.random() * 0xffffff,
        roughness: 0.5,
        metalness: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    
    // Roues
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const wheels = [];
    const wheelPositions = [
        [-1, 0.5, -1.5],
        [1, 0.5, -1.5],
        [-1, 0.5, 1.5],
        [1, 0.5, 1.5]
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        wheels.push(wheel);
        carGroup.add(wheel);
    });
    
    carGroup.add(body);
    carGroup.position.set(x, 0, z);
    return carGroup;
}

// Fonction pour créer une route
function createRoad(x, z, width, length, isHorizontal) {
    const roadGeometry = new THREE.PlaneGeometry(width, length);
    const roadMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333,
        roughness: 0.9,
        metalness: 0.1
    });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.set(x, 0.01, z);
    return road;
}

// Création de la ville
const buildings = [];
const gridSize = 10;
const spacing = 8;

// Création des routes principales
const mainRoad = createRoad(0, 0, 4, 100, true);
scene.add(mainRoad);
const crossRoad = createRoad(0, 0, 100, 4, false);
scene.add(crossRoad);

// Création des bâtiments
for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
        const x = (i - gridSize/2) * spacing;
        const z = (j - gridSize/2) * spacing;
        
        // Ne pas placer de bâtiments sur les routes principales
        if (Math.abs(x) > 2 && Math.abs(z) > 2) {
            const width = 4 + Math.random() * 4;
            const depth = 4 + Math.random() * 4;
            const height = 5 + Math.random() * 15;
            
            const building = createBuilding(x, z, width, depth, height);
            scene.add(building);
            buildings.push(building);
        }
    }
}

// Ajout d'arbres (plus nombreux et mieux répartis)
for (let i = 0; i < 50; i++) {
    const x = (Math.random() - 0.5) * 80;
    const z = (Math.random() - 0.5) * 80;
    // Ne pas placer d'arbres sur les routes ou trop près des bâtiments
    if (Math.abs(x) > 4 && Math.abs(z) > 4) {
        const tree = createTree(x, z);
        scene.add(tree);
    }
}

// Ajout de voitures (plus nombreuses et mieux réparties)
for (let i = 0; i < 15; i++) {
    let x, z;
    // Placer les voitures sur les routes
    if (Math.random() > 0.5) {
        x = (Math.random() - 0.5) * 80;
        z = (Math.random() * 4 - 2); // Sur la route horizontale
    } else {
        x = (Math.random() * 4 - 2); // Sur la route verticale
        z = (Math.random() - 0.5) * 80;
    }
    const car = createCar(x, z);
    scene.add(car);
}

// Variables pour l'animation cinématique
let time = 0;
const animationSpeed = 0.0005;
const radius = 50;
const heightVariation = 20;

// Fonction pour l'animation cinématique de la caméra
function cinematicCameraAnimation() {
    time += animationSpeed;
    
    // Mouvement circulaire avec variation de hauteur
    const x = Math.cos(time) * radius;
    const z = Math.sin(time) * radius;
    const y = 30 + Math.sin(time * 2) * heightVariation;
    
    // Position de la caméra
    camera.position.set(x, y, z);
    
    // La caméra regarde toujours vers le centre
    camera.lookAt(0, 0, 0);
}

// Animation avec mise à jour des contrôles
function animate() {
    requestAnimationFrame(animate);
    cinematicCameraAnimation(); // Appel de l'animation cinématique
    renderer.render(scene, camera);
}

// Gestion du redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Démarrage de l'animation
animate(); 