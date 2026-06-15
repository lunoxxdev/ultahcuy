// --- UNICORN BIRTHDAY INVITATION SCRIPT ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. GUEST NAME FROM URL PARAMETERS
    const urlParams = new URLSearchParams(window.location.search);
    const guestNameParam = urlParams.get('to');
    const guestNameElement = document.getElementById('guestName');
    
    if (guestNameParam) {
        guestNameElement.textContent = decodeURIComponent(guestNameParam);
    } else {
        guestNameElement.textContent = 'Sahabat Terbaik & Keluarga';
    }

    // 2. INVITATION REVEAL FLOW
    const btnOpenInvitation = document.getElementById('btnOpenInvitation');
    const invitationCover = document.getElementById('invitationCover');
    const mainContent = document.getElementById('mainContent');
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');

    // Soft pastel ambient tune (using a cute royalty-free synth pop track)
    bgMusic.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3';

    btnOpenInvitation.addEventListener('click', () => {
        // Play click pop sound (Web Audio API fallback or simple synthesize)
        playPopSound();

        // CSS Transition slide-up and fade out
        invitationCover.classList.add('cover-dismissed');
        mainContent.classList.remove('content-hidden');
        musicToggle.classList.remove('hidden');

        // Play background music (most browsers require user gesture first, which is this click)
        bgMusic.play().then(() => {
            console.log("Audio playing successfully.");
        }).catch(err => {
            console.warn("Audio autoplay blocked or failed:", err);
        });

        // Initialize animations/canvas
        initCanvas();
    });

    // 3. BACKGROUND MUSIC PLAY/PAUSE
    let isPlaying = true;
    musicToggle.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            isPlaying = false;
        } else {
            bgMusic.play();
            musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            isPlaying = true;
        }
        playPopSound();
    });

    // 4. COUNTDOWN TIMER
    // Set Target Date (Minggu, 12 Juli 2026, 15:00:00 WIB)
    const targetDate = new Date('July 12, 2026 15:00:00').getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            document.querySelector('.countdown-title').textContent = 'Pesta Sedang Berlangsung! 🦄';
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days < 10 ? '0' + days : days;
        document.getElementById('hours').textContent = hours < 10 ? '0' + hours : hours;
        document.getElementById('minutes').textContent = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById('seconds').textContent = seconds < 10 ? '0' + seconds : seconds;
    };

    // Update countdown immediately, then every second
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // 5. COPY TO CLIPBOARD HANDLER
    const copyButtons = document.querySelectorAll('.btn-copy');
    const toast = document.getElementById('toast');

    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetTextElement = document.getElementById(targetId);
            
            let textToCopy = '';
            if (targetTextElement) {
                textToCopy = targetTextElement.textContent || targetTextElement.innerText;
            }

            navigator.clipboard.writeText(textToCopy).then(() => {
                // Show custom toast notification
                toast.classList.remove('hidden');
                playPopSound();
                
                // Hide toast after 2.5 seconds
                setTimeout(() => {
                    toast.classList.add('hidden');
                }, 2500);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    });

    // 6. RSVP & WISHES WALL LOCAL STORAGE STORAGE
    const rsvpForm = document.getElementById('rsvpForm');
    const wishesList = document.getElementById('wishesList');
    const wishesCount = document.getElementById('wishesCount');

    // Default messages to seed if no messages are stored yet
    const defaultWishes = [
        {
            name: "Tante Sisi & Keluarga",
            attendance: "hadir",
            message: "Selamat ulang tahun Aurelia sayang! Semoga panjang umur, sehat selalu, tumbuh jadi anak solehah dan selalu ceria. Tante & Om pasti datang! 🦄✨"
        },
        {
            name: "Kak Gilang Pratama",
            attendance: "hadir",
            message: "Wah seru banget temanya unicorn! Selamat ulang tahun ya Aurelia, tidak sabar bermain bareng di Istana Pelangi! 🎂🎈"
        },
        {
            name: "Nenek Hajah",
            attendance: "tidak_hadir",
            message: "Barakallah fii umrik cucu nenek sayang. Maaf ya nenek belum bisa hadir langsung karena sedang di luar kota, tapi doa nenek selalu menyertai Aurelia. Semoga sehat selalu."
        }
    ];

    const getWishes = () => {
        const wishes = localStorage.getItem('unicorn_wishes');
        if (!wishes) {
            localStorage.setItem('unicorn_wishes', JSON.stringify(defaultWishes));
            return defaultWishes;
        }
        return JSON.parse(wishes);
    };

    const displayWishes = () => {
        const wishes = getWishes();
        wishesList.innerHTML = '';
        wishesCount.textContent = wishes.length;

        // Render in reverse order so latest wishes appear on top
        wishes.slice().reverse().forEach(wish => {
            const wishCard = document.createElement('div');
            wishCard.className = 'wish-card';

            const statusClass = wish.attendance === 'hadir' ? 'status-hadir' : 'status-tidak';
            const statusText = wish.attendance === 'hadir' ? '<i class="fas fa-check"></i> Hadir' : '<i class="fas fa-times"></i> Absen';

            wishCard.innerHTML = `
                <div class="wish-header">
                    <span class="wish-name">${escapeHTML(wish.name)}</span>
                    <span class="wish-status ${statusClass}">${statusText}</span>
                </div>
                <p class="wish-text">${escapeHTML(wish.message)}</p>
            `;
            wishesList.appendChild(wishCard);
        });
    };

    // Handle RSVP Form Submission
    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('formName').value.trim();
        const attendanceInput = document.querySelector('input[name="attendance"]:checked').value;
        const messageInput = document.getElementById('formMessage').value.trim();

        if (nameInput === '' || messageInput === '') return;

        const newWish = {
            name: nameInput,
            attendance: attendanceInput,
            message: messageInput
        };

        const wishes = getWishes();
        wishes.push(newWish);
        localStorage.setItem('unicorn_wishes', JSON.stringify(wishes));

        // Re-display and clear form
        displayWishes();
        rsvpForm.reset();
        playPopSound();

        // Simple visual feedback
        const submitBtn = rsvpForm.querySelector('button[type="submit"]');
        const originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-check-double"></i> Terkirim!';
        submitBtn.style.background = '#10AC84';
        
        setTimeout(() => {
            submitBtn.innerHTML = originalHtml;
            submitBtn.style.background = '';
        }, 3000);
    });

    // Seed and display wishes on load
    displayWishes();
});

// Helper: Escape HTML strings to prevent XSS in localStorage
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Helper: Web Audio API synth to generate sweet party bubble pops
let audioCtx = null;
function playPopSound() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Soft cute high-pitched bubble pop sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, audioCtx.currentTime); // start frequency
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1); // swift ramp up
        
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
        
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.13);
    } catch (e) {
        console.log("Audio synthesis blocked or failed.");
    }
}

// 7. FLOATING STARS & SPARKLES CANVAS PARTICLE SYSTEM
function initCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const colors = [
        'rgba(255, 141, 161, 0.4)', // pastel pink
        'rgba(92, 225, 230, 0.4)',  // pastel blue
        'rgba(255, 212, 59, 0.4)',  // pastel yellow
        'rgba(199, 206, 234, 0.4)', // pastel lavender
        'rgba(255, 218, 193, 0.4)'  // pastel orange
    ];

    class Sparkle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height + height; // start off-screen bottom
            this.size = Math.random() * 6 + 2;
            this.speed = Math.random() * 1.2 + 0.4;
            this.angle = Math.random() * 360;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.type = Math.random() > 0.5 ? 'star' : 'bubble';
        }

        update() {
            this.y -= this.speed;
            this.angle += 0.5;
            
            // horizontal wobble
            this.x += Math.sin(this.y / 30) * 0.3;

            // Reset particle when it goes off screen top
            if (this.y < -20) {
                this.y = height + 20;
                this.x = Math.random() * width;
                this.speed = Math.random() * 1.2 + 0.4;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle * Math.PI / 180);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;

            if (this.type === 'star') {
                // Draw star shape
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    ctx.lineTo(0, -this.size);
                    ctx.rotate(Math.PI / 5);
                    ctx.lineTo(0, -this.size * 0.4);
                    ctx.rotate(Math.PI / 5);
                }
                ctx.closePath();
                ctx.fill();
            } else {
                // Draw soft bubble
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // Populate sparkles (adjust count based on screen size)
    const particleCount = Math.min(60, Math.floor(width / 20));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Sparkle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
}
