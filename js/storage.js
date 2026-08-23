// مفتاح الحفظ في LocalStorage
const STORAGE_KEY = 'dashfocus_tasks';

// دالة لجلب المهام المحفوظة
function getTasks() {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    // إذا كان هناك مهام نعيدها كـ Array، وإلا نعيد مصفوفة فارغة
    return savedTasks ? JSON.parse(savedTasks) : [];
}

// دالة لحفظ المهام بعد أي تعديل
function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}