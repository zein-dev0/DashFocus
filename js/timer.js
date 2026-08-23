// جلب عناصر واجهة المستخدم (UI Elements)
const timeText = document.getElementById('time-text');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const circle = document.querySelector('.timer-ring-circle');

// جلب عناصر التبديل بين الأوضاع
const modeFocusBtn = document.getElementById('mode-focus-btn');
const modeBreakBtn = document.getElementById('mode-break-btn');

// جلب عناصر نافذة الإعدادات
const settingsModal = document.getElementById('settings-modal');
const openSettingsBtn = document.getElementById('open-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');

// عناصر حقول الإعدادات
const sliderFocus = document.getElementById('slider-focus');
const sliderBreak = document.getElementById('slider-break');
const sliderFocusText = document.getElementById('slider-focus-text');
const sliderBreakText = document.getElementById('slider-break-text');
const autoStartBreakCheck = document.getElementById('auto-start-break');
const autoStartFocusCheck = document.getElementById('auto-start-focus');

// مفاتيح الحفظ في الـ LocalStorage
const STORAGE_KEYS = {
    focusTime: 'dashfocus_config_focus',
    breakTime: 'dashfocus_config_break',
    autoBreak: 'dashfocus_config_autobreak',
    autoFocus: 'dashfocus_config_autofocus'
};

// الإعدادات الافتراضية أو المحفوظة في المتصفح
let config = {
    focusTime: parseInt(localStorage.getItem(STORAGE_KEYS.focusTime)) || 25,
    breakTime: parseInt(localStorage.getItem(STORAGE_KEYS.breakTime)) || 5,
    autoBreak: localStorage.getItem(STORAGE_KEYS.autoBreak) === 'true',
    autoFocus: localStorage.getItem(STORAGE_KEYS.autoFocus) === 'true'
};

// متغيرات التحكم بالحالة الحالية للمؤقت
let currentMode = 'focus'; 
let timeLeft = config.focusTime * 60;
let totalTime = config.focusTime * 60;
let timerId = null;
let isRunning = false;
let isAudioUnlocked = false; // فلاج للتحقق من فك قفل صوت الموبايل

const totalCircumference = 565; 
const alarmSound = new Audio('../assets/sounds/bell.wav'); // صوت انتهاء جلسة التركيز الحالي
const breakFinishedSound = new Audio('../assets/sounds/clock.wav'); // الصوت الجديد لانتهاء الاستراحة

function updateDisplay() {
    if (!timeText || !circle) return;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timeText.textContent = formattedTime;
    
    const modeLabel = currentMode === 'focus' ? 'تركيز' : 'استراحة';
    document.title = isRunning ? `(${formattedTime}) ${modeLabel} | DashFocus` : 'DashFocus | لوحة التركيز';

    const progress = totalTime > 0 ? timeLeft / totalTime : 0;
    const offset = totalCircumference - (progress * totalCircumference);
    circle.style.strokeDashoffset = offset;
}

// دالة سحرية لفك قفل أمان متصفحات الموبايل للأبد عند أول ضغطة مستخدم
function unlockAudioContext() {
    if (isAudioUnlocked) return;

    // تشغيل الأصوات صامتة تماماً وفوراً لتفعيل القناة الصوتية للنظام
    alarmSound.play().then(() => {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }).catch(e => console.log("تأمين صوت التركيز"));

    breakFinishedSound.play().then(() => {
        breakFinishedSound.pause();
        breakFinishedSound.currentTime = 0;
    }).catch(e => console.log("تأمين صوت الاستراحة"));

    isAudioUnlocked = true;
}

function switchModeToFocus(shouldAutoStart = false) {
    if (isRunning) pauseTimer();
    currentMode = 'focus';
    if (modeFocusBtn) modeFocusBtn.classList.add('active');
    if (modeBreakBtn) modeBreakBtn.classList.remove('active');
    
    if (circle) {
        circle.style.stroke = 'var(--neon-cyan)';
        circle.style.filter = 'drop-shadow(0 0 8px var(--neon-cyan))';
    }
    
    timeLeft = config.focusTime * 60;
    totalTime = config.focusTime * 60;
    updateDisplay();

    if (shouldAutoStart) {
        // الـ setTimeout يضمن كسر القيود المتتالية على الموبايل ويشغل الوضع تلقائياً بأمان
        setTimeout(() => { startTimer(); }, 300);
    }
}

function switchModeToBreak(shouldAutoStart = false) {
    if (isRunning) pauseTimer();
    currentMode = 'break';
    if (modeBreakBtn) modeBreakBtn.classList.add('active');
    if (modeFocusBtn) modeFocusBtn.classList.remove('active');
    
    if (circle) {
        circle.style.stroke = 'var(--neon-purple)';
        circle.style.filter = 'drop-shadow(0 0 8px var(--neon-purple))';
    }
    
    timeLeft = config.breakTime * 60;
    totalTime = config.breakTime * 60;
    updateDisplay();

    if (shouldAutoStart) {
        setTimeout(() => { startTimer(); }, 300);
    }
}

function startTimer() {
    // تفعيل فك القفل الصوتي فوراً عند التفاعل
    unlockAudioContext();

    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }

    if (isRunning) return;
    isRunning = true;
    
    if (circle) {
        const activeColor = currentMode === 'focus' ? 'var(--neon-cyan)' : 'var(--neon-purple)';
        circle.style.filter = `drop-shadow(0 0 15px ${activeColor})`;
    }

    timerId = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timerId);
            isRunning = false;
            
            // تشغيل الصوت التنبيهي أولاً وهو مستقر تماماً الآن
            triggerAlert();
            
            // إدارة منطق التشغيل التلقائي على أجهزة الموبايل بمرونة
            if (currentMode === 'focus') {
                if (config.autoBreak) {
                    switchModeToBreak(true);
                } else {
                    switchModeToBreak(false);
                }
            } else {
                if (config.autoFocus) {
                    switchModeToFocus(true);
                } else {
                    switchModeToFocus(false);
                }
            }
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerId);
    isRunning = false;
    if (circle) {
        const activeColor = currentMode === 'focus' ? 'var(--neon-cyan)' : 'var(--neon-purple)';
        circle.style.filter = `drop-shadow(0 0 8px ${activeColor})`;
    }
    updateDisplay();
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    
    if (currentMode === 'focus') {
        timeLeft = config.focusTime * 60;
        totalTime = config.focusTime * 60;
    } else {
        timeLeft = config.breakTime * 60;
        totalTime = config.breakTime * 60;
    }
    
    if (circle) {
        const activeColor = currentMode === 'focus' ? 'var(--neon-cyan)' : 'var(--neon-purple)';
        circle.style.filter = `drop-shadow(0 0 8px ${activeColor})`;
    }
    updateDisplay();
}

function openSettingsModal() {
    if (isRunning) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'يرجى إيقاف المؤقت أولاً لتتمكن من تعديل الإعدادات!',
                icon: 'warning',
                iconColor: 'var(--neon-cyan)',
                confirmButtonText: 'حسناً ',
                customClass: { popup: 'custom-swal-glass', confirmButton: 'custom-swal-btn' },
                buttonsStyling: false
            });
        } else {
            alert('يرجى إيقاف المؤقت أولاً لتتمكن من تعديل الإعدادات!');
        }
        return;
    }
    if (sliderFocus) { sliderFocus.value = config.focusTime; sliderFocusText.textContent = config.focusTime; }
    if (sliderBreak) { sliderBreak.value = config.breakTime; sliderBreakText.textContent = config.breakTime; }
    if (autoStartBreakCheck) autoStartBreakCheck.checked = config.autoBreak;
    if (autoStartFocusCheck) autoStartFocusCheck.checked = config.autoFocus;
    
    if (settingsModal) settingsModal.classList.add('active');
}

function closeSettingsModal() {
    if (settingsModal) settingsModal.classList.remove('active');
}

function saveAllSettings() {
    if (sliderFocus) config.focusTime = parseInt(sliderFocus.value);
    if (sliderBreak) config.breakTime = parseInt(sliderBreak.value);
    if (autoStartBreakCheck) config.autoBreak = autoStartBreakCheck.checked;
    if (autoStartFocusCheck) config.autoFocus = autoStartFocusCheck.checked;

    localStorage.setItem(STORAGE_KEYS.focusTime, config.focusTime);
    localStorage.setItem(STORAGE_KEYS.breakTime, config.breakTime);
    localStorage.setItem(STORAGE_KEYS.autoBreak, config.autoBreak);
    localStorage.setItem(STORAGE_KEYS.autoFocus, config.autoFocus);

    resetTimer();
    closeSettingsModal();
}

function sendTimerFinishedNotification() {
    if ("Notification" in window && Notification.permission === "granted") {
        const title = currentMode === 'focus' ? "DashFocus | انتهت جلسة التركيز! 🎯" : "DashFocus | انتهت الاستراحة! ☕";
        const bodyText = currentMode === 'focus' ? "حان وقت أخذ استراحة قصيرة لتجديد طاقتك." : "حان وقت العودة للتركيز وإنجاز المهام.";
        
        const notification = new Notification(title, { body: bodyText, icon: "../assets/icons/hourglass.webp", dir: "rtl" });
        notification.onclick = () => { window.focus(); notification.close(); };
    }
}

function triggerAlert() {
    if (currentMode === 'focus') {
        alarmSound.play().catch(e => console.log("خطأ تشغيل جرس الموبايل:", e));
    } else if (currentMode === 'break') {
        breakFinishedSound.play().catch(e => console.log("خطأ تشغيل ساعة الموبايل:", e));
    }
    sendTimerFinishedNotification();
}

// ربط الأحداث بأمان بعد التأكد من وجود العناصر
if (startBtn) startBtn.addEventListener('click', startTimer);
if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
if (resetBtn) resetBtn.addEventListener('click', resetTimer);
if (modeFocusBtn) modeFocusBtn.addEventListener('click', () => { unlockAudioContext(); switchModeToFocus(false); });
if (modeBreakBtn) modeBreakBtn.addEventListener('click', () => { unlockAudioContext(); switchModeToBreak(false); });
if (openSettingsBtn) openSettingsBtn.addEventListener('click', openSettingsModal);
if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettingsModal);
if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveAllSettings);

if (sliderFocus) sliderFocus.addEventListener('input', () => sliderFocusText.textContent = sliderFocus.value);
if (sliderBreak) sliderBreak.addEventListener('input', () => sliderBreakText.textContent = sliderBreak.value);

if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettingsModal();
    });
}

// تشغيل المظهر المبدئي
switchModeToFocus(false);