// جلب عناصر واجهة المستخدم (UI Elements)
const shortcutNameInput = document.getElementById('shortcut-name');
const shortcutUrlInput = document.getElementById('shortcut-url');
const shortcutCategoryInput = document.getElementById('shortcut-category');
const addShortcutBtn = document.getElementById('add-shortcut-btn');
const shortcutsGrid = document.getElementById('shortcuts-grid');
const filterButtonsContainer = document.getElementById('filter-buttons-container');

// مفتاح التخزين في الـ LocalStorage
const SHORTCUTS_STORAGE_KEY = 'dashfocus_developer_shortcuts';

// البدء بمصفوفة فارغة لتظهر رسالة الفراغ فوراً
let developerShortcuts = JSON.parse(localStorage.getItem(SHORTCUTS_STORAGE_KEY)) || [];

// الفئة النشطة حالياً في الفلترة
let currentFilter = 'الكل';

function saveShortcutsToStorage() {
    localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(developerShortcuts));
}

// دالة توليد ورقة أزرار الفلترة المضيئة ديناميكياً
function renderFilterButtons() {
    if (!filterButtonsContainer) return;
    filterButtonsContainer.innerHTML = '';

    if (developerShortcuts.length === 0) return;

    const categories = ['الكل', ...new Set(developerShortcuts.map(item => item.category || 'عام'))];

    categories.forEach(category => {
        const btn = document.createElement('button');
        
        if (category === currentFilter) {
            btn.className = 'glow-btn';
            btn.style.padding = '6px 16px';
            btn.style.fontSize = '0.85rem';
            btn.style.borderRadius = '20px';
        } else {
            btn.className = 'glow-btn outline';
            btn.style.padding = '6px 16px';
            btn.style.fontSize = '0.85rem';
            btn.style.borderRadius = '20px';
            btn.style.border = '1px solid var(--glass-border)';
        }

        btn.innerText = category;
        
        btn.addEventListener('click', () => {
            currentFilter = category;
            renderFilterButtons();
            renderShortcuts();
        });

        filterButtonsContainer.appendChild(btn);
    });
}

// دالة رسم وعرض بطاقات الروابط (تم تحديث مكان الحذف والـ #تصنيف)
function renderShortcuts() {
    if (!shortcutsGrid) return;
    shortcutsGrid.innerHTML = '';

    if (developerShortcuts.length === 0) {
        shortcutsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; color: var(--text-muted); text-align: center; padding: 40px; font-size: 0.95rem;">
                <i class="fa-solid fa-link" style="display: block; font-size: 2rem; margin-bottom: 12px; opacity: 0.3;"></i>
                لا توجد روابط مضافة حالياً. أضف مواقعك المفضلة الآن!
            </div>`;
        return;
    }

    const filteredShortcuts = currentFilter === 'الكل' 
        ? developerShortcuts 
        : developerShortcuts.filter(item => (item.category || 'عام') === currentFilter);

    if (filteredShortcuts.length === 0) {
        shortcutsGrid.innerHTML = `<div style="grid-column: 1 / -1; color: var(--text-muted); text-align: center; padding: 30px;">لا توجد روابط في هذا التصنيف حالياً.</div>`;
        return;
    }

    filteredShortcuts.forEach((shortcut) => {
        const realIndex = developerShortcuts.findIndex(item => item === shortcut);
        
        const card = document.createElement('div');
        card.className = 'shortcut-card';
        card.style.position = 'relative';
        card.style.padding = '25px 15px 15px 15px';

        // الحذف ظاهر دائماً بالأعلى، والوسم (#) معلق بالزاوية اليسرى بلون سيان متوهج ناعم
        card.innerHTML = `
            <span style="position: absolute; left: 10px; top: 8px; font-size: 0.72rem; color: var(--neon-cyan); background: rgba(0, 240, 255, 0.08); padding: 2px 8px; border-radius: 4px; font-weight: bold; border: 1px solid rgba(0, 240, 255, 0.15);">
                #${shortcut.category || 'عام'}
            </span>

            <button onclick="deleteShortcut(${realIndex})" title="حذف الرابط" style="position: absolute; right: 10px; top: 6px; background: transparent; border: none; color: rgba(255, 71, 87, 0.7); font-size: 0.95rem; cursor: pointer; transition: color 0.2s; padding: 4px;">
                <i class="fa-solid fa-xmark"></i>
            </button>
            
            <a href="${shortcut.url}" target="_blank" rel="noopener noreferrer" class="shortcut-link-anchor" style="margin-top: 10px;">
                <i class="fa-solid fa-globe site-icon"></i>
                <span class="shortcut-name-text">${shortcut.name}</span>
            </a>
        `;

        shortcutsGrid.appendChild(card);
    });
}

// دالة إضافة رابط جديد متناسقة تماماً مع ستايل البومودورو الزجاجي
function addNewShortcut() {
    if (!shortcutNameInput || !shortcutUrlInput || !shortcutCategoryInput) return;

    const name = shortcutNameInput.value.trim();
    let url = shortcutUrlInput.value.trim();
    let category = shortcutCategoryInput.value.trim() || 'عام';

    // إطلاق النافذة الزجاجية المتطابقة مع البومودورو (تنبيه الحقول الفارغة)
    if (name === '' || url === '') {
        Swal.fire({
            title: 'تنبيه!',
            text: 'الرجاء كتابة اسم الموقع ورابط الـ URL معاً.',
            icon: 'info', // أيقونة التعجب الدائرية الزرقاء مثل البومودورو
            customClass: {
                popup: 'custom-swal-glass',
                title: 'swal2-title',
                confirmButton: 'custom-swal-btn'
            },
            background: 'transparent', // يضمن تفعيل الـ backdrop-filter الزجاجي من الـ CSS
            buttonsStyling: false,
            confirmButtonText: 'حسناً '
        });
        return;
    }

    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    developerShortcuts.push({ name: name, url: url, category: category });
    saveShortcutsToStorage();
    
    shortcutNameInput.value = '';
    shortcutUrlInput.value = '';
    shortcutCategoryInput.value = '';
    shortcutNameInput.focus();
    
    renderFilterButtons();
    renderShortcuts();
}

window.deleteShortcut = function(index) {
    developerShortcuts.splice(index, 1);
    saveShortcutsToStorage();
    
    const remainingCategories = new Set(developerShortcuts.map(item => item.category || 'عام'));
    if (currentFilter !== 'الكل' && !remainingCategories.has(currentFilter)) {
        currentFilter = 'الكل';
    }
    
    renderFilterButtons();
    renderShortcuts();
};

if (addShortcutBtn) addShortcutBtn.addEventListener('click', addNewShortcut);

[shortcutNameInput, shortcutUrlInput, shortcutCategoryInput].forEach(input => {
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addNewShortcut();
        });
    }
});

renderFilterButtons();
renderShortcuts();