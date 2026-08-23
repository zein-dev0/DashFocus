// جلب عناصر زر المظهر وجسم الصفحة
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

// مفتاح الحفظ في LocalStorage
const THEME_STORAGE_KEY = 'dashfocus_theme';

// 1. فحص وتطبيق السمة المحفوظة فوراً عند تحميل أي صفحة في الموقع
const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
if (savedTheme === 'light') {
    body.classList.add('light-theme');
    // نغير نص الزر فقط إذا كان موجوداً في الصفحة الحالية
    if (themeToggleBtn) {
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>'; 
    }
} else {
    body.classList.remove('light-theme');
    if (themeToggleBtn) {
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>'; 
    }
}

// 2. دالة التبديل عند الضغط على الزر (تُربط فقط إذا كان الزر موجوداً كالصفحة الرئيسية)
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        
        if (body.classList.contains('light-theme')) {
            localStorage.setItem(THEME_STORAGE_KEY, 'light');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            localStorage.setItem(THEME_STORAGE_KEY, 'dark');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    });
}

// =========================================
// منطق الشاشة المنبثقة (About Developer Modal)
// =========================================
const aboutBtn = document.getElementById('about-btn');
const aboutModal = document.getElementById('about-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

function openModal() {
    if (aboutModal) aboutModal.classList.add('active');
}

function closeModal() {
    if (aboutModal) aboutModal.classList.remove('active');
}

// الاستماع لضغطات الأزرار (فقط إن وجدت في الصفحة الحالية)
if (aboutBtn && closeModalBtn && aboutModal) {
    aboutBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aboutModal.classList.contains('active')) closeModal();
    });
}

// =========================================
// منطق تاريخ اليوم والوقت الإضافي
// =========================================
function displayCurrentDate() {
    const dayElement = document.getElementById('date-day');
    const fullDateElement = document.getElementById('date-full');
    
    if (!dayElement || !fullDateElement) return;

    const today = new Date();
    const dayOptions = { weekday: 'long' };
    const dayName = today.toLocaleDateString('ar-EG', dayOptions);

    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    dayElement.textContent = dayName;
    fullDateElement.textContent = `${day} / ${month} / ${year}`;
}

// =========================================
// نظام إشعارات المتصفح (Web Notifications)
// =========================================
function requestNotificationPermission() {
    if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("🎯 تم تفعيل نظام إشعارات المتصفح بنجاح في DashFocus!");
                }
            });
        }
    }
}

// استدعاء الدوال الآمنة عند تحميل أي صفحة
document.addEventListener('DOMContentLoaded', () => {
    displayCurrentDate();
    requestNotificationPermission();
});

console.log('🚀 تم تشغيل نظام DashFocus بنجاح، والملف البرمجي الرئيسي مستقر وآمن تماماً.');

// =========================================================
// 🌙 محرك توليد الأحاديث النبوية المتسلسلة (DashFocus)
// =========================================================

// مصفوفة منتقاة من الأحاديث النبوية الشريفة المنسقة
const dashFocusHadiths = [
    "قَالَ رَسُولُ اللَّهِ ﷺ:\n«لَا فَضْلَ لِعَرَبِيٍّ عَلَى أَعْجَمِيٍّ، وَلَا لِأَعْجَمِيٍّ عَلَى عَرَبِيٍّ، إِلَّا بِالتَّقْوَى»",
    "قَالَ رَسُولُ اللَّهِ ﷺ:\n«مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ»",
    "قَالَ رَسُولُ اللَّهِ ﷺ:\n«إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكارِمَ الْأَخْلَاقِ»",
    "قَالَ رَسُولُ اللَّهِ ﷺ:\n«الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ، وَفِي كُلٍّ خَيْرٌ»",
    "قَالَ رَسُولُ اللَّهِ ﷺ:\n«مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ»",
    "قَالَ رَسُولُ اللَّهِ ﷺ:\n«من لمْ يَشكُرِ النَّاسَ لَمْ يَشكُرِ اللهَ»",
    "قَالَ رَسُولُ اللَّهِ ﷺ:\n«احْرِصْ عَلَى مَا يَنْفَعُكَ، وَاسْتَعِنْ بِاللَّهِ وَلاَ تَعْجِزْ»",
    "قَالَ رَسُولُ اللَّهِ ﷺ:\n«الدِّينُ النَّصِيحَةُ»",
    "قَالَ رَسُولُ اللَّهِ ﷺ:\n«من لمْ يَشكُرِ النَّاسَ لَمْ يَشكُرِ اللهَ»",
    "قَالَ رَسُولُ اللَّهِ ﷺ:\n«مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ»",
    "قَالَ رَسُولُ اللَّهِ ﷺ:\n«مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ جَارَهُ»",
    "قَالَ رَسُولُ اللَّهِ ﷺ:\n«لا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ»",
    "قَالَ رَسُولُ اللَّهِ ﷺ:\n«يَسِّرُوا وَلا تُعَسِّرُوا، وَبَشِّرُوا وَلا تُنَفِّرُوا»"
];

// دالة التقاط النقر وعرض الحديث النبوي بالترتيب الدوري
function showOrderedHadithPopup(e) {
    e.preventDefault(); // منع الصفحة من القفز أو التحديث عند الضغط

    const STORAGE_KEY = 'dashfocus_current_hadith_index';

    // 1. جلب مؤشر الحديث الحالي من الذاكرة أو البدء من الصفر (الحديث الأول)
    let currentIndex = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;

    // صمام أمان في حال تم تعديل المصفوفة لاحقاً وخرج المؤشر عن النطاق
    if (currentIndex >= dashFocusHadiths.length || currentIndex < 0) {
        currentIndex = 0;
    }

    const chosenHadith = dashFocusHadiths[currentIndex];

    // 2. إطلاق النافذة المنبثقة الفخمة والمتوافقة مع الوضعين
    Swal.fire({
        title: `<span style="font-size: 1.2rem; font-weight: 700; color: var(--neon-purple); filter: drop-shadow(0 0 3px var(--neon-purple));"><i class="fa-solid fa-mosque"></i> مِنْ نُورِ النُّبُوَّةِ ﷺ</span>`,
        html: `
            <div style="padding: 15px 5px; font-size: 1.05rem; line-height: 1.7; font-weight: 500; text-align: center; white-space: pre-line; word-break: break-word;" class="swal-hadith-body-text">
                ${chosenHadith}
            </div>
        `,
        confirmButtonText: 'جزاك الله خيراً',
        customClass: {
            popup: 'custom-swal-glass',
            title: 'swal2-title',
            confirmButton: 'custom-swal-btn'
        },
        background: 'transparent',
        buttonsStyling: false
    });

    // 3. تحديث المؤشر للحديث التالي واستخدام باقي القسمة (%) ليعود تلقائياً للصفر عند الانتهاء
    let nextIndex = (currentIndex + 1) % dashFocusHadiths.length;
    localStorage.setItem(STORAGE_KEY, nextIndex);
}

// ربط الحدث بالبطاقة فور تحميل الصفحة
const hadithCard = document.getElementById('hadith-trigger-card');
if (hadithCard) {
    hadithCard.addEventListener('click', showOrderedHadithPopup);
}