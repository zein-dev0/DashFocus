// =========================================================
// 📅 محرك إدارة جدول الساعات الأسبوعي المخصص (DashFocus)
// =========================================================

// جلب عناصر واجهة المستخدم الأساسية
const configStartHourSelect = document.getElementById('config-start-hour');
const configEndHourSelect = document.getElementById('config-end-hour');
const applyConfigBtn = document.getElementById('apply-config-btn');
const downloadPlannerBtn = document.getElementById('download-planner-btn');
const timetableHeaderRow = document.getElementById('timetable-header-row');
const timetableBody = document.getElementById('timetable-body');
const timetableCaptureArea = document.getElementById('timetable-capture-area');

// مفاتيح التخزين في الـ LocalStorage
const PLANNER_CONFIG_KEY = 'dashfocus_planner_config';
const PLANNER_DATA_KEY = 'dashfocus_planner_data';

// الأيام المعتمدة في الجدول الدراسي
const plannerDays = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

// الإعدادات الافتراضية والبيانات
let plannerConfig = JSON.parse(localStorage.getItem(PLANNER_CONFIG_KEY)) || { startHour: 5, endHour: 16 };
let timetableData = JSON.parse(localStorage.getItem(PLANNER_DATA_KEY)) || {};

// دالة تعبئة قوائم الاختيار (Select Options) من 00:00 إلى 23:00
function populateHourSelects() {
    if (!configStartHourSelect || !configEndHourSelect) return;

    configStartHourSelect.innerHTML = '';
    configEndHourSelect.innerHTML = '';

    for (let h = 0; h < 24; h++) {
        const period = h < 12 ? 'ص' : 'م';
        const displayHour = h === 0 ? 12 : (h > 12 ? h - 12 : h);
        const optionText = `${displayHour}:00 ${period}`;

        const startOpt = new Option(optionText, h);
        const endOpt = new Option(optionText, h);

        configStartHourSelect.add(startOpt);
        configEndHourSelect.add(endOpt);
    }

    // تعيين القيم الحالية المخزنة
    configStartHourSelect.value = plannerConfig.startHour;
    configEndHourSelect.value = plannerConfig.endHour;
}

// دالة بناء ورسم شبكة الجدول الزجاجية ديناميكياً
function buildTimetable() {
    if (!timetableHeaderRow || !timetableBody) return;

    timetableHeaderRow.innerHTML = '';
    timetableBody.innerHTML = '';

    const start = parseInt(plannerConfig.startHour);
    const end = parseInt(plannerConfig.endHour);

    // 1. بناء صف الهيدر (الساعات التنازلية)
    const firstTh = document.createElement('th');
    firstTh.innerText = 'اليوم / الساعة';
    timetableHeaderRow.appendChild(firstTh);

    for (let h = start; h <= end; h++) {
        const th = document.createElement('th');
        const period = h < 12 ? 'ص' : 'م';
        const displayHour = h === 0 ? 12 : (h > 12 ? h - 12 : h);
        th.innerText = `${displayHour}:00 ${period}`;
        timetableHeaderRow.appendChild(th);
    }

    // 2. بناء سطور الأيام والخلايا الزمنية
    plannerDays.forEach(day => {
        const row = document.createElement('tr');

        const dayTd = document.createElement('td');
        dayTd.className = 'timetable-day-name';
        dayTd.innerText = day;
        row.appendChild(dayTd);

        for (let h = start; h <= end; h++) {
            const cell = document.createElement('td');
            const slotKey = `${day}-${h}`;

            // 🧠 جعل خلية الجدول (td) بالكامل قابلة للضغط أينما نقر المستخدم في المربع
            cell.setAttribute('onclick', `openSlotModal('${day}', ${h})`);
            cell.style.cursor = 'pointer';

            // فحص وجود مهمة مسجلة في هذه الخانة
            if (timetableData[slotKey]) {
                cell.style.background = 'rgba(138, 43, 226, 0.05)';
                cell.innerHTML = `
                    <div class="slot-filled-box" style="width: 100%; height: 100%; min-height: 55px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box;">
                        <span class="slot-subject">${timetableData[slotKey].subject}</span>
                        ${timetableData[slotKey].room ? `<span class="slot-room"> ${timetableData[slotKey].room}</span>` : ''}
                    </div>
                `;
            } else {
                // 🧠 إضافة الزائد الناعمة الخافتة جداً التي تملأ المربع لضمان ظهور الهوفر الفخم بكامل المساحة أينما تحرك الماوس
                cell.innerHTML = `
                    <div class="slot-empty" style="width: 100%; height: 100%; min-height: 55px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 300; opacity: 0.15; color: var(--text-main); transition: all 0.2s ease;">
                        +
                    </div>
                `;
            }

            row.appendChild(cell);
        }

        timetableBody.appendChild(row);
    });
}

// دالة تفعيل وتحديث نطاق بنية الساعات الجديدة
if (applyConfigBtn) {
    applyConfigBtn.addEventListener('click', () => {
        const start = parseInt(configStartHourSelect.value);
        const end = parseInt(configEndHourSelect.value);

        if (start >= end) {
            Swal.fire({
                title: 'خطأ في النطاق!',
                text: 'يجب أن يكون وقت البداية أقل من وقت نهاية الجدول الدراسي.',
                icon: 'warning',
                background: 'transparent',
                customClass: { popup: 'custom-swal-glass', title: 'swal2-title', confirmButton: 'custom-swal-btn' },
                buttonsStyling: false
            });
            return;
        }

        plannerConfig.startHour = start;
        plannerConfig.endHour = end;
        localStorage.setItem(PLANNER_CONFIG_KEY, JSON.stringify(plannerConfig));

        buildTimetable();
    });
}

// دالة فتح نافذة تعديل أو إضافة مهمة داخل الجدول الدراسي
window.openSlotModal = function(day, hour) {
    const slotKey = `${day}-${hour}`;
    const currentData = timetableData[slotKey] || { subject: '', room: '' };

    const period = hour < 12 ? 'ص' : 'م';
    const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);

    Swal.fire({
        title: `<span style="font-size:1.1rem; font-weight:700;"><i class="fa-solid fa-calendar-plus"></i> خانة: ${day} (${displayHour}:00 ${period})</span>`,
        html: `
            <div style="display:flex; flex-direction:column; gap:12px; text-align:right; margin-top:10px;">
                <label class="swal-custom-label">اسم المهمة:</label>
                <input id="swal-slot-subject" class="swal2-input swal-custom-input" value="${currentData.subject}" placeholder="" maxlength="20" autocomplete="off">
                
                <label class="swal-custom-label">وصف إضافي / القاعة (اختياري):</label>
                <input id="swal-slot-room" class="swal2-input swal-custom-input" value="${currentData.room}" placeholder="" maxlength="20" autocomplete="off">
            </div>
        `,
        showCancelButton: true,
        showDenyButton: currentData.subject ? true : false,
        confirmButtonText: 'حفظ التغييرات',
        denyButtonText: 'مسح الخانة',
        cancelButtonText: 'إلغاء',
        customClass: {
            popup: 'custom-swal-glass',
            title: 'swal2-title',
            confirmButton: 'custom-swal-btn',
            denyButton: 'glow-btn outline',
            cancelButton: 'glow-btn outline'
        },
        background: 'transparent',
        buttonsStyling: false,
        preConfirm: () => {
            return {
                subject: document.getElementById('swal-slot-subject').value.trim(),
                room: document.getElementById('swal-slot-room').value.trim()
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            if (!result.value.subject) {
                delete timetableData[slotKey];
            } else {
                timetableData[slotKey] = { subject: result.value.subject, room: result.value.room };
            }
            localStorage.setItem(PLANNER_DATA_KEY, JSON.stringify(timetableData));
            buildTimetable();
        } else if (result.isDenied) {
            delete timetableData[slotKey];
            localStorage.setItem(PLANNER_DATA_KEY, JSON.stringify(timetableData));
            buildTimetable();
        }
    });
};

// =========================================================
// 📸 محرك التصوير الاحترافي الشامل: يحافظ على الألوان الأصلية الفخمة والشفافية الزجاجية
// =========================================================
if (downloadPlannerBtn && timetableCaptureArea) {
    downloadPlannerBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'جاري تحضير صورتك الكلية...',
            text: 'يرجى الانتظار لحظة.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
            background: 'transparent',
            customClass: { popup: 'custom-swal-glass', title: 'swal2-title' }
        });

        const isLightTheme = document.body.classList.contains('light-theme');
        
        // محاكاة الألوان البيئية للموقع لتعمل الشفافية والبلور بنقاء أصيل ومطابق تماماً
        const visualBackground = isLightTheme ? '#f1f5f9' : 'linear-gradient(135deg, #090d1a 0%, #0f172a 100%)';
        const canvasFallbackBg = isLightTheme ? '#f1f5f9' : '#0f172a';

        // حساب الأبعاد الكلية للشبكة بالكامل لمنع أي قص
        const innerTable = timetableCaptureArea.querySelector('.planner-timetable');
        const fullWidth = innerTable ? innerTable.scrollWidth : 1100;
        const totalHeight = timetableCaptureArea.scrollHeight + 50; // زيادة المساحة السفلية لضمان التقاط الحواف كاملة بدون قص

        // بناء الحاوية الوهمية الخارجية لإعطاء مساحة تصوير كاملة وحرة خارج حدود الشاشة (Off-screen)
        const offScreenContainer = document.createElement('div');
        offScreenContainer.style.position = 'absolute';
        offScreenContainer.style.top = '-9999px';
        offScreenContainer.style.left = '-9999px';
        offScreenContainer.style.width = fullWidth + 'px';
        offScreenContainer.style.height = totalHeight + 'px';
        offScreenContainer.style.background = visualBackground;
        offScreenContainer.style.overflow = 'visible';
        offScreenContainer.style.padding = '20px';
        offScreenContainer.style.boxSizing = 'border-box';
        offScreenContainer.style.borderRadius = '14px';
        offScreenContainer.dir = 'rtl';

        // نسخ الجدول بالكامل إلى داخل الحاوية المصممة بيئياً لإنقاذ المظهر الزجاجي الشفاف
        offScreenContainer.innerHTML = timetableCaptureArea.innerHTML;

        // صمام الأمان: جعل الجدول داخل النسخة يحافظ على عرضه الكامل لعدم حدوث انضغاط للأعمدة
        const clonedTable = offScreenContainer.querySelector('.planner-timetable');
        if (clonedTable) {
            clonedTable.style.width = '100%';
        }

        document.body.appendChild(offScreenContainer);

        // تشغيل عملية المعالجة الرسومية الفورية بدقة هائلة
        html2canvas(offScreenContainer, {
            backgroundColor: canvasFallbackBg,
            scale: 2, 
            logging: false,
            useCORS: true,
            width: fullWidth,
            height: totalHeight,
            windowWidth: fullWidth,
            windowHeight: totalHeight
        }).then(canvas => {
            document.body.removeChild(offScreenContainer);

            const imageContainer = canvas.toDataURL('image/png');
            const createDownloadLink = document.createElement('a');
            createDownloadLink.href = imageContainer;
            createDownloadLink.download = isLightTheme ? 'جدول_ساعات_الوضع_النهاري.png' : 'جدول_ساعات_الوضع_المظلم.png';
            
            document.body.appendChild(createDownloadLink);
            createDownloadLink.click();
            document.body.removeChild(createDownloadLink);

            Swal.fire({
                title: '<div style="color: #a5dc86; font-size: 3.5rem; margin-bottom: 15px; text-shadow: 0 0 15px rgba(165, 220, 134, 0.3);"><i class="fa-solid fa-circle-check"></i></div>تم الحفظ بنجاح!',
                text: 'تم حفظ جدولك كاملاً.',
                confirmButtonText: 'حسنا',
                background: 'transparent',
                customClass: { 
                    popup: 'custom-swal-glass', 
                    title: 'swal2-title', 
                    confirmButton: 'custom-swal-btn' 
                },
                buttonsStyling: false
            });
        }).catch(error => {
            console.error("خطأ أثناء معالجة لقطة الصورة للجدول:", error);
            if (document.body.contains(offScreenContainer)) {
                document.body.removeChild(offScreenContainer);
            }
            Swal.fire({
                title: 'فشل التقاط الصورة!',
                text: 'حدث خطأ غير متوقع أثناء التصوير، يرجى المحاولة لاحقاً.',
                icon: 'error',
                background: 'transparent',
                customClass: { popup: 'custom-swal-glass', title: 'swal2-title', confirmButton: 'custom-swal-btn' },
                buttonsStyling: false
            });
        });
    });
}

// تشغيل وتهيئة اللوحة المخصصة فور استدعاء الصفحة
populateHourSelects();
buildTimetable();