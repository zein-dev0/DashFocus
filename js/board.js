// جلب عناصر واجهة المستخدم (UI Elements)
const habitInput = document.getElementById('habit-input');
const addHabitBtn = document.getElementById('add-habit-btn');
const habitsBoard = document.getElementById('habits-board');

// مفتاح التخزين الخاص باللوحة طويلة الأمد
const LONG_TERM_TASKS_KEY = 'dashfocus_long_term_tasks';

// جلب البيانات أو مصفوفة فارغة
let longTermTasks = JSON.parse(localStorage.getItem(LONG_TERM_TASKS_KEY)) || [];

function saveBoardToStorage() {
    localStorage.setItem(LONG_TERM_TASKS_KEY, JSON.stringify(longTermTasks));
}

// دالة رسم الأوراق والدبابيس على اللوح الزجاجي
function renderBoard() {
    if (!habitsBoard) return;
    habitsBoard.innerHTML = '';

    if (longTermTasks.length === 0) {
        habitsBoard.innerHTML = `
            <div style="grid-column: 1 / -1; color: var(--text-muted); text-align: center; padding: 40px; font-size: 0.95rem;">
                <i class="fa-solid fa-thumbtack" style="display: block; font-size: 2rem; margin-bottom: 10px; opacity: 0.3;"></i>
                اللوحة فارغة حالياً. اكتب أهدافك الكبيرة وثبتها هنا!
            </div>`;
        return;
    }

    longTermTasks.forEach((task, index) => {
        const div = document.createElement('div');
        
        // إذا كان الهدف مكتملًا نمنحه كلاس .done ليتغير لونه الزجاجي للسيان الخافت
        div.className = task.completed ? 'note-paper done' : 'note-paper';

        div.innerHTML = `
            <div class="note-pin"><i class="fa-solid fa-thumbtack"></i></div>
            
            <p class="note-text">${task.text}</p>
            
            <div class="note-footer">
                <label class="custom-checkbox" style="transform: scale(0.9);">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus(${index})">
                    <span class="checkmark"></span>
                </label>
                <button class="note-delete-btn" onclick="deleteTaskFromBoard(${index})" title="انتزاع الورقة وحذفها">
                    <i class="fa-solid fa-trash-can"></i> الحذف
                </button>
            </div>
        `;

        habitsBoard.appendChild(div);
    });
}

// دالة إضافة ورقة جديدة وتثبيتها بالدبوس
function addNewTaskToBoard() {
    if (!habitInput) return;
    const text = habitInput.value.trim();

    if (text !== '') {
        longTermTasks.push({ text: text, completed: false });
        saveBoardToStorage();
        habitInput.value = ''; // تفريغ حقل الإدخال
        renderBoard(); // إعادة الرسم الفوري
    }
}

// دالة التبديل بين الاكتمال وعدمه للأهداف طويلة الأمد
window.toggleTaskStatus = function(index) {
    longTermTasks[index].completed = !longTermTasks[index].completed;
    saveBoardToStorage();
    renderBoard();
};

// دالة انتزاع وحذف الورقة نهائياً من اللوح
window.deleteTaskFromBoard = function(index) {
    longTermTasks.splice(index, 1);
    saveBoardToStorage();
    renderBoard();
};

// ربط الأحداث والأزرار
if (addHabitBtn) addHabitBtn.addEventListener('click', addNewTaskToBoard);
if (habitInput) {
    habitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTaskToBoard();
    });
}

// الرندر الأولي عند فتح اللوحة الفنية
renderBoard();