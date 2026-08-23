// جلب عناصر HTML
const taskInput = document.getElementById('task-input');
const taskDescInput = document.getElementById('task-desc-input'); // العنصر المخصص للوصف
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

// جلب المهام من الذاكرة عبر الاستعانة بملف storage.js المشترك
let tasks = getTasks();

// دالة لطباعة المهام على الشاشة بالأيقونات الاحترافية والتأثير الزجاجي الأخضر
function renderTasks() {
    if (!taskList) return;
    // تفريغ القائمة أولاً لمنع التكرار
    taskList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        
        // ربط حالة الاكتمال بالكلاس الزجاجي الأخضر
        if (task.completed) {
            li.className = 'task-item glass-panel-small completed';
        } else {
            li.className = 'task-item glass-panel-small';
        }
        
        // التحقق مما إذا كانت المهمة في حالة تعديل حالياً
        if (task.isEditing) {
            // مظهر بطاقة المهمة أثناء التعديل (تعديل العنوان وتعديل الوصف معاً)
            li.innerHTML = `
                <div class="edit-task-inputs-block">
                    <input type="text" class="edit-task-input" id="edit-title-${index}" value="${task.text}" autocomplete="off">
                    <input type="text" class="edit-task-desc-input" id="edit-desc-${index}" value="${task.desc || ''}" placeholder="تعديل الوصف الفرعي..." autocomplete="off">
                </div>
                <div class="task-actions">
                    <button class="action-btn save-btn" onclick="saveEdit(${index})" title="حفظ التعديل">
                        <i class="fa-solid fa-floppy-disk"></i>
                    </button>
                    <button class="action-btn cancel-btn" onclick="toggleEditMode(${index})" title="إلغاء">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;
        } else {
            // مظهر بطاقة المهمة الطبيعي (كتلة نصية تحتوي على عنوان عريض ووصف أصغر وخافت تحته)
            li.innerHTML = `
                <label class="custom-checkbox">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
                    <span class="checkmark"></span>
                </label>
                <div class="task-content-block">
                    <span class="task-title-text">${task.text}</span>
                    ${task.desc ? `<span class="task-desc-text">${task.desc}</span>` : ''}
                </div>
                <div class="task-actions">
                    <button class="action-btn edit-btn" onclick="toggleEditMode(${index})" title="تعديل المهمة">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteTask(${index})" title="حذف المهمة">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
        }
        
        taskList.appendChild(li);
        
        // تركيز المؤشر تلقائياً داخل حقل التعديل الرئيسي عند تفعيله
        if (task.isEditing) {
            const titleInputElement = document.getElementById(`edit-title-${index}`);
            const descInputElement = document.getElementById(`edit-desc-${index}`);
            
            if (titleInputElement) titleInputElement.focus();
            
            // تفعيل الحفظ عند الضغط على Enter في أي من الحقلين
            const handleEnterSave = (e) => { if (e.key === 'Enter') saveEdit(index); };
            if (titleInputElement) titleInputElement.addEventListener('keypress', handleEnterSave);
            if (descInputElement) descInputElement.addEventListener('keypress', handleEnterSave);
        }
    });
}

// دالة إضافة مهمة جديدة (تأخذ العنوان والوصف معاً)
function addTask() {
    if (!taskInput || !taskDescInput) return;
    
    const titleText = taskInput.value.trim();
    const descText = taskDescInput.value.trim();
    
    if (titleText !== '') {
        // إضافة الخصائص المعتادة مع حفظ متغير الـ desc الجديد
        tasks.push({ 
            text: titleText, 
            desc: descText, // سيتم حفظه كنص فارغ إذا لم يدخله المستخدم
            completed: false, 
            isEditing: false 
        });
        
        saveTasks(tasks); // دالة الحفظ المشتركة من ملف storage.js
        
        // تفريغ حقول الإدخال
        taskInput.value = ''; 
        taskDescInput.value = ''; 
        
        renderTasks(); // إعادة رسم القائمة بالمظهر الجديد
    }
}

// دالة التبديل والدخول/الخروج من وضع التعديل
window.toggleEditMode = function(index) {
    tasks.forEach((task, i) => {
        if (i !== index) task.isEditing = false;
    });
    tasks[index].isEditing = !tasks[index].isEditing;
    renderTasks();
}

// دالة حفظ النص والوصف الجديدين بعد التعديل
window.saveEdit = function(index) {
    const editTitleInput = document.getElementById(`edit-title-${index}`);
    const editDescInput = document.getElementById(`edit-desc-${index}`);
    
    if (!editTitleInput || !editDescInput) return;
    
    const newTitle = editTitleInput.value.trim();
    const newDesc = editDescInput.value.trim();
    
    if (newTitle !== '') {
        tasks[index].text = newTitle;
        tasks[index].desc = newDesc;
        tasks[index].isEditing = false; // الخروج من وضع التعديل
        saveTasks(tasks); // دالة الحفظ من ملف storage.js
        renderTasks();
    }
}

// دالة تبديل حالة المهمة (مكتملة / غير مكتملة)
window.toggleTask = function(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks(tasks); 
    renderTasks();
}

// دالة حذف مهمة
window.deleteTask = function(index) {
    tasks.splice(index, 1);
    saveTasks(tasks); 
    renderTasks();
}

// تفعيل زر الإضافة والأحداث
if (addTaskBtn) addTaskBtn.addEventListener('click', addTask);

const handleInputEnter = (e) => { if (e.key === 'Enter') addTask(); };
if (taskInput) taskInput.addEventListener('keypress', handleInputEnter);
if (taskDescInput) taskDescInput.addEventListener('keypress', handleInputEnter);

// رسم المهام عند التحميل الأول
renderTasks();