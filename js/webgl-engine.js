/* ============================================================
   LOVELLE â€” WebGL Engine
   Three.js + Custom Shaders for all visual effects
   ============================================================ */

class WebGLEngine {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
            premultipliedAlpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.clock = new THREE.Clock();
        this.mouse = { x: 0, y: 0 };
        this.particles = [];
        this.isRunning = true;

        this._bindEvents();
        this._createBackgroundMesh();
        this._animate();
    }

    _bindEvents() {
        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    _createBackgroundMesh() {
        // Subtle animated noise background
        const geo = new THREE.PlaneGeometry(2, 2);
        const mat = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uScroll: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform float uTime;
                uniform vec2 uMouse;
                uniform float uScroll;
                varying vec2 vUv;

                // Simplex-like noise
                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
                }

                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    float a = hash(i);
                    float b = hash(i + vec2(1.0, 0.0));
                    float c = hash(i + vec2(0.0, 1.0));
                    float d = hash(i + vec2(1.0, 1.0));
                    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
                }

                float fbm(vec2 p) {
                    float v = 0.0;
                    float a = 0.5;
                    for (int i = 0; i < 4; i++) {
                        v += a * noise(p);
                        p *= 2.0;
                        a *= 0.5;
                    }
                    return v;
                }

                void main() {
                    vec2 uv = vUv;
                    float t = uTime * 0.1;

                    // Very subtle flowing noise texture
                    float n = fbm(uv * 3.0 + t);
                    n = fbm(uv * 2.0 + n + t * 0.5);

                    // Mouse influence
                    float mouseDist = distance(uv, uMouse * 0.5 + 0.5);
                    float mouseInfluence = smoothstep(0.4, 0.0, mouseDist) * 0.02;

                    float alpha = n * 0.03 + mouseInfluence;
                    vec3 col = vec3(0.0);

                    gl_FragColor = vec4(col, alpha);
                }
            `
        });
        this.bgMesh = new THREE.Mesh(geo, mat);
        this.scene.add(this.bgMesh);
    }

    updateScroll(val) {
        if (this.bgMesh) {
            this.bgMesh.material.uniforms.uScroll.value = val;
        }
    }

    _animate() {
        if (!this.isRunning) return;
        requestAnimationFrame(() => this._animate());

        const elapsed = this.clock.getElapsedTime();
        if (this.bgMesh) {
            this.bgMesh.material.uniforms.uTime.value = elapsed;
            this.bgMesh.material.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
        }

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        this.isRunning = false;
        this.renderer.dispose();
    }
}


/* ============================================================
   Comb Wipe Page Transition (2D Canvas Shader-like)
   ============================================================ */
class CombWipeTransition {
    constructor() {
        this.canvas = document.getElementById('transition-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isAnimating = false;
        this._resize();
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        this.canvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 2);
        this.canvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2);
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    }

    play(onMidpoint) {
        return new Promise((resolve) => {
            if (this.isAnimating) return resolve();
            this.isAnimating = true;

            const ctx = this.ctx;
            const dpr = Math.min(window.devicePixelRatio, 2);
            const w = window.innerWidth * dpr;
            const h = window.innerHeight * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.canvas.style.opacity = '1';

            const teethCount = 40;
            const toothHeight = h / teethCount;
            const duration = 1.2;
            const startTime = performance.now();
            let midpointFired = false;

            const animate = (now) => {
                const elapsed = (now - startTime) / 1000;
                const rawProgress = Math.min(elapsed / duration, 1);
                // Ease in-out
                const progress = rawProgress < 0.5
                    ? 4 * rawProgress * rawProgress * rawProgress
                    : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

                ctx.clearRect(0, 0, w, h);

                // Draw comb teeth sweeping across
                for (let i = 0; i < teethCount; i++) {
                    const y = i * toothHeight;
                    const offset = Math.sin(i * 0.3) * 0.05;
                    const toothProgress = Math.max(0, Math.min(1, (progress - offset) / 0.9));
                    const toothWidth = w * toothProgress;

                    // Tooth body (dark comb)
                    ctx.fillStyle = i % 2 === 0 ? '#111' : '#1a1a1a';
                    ctx.fillRect(0, y, toothWidth, toothHeight);

                    // Fine tooth edge highlight
                    if (toothWidth > 0) {
                        const grad = ctx.createLinearGradient(toothWidth - 40 * dpr, 0, toothWidth, 0);
                        grad.addColorStop(0, 'rgba(60,60,60,0)');
                        grad.addColorStop(0.7, 'rgba(80,80,80,0.5)');
                        grad.addColorStop(1, 'rgba(40,40,40,0.8)');
                        ctx.fillStyle = grad;
                        ctx.fillRect(toothWidth - 40 * dpr, y, 40 * dpr, toothHeight);

                        // Metallic comb tooth tip
                        ctx.fillStyle = 'rgba(100,100,100,0.4)';
                        ctx.fillRect(toothWidth - 2 * dpr, y, 2 * dpr, toothHeight);
                    }

                    // Separator line between teeth
                    ctx.fillStyle = 'rgba(0,0,0,0.8)';
                    ctx.fillRect(0, y + toothHeight - dpr * 0.5, toothWidth, dpr * 0.5);
                }

                // Fire midpoint callback
                if (progress > 0.5 && !midpointFired) {
                    midpointFired = true;
                    if (onMidpoint) onMidpoint();
                }

                if (rawProgress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Reverse wipe (comb moves off screen)
                    this._reverseWipe(ctx, w, h, teethCount, toothHeight, dpr, resolve);
                }
            };

            requestAnimationFrame(animate);
        });
    }

    _reverseWipe(ctx, w, h, teethCount, toothHeight, dpr, resolve) {
        const duration = 0.8;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = (now - startTime) / 1000;
            const rawProgress = Math.min(elapsed / duration, 1);
            const progress = rawProgress < 0.5
                ? 4 * rawProgress * rawProgress * rawProgress
                : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

            ctx.clearRect(0, 0, w, h);

            for (let i = 0; i < teethCount; i++) {
                const y = i * toothHeight;
                const offset = Math.sin(i * 0.3) * 0.05;
                const toothProgress = Math.max(0, Math.min(1, (progress - offset) / 0.9));
                const startX = w * toothProgress;

                ctx.fillStyle = i % 2 === 0 ? '#111' : '#1a1a1a';
                ctx.fillRect(startX, y, w - startX, toothHeight);

                // Leading edge
                if (startX > 0 && startX < w) {
                    ctx.fillStyle = 'rgba(100,100,100,0.4)';
                    ctx.fillRect(startX, y, 2 * dpr, toothHeight);
                }

                ctx.fillStyle = 'rgba(0,0,0,0.8)';
                ctx.fillRect(startX, y + toothHeight - dpr * 0.5, w - startX, dpr * 0.5);
            }

            if (rawProgress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.canvas.style.opacity = '0';
                this.isAnimating = false;
                resolve();
            }
        };

        requestAnimationFrame(animate);
    }
}


/* ============================================================
   Social Button Ripple Effect (2D Canvas)
   ============================================================ */
class SocialRippleEffect {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ripples = [];
        this._resize();

        const btn = canvas.parentElement;
        btn.addEventListener('mouseenter', () => this._addRipple());
        window.addEventListener('resize', () => this._resize());
        this._animate();
    }

    _resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio, 2);
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.w = rect.width;
        this.h = rect.height;
    }

    _addRipple() {
        const count = 15;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = 0.5 + Math.random() * 1;
            this.ripples.push({
                x: this.w / 2,
                y: this.h / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                size: 1 + Math.random() * 2,
                decay: 0.015 + Math.random() * 0.01
            });
        }
    }

    _animate() {
        requestAnimationFrame(() => this._animate());
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.w, this.h);

        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.x += r.vx;
            r.y += r.vy;
            r.life -= r.decay;

            if (r.life <= 0) {
                this.ripples.splice(i, 1);
                continue;
            }

            ctx.fillStyle = `rgba(150, 150, 150, ${r.life * 0.6})`;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.size * r.life, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}


/* ============================================================
   Accordion Particle Effect (2D Canvas)
   ============================================================ */
class AccordionParticleEffect {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.isActive = false;
        this._animate();
    }

    trigger() {
        this._resize();
        this.isActive = true;

        const count = 30;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.w,
                y: 0,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 1.5 + 0.5,
                life: 1,
                size: 0.5 + Math.random() * 2,
                decay: 0.008 + Math.random() * 0.006
            });
        }
    }

    _resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio, 2);
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.w = rect.width;
        this.h = rect.height;
    }

    _animate() {
        requestAnimationFrame(() => this._animate());
        if (!this.isActive || this.particles.length === 0) return;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.w, this.h);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            ctx.fillStyle = `rgba(100, 100, 100, ${p.life * 0.4})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.particles.length === 0) {
            this.isActive = false;
        }
    }
}
