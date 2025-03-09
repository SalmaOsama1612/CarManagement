const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();
// استخدام المنفذ الذي يوفره Render أو المنفذ 3000 كمنفذ احتياطي
const PORT = process.env.PORT || 3000;

// تمكين CORS والتعامل مع JSON
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📂 عرض الملفات الثابتة (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// 📂 عرض الملفات المرفوعة (الصور، الفيديوهات، وملفات PDF)
app.use('/files', express.static(path.join(__dirname, 'files')));

// 📂 مجلد تخزين الملفات
const FILES_DIR = path.join(__dirname, 'files');
if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR);
}

// 🛠️ إعداد `multer` لرفع الملفات
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, FILES_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// 📌 ملف تخزين بيانات السيارات
const CARS_FILE = path.join(__dirname, 'cars.json');

// 📌 تحميل بيانات السيارات من `cars.json`
const loadCars = () => {
    if (fs.existsSync(CARS_FILE)) {
        return JSON.parse(fs.readFileSync(CARS_FILE, 'utf8'));
    }
    return [];
};

// 📌 حفظ السيارات في `cars.json`
const saveCars = (cars) => {
    fs.writeFileSync(CARS_FILE, JSON.stringify(cars, null, 2));
};

// ✅ **عرض الصفحة الرئيسية**
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ **إرجاع قائمة السيارات**
app.get('/cars', (req, res) => {
    res.json(loadCars());
});

// ✅ **إضافة سيارة جديدة**
app.post('/add-car', upload.fields([{ name: 'image' }, { name: 'pdf' }, { name: 'video' }]), (req, res) => {
    const { name } = req.body;
    if (!name || !req.files.image || !req.files.pdf || !req.files.video) {
        return res.status(400).json({ message: 'جميع البيانات مطلوبة!' });
    }

    let cars = loadCars();
    const newCar = {
        id: Date.now(),
        name,
        image: req.files.image[0].filename,
        pdf: req.files.pdf[0].filename,
        video: req.files.video[0].filename
    };

    cars.push(newCar);
    saveCars(cars);
    res.json({ message: 'تمت إضافة السيارة بنجاح!', car: newCar });
});

// ✅ **حذف سيارة**
app.delete('/delete-car/:id', (req, res) => {
    let cars = loadCars();
    const carId = parseInt(req.params.id);

    const car = cars.find(car => car.id === carId);
    if (!car) {
        return res.status(404).json({ message: 'السيارة غير موجودة!' });
    }

    // حذف الملفات من المجلد
    fs.unlinkSync(path.join(FILES_DIR, car.image));
    fs.unlinkSync(path.join(FILES_DIR, car.pdf));
    fs.unlinkSync(path.join(FILES_DIR, car.video));

    cars = cars.filter(car => car.id !== carId);
    saveCars(cars);

    res.json({ message: 'تم حذف السيارة بنجاح!' });
});

// ✅ **تشغيل السيرفر**
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});