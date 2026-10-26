// ==========================================
// 1. STARFIELD ANIMATION (Runs on all pages)
// ==========================================
const canvas = document.getElementById('starfield');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let stars = [];
  const starCount = 100;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Star {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.2 + 0.2;
      this.speed = Math.random() * 0.3 + 0.05;
      this.alpha = Math.random();
    }
    update() {
      this.x += this.speed;
      if (this.x > canvas.width) {
        this.x = 0;
        this.y = Math.random() * canvas.height;
        this.alpha = Math.random();
      }
      this.alpha += (Math.random() - 0.5) * 0.05;
      if (this.alpha < 0.1) this.alpha = 0.1;
      if (this.alpha > 1) this.alpha = 1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      ctx.fill();
    }
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < starCount; i++) { stars.push(new Star()); }
  }

  function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => {
      star.update();
      star.draw();
    });
    requestAnimationFrame(animateStars);
  }

  initStars();
  animateStars();
}

// ==========================================
// 2. SIDEBAR TOGGLE LOGIC (Runs on all pages)
// ==========================================
const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.querySelector(".toggle");

if (sidebar && toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  });
}

// ==========================================
// 3. GALAXY DATA & GALLERY (Runs ONLY on galaxies.html)
// ==========================================


// ==========================================
// 3. FETCH DATA & BUILD GALLERY
// ==========================================
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');

// Only run this code if the gallery element exists on the page
if (gallery && modal) {
  const modalImage = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const modalDesignation = document.getElementById('modal-designation');
  const modalMorphology = document.getElementById('modal-morphology');
  const modalDistance = document.getElementById('modal-distance');
  const modalDescription = document.getElementById('modal-description');
  const backButton = document.getElementById('back-button');

  let currentData = []; // This will hold our data once it loads

  // Fetch the JSON file
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      // Check which page we are on and load the correct data array
      // Right now we just have galaxies, but this sets you up for the future!
      if (window.location.pathname.includes('galaxies.html')) {
        currentData = data.galaxies;
      } 
      else if (window.location.pathname.includes('exo.html')) {
        currentData = data.exoplanets;
      }
      else if (window.location.pathname.includes('planets.html')) {
        currentData = data.planets;
      }
      else if (window.location.pathname.includes('blackholes.html')) {
        currentData = data.blackHoles; // Note the capital H to match the JSON key
      }
      // Example for later: else if (window.location.pathname.includes('planets.html')) { currentData = data.planets; }

      createGallery(currentData);
    })
    .catch(error => console.error("Error loading data:", error));

  function createGallery(dataArray) {
    dataArray.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'galaxy-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      
      const img = document.createElement('img');
      img.src = item.image;
      card.appendChild(img);
      
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = item.name;
      card.appendChild(name);

      card.addEventListener('click', () => openModal(item));
      gallery.appendChild(card);
    });
  }

  // Variable to store the 3D animation so we can stop it later
let animationFrameId; 

  function openModal(item) {
    // 1. Fill in the text data
    document.getElementById('modal-title').textContent = item.name;
    document.getElementById('modal-designation').textContent = item.designation || 'N/A';
    document.getElementById('modal-morphology').textContent = item.morphology || 'N/A';
    document.getElementById('modal-distance').textContent = item.distance || 'N/A';
    document.getElementById('modal-description').textContent = item.description;
    
    // Show the modal first so it has dimensions
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Grab both display containers
    const modalImage = document.getElementById('modal-image');
    const canvasContainer = document.getElementById('canvas-container');

    // Check if we are on the Planets page
    const isPlanetsPage = window.location.pathname.includes('planets.html');

    if (isPlanetsPage) {
      // ==========================================
      // SHOW 3D SPHERE (Using your known working code!)
      // ==========================================
      modalImage.style.display = 'none'; 
      canvasContainer.style.display = 'block'; 
      canvasContainer.innerHTML = ''; 

      const scene = new THREE.Scene();
      
      const camera = new THREE.PerspectiveCamera(45, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
      camera.position.z = 4.5; 

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
      canvasContainer.appendChild(renderer.domElement);

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(5, 3, 5);
      scene.add(light);
      scene.add(new THREE.AmbientLight(0x222222));
      
      const planetGroup = new THREE.Group();
      scene.add(planetGroup);

      // Create the Sphere
      const geometry = new THREE.SphereGeometry(1.5, 64, 64);
      const texture = new THREE.TextureLoader().load(item.image); 
      const material = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.6 
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      planetGroup.add(sphere);

      // Add basic rings if data exists
      // Add realistic rings if data exists
      if (item.ringImage) {

  const innerRadius = 1.6;
  const outerRadius = 3.2;

  const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 256);

  const ringTexture = new THREE.TextureLoader().load(item.ringImage);

  const ringMat = new THREE.MeshBasicMaterial({
    map: ringTexture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
    depthWrite: false // important for transparency rendering
  });

  const ring = new THREE.Mesh(ringGeo, ringMat);

  ring.rotation.x = Math.PI / 2; // make it horizontal
  ring.position.y = 0.001; // prevent z-fighting

  planetGroup.add(ring);

  // Proper Saturn tilt (~26.7 degrees)
  planetGroup.rotation.z = THREE.MathUtils.degToRad(26.7);
}

      function animate() {
        animationFrameId = requestAnimationFrame(animate);
        planetGroup.rotation.y += 0.003; 
        renderer.render(scene, camera);
      }
      animate();

    } else {
      // ==========================================
      // SHOW 2D IMAGE (For Galaxies, Black Holes, Exo)
      // ==========================================
      canvasContainer.style.display = 'none'; 
      
      // Stop the 3D engine if it was running
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      modalImage.style.display = 'block'; 
      modalImage.src = item.image; 
    }
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Stop the 3D animation when closed to save memory!
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  }

  backButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

// ==========================================
// 4. QUIZ LOGIC (Runs ONLY on quiz.html)
// ==========================================
if (window.location.pathname.includes('quiz.html')) {
  
  // A much larger pool of questions covering all categories!
  const questionPool = [
    // --- Galaxies ---
    {
      question: "Which galaxy is on a collision course with our Milky Way in about 4 billion years?",
      answers: [{ text: "Sombrero Galaxy", correct: false }, { text: "Andromeda Galaxy", correct: true }, { text: "Whirlpool Galaxy", correct: false }, { text: "Centaurus A", correct: false }]
    },
    {
      question: "Which galaxy is known as the 'Fireworks Galaxy' due to its frequent supernovae?",
      answers: [{ text: "Cigar Galaxy", correct: false }, { text: "NGC 6946", correct: true }, { text: "Messier 81", correct: false }, { text: "Tadpole Galaxy", correct: false }]
    },
    {
      question: "Which peculiar galaxy exhibits a long tidal tail from gravitational interactions?",
      answers: [{ text: "Tadpole Galaxy", correct: true }, { text: "Pinwheel Galaxy", correct: false }, { text: "Messier 87", correct: false }, { text: "NGC 1300", correct: false }]
    },
    {
      question: "Also known as the Sunflower Galaxy, which galaxy has a bright core and distinctive arms?",
      answers: [{ text: "Messier 63", correct: true }, { text: "Sombrero Galaxy", correct: false }, { text: "NGC 3310", correct: false }, { text: "Cigar Galaxy", correct: false }]
    },
    // --- Planets ---
    {
      question: "Which planet is known as the 'Red Planet' due to the iron oxide prevalent on its surface?",
      answers: [{ text: "Venus", correct: false }, { text: "Mars", correct: true }, { text: "Jupiter", correct: false }, { text: "Mercury", correct: false }]
    },
    {
      question: "Which ice giant planet rotates on its side, appearing to roll around the Sun like a barrel?",
      answers: [{ text: "Neptune", correct: false }, { text: "Saturn", correct: false }, { text: "Uranus", correct: true }, { text: "Earth", correct: false }]
    },
    {
      question: "Which planet is sometimes called Earth's 'sister planet' because of their similar size?",
      answers: [{ text: "Mars", correct: false }, { text: "Venus", correct: true }, { text: "Mercury", correct: false }, { text: "Neptune", correct: false }]
    },
    {
      question: "Which planet is famous for its Great Red Spot, a giant storm bigger than Earth?",
      answers: [{ text: "Mars", correct: false }, { text: "Saturn", correct: false }, { text: "Jupiter", correct: true }, { text: "Neptune", correct: false }]
    },
    // --- Exoplanets ---
    {
      question: "Which exoplanet is known for having weather that includes horizontal rain made of jagged silicate glass?",
      answers: [{ text: "HD 189733 b", correct: true }, { text: "Proxima Centauri b", correct: false }, { text: "WASP-12b", correct: false }, { text: "Kepler-22b", correct: false }]
    },
    {
      question: "Which scorching 'super-Earth' is theorized to possess a core made of diamond?",
      answers: [{ text: "TRAPPIST-1e", correct: false }, { text: "55 Cancri e", correct: true }, { text: "Kepler-186f", correct: false }, { text: "PSR B1257+12 B", correct: false }]
    },
    {
      question: "What is the closest known exoplanet to our Solar System?",
      answers: [{ text: "Kepler-22b", correct: false }, { text: "Proxima Centauri b", correct: true }, { text: "HD 189733 b", correct: false }, { text: "TRAPPIST-1e", correct: false }]
    },
    // --- Black Holes ---
    {
      question: "What is the name of the supermassive black hole at the center of our Milky Way galaxy?",
      answers: [{ text: "Messier 87*", correct: false }, { text: "Cygnus X-1", correct: false }, { text: "TON 618", correct: false }, { text: "Sagittarius A*", correct: true }]
    },
    {
      question: "Which black hole weighs an incomprehensible 66 billion times the mass of our Sun?",
      answers: [{ text: "TON 618", correct: true }, { text: "Gaia BH1", correct: false }, { text: "V404 Cygni", correct: false }, { text: "Holmberg 15A", correct: false }]
    },
    {
      question: "Which was the very first black hole to ever be directly imaged by humanity in 2019?",
      answers: [{ text: "Sagittarius A*", correct: false }, { text: "Cygnus X-1", correct: false }, { text: "Messier 87*", correct: true }, { text: "J0313-1806", correct: false }]
    },
    {
      question: "Which is currently the closest known black hole to Earth?",
      answers: [{ text: "Gaia BH1", correct: true }, { text: "Cygnus X-1", correct: false }, { text: "V404 Cygni", correct: false }, { text: "Sagittarius A*", correct: false }]
    }
  ];

  const questionElement = document.getElementById('question-text');
  const answerButtons = document.getElementById('answer-buttons');
  const nextButton = document.getElementById('next-btn');
  const scoreTracker = document.getElementById('score-tracker');
  const questionTracker = document.getElementById('question-tracker');

  let currentQuizQuestions = []; // Holds the 5 selected questions
  let currentQuestionIndex = 0;
  let score = 0;
  const questionsPerGame = 5;

  // Function to shuffle an array randomly
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next Question";
    
    // Shuffle the entire pool and slice out only 5 questions
    const shuffledPool = shuffleArray([...questionPool]);
    currentQuizQuestions = shuffledPool.slice(0, questionsPerGame);
    
    showQuestion();
  }

  function showQuestion() {
    resetState();
    let currentQuestion = currentQuizQuestions[currentQuestionIndex];
    
    // Randomize the order of the answers so they aren't always in the same spot!
    let shuffledAnswers = shuffleArray([...currentQuestion.answers]);

    questionTracker.innerText = `Question ${currentQuestionIndex + 1} / ${questionsPerGame}`;
    scoreTracker.innerText = `Score: ${score}`;
    questionElement.innerText = currentQuestion.question;

    shuffledAnswers.forEach(answer => {
      const button = document.createElement('button');
      button.innerText = answer.text;
      button.classList.add('quiz-btn');
      if (answer.correct) {
        button.dataset.correct = answer.correct;
      }
      button.addEventListener('click', selectAnswer);
      answerButtons.appendChild(button);
    });
  }

  function resetState() {
    nextButton.classList.add('hidden');
    while (answerButtons.firstChild) {
      answerButtons.removeChild(answerButtons.firstChild);
    }
  }

  function selectAnswer(e) {
    const selectedButton = e.target;
    const isCorrect = selectedButton.dataset.correct === "true";
    
    if (isCorrect) {
      selectedButton.classList.add('correct');
      score++;
      scoreTracker.innerText = `Score: ${score}`;
    } else {
      selectedButton.classList.add('wrong');
    }

    Array.from(answerButtons.children).forEach(button => {
      if (button.dataset.correct === "true") {
        button.classList.add('correct');
      }
      button.disabled = true;
    });
    
    nextButton.classList.remove('hidden');
  }

  function showScore() {
    resetState();
    questionTracker.innerText = "Quiz Complete!";
    questionElement.innerText = `You scored ${score} out of ${questionsPerGame}!`;
    nextButton.innerHTML = "Play Again";
    nextButton.classList.remove('hidden');
  }

  function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuizQuestions.length) {
      showQuestion();
    } else {
      showScore();
    }
  }

  nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < currentQuizQuestions.length) {
      handleNextButton();
    } else {
      startQuiz();
    }
  });

  startQuiz();
}

// ==========================================
// 5. FULL 3D SOLAR SYSTEM (Runs ONLY on system.html)
// ==========================================
// ==========================================
// 5. FULL 3D SOLAR SYSTEM (Runs ONLY on system.html)
// ==========================================
if (window.location.pathname.includes('system.html')) {
  
  const container = document.getElementById('solar-system-container');
  
  // 1. Scene & Camera Setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 100, 250); // Pulled further back to see Neptune!

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // 2. OrbitControls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; 
  controls.dampingFactor = 0.05;
  controls.maxDistance = 1000; 

  // 3. Realistic Lighting Setup
  // Deep space is dark, so we lower ambient light to create realistic shadows on the dark side of planets
  scene.add(new THREE.AmbientLight(0x111111)); 
  
  // The Sun is the light source! Increased intensity and distance.
  const sunLight = new THREE.PointLight(0xffffff, 2.5, 1500);
  scene.add(sunLight);

  // 4. Star Background
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(3000 * 3); 
  for(let i=0; i<9000; i++) {
    starPos[i] = (Math.random() - 0.5) * 1000; 
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({color: 0xffffff, size: 0.5});
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  const textureLoader = new THREE.TextureLoader();

  // ==========================================
  // 5. THE SUN (Texture Map + Realistic Glow)
  // ==========================================
  // We name the group 'sun' so the animation loop at the bottom doesn't crash!
  const sun = new THREE.Group();
  scene.add(sun);

  // A. The Core (Using your 2D Image Map)
  const sunGeo = new THREE.SphereGeometry(12, 64, 64);
  const sunMat = new THREE.MeshBasicMaterial({ 
    map: textureLoader.load('static/images/planets/2k_sun.jpg') 
  });
  const sunCore = new THREE.Mesh(sunGeo, sunMat);
  sun.add(sunCore);

  // B. The Corona / Flames (Glowing outer layer)
  const glowGeo = new THREE.SphereGeometry(12.6, 64, 64); // Slightly larger
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00, // Fiery orange/yellow
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending, // Magic glow effect
    side: THREE.BackSide
  });
  const sunGlow = new THREE.Mesh(glowGeo, glowMat);
  sun.add(sunGlow);

  const planets = [];
  
  // 6. Upgraded Planet Factory
  function createPlanet(size, texture, distance, orbitSpeed, rotationSpeed, ringData = null) {
    
    // --- ADDING THE ORBIT LINE ---
    const orbitGeo = new THREE.BufferGeometry();
    const orbitPoints = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      orbitPoints.push(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
    }
    orbitGeo.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
    const orbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    scene.add(orbitLine);

    // --- THE PLANET CONTAINER FIX ---
    const planetContainer = new THREE.Group();
    planetContainer.position.x = distance;

    // The Planet Sphere
    const geo = new THREE.SphereGeometry(size, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ 
      map: textureLoader.load(texture),
      roughness: 0.5, // Tweaked for realistic lighting
      metalness: 0.1  // Helps catch the sun's reflection
    });
    const mesh = new THREE.Mesh(geo, mat);
    planetContainer.add(mesh);

    // The Pivot Point (Sitting in the Sun)
    const pivot = new THREE.Group();
    pivot.add(planetContainer);
    scene.add(pivot);

    // Add Rings (For Saturn)
    // Add Rings (For Saturn)
    if (ringData) {
      const ringGeo = new THREE.RingGeometry(ringData.inner, ringData.outer, 128);
      
      const pos = ringGeo.attributes.position;
      const uv = ringGeo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const radius = Math.sqrt(x*x + y*y);
        const u = (radius - ringData.inner) / (ringData.outer - ringData.inner);
        uv.setXY(i, u, 0.5); 
      }
      uv.needsUpdate = true;

      // THE PRACTICAL, SOLID RING FIX
      const ringTexture = textureLoader.load(ringData.texture);
      
      const ringMat = new THREE.MeshBasicMaterial({
        map: ringTexture,           // Uses your image map
        side: THREE.DoubleSide,     // Visible from top and bottom
        transparent: true,          // Keeps the background gaps empty
        opacity: 1.0,               // Forces the ring to be fully solid, not ghostly
        color: 0xffffff             // Ensures the natural colors of your image show perfectly
      });
      
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + 0.3; // Beautifully tilt the rings
      planetContainer.add(ring); 
    }

    return { mesh, pivot, orbitSpeed, rotationSpeed };
  }

  // 7. BUILD THE FULL SOLAR SYSTEM
  planets.push(createPlanet(1.2, 'static/images/planets/2k_mercury.jpg', 25, 0.02, 0.01));
  planets.push(createPlanet(1.8, 'static/images/planets/2k_venus_surface.jpg', 35, 0.015, 0.01));
  planets.push(createPlanet(2, 'static/images/planets/2k_earth_daymap.jpg', 50, 0.01, 0.02));
  planets.push(createPlanet(1.5, 'static/images/planets/2k_mars.jpg', 65, 0.008, 0.02));
  
  planets.push(createPlanet(6, 'static/images/planets/2k_jupiter.jpg', 100, 0.002, 0.04));
  
  // Saturn with Rings
  planets.push(createPlanet(5, 'static/images/planets/2k_saturn.jpg', 140, 0.001, 0.038, {
    inner: 6.5, outer: 11, texture: 'static/images/planets/2k_saturn_ring_alpha.png'
  }));

  // Adding Uranus and Neptune!
  planets.push(createPlanet(3.5, 'static/images/planets/2k_uranus.jpg', 180, 0.0007, 0.03));
  planets.push(createPlanet(3.3, 'static/images/planets/2k_neptune.jpg', 220, 0.0005, 0.032));

  // 8. Handle Resizing
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 9. Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    // This now spins the entire sun group (core + glow) flawlessly!
    sun.rotation.y += 0.002;

    planets.forEach(p => {
      p.pivot.rotation.y += p.orbitSpeed;     // Orbits the sun
      p.mesh.rotation.y += p.rotationSpeed;   // Spins on its own axis
    });

    controls.update(); 
    renderer.render(scene, camera);
  }

  animate();
}

// ==========================================
// 6. INTERACTIVE UNIVERSE (Runs ONLY on galaxy3d.html)
// ==========================================
if (window.location.pathname.includes('galaxy3d.html')) {
  
  const container = document.getElementById('galaxy-container');
  container.innerHTML = ''; 
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 8000);
  camera.position.set(0, 400, 800); // Pulled back to see the sprawling cluster

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(new THREE.Color('#010103')); 
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 3500; // Increased to let you zoom way out!
  controls.minDistance = 5;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let targetFocus = new THREE.Vector3(0, 0, 0); 
  const hitBoxes = []; 
  const galaxySystems = []; 

  const canvas = document.createElement('canvas');
  canvas.width = 32; canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');    
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)'); 
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const starTexture = new THREE.CanvasTexture(canvas);

  // 4. THE ADVANCED MULTI-TYPE GALAXY GENERATOR
  function createGalaxy(name, type, x, y, z, coreColor, edgeColor, starCount, radius, branches, spin, tiltX, tiltZ) {
    
    const galaxyGroup = new THREE.Group();
    galaxyGroup.position.set(x, y, z);
    galaxyGroup.rotation.set(tiltX, 0, tiltZ);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const colorInside = new THREE.Color(coreColor);
    const colorOutside = new THREE.Color(edgeColor);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      let px, py, pz, currentRadius;

      // --- MATHEMATICS BASED ON GALAXY TYPE ---
      if (type === 'spiral') {
        currentRadius = Math.pow(Math.random(), 1.5) * radius;
        const spinAngle = (currentRadius / radius) * spin * Math.PI * 2;
        const branchAngle = ((i % branches) / branches) * Math.PI * 2;

        const randomX = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * 0.8 * currentRadius;
        const randomY = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * 0.15 * currentRadius; 
        const randomZ = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1) * 0.8 * currentRadius;

        px = Math.cos(branchAngle + spinAngle) * currentRadius + randomX;
        py = randomY;
        pz = Math.sin(branchAngle + spinAngle) * currentRadius + randomZ;

      } else if (type === 'elliptical') {
        // Massive, glowing egg shape (Spherical Math)
        currentRadius = Math.pow(Math.random(), 3) * radius; 
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        
        px = currentRadius * Math.sin(phi) * Math.cos(theta);
        py = currentRadius * Math.sin(phi) * Math.sin(theta) * 0.6; // Flattens it slightly into an egg
        pz = currentRadius * Math.cos(phi);

      } else if (type === 'ring') {
        // Detached outer ring with a tiny core
        if (Math.random() < 0.15) {
            currentRadius = Math.pow(Math.random(), 2) * radius * 0.2; // The core
        } else {
            currentRadius = radius * 0.75 + (Math.random() - 0.5) * radius * 0.25; // The detached ring
        }
        const angle = Math.random() * Math.PI * 2;
        px = Math.cos(angle) * currentRadius + (Math.random()-0.5) * radius * 0.1;
        py = (Math.random() - 0.5) * radius * 0.1;
        pz = Math.sin(angle) * currentRadius + (Math.random()-0.5) * radius * 0.1;

      } else if (type === 'irregular') {
        // Chaotic, clumpy dust clouds
        currentRadius = Math.random() * radius;
        const angle = Math.random() * Math.PI * 2;
        const clump = i % 3; // 3 main distinct clumps
        let offsetX = clump === 0 ? radius*0.3 : (clump===1 ? -radius*0.2 : 0);
        let offsetZ = clump === 0 ? 0 : (clump===1 ? radius*0.3 : -radius*0.2);
        
        px = Math.cos(angle) * currentRadius * Math.random() + offsetX;
        py = (Math.random() - 0.5) * radius * 0.3;
        pz = Math.sin(angle) * currentRadius * Math.random() + offsetZ;
      }

      positions[i3] = px;
      positions[i3 + 1] = py;
      positions[i3 + 2] = pz;

      // Color Blending works for all types!
      const mixedColor = colorInside.clone();
      mixedColor.lerp(colorOutside, currentRadius / radius);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.6,
      sizeAttenuation: true, 
      depthWrite: false,     
      blending: THREE.AdditiveBlending, 
      vertexColors: true,
      map: starTexture,
      transparent: true
    });

    const galaxyPoints = new THREE.Points(geometry, material);
    galaxyGroup.add(galaxyPoints);

    // Hitbox for Clicking
    const hitGeo = new THREE.SphereGeometry(radius * 0.9, 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false }); 
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.userData = { name: name, position: new THREE.Vector3(x, y, z) };
    
    galaxyGroup.add(hitMesh);
    hitBoxes.push(hitMesh);
    
    scene.add(galaxyGroup);
    galaxySystems.push(galaxyGroup);
  }

  // 5. BUILD THE 10-GALAXY UNIVERSE
  // (Name, Type, X, Y, Z, CoreColor, EdgeColor, StarCount, Radius, Branches, Spin, TiltX, TiltZ)
  
  // The Spirals
  createGalaxy('Milky Way', 'spiral', 0, 0, 0, '#ffddaa', '#0055ff', 50000, 140, 4, 1.4, 0, 0);
  createGalaxy('Andromeda', 'spiral', 400, 150, -300, '#ffccff', '#aa00ff', 60000, 180, 2, 2.0, 0.4, -0.2);
  createGalaxy('Whirlpool', 'spiral', -450, 200, 400, '#ffffff', '#00aaff', 40000, 110, 2, 3.0, 0.1, 0.6);
  createGalaxy('Sombrero', 'spiral', -200, -300, -500, '#ffcc00', '#ff2200', 45000, 100, 5, 0.8, -0.2, 0.1);

  // The Ellipticals (Ancient, huge, glowing eggs)
  createGalaxy('Messier 87', 'elliptical', 600, -200, 200, '#ffffee', '#ffaa44', 55000, 160, 0, 0, 0.2, 0.4);
  createGalaxy('Centaurus A', 'elliptical', -600, -100, -200, '#ffddcc', '#cc4422', 45000, 130, 0, 0, -0.4, 0.2);

  // The Ring Galaxies (Detached glowing hoops)
  createGalaxy('Hoags Object', 'ring', 250, 400, 500, '#ffddaa', '#0088ff', 35000, 120, 0, 0, 0.6, -0.3);
  createGalaxy('Cartwheel', 'ring', -700, 300, -100, '#ffcccc', '#ff0055', 35000, 100, 0, 0, 0.5, 0.5);

  // The Irregulars (Chaotic, clumpy dust)
  createGalaxy('Magellanic Cloud', 'irregular', 150, -350, 600, '#aaffff', '#00aa55', 30000, 90, 0, 0, 0, 0);
  createGalaxy('Cigar Galaxy', 'irregular', 800, 100, -400, '#ffffff', '#ff3300', 35000, 100, 0, 0, 0.8, 0);

  // 6. CLICK EVENT TO TRAVEL
  window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(hitBoxes); 
    
    if (intersects.length > 0) {
      const clickedData = intersects[0].object.userData;
      targetFocus.copy(clickedData.position); 
      document.getElementById('galaxy-title').innerText = clickedData.name;
    }
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 7. Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    // Spin each galaxy
    galaxySystems.forEach(galaxy => {
      galaxy.rotation.y += 0.0004;
    });

    // SMOOTH CAMERA PANNING
    controls.target.lerp(targetFocus, 0.04);

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

