const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // استبدال nedb بـ mongoose
const path = require('path');
require('dotenv').config(); // لحماية رابط قاعدة البيانات

const app = express();
app.use(express.json());
app.use(cors());

// --- الربط مع قاعدة البيانات العالمية (MongoDB Atlas) ---
// الرابط سيتم وضعه في ملف اسمه .env لحماية كلمة سرك
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:zainab123@cluster0.fn68ztm.mongodb.net/alNasharDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ متصل بقاعدة البيانات العالمية MongoDB"))
    .catch(err => console.error("❌ فشل الاتصال بالقاعدة:", err));

// --- تعريف هيكلية البيانات (Schemas) ---
const projectSchema = new mongoose.Schema({
    projectName: String,
    customerName: String,
    receivedAmount: Number,
    expenses: Array,
    date: String,
    createdAt: { type: Date, default: Date.now }
});

const settingSchema = new mongoose.Schema({
    key: String,
    value: String
});

const Project = mongoose.model('Project', projectSchema);
const Setting = mongoose.model('Setting', settingSchema);

// --- المسارات (APIs) ---

// 1. تسجيل الدخول
app.post('/api/login', async (req, res) => {
    try {
        const { password } = req.body;
        const pwRecord = await Setting.findOne({ key: 'admin_password' });
        const correctPassword = pwRecord ? pwRecord.value : 'admin';
        if (password === correctPassword) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: "كلمة السر خاطئة" });
        }
    } catch (err) { res.status(500).send(err); }
});

// 2. جلب المشاريع
app.get('/api/projects', async (req, res) => {
    try {
        const allProjects = await Project.find().sort({ createdAt: -1 });
        res.json(allProjects);
    } catch (err) { res.status(500).send(err); }
});

// 3. إضافة مشروع
app.post('/api/save-project', async (req, res) => {
    try {
        const newProject = new Project(req.body);
        await newProject.save();
        res.json({ success: true, project: newProject });
    } catch (err) { res.status(500).send(err); }
});

// 4. تعديل مشروع
app.put('/api/project/:id', async (req, res) => {
    try {
        await Project.findByIdAndUpdate(req.params.id, req.body);
        res.json({ success: true });
    } catch (err) { res.status(500).send(err); }
});

// 5. حذف مشروع
app.delete('/api/project/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).send(err); }
});

// 6. إدارة كلمة السر
app.post('/api/update-password', async (req, res) => {
    try {
        await Setting.findOneAndUpdate({ key: 'admin_password' }, { value: req.body.newPassword }, { upsert: true });
        res.json({ success: true });
    } catch (err) { res.status(500).send(err); }
});

app.get('/api/get-password', async (req, res) => {
    try {
        const pwRecord = await Setting.findOne({ key: 'admin_password' });
        res.json({ password: pwRecord ? pwRecord.value : 'admin' });
    } catch (err) { res.status(500).send(err); }
});

// --- تشغيل السيرفر للبث العالمي ---
// استخدام process.env.PORT ضروري جداً لموقع Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل الآن على البورت: ${PORT}`);
});