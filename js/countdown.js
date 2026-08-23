// جلب عناصر واجهة المستخدم المحدثة (UI Elements)
const eventTitleInput = document.getElementById('event-title');
const eventTypeInput = document.getElementById('event-type'); // حقل إدخال نصي حرّ
const eventOnlyDateInput = document.getElementById('event-only-date'); // حقل التاريخ المنفصل
const eventOnlyTimeInput = document.getElementById('event-only-time'); // حقل الوقت المنفصل
const addEventBtn = document.getElementById('add-event-btn');
const eventsGrid = document.getElementById('events-grid');

// مفتاح التخزين في الـ LocalStorage
const COUNTDOWN_STORAGE_KEY = 'dashfocus_student_countdowns';

// جلب المواعيد المخزنة أو البدء بمصفوفة فارغة نظيفة تماماً
let studentEvents = JSON.parse(localStorage.getItem(COUNTDOWN_STORAGE_KEY)) || [];

// متغير لتشغيل عداد التحديث التلقائي المركزي (Interval)
let countdownInterval = null;

function saveEventsToStorage() {
    localStorage.setItem(COUNTDOWN_STORAGE_KEY, JSON.stringify(studentEvents));
}

// دالة حساب الوقت المتبقي وحقنه داخل المربعات المصغرة بالثانية
function updateAllCountdowns() {
    const cards = eventsGrid.querySelectorAll('.event-countdown-card');
    
    if (studentEvents.length === 0) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        renderEvents();
        return;
    }

    studentEvents.forEach((eventItem, index) => {
        const card = cards[index];
        if (!card) return;

        const targetDate = new Date(eventItem.date).getTime();
        const now = new Date().getTime();
        const difference = targetDate - now;

        const daysBlock = card.querySelector('.days-num');
        const hoursBlock = card.querySelector('.hours-num');
        const minutesBlock = card.querySelector('.minutes-num');
        const secondsBlock = card.querySelector('.seconds-num');
        const displayWrapper = card.querySelector('.countdown-display-blocks');

        // حالة انتهاء الموعد النهائي (Deadline Expired)
        if (difference <= 0) {
            card.classList.add('expired');
            if (displayWrapper) {
                displayWrapper.innerHTML = `
                    <div style="grid-column: 1 / -1; width: 100%; text-align: center; font-weight: bold; font-size: 1.1rem; color: #ff4757; padding: 5px 0;">
                        ⚠️ انتهى وقت الموعد المحدد!
                    </div>`;
            }
            return;
        }

        // الحسابات الزمنية الدقيقة للوقت المتبقي
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // حقن الأرقام مع إضافة صفر حشو إذا كانت الخانة أقل من 10 لتناسق المظهر الافتراضي
        if (daysBlock) daysBlock.innerText = days;
        if (hoursBlock) hoursBlock.innerText = hours < 10 ? '0' + hours : hours;
        if (minutesBlock) minutesBlock.innerText = minutes < 10 ? '0' + minutes : minutes;
        if (secondsBlock) secondsBlock.innerText = seconds < 10 ? '0' + seconds : seconds;
    });
}

// دالة رندر بناء وعرض الكروت الهيكلية على الشاشة
function renderEvents() {
    if (!eventsGrid) return;
    eventsGrid.innerHTML = '';

    if (studentEvents.length === 0) {
        eventsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; color: var(--text-muted); text-align: center; padding: 50px 20px; font-size: 0.95rem;">
                <i class="fa-solid fa-hourglass-start" style="display: block; font-size: 2.2rem; margin-bottom: 15px; opacity: 0.25; color: var(--neon-cyan);"></i>
                لا توجد امتحانات أو تسليمات مجدولة حالياً. أضف مواعيدك الدراسية القادمة لتبدأ التتبع المباشر!
            </div>`;
        return;
    }

    // فرز المواعيد تلقائياً بحيث يظهر الموعد الأقرب زمنياً أولاً للأهمية والاستعداد لها
    studentEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    studentEvents.forEach((eventItem, index) => {
        const card = document.createElement('div');
        card.className = 'event-countdown-card';
        card.style.position = 'relative'; // لضمان ثبات أزرار الحذف والبادجات بالداخل

        // تنسيق وقراءة التاريخ بشكل مفهوم وجميل للطلاب باللغة العربية
        const localDateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const readableDate = new Date(eventItem.date).toLocaleDateString('ar-EG', localDateOptions);

        card.innerHTML = `
            <span style="position: absolute; left: 12px; top: 12px; font-size: 0.75rem; color: var(--neon-cyan); background: rgba(0, 240, 255, 0.06); padding: 3px 10px; border-radius: 6px; font-weight: bold; border: 1px solid rgba(0, 240, 255, 0.12); max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${eventItem.type}
            </span>

            <button onclick="deleteEvent(${index})" title="حذف الموعد" style="position: absolute; right: 12px; top: 10px; background: transparent; border: none; color: rgba(255, 71, 87, 0.7); font-size: 1.1rem; cursor: pointer; transition: color 0.2s; padding: 4px; z-index: 10;">
                <i class="fa-solid fa-xmark"></i>
            </button>
            
            <div style="margin-top: 25px; text-align: right;">
                <h3 style="font-size: 1.1rem; margin: 0 0 6px 0; font-weight: 700; color: var(--text-main); padding-left: 115px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${eventItem.title}
                </h3>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">
                    <i class="fa-regular fa-calendar" style="margin-left: 5px; font-size: 0.85rem;"></i> ${readableDate}
                </p>
            </div>

            <div class="countdown-display-blocks">
                <div class="countdown-unit-block"><span class="countdown-number seconds-num">--</span><span class="countdown-label">ثانية</span></div>
                <div class="countdown-unit-block"><span class="countdown-number minutes-num">--</span><span class="countdown-label">دقيقة</span></div>
                <div class="countdown-unit-block"><span class="countdown-number hours-num">--</span><span class="countdown-label">ساعة</span></div>
                <div class="countdown-unit-block"><span class="countdown-number days-num">--</span><span class="countdown-label">يوم</span></div>
            </div>
        `;

        eventsGrid.appendChild(card);
    });

    // تشغيل محرك التحديث بالثواني فوراً بعد بناء العناصر وتجنب تراكم الـ Intervals
    if (!countdownInterval) {
        updateAllCountdowns();
        countdownInterval = setInterval(updateAllCountdowns, 1000);
    }
}

// دالة إضافة حدث دراسي جديد بعد دمج حقول التاريخ والوقت المسهلين
function addNewEvent() {
    if (!eventTitleInput || !eventTypeInput || !eventOnlyDateInput || !eventOnlyTimeInput) return;

    const title = eventTitleInput.value.trim();
    const type = eventTypeInput.value.trim() || 'موعد دراسي';
    const dateValue = eventOnlyDateInput.value;
    const timeValue = eventOnlyTimeInput.value;

    if (title === '' || dateValue === '' || timeValue === '') {
        Swal.fire({
            title: 'تنبيه!',
            text: 'يرجى كتابة اسم المادة الدراسية، وتحديد التاريخ والوقت المخصصين لتشغيل العداد التنازلي.',
            icon: 'info',
            customClass: {
                popup: 'custom-swal-glass',
                title: 'swal2-title',
                confirmButton: 'custom-swal-btn'
            },
            background: 'transparent',
            buttonsStyling: false,
            confirmButtonText: 'حسنا'
        });
        return;
    }

    const fullDateTimeString = `${dateValue}T${timeValue}`;
    const selectedTime = new Date(fullDateTimeString).getTime();
    const currentTime = new Date().getTime();

    if (selectedTime <= currentTime) {
        Swal.fire({
            title: 'خطأ في التاريخ!',
            text: 'لا يمكن ضبط عداد تنازلي لتاريخ ووقت قد مضى بالفعل، يرجى اختيار موعد مستقبلي.',
            icon: 'warning',
            customClass: {
                popup: 'custom-swal-glass',
                title: 'swal2-title',
                confirmButton: 'custom-swal-btn'
            },
            background: 'transparent',
            buttonsStyling: false,
            confirmButtonText: 'تعديل الموعد'
        });
        return;
    }

    studentEvents.push({ title: title, type: type, date: fullDateTimeString });
    saveEventsToStorage();
    
    eventTitleInput.value = '';
    eventTypeInput.value = '';
    eventOnlyDateInput.value = '';
    eventOnlyTimeInput.value = '';
    eventTitleInput.focus();
    
    renderEvents();
}

// دالة حذف الموعد التنازلي
window.deleteEvent = function(index) {
    studentEvents.splice(index, 1);
    saveEventsToStorage();
    renderEvents();
};

// ربط أحداث النقر والإضافة
if (addEventBtn) addEventBtn.addEventListener('click', addNewEvent);

[eventTitleInput, eventTypeInput].forEach(input => {
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addNewEvent();
        });
    }
});

renderEvents();