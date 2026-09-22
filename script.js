/* =========================================================
   UNIVERSO CÓSMICO DE FLORES AMARILLAS PARA JUDITH 🌻✨
   Música: Río Roma - "Mi Persona Favorita"
   ========================================================= */

"use strict";

(function () {
    /* =====================================================
       1. VARIABLES GLOBALES Y ELEMENTOS DEL DOM
       ===================================================== */
    const canvas = document.getElementById("galaxyCanvas");
    const musicButton = document.getElementById("musicButton");
    const musicIcon = document.getElementById("musicIcon");
    const trackStatus = document.getElementById("trackStatus");
    const soundWaves = document.getElementById("soundWaves");
    const backgroundMusic = document.getElementById("backgroundMusic");
    const startPrompt = document.getElementById("startPrompt");
    const startBtn = document.getElementById("startBtn");
    const openLetterBtn = document.getElementById("openLetterBtn");
    const closeLetterBtn = document.getElementById("closeLetterBtn");
    const acceptLetterBtn = document.getElementById("acceptLetterBtn");
    const letterModal = document.getElementById("letterModal");
    const flowerToast = document.getElementById("flowerToast");
    const toastText = document.getElementById("toastText");
    const interactionHint = document.getElementById("interactionHint");

    let scene, camera, renderer, controls;
    let clock = new THREE.Clock();
    let clickableObjects = [];
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    let isPlaying = false;
    let userHasInteracted = false;
    let toastTimeout = null;

    // Frases flotantes inspiradas exactamente en la imagen y dedicadas a Judith
    const FLOATING_TEXTS = [
        { text: "Pura luz ✨ luz en mi vida", radius: 36, angle: 0.1, y: -8, scale: 1.2 },
        { text: "Solo para ti 💛", radius: 42, angle: 1.1, y: 12, scale: 1.1 },
        { text: "Judith 🌻", radius: 52, angle: 2.3, y: 6, scale: 1.3 },
        { text: "Mi persona favorita 💛", radius: 46, angle: 3.4, y: -10, scale: 1.25 },
        { text: "Feliz día 🌻", radius: 38, angle: 4.3, y: 8, scale: 1.1 },
        { text: "Sonríe siempre ✨", radius: 48, angle: 5.2, y: -6, scale: 1.15 },
        { text: "Alegras mis días ☀️", radius: 58, angle: 0.8, y: 14, scale: 1.1 },
        { text: "Un detalle amarillo 🌼", radius: 50, angle: 1.8, y: -12, scale: 1.1 },
        { text: "Tesoro tu compañía", radius: 62, angle: 2.9, y: 10, scale: 1.1 },
        { text: "Eres mi sol ☀️", radius: 44, angle: 3.9, y: 15, scale: 1.15 },
        { text: "Flores para ti 💛", radius: 54, angle: 4.8, y: -14, scale: 1.2 },
        { text: "Nunca olvidaré la fecha...", radius: 60, angle: 5.7, y: 5, scale: 1.2 }
    ];

    // Frases para los toasts al interactuar con las flores
    const FLOWER_MESSAGES = [
        "Judith, eres pura luz en mi vida ✨",
        "«Fue un día como cualquiera, nunca olvidaré la fecha...» 🎶",
        "Este universo de flores amarillas es solo para ti 🌻",
        "¡Sonríe siempre, Judith! Tu sonrisa ilumina todo 💛",
        "Eres mi persona favorita en el mundo entero ☀️",
        "Gracias por existir y coincidir conmigo en este universo 💫",
        "Un detalle amarillo para quien alegra todos mis días 🌻"
    ];

    /* =====================================================
       2. INICIALIZACIÓN DE THREE.JS (ESCENA 3D)
       ===================================================== */
    function initThree() {
        // Escena
        scene = new THREE.Scene();

        // Cámara con ajuste según orientación de pantalla
        const aspect = window.innerWidth / window.innerHeight;
        camera = new THREE.PerspectiveCamera(52, aspect, 0.1, 2000);
        updateCameraPosition();

        // Renderizador WebGL
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
        });
        renderer.setClearColor(0x000000, 1);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Controles orbitales interactivos
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5; // Rotación serena
        controls.maxDistance = 280;
        controls.minDistance = 30;
        controls.maxPolarAngle = Math.PI * 0.85;
        controls.minPolarAngle = Math.PI * 0.15;
        controls.target.set(0, 0, 0);

        // Iluminación
        const ambientLight = new THREE.AmbientLight(0xfff8d6, 1.3);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffe500, 4.0, 300);
        pointLight.position.set(0, 0, 0);
        scene.add(pointLight);

        // Construcción de la galaxia
        createCosmicStarfield();
        createCentralBlackHoleAndRing();
        loadFlowersAndPhrases();

        // Manejadores de eventos
        window.addEventListener("resize", onWindowResize);
        window.addEventListener("pointerdown", onPointerDown);

        // Ocultar hint de interacción después de 8 segundos
        setTimeout(() => {
            if (interactionHint) {
                interactionHint.style.opacity = "0";
                setTimeout(() => interactionHint.style.display = "none", 600);
            }
        }, 7500);
    }

    function updateCameraPosition() {
        const aspect = window.innerWidth / window.innerHeight;
        if (aspect < 1) {
            // Modo móvil vertical
            camera.position.set(0, 52, 145);
        } else {
            // Modo horizontal de escritorio
            camera.position.set(0, 44, 115);
        }
    }

    /* =====================================================
       3. CAMPO ESTELAR Y POLVO CÓSMICO (PARTÍCULAS SUAVES)
       ===================================================== */
    let starsPoints, dustPoints;
    let starTexture;

    function getStarTexture() {
        if (starTexture) return starTexture;
        const starCanvas = document.createElement("canvas");
        starCanvas.width = 64;
        starCanvas.height = 64;
        const ctx = starCanvas.getContext("2d");

        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.2, "rgba(255, 245, 170, 0.95)");
        grad.addColorStop(0.5, "rgba(255, 200, 0, 0.4)");
        grad.addColorStop(0.85, "rgba(255, 150, 0, 0.1)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);

        starTexture = new THREE.CanvasTexture(starCanvas);
        return starTexture;
    }

    function createCosmicStarfield() {
        const texture = getStarTexture();

        // 1. Estrellas de fondo
        const starCount = 3500;
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);

        const colWhite = new THREE.Color(0xffffff);
        const colGold = new THREE.Color(0xffe600);
        const colWarm = new THREE.Color(0xffb300);

        for (let i = 0; i < starCount; i++) {
            const radius = 50 + Math.random() * 400;
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() - 0.5) * Math.PI * 0.7;

            starPositions[i * 3] = radius * Math.cos(phi) * Math.cos(theta);
            starPositions[i * 3 + 1] = radius * Math.sin(phi) * 0.65;
            starPositions[i * 3 + 2] = radius * Math.cos(phi) * Math.sin(theta);

            const r = Math.random();
            const col = r > 0.6 ? colGold : (r > 0.35 ? colWarm : colWhite);
            starColors[i * 3] = col.r;
            starColors[i * 3 + 1] = col.g;
            starColors[i * 3 + 2] = col.b;
        }

        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
        starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

        const starMat = new THREE.PointsMaterial({
            size: 3.2,
            map: texture,
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        starsPoints = new THREE.Points(starGeo, starMat);
        scene.add(starsPoints);

        // 2. Polvo estelar orbital dorado
        const dustCount = 1400;
        const dustPositions = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount; i++) {
            const r = 24 + Math.random() * 115;
            const a = Math.random() * Math.PI * 2;
            dustPositions[i * 3] = r * Math.cos(a);
            dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
            dustPositions[i * 3 + 2] = r * Math.sin(a);
        }

        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));

        const dustMat = new THREE.PointsMaterial({
            size: 2.4,
            map: texture,
            color: 0xffea00,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        dustPoints = new THREE.Points(dustGeo, dustMat);
        dustPoints.rotation.x = 0.42;
        scene.add(dustPoints);
    }

    /* =====================================================
       4. ANILLO CELESTIAL Y AGUJERO NEGRO CENTRAL
          (EXACTO A LA IMAGEN: CÍRCULO NEGRO + ANILLO NEÓN)
       ===================================================== */
    let ringGroup;

    function createCentralBlackHoleAndRing() {
        ringGroup = new THREE.Group();
        // Inclinación clásica del anillo (como en la captura)
        ringGroup.rotation.x = 0.46;
        ringGroup.rotation.z = -0.06;

        // 1. Textura concéntrica de anillo de acreción dorado/blanco puro
        const ringCanvas = document.createElement("canvas");
        ringCanvas.width = 1024;
        ringCanvas.height = 1024;
        const ctx = ringCanvas.getContext("2d");

        const cx = 512;
        const cy = 512;
        const outerR = 500;
        const innerR = 190;

        // Gradiente radial concéntrico perfecto
        const grad = ctx.createRadialGradient(cx, cy, innerR, cx, cy, outerR);
        grad.addColorStop(0.00, "rgba(0, 0, 0, 0)");
        grad.addColorStop(0.04, "rgba(255, 255, 255, 1.0)");    // Borde interior blanco brillante
        grad.addColorStop(0.18, "rgba(255, 245, 100, 1.0)");   // Amarillo neón intenso
        grad.addColorStop(0.38, "rgba(255, 215, 0, 0.95)");    // Oro vivo
        grad.addColorStop(0.65, "rgba(255, 160, 0, 0.65)");    // Ámbar
        grad.addColorStop(0.88, "rgba(255, 120, 0, 0.2)");     // Difuminado exterior
        grad.addColorStop(1.00, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.fill();

        const ringTex = new THREE.CanvasTexture(ringCanvas);

        // Plano del disco de acreción
        const diskGeo = new THREE.PlaneGeometry(86, 86, 1, 1);
        const diskMat = new THREE.MeshBasicMaterial({
            map: ringTex,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const diskMesh = new THREE.Mesh(diskGeo, diskMat);
        diskMesh.rotation.x = Math.PI / 2;
        ringGroup.add(diskMesh);

        // Halo exterior expandido adicional
        const haloGeo = new THREE.PlaneGeometry(120, 120, 1, 1);
        const haloMat = new THREE.MeshBasicMaterial({
            map: ringTex,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        haloMesh.rotation.x = Math.PI / 2;
        ringGroup.add(haloMesh);

        // 2. Esfera central oscura (agujero negro)
        const sphereGeo = new THREE.SphereGeometry(14.8, 48, 48);
        const sphereMat = new THREE.MeshBasicMaterial({
            color: 0x000000
        });
        const centerSphere = new THREE.Mesh(sphereGeo, sphereMat);
        ringGroup.add(centerSphere);

        scene.add(ringGroup);
    }

    /* =====================================================
       5. PROCESAMIENTO DE IMÁGENES A TEXTURAS TRANSPARENTES
       ===================================================== */
    function loadTransparentTexture(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = url;
            img.onload = () => {
                const offCanvas = document.createElement("canvas");
                offCanvas.width = img.width;
                offCanvas.height = img.height;
                const ctx = offCanvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                const imgData = ctx.getImageData(0, 0, img.width, img.height);
                const data = imgData.data;

                // Suavizar y remover fondo negro puro
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const brightness = Math.max(r, g, b);

                    if (brightness < 22) {
                        data[i + 3] = 0;
                    } else if (brightness < 70) {
                        data[i + 3] = Math.floor(((brightness - 22) / 48) * 255);
                    }
                }

                ctx.putImageData(imgData, 0, 0);
                const texture = new THREE.CanvasTexture(offCanvas);
                texture.generateMipmaps = true;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                resolve(texture);
            };
            img.onerror = () => {
                resolve(null);
            };
        });
    }

    /* =====================================================
       6. TEXTURAS DE TEXTO NEÓN 3D
       ===================================================== */
    function createTextSprite(text, fontSize = 42) {
        const tCanvas = document.createElement("canvas");
        tCanvas.width = 680;
        tCanvas.height = 140;
        const ctx = tCanvas.getContext("2d");

        ctx.font = `bold ${fontSize}px 'Caveat', 'Playfair Display', cursive, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Brillo neón dorado/amarillo
        ctx.shadowColor = "#ffe600";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#fffdf0";
        ctx.fillText(text, 340, 70);

        ctx.shadowBlur = 32;
        ctx.shadowColor = "#ff9800";
        ctx.fillText(text, 340, 70);

        ctx.shadowBlur = 8;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, 340, 70);

        const tex = new THREE.CanvasTexture(tCanvas);
        const mat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(32, 6.6, 1);
        return sprite;
    }

    /* =====================================================
       7. CARGAR GIRASOLES, RAMOS Y FRASES EN 3D
       ===================================================== */
    let animatedObjects = [];

    async function loadFlowersAndPhrases() {
        const sunflowerTex = await loadTransparentTexture("assets/sunflower.jpg");
        const bouquetTex = await loadTransparentTexture("assets/bouquet.jpg");

        const sfMaterial = sunflowerTex ? new THREE.SpriteMaterial({
            map: sunflowerTex,
            transparent: true,
            blending: THREE.NormalBlending,
            depthWrite: false
        }) : null;

        const bqMaterial = bouquetTex ? new THREE.SpriteMaterial({
            map: bouquetTex,
            transparent: true,
            blending: THREE.NormalBlending,
            depthWrite: false
        }) : null;

        // 1. Girasoles en órbita alrededor del anillo cósmico
        const sunflowerConfigs = [
            // Primer plano (foreground) grande como en la captura
            { radius: 26, angle: 0.2, y: -16, scale: 18 },
            { radius: 30, angle: 5.5, y: -18, scale: 19 },
            { radius: 35, angle: 4.2, y: -12, scale: 15 },
            // Plano medio alrededor del disco
            { radius: 36, angle: 1.2, y: 8, scale: 13 },
            { radius: 38, angle: 2.1, y: 14, scale: 14 },
            { radius: 42, angle: 3.1, y: -6, scale: 12 },
            { radius: 45, angle: 4.8, y: 10, scale: 13 },
            { radius: 50, angle: 0.9, y: -8, scale: 12 },
            // Fondo lejano
            { radius: 55, angle: 2.8, y: 18, scale: 9 },
            { radius: 60, angle: 3.7, y: -14, scale: 10 },
            { radius: 65, angle: 5.0, y: 12, scale: 9 },
            { radius: 70, angle: 1.6, y: -16, scale: 8.5 },
            { radius: 75, angle: 2.4, y: 6, scale: 8 },
            { radius: 80, angle: 4.0, y: 14, scale: 8 }
        ];

        sunflowerConfigs.forEach((cfg) => {
            if (!sfMaterial) return;
            const sprite = new THREE.Sprite(sfMaterial.clone());
            sprite.position.x = cfg.radius * Math.cos(cfg.angle);
            sprite.position.y = cfg.y;
            sprite.position.z = cfg.radius * Math.sin(cfg.angle);
            sprite.scale.set(cfg.scale, cfg.scale, 1);

            sprite.userData = {
                type: "sunflower",
                baseY: cfg.y,
                floatSpeed: 0.8 + Math.random() * 0.8,
                floatOffset: Math.random() * Math.PI * 2,
                orbitRadius: cfg.radius,
                orbitAngle: cfg.angle,
                orbitSpeed: 0.015 + Math.random() * 0.02
            };

            scene.add(sprite);
            animatedObjects.push(sprite);
            clickableObjects.push(sprite);
        });

        // 2. Ramos de flores amarillas
        const bouquetConfigs = [
            // Ramo en primer plano derecho inferior (como en la captura)
            { radius: 32, angle: 5.8, y: -18, scale: 22 },
            // Ramo en primer plano izquierdo inferior
            { radius: 36, angle: 3.8, y: -16, scale: 20 },
            // Ramos en órbita
            { radius: 48, angle: 1.4, y: 12, scale: 15 },
            { radius: 58, angle: 2.6, y: -10, scale: 14 },
            { radius: 68, angle: 4.6, y: 16, scale: 13 },
            { radius: 78, angle: 0.4, y: 8, scale: 12 }
        ];

        bouquetConfigs.forEach((cfg) => {
            if (!bqMaterial) return;
            const sprite = new THREE.Sprite(bqMaterial.clone());
            sprite.position.x = cfg.radius * Math.cos(cfg.angle);
            sprite.position.y = cfg.y;
            sprite.position.z = cfg.radius * Math.sin(cfg.angle);
            sprite.scale.set(cfg.scale, cfg.scale, 1);

            sprite.userData = {
                type: "bouquet",
                baseY: cfg.y,
                floatSpeed: 0.7 + Math.random() * 0.7,
                floatOffset: Math.random() * Math.PI * 2,
                orbitRadius: cfg.radius,
                orbitAngle: cfg.angle,
                orbitSpeed: 0.012 + Math.random() * 0.015
            };

            scene.add(sprite);
            animatedObjects.push(sprite);
            clickableObjects.push(sprite);
        });

        // 3. Frases luminosas flotantes (exactas a la imagen)
        FLOATING_TEXTS.forEach((item) => {
            const textSprite = createTextSprite(item.text, 44);
            textSprite.position.x = item.radius * Math.cos(item.angle);
            textSprite.position.y = item.y;
            textSprite.position.z = item.radius * Math.sin(item.angle);

            const s = (item.scale || 1.0) * 28;
            textSprite.scale.set(s, s * 0.21, 1);

            textSprite.userData = {
                type: "text",
                baseY: item.y,
                floatSpeed: 0.9 + Math.random() * 0.6,
                floatOffset: Math.random() * Math.PI * 2,
                orbitRadius: item.radius,
                orbitAngle: item.angle,
                orbitSpeed: 0.014 + Math.random() * 0.012
            };

            scene.add(textSprite);
            animatedObjects.push(textSprite);
        });
    }

    /* =====================================================
       8. SISTEMA DE AUDIO (RÍO ROMA - MI PERSONA FAVORITA)
       ===================================================== */
    let ytPlayer = null;
    let isUsingYouTube = false;

    function loadYouTubeAPI() {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = function () {
        ytPlayer = new YT.Player("ytPlayer", {
            height: "1",
            width: "1",
            videoId: "AJKzOgv5YNU", // Río Roma - Mi Persona Favorita Oficial
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                loop: 1,
                playlist: "AJKzOgv5YNU",
                modestbranding: 1
            },
            events: {
                onStateChange: (event) => {
                    if (event.data === YT.PlayerState.PLAYING) {
                        setMusicPlayingState(true);
                    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                        setMusicPlayingState(false);
                    }
                }
            }
        });
    };

    function setMusicPlayingState(playing) {
        isPlaying = playing;
        if (playing) {
            musicIcon.textContent = "❚❚";
            musicButton.classList.add("playing");
            soundWaves.classList.add("active");
            trackStatus.textContent = "Reproduciendo • Río Roma";
        } else {
            musicIcon.textContent = "▶";
            musicButton.classList.remove("playing");
            soundWaves.classList.remove("active");
            trackStatus.textContent = "Pausado • Toca para escuchar";
        }
    }

    async function playMusic() {
        userHasInteracted = true;
        if (startPrompt) {
            startPrompt.classList.add("hidden");
        }

        // Intentar primero con el archivo local
        try {
            backgroundMusic.volume = 0.95;
            await backgroundMusic.play();
            setMusicPlayingState(true);
            isUsingYouTube = false;
            return;
        } catch (localError) {
            console.info("Intentando respaldo oficial de Río Roma en YouTube...");
        }

        // Si el archivo local no responde, reproducir con YouTube
        if (ytPlayer && typeof ytPlayer.playVideo === "function") {
            try {
                ytPlayer.playVideo();
                isUsingYouTube = true;
                setMusicPlayingState(true);
            } catch (ytError) {
                console.warn("YouTube player:", ytError);
            }
        }
    }

    function pauseMusic() {
        if (!isUsingYouTube && backgroundMusic) {
            backgroundMusic.pause();
        } else if (ytPlayer && typeof ytPlayer.pauseVideo === "function") {
            ytPlayer.pauseVideo();
        }
        setMusicPlayingState(false);
    }

    function toggleMusic() {
        if (isPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    }

    /* =====================================================
       9. INTERACCIONES Y DETALLES PARA JUDITH
       ===================================================== */
    function showToast(message) {
        if (toastTimeout) clearTimeout(toastTimeout);
        toastText.textContent = message;
        flowerToast.classList.add("show");
        flowerToast.setAttribute("aria-hidden", "false");

        toastTimeout = setTimeout(() => {
            flowerToast.classList.remove("show");
            flowerToast.setAttribute("aria-hidden", "true");
        }, 4000);
    }

    function onPointerDown(event) {
        if (event.target.closest(".bottom-card") || 
            event.target.closest(".modal-overlay") || 
            event.target.closest(".start-prompt") || 
            event.target.closest(".header-neon")) {
            return;
        }

        if (!userHasInteracted) {
            playMusic();
        }

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickableObjects);

        if (intersects.length > 0) {
            const hit = intersects[0].object;

            const initialScale = hit.scale.x;
            hit.scale.set(initialScale * 1.25, initialScale * 1.25, 1);
            setTimeout(() => {
                hit.scale.set(initialScale, initialScale, 1);
            }, 300);

            const randomMsg = FLOWER_MESSAGES[Math.floor(Math.random() * FLOWER_MESSAGES.length)];
            showToast(randomMsg);
        }
    }

    function openLetter() {
        letterModal.classList.add("active");
        letterModal.setAttribute("aria-hidden", "false");
        if (!isPlaying) {
            playMusic();
        }
    }

    function closeLetter() {
        letterModal.classList.remove("active");
        letterModal.setAttribute("aria-hidden", "true");
    }

    /* =====================================================
       10. CICLO DE ANIMACIÓN (60 FPS)
       ===================================================== */
    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        controls.update();

        // Rotar suavemente el campo estelar
        if (starsPoints) {
            starsPoints.rotation.y = elapsedTime * 0.008;
        }
        if (dustPoints) {
            dustPoints.rotation.z = elapsedTime * 0.025;
        }

        // Rotar el anillo celestial
        if (ringGroup) {
            ringGroup.rotation.y = elapsedTime * 0.045;
        }

        // Animar flores y frases en órbita suave
        animatedObjects.forEach((obj) => {
            const u = obj.userData;
            if (u) {
                // Flotación suave vertical
                obj.position.y = u.baseY + Math.sin(elapsedTime * u.floatSpeed + u.floatOffset) * 2.2;

                // Órbita circular
                if (u.orbitRadius) {
                    const currentAngle = u.orbitAngle + elapsedTime * u.orbitSpeed;
                    obj.position.x = u.orbitRadius * Math.cos(currentAngle);
                    obj.position.z = u.orbitRadius * Math.sin(currentAngle);
                }
            }
        });

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        updateCameraPosition();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /* =====================================================
       11. ENLACE DE EVENTOS
       ===================================================== */
    function bindEvents() {
        musicButton.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleMusic();
        });

        startBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            playMusic();
        });

        openLetterBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            openLetter();
        });

        closeLetterBtn.addEventListener("click", closeLetter);
        acceptLetterBtn.addEventListener("click", () => {
            closeLetter();
            showToast("¡Judith, que tengas un día tan brillante como estas flores! 🌻💛");
        });

        letterModal.addEventListener("click", (e) => {
            if (e.target === letterModal) {
                closeLetter();
            }
        });

        loadYouTubeAPI();
    }

    document.addEventListener("DOMContentLoaded", () => {
        initThree();
        bindEvents();
        animate();

        // Intento de reproducción automática gentil
        setTimeout(() => {
            backgroundMusic.play().then(() => {
                setMusicPlayingState(true);
                if (startPrompt) startPrompt.classList.add("hidden");
            }).catch(() => {
                // Si el navegador bloquea autoplay, se mantiene el botón para iniciar
            });
        }, 800);
    });

})();