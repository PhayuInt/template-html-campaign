// --- GLOBAL FUNCTIONS (เรียกใช้งานจาก HTML ได้โดยตรง) ---

// ฟังก์ชันสำหรับเลื่อนหน้าจอไปยัง Section ที่ต้องการ
window.scrollToSection = function (id) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
};

// ตัวแปรสำหรับ Phud Hong Slideshow
let phCurrent = 0;
let phSlides, phDots;

// ฟังก์ชันเปลี่ยนรูป Slideshow
window.phGoTo = function (n) {
    if (!phSlides || !phDots || phSlides.length === 0) return;

    // ลบ class active ออกจากตัวเก่า
    phSlides[phCurrent].classList.remove('active');
    phDots[phCurrent].classList.remove('active');

    // อัปเดต index ปัจจุบัน
    phCurrent = n;

    // เพิ่ม class active ให้ตัวใหม่
    phSlides[phCurrent].classList.add('active');
    phDots[phCurrent].classList.add('active');
};


// --- DOM CONTENT LOADED (ทำงานเมื่อโหลดหน้าเว็บเสร็จ) ---
document.addEventListener('DOMContentLoaded', function () {

    // ── 1. SETUP PHUD HONG SLIDESHOW ──────────────────────────
    phSlides = document.querySelectorAll('#phSlideshow .ph-slide');
    phDots = document.querySelectorAll('.ph-dot');

    if (phSlides.length > 0) {
        setInterval(() => {
            let nextIndex = (phCurrent + 1) % phSlides.length;
            phGoTo(nextIndex);
        }, 4000);
    }

    // ── 2. SETUP ORIGINAL SLIDER (sl-card) ─────────────────────
    // (คงไว้ตามโค้ดเดิมของคุณเพื่อไม่ให้กระทบส่วนอื่น)
    const track = document.getElementById('slTrack');
    const prevBtn = document.getElementById('slPrev');
    const nextBtn = document.getElementById('slNext');
    let slIndex = 0;

    // หมายเหตุ: ส่วนนี้จะทำงานเฉพาะถ้ามีคลาส .sl-card อยู่ใน HTML
    if (track && document.querySelector('.sl-card')) {
        function updateCarousel(hasAnimation = true) {
            const card = document.querySelector('.sl-card');
            if (!card) return;
            const cardWidth = card.offsetWidth + 15;
            const viewport = document.querySelector('.sl-viewport');
            const containerWidth = viewport ? viewport.offsetWidth : window.innerWidth;
            const offset = (containerWidth - (cardWidth * 3)) / 2;

            track.style.transition = hasAnimation ? 'transform 0.5s ease-in-out' : 'none';
            track.style.transform = `translateX(${-slIndex * cardWidth + offset}px)`;
        }
        if (nextBtn) nextBtn.addEventListener('click', () => { slIndex++; updateCarousel(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { if (slIndex > 0) slIndex--; updateCarousel(); });
        window.addEventListener('resize', () => updateCarousel(false));
    }

    // ── 3. SETUP TESTIMONIAL SLIDER (tm-item) ──────────────────
    // ส่วนใหม่: จัดการรูปตรงกลางชัด (Center) และรูปข้างๆ เบลอ
    // ── TESTIMONIAL SLIDER (tm-item) ──────────────────
    const tmTrack = document.getElementById('tmTrack');
    const tmPrev = document.getElementById('tmPrev');
    const tmNext = document.getElementById('tmNext');
    const tmItems = document.querySelectorAll('.tm-item');

    // ตั้งค่าเริ่มต้นที่ Index 1 (รูปที่สอง)
    let tmCurrentIndex = 1;

    if (tmTrack && tmItems.length > 0) {
        function updateTestimonialSlider() {
            const itemWidth = tmItems[0].offsetWidth;
            const totalItemWidth = itemWidth + 30; // 30 คือ margin ซ้าย-ขวา (15+15)

            // คำนวณหาตำแหน่ง Viewport
            const viewport = tmTrack.closest('.tm-viewport');
            const viewportWidth = viewport.offsetWidth;

            // คำนวณจุดกึ่งกลาง
            const centerOffset = (viewportWidth / 2) - (totalItemWidth / 2);
            const translateValue = - (tmCurrentIndex * totalItemWidth) + centerOffset;

            tmTrack.style.transform = `translateX(${translateValue}px)`;

            // จัดการ Class .center
            tmItems.forEach((item, index) => {
                if (index === tmCurrentIndex) {
                    item.classList.add('center');
                } else {
                    item.classList.remove('center');
                }
            });
        }

        // Event Listeners
        if (tmNext) {
            tmNext.addEventListener('click', () => {
                tmCurrentIndex = (tmCurrentIndex + 1) % tmItems.length;
                updateTestimonialSlider();
            });
        }

        if (tmPrev) {
            tmPrev.addEventListener('click', () => {
                tmCurrentIndex = (tmCurrentIndex - 1 + tmItems.length) % tmItems.length;
                updateTestimonialSlider();
            });
        }

        // คลิกที่รูปเพื่อ Focus
        tmItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                tmCurrentIndex = index;
                updateTestimonialSlider();
            });
        });

        window.addEventListener('resize', updateTestimonialSlider);

        // รันทันทีเพื่อให้ Focus รูปที่ 2 ตั้งแต่โหลดหน้า
        updateTestimonialSlider();
    }

    // ── 4. SLOT MACHINE (bp-) ──────────────────────────────────
    // เพิ่มใหม่ — ไม่แก้โค้ดข้างบน

    const BP_ITEM_HEIGHT = 120;
    const BP_SPIN_INTERVAL = 60;

    const bpReels = [
        { inner: document.getElementById('bp-reel-inner1'), offset: 0, timer: null, stopping: false },
        { inner: document.getElementById('bp-reel-inner2'), offset: 0, timer: null, stopping: false },
        { inner: document.getElementById('bp-reel-inner3'), offset: 0, timer: null, stopping: false },
    ].filter(r => r.inner !== null); // guard: ถ้าไม่มี element ก็ข้ามไป

    const bpSpinBtn = document.getElementById('bp-spinBtn');
    const bpStopBtn = document.getElementById('bp-stopBtn');
    const bpResultEl = document.getElementById('bp-resultMsg');

    if (bpReels.length === 0 || !bpSpinBtn || !bpStopBtn) return; // ไม่มี slot machine ในหน้านี้

    let bpIsSpinning = false;

    // helpers
    function bpGetItemCount(reel) {
        return reel.inner.querySelectorAll('.bp-reel-item').length;
    }
    function bpSetOffset(reel, offset) {
        reel.offset = offset;
        reel.inner.style.transform = `translateY(-${offset}px)`;
    }
    function bpWrapOffset(reel) {
        const total = bpGetItemCount(reel) * BP_ITEM_HEIGHT;
        if (reel.offset >= total) {
            reel.offset -= total;
            reel.inner.style.transition = 'none';
            reel.inner.style.transform = `translateY(-${reel.offset}px)`;
        }
    }
    function bpStartReel(reel) {
        reel.stopping = false;
        reel.timer = setInterval(() => {
            reel.inner.style.transition = `transform ${BP_SPIN_INTERVAL * 0.8}ms linear`;
            bpSetOffset(reel, reel.offset + BP_ITEM_HEIGHT);
            bpWrapOffset(reel);
            if (reel.stopping) bpSnapReel(reel);
        }, BP_SPIN_INTERVAL);
    }
    function bpSnapReel(reel) {
        clearInterval(reel.timer);
        reel.timer = null;
        const snapped = Math.round(reel.offset / BP_ITEM_HEIGHT) * BP_ITEM_HEIGHT;
        reel.inner.style.transition = 'transform 200ms ease-out';
        bpSetOffset(reel, snapped);
        bpWrapOffset(reel);
        bpCheckAllStopped();
    }
    function bpStopAllReels() {
        [0, 350, 700].forEach((delay, i) => {
            setTimeout(() => { if (bpReels[i]) bpReels[i].stopping = true; }, delay);
        });
    }
    function bpCheckAllStopped() {
        if (bpReels.every(r => r.timer === null)) {
            bpIsSpinning = false;
            bpSpinBtn.disabled = false;
            bpStopBtn.disabled = true;
            bpEvaluate();
        }
    }
    function bpGetSymbol(reel) {
        const count = bpGetItemCount(reel);
        const idx = Math.round(reel.offset / BP_ITEM_HEIGHT) % count;
        const imgs = reel.inner.querySelectorAll('.bp-reel-item img');
        return imgs[idx] ? imgs[idx].getAttribute('src') : '';
    }
    function bpEvaluate() {
        const s = bpReels.map(bpGetSymbol);
        if (s[0] === s[1] && s[1] === s[2]) {
            bpResultEl.textContent = '🎉 CONGRATULATIONS! You WIN!';
            bpResultEl.style.color = '#e8b000';
        } else {
            bpResultEl.textContent = 'Try again – better luck next spin!';
            bpResultEl.style.color = '#1a5fb4';
        }
    }

    // spin / stop button handlers
    bpSpinBtn.addEventListener('click', () => {
        if (bpIsSpinning) return;
        bpIsSpinning = true;
        bpResultEl.textContent = '';
        bpSpinBtn.disabled = true;
        bpStopBtn.disabled = false;
        bpReels.forEach(reel => {
            if (reel.timer) { clearInterval(reel.timer); reel.timer = null; }
            bpStartReel(reel);
        });
    });

    bpStopBtn.addEventListener('click', () => {
        if (!bpIsSpinning) return;
        bpStopBtn.disabled = true;
        bpStopAllReels();
    });

    // init: random start position
    bpStopBtn.disabled = true;
    bpReels.forEach(reel => {
        const rand = Math.floor(Math.random() * bpGetItemCount(reel)) * BP_ITEM_HEIGHT;
        reel.inner.style.transition = 'none';
        bpSetOffset(reel, rand);
    });

    // ── 5. REGISTER & SPIN-LIMIT ────────────────────────────────
    // เพิ่มใหม่ — ไม่แก้โค้ดข้างบน

    (function () {
        const MAX_SPINS = 3;
        const LS_EMAIL_KEY = 'bp_registered_email';
        const LS_SPINS_KEY = 'bp_spins_used';

        // โหลด email และจำนวนสปินจาก localStorage
        let registeredEmail = localStorage.getItem(LS_EMAIL_KEY) || null;
        let spinsUsed = parseInt(localStorage.getItem(LS_SPINS_KEY) || '0', 10);

        const registerOverlay = document.getElementById('bp-registerOverlay');
        const limitOverlay = document.getElementById('bp-limitOverlay');
        const emailInput = document.getElementById('bp-emailInput');
        const submitEmailBtn = document.getElementById('bp-submitEmail');
        const emailError = document.getElementById('bp-emailError');
        const limitClose = document.getElementById('bp-limitClose');
        const registerClose = document.getElementById('bp-registerClose');

        if (!registerOverlay || !limitOverlay) return;

        // ซ่อน modal ทั้งสองตอนโหลดหน้า
        registerOverlay.style.display = 'none';
        limitOverlay.style.display = 'none';

        function isValidEmail(v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
        }
        function showRegister() {
            registerOverlay.style.display = 'flex';
            emailInput.value = '';
            emailError.textContent = '';
            setTimeout(() => emailInput.focus(), 100);
        }
        function hideRegister() { registerOverlay.style.display = 'none'; }
        function showLimit() { limitOverlay.style.display = 'flex'; }
        function hideLimit() { limitOverlay.style.display = 'none'; }

        // ดัก SPIN ก่อน handler ข้างบน (capture phase)
        bpSpinBtn.addEventListener('click', function (e) {
            if (!registeredEmail) {
                e.stopImmediatePropagation();
                showRegister();
                return;
            }
            if (spinsUsed >= MAX_SPINS) {
                e.stopImmediatePropagation();
                showLimit();
                return;
            }
            spinsUsed++;
            localStorage.setItem(LS_SPINS_KEY, spinsUsed);
        }, true);

        function handleSubmit() {
            const val = emailInput.value.trim();
            if (!isValidEmail(val)) {
                emailError.textContent = 'Please enter a valid email address.';
                emailInput.focus();
                return;
            }
            registeredEmail = val;
            spinsUsed = 0;
            localStorage.setItem(LS_EMAIL_KEY, registeredEmail);
            localStorage.setItem(LS_SPINS_KEY, '0');
            hideRegister();
            bpSpinBtn.click(); // trigger spin หลัง register
        }

        submitEmailBtn.addEventListener('click', handleSubmit);
        emailInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit(); });

        limitClose.addEventListener('click', hideLimit);
        limitOverlay.addEventListener('click', hideLimit);

        if (registerClose) registerClose.addEventListener('click', hideRegister);
        registerOverlay.addEventListener('click', e => { if (e.target === registerOverlay) hideRegister(); });
    })();

}); // end DOMContentLoaded