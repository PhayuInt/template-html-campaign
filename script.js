// --- GLOBAL FUNCTIONS ---

window.scrollToSection = function (id) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
};

let phCurrent = 0;
let phSlides, phDots;

window.phGoTo = function (n) {
    if (!phSlides || !phDots || phSlides.length === 0) return;
    phSlides[phCurrent].classList.remove('active');
    phDots[phCurrent].classList.remove('active');
    phCurrent = n;
    phSlides[phCurrent].classList.add('active');
    phDots[phCurrent].classList.add('active');
};

let selectedAvatarColor = 'blue';

window.selectAvatar = function (element) {
    document.querySelectorAll('.avatar-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedAvatarColor = element.getAttribute('data-color');
};

window.sendMessage = function () {
    const nameInput = document.getElementById('inputName');
    const msgInput = document.getElementById('inputMsg');
    const messagesArea = document.getElementById('messagesArea');

    const name = nameInput.value.trim();
    const message = msgInput.value.trim();

    if (name === "" || message === "") {
        alert("Please enter both Name and Message.");
        return;
    }

    const messageItem = document.createElement('div');
    messageItem.className = 'message-item';
    messageItem.innerHTML = `
        <div class="avatar-circle avatar-${selectedAvatarColor}"></div>
        <div class="message-content">
            <div class="message-name">${name}</div>
            <div class="message-text">${message}</div>
        </div>
    `;

    messagesArea.appendChild(messageItem);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    msgInput.value = "";
};


// --- DOM CONTENT LOADED ---
document.addEventListener('DOMContentLoaded', function () {

    // 1. PHUD HONG SLIDESHOW
    phSlides = document.querySelectorAll('#phSlideshow .ph-slide');
    phDots = document.querySelectorAll('.ph-dot');

    if (phSlides.length > 0) {
        setInterval(() => {
            let nextIndex = (phCurrent + 1) % phSlides.length;
            phGoTo(nextIndex);
        }, 4000);
    }

    // 2. CAROUSEL SLIDER
    const track = document.getElementById('slTrack');
    const prevBtn = document.getElementById('slPrev');
    const nextBtn = document.getElementById('slNext');
    let slIndex = 0;

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

    // 3. TESTIMONIAL SLIDER
    const tmTrack = document.getElementById('tmTrack');
    const tmPrev = document.getElementById('tmPrev');
    const tmNext = document.getElementById('tmNext');
    const tmItems = document.querySelectorAll('.tm-item');
    let tmCurrentIndex = 1;

    if (tmTrack && tmItems.length > 0) {
        function updateTestimonialSlider() {
            const itemWidth = tmItems[0].offsetWidth;
            const totalItemWidth = itemWidth + 30;
            const viewport = tmTrack.closest('.tm-viewport');
            const viewportWidth = viewport.offsetWidth;
            const centerOffset = (viewportWidth / 2) - (totalItemWidth / 2);
            const translateValue = -(tmCurrentIndex * totalItemWidth) + centerOffset;

            tmTrack.style.transform = `translateX(${translateValue}px)`;

            tmItems.forEach((item, index) => {
                item.classList.toggle('center', index === tmCurrentIndex);
            });
        }

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

        tmItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                tmCurrentIndex = index;
                updateTestimonialSlider();
            });
        });

        window.addEventListener('resize', updateTestimonialSlider);
        updateTestimonialSlider();
    }

    // 4. SLOT MACHINE
    const BP_ITEM_HEIGHT = 120;
    const BP_SPIN_INTERVAL = 60;

    const bpReels = [
        { inner: document.getElementById('bp-reel-inner1'), offset: 0, timer: null, stopping: false },
        { inner: document.getElementById('bp-reel-inner2'), offset: 0, timer: null, stopping: false },
        { inner: document.getElementById('bp-reel-inner3'), offset: 0, timer: null, stopping: false },
    ].filter(r => r.inner !== null);

    const bpSpinBtn = document.getElementById('bp-spinBtn');
    const bpStopBtn = document.getElementById('bp-stopBtn');
    const bpResultEl = document.getElementById('bp-resultMsg');

    if (bpReels.length === 0 || !bpSpinBtn || !bpStopBtn) return;

    let bpIsSpinning = false;

    function bpGetItemCount(reel) { return reel.inner.querySelectorAll('.bp-reel-item').length; }

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

    bpStopBtn.disabled = true;
    bpReels.forEach(reel => {
        const rand = Math.floor(Math.random() * bpGetItemCount(reel)) * BP_ITEM_HEIGHT;
        reel.inner.style.transition = 'none';
        bpSetOffset(reel, rand);
    });

    // 5. REGISTER & SPIN LIMIT
    (function () {
        const MAX_SPINS = 3;
        const LS_EMAIL_KEY = 'bp_registered_email';
        const LS_SPINS_KEY = 'bp_spins_used';

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

        registerOverlay.style.display = 'none';
        limitOverlay.style.display = 'none';

        function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
        function showRegister() {
            registerOverlay.style.display = 'flex';
            emailInput.value = '';
            emailError.textContent = '';
            setTimeout(() => emailInput.focus(), 100);
        }
        function hideRegister() { registerOverlay.style.display = 'none'; }
        function showLimit() { limitOverlay.style.display = 'flex'; }
        function hideLimit() { limitOverlay.style.display = 'none'; }

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
            bpSpinBtn.click();
        }

        submitEmailBtn.addEventListener('click', handleSubmit);
        emailInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit(); });
        limitClose.addEventListener('click', hideLimit);
        limitOverlay.addEventListener('click', e => { if (e.target === limitOverlay) hideLimit(); });
        if (registerClose) registerClose.addEventListener('click', hideRegister);
        registerOverlay.addEventListener('click', e => { if (e.target === registerOverlay) hideRegister(); });
    })();

});