import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [screen, setScreen] = useState('login');
  const [password, setPassword] = useState('');
  const [dbPassword, setDbPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showSettings, setShowSettings] = useState(false); // التحكم في ظهور نافذة الأمن
  
  const [exchangeRate, setExchangeRate] = useState(0); 
  const [quantity, setQuantity] = useState(0); 
  const [unitPrice, setUnitPrice] = useState(0);
  const [contractorName, setContractorName] = useState('');

  const [currentProject, setCurrentProject] = useState({
    projectName: '', customerName: '', receivedAmount: '', expenses: [] 
  });

  useEffect(() => {
    fetchPassword();
    fetchProjects();
  }, []);

  const fetchPassword = () => {
    axios.get('https://al-nashar-backend.onrender.com/api/get-password')
      .then(res => setDbPassword(res.data.password))
      .catch(err => console.log("السيرفر غير متصل"));
  };

  const fetchProjects = () => {
    axios.get('https://al-nashar-backend.onrender.com/api/projects').then(res => setProjects(res.data));
  };

  const handleUpdatePassword = () => {
    if (!newPassword) return alert("يرجى كتابة كلمة السر الجديدة أولاً");
    axios.post('https://al-nashar-backend.onrender.com/api/update-password', { newPassword })
      .then(() => {
        alert("✅ تم تحديث كلمة السر بنجاح!");
        setNewPassword('');
        setShowSettings(false); // إغلاق النافذة بعد النجاح
        fetchPassword();
      })
      .catch(() => alert("❌ فشل التحديث"));
  };

  const handleSaveProject = async () => {
    if (!currentProject.projectName) return alert("يرجى إدخال اسم المشروع على الأقل");
    const projectData = {
      projectName: currentProject.projectName,
      customerName: currentProject.customerName,
      receivedAmount: Number(currentProject.receivedAmount) || 0,
      expenses: currentProject.expenses || []
    };
    try {
      if (editingId) {
        await axios.put(`https://al-nashar-backend.onrender.com/api/project/${editingId}`, projectData);
        alert("✅ تم التعديل بنجاح");
        setEditingId(null);
      } else {
        const newProjectData = { ...projectData, date: new Date().toLocaleDateString('en-GB') };
        await axios.post('https://al-nashar-backend.onrender.com/api/save-project', newProjectData);
        alert("✅ تم الحفظ بنجاح");
      }
      setCurrentProject({ projectName: '', customerName: '', receivedAmount: '', expenses: [] });
      fetchProjects(); 
      setScreen('dashboard');
    } catch (err) {
      alert("❌ فشل العملية.");
    }
  };

  if (screen === 'login') return (
    <div className="login-page">
      <div className="login-overlay">
        <div className="login-frame">
          <h1 className="main-title">تسجيل الدخول</h1>
          <p className="welcome-msg">مرحباً بك في مجموعة النشار المعمارية</p>
          <div className="services-list">تصميم - تنفيذ - ديكور - إكساء</div>
          <div className="double-divider"><div className="line-long"></div><div className="line-short"></div></div>
          <input type="password" placeholder="••••••••" className="password-input-small" onChange={e => setPassword(e.target.value)} />
          <div className="button-wrapper">
            <button className="enter-btn-half" onClick={() => password === dbPassword ? setScreen('dashboard') : alert("كلمة المرور خاطئة!")}>دخول</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (screen === 'dashboard') return (
    <div className="app-container">
      <header className="main-header">
        <h2>لوحة تحكم مجموعة النشار</h2>
        <div className="header-left">
            <button className="settings-btn" onClick={() => setShowSettings(true)}>⚙️</button>
            <button className="logout-btn" onClick={() => setScreen('login')}>تسجيل خروج</button>
        </div>
      </header>

      {/* نافذة أمن النظام المنبثقة */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
             <div className="card security-modal-card">
                <h3>🔐 أمن النظام</h3>
                <div className="horizontal-inputs vertical-mobile">
                    <input type="text" placeholder="كلمة المرور الجديدة" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <button className="primary-btn gold-fixed" onClick={handleUpdatePassword}>تحديث</button>
                </div>
                <button className="cancel-btn full-width" style={{marginTop: '10px'}} onClick={() => setShowSettings(false)}>إغلاق</button>
             </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>{editingId ? "📝 تعديل المشروع" : "➕ إضافة مشروع جديد"}</h3>
        <div className="horizontal-inputs">
          <input type="text" placeholder="اسم المشروع" value={currentProject.projectName} onChange={e => setCurrentProject({...currentProject, projectName: e.target.value})} />
          <input type="text" placeholder="اسم الزبون" value={currentProject.customerName} onChange={e => setCurrentProject({...currentProject, customerName: e.target.value})} />
          <input type="number" placeholder="المبلغ المستلم $" value={currentProject.receivedAmount} onChange={e => setCurrentProject({...currentProject, receivedAmount: e.target.value})} />
        </div>
        <div className="action-btns">
          <button className="primary-btn gold-fixed" onClick={handleSaveProject}>
            {editingId ? "حفظ التعديلات" : "حفظ المشروع"}
          </button>
          {editingId && (
            <button className="cancel-btn" onClick={() => {
                setEditingId(null);
                setCurrentProject({ projectName: '', customerName: '', receivedAmount: '', expenses: [] });
            }}>إلغاء</button>
          )}
        </div>
      </div>

      <div className="card">
        <h3>📂 المشاريع الحالية</h3>
        <table className="modern-table">
          <thead><tr><th>التاريخ</th><th>المشروع</th><th>الزبون</th><th>المبلغ</th><th>إجراءات</th></tr></thead>
          <tbody>
            {projects.slice().reverse().map(p => (
              <tr key={p._id}>
                <td>{p.date}</td><td>{p.projectName}</td><td>{p.customerName}</td><td className="gold-text">{p.receivedAmount} $</td>
                <td className="table-actions">
                  <button className="icon-action-btn edit" onClick={() => {setEditingId(p._id); setCurrentProject(p);}} title="تعديل">🖋️</button>
                  <button className="icon-action-btn delete" onClick={async () => {if(window.confirm("حذف؟")){await axios.delete(`https://al-nashar-backend.onrender.com/api/project/${p._id}`); fetchProjects();}}} title="حذف">🗑️</button>
                  <button className="icon-action-btn money" onClick={() => {setCurrentProject(p); setScreen('expenses');}} title="المصاريف">💰</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // بقية الشاشات (expenses, final) تبقى كما هي دون تغيير في المنطق
  if (screen === 'expenses') return (
    <div className="app-container">
      <header className="main-header">
        <h2>💰 مصاريف: {currentProject.projectName}</h2>
        <button className="back-btn-red" onClick={() => setScreen('dashboard')}>عودة للرئيسية</button>
      </header>

      <div className="card">
        <h3>➕ إضافة مصروف</h3>
        <div className="horizontal-inputs">
          <input style={{flex: 2}} type="text" id="exp-title" placeholder="نوع المصروف" />
          <div className="combined-field" style={{flex: 1.2}}>
            <input type="number" id="exp-amount" placeholder="المبلغ" />
            <select id="exp-currency" className="mini-currency-select">
                <option value="$">$</option>
                <option value="ل.س">ل.س</option>
            </select>
          </div>
          <input style={{flex: 1}} type="text" id="exp-date" placeholder="التاريخ" onFocus={(e)=>e.target.type='date'} onBlur={(e)=>e.target.value===""?e.target.type='text':null} />
        </div>
        <textarea id="exp-note" placeholder="ملاحظات..." className="full-width-input"></textarea>
        <button className="primary-btn gold-fixed" onClick={() => {
          const t = document.getElementById('exp-title').value;
          const a = document.getElementById('exp-amount').value;
          const c = document.getElementById('exp-currency').value;
          const d = document.getElementById('exp-date').value;
          const n = document.getElementById('exp-note').value;
          if(t && a) {
            setCurrentProject({...currentProject, expenses: [...(currentProject.expenses || []), {title:t, amount:a, currency:c, date:d, note:n}]});
            document.getElementById('exp-title').value=''; document.getElementById('exp-amount').value='';
          }
        }}>+ إضافة للجدول </button>
      </div>

      <div className="card">
        <table className="modern-table">
          <thead><tr><th>التاريخ</th><th>النوع</th><th>المبلغ</th><th>ملاحظات</th><th>حذف</th></tr></thead>
          <tbody>
            {(currentProject.expenses || []).map((e, i) => (
              <tr key={i}>
                <td>{e.date}</td><td className="bold">{e.title}</td><td className="gold-text">{e.amount} {e.currency}</td><td>{e.note}</td>
                <td><button className="icon-action-btn delete" onClick={() => {
                  const up = currentProject.expenses.filter((_, idx) => idx !== i);
                  setCurrentProject({...currentProject, expenses: up});
                }}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="summary-section">
          <button className="primary-btn gold-fixed" onClick={() => setScreen('final')}>📊 التقرير النهائي (تصفية)</button>
          <button className="primary-btn gold-fixed" onClick={handleSaveProject}>💾 حفظ كافة البيانات</button>
        </div>
      </div>
    </div>
  );

  if (screen === 'final') {
    const totalExpenses = currentProject.expenses.reduce((a, b) => a + (Number(b.amount) || 0), 0);
    const totalWorkValue = quantity * unitPrice; 
    const remainingAmount = totalWorkValue - totalExpenses;
    const profit = currentProject.receivedAmount - (totalExpenses / (exchangeRate || 1));
    const profitRatio = currentProject.receivedAmount > 0 ? ((profit / currentProject.receivedAmount) * 100).toFixed(1) : 0;

    return (
      <div className="app-container">
        <div className="card printable">
          <h2 className="gold-text">📊 واجهة الحساب النهائي: {currentProject.projectName}</h2>
          <div className="calculation-tool no-print" style={{background: '#000', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px dashed #c5a059'}}>
            <h4 style={{marginTop: 0, color: '#888'}}>🧮 حساب مستحقات:</h4>
            <div className="horizontal-inputs">
              <input type="text" placeholder="اسم الفني" onChange={(e) => setContractorName(e.target.value)} />
              <input type="number" placeholder="الكمية" onChange={(e) => setQuantity(Number(e.target.value))} />
              <input type="number" placeholder="سعر الوحدة" onChange={(e) => setUnitPrice(Number(e.target.value))} />
              <input type="number" placeholder="سعر الصرف" onChange={(e) => setExchangeRate(Number(e.target.value))} />
            </div>
          </div>

          <table className="modern-table">
            <thead>
              <tr><th>البيان</th><th>التفاصيل</th><th>القيمة</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>قيمة عمل ({contractorName || 'الفني'})</td>
                <td>{quantity} وحدة × {unitPrice.toLocaleString()}</td>
                <td className="bold">{totalWorkValue.toLocaleString()}</td>
              </tr>
              <tr>
                <td>إجمالي المصاريف</td>
                <td>المبالغ المسجلة</td>
                <td style={{color: '#ff4d4d'}} className="bold">-{totalExpenses.toLocaleString()}</td>
              </tr>
              <tr style={{background: 'rgba(197, 160, 89, 0.1)'}}>
                <td style={{fontWeight: '900'}}>صافي الذمة المتبقية</td>
                <td className="gold-text">تصفية حساب</td>
                <td className="profit-text" style={{color: remainingAmount > 0 ? '#ff4d4d' : '#2ecc71', fontSize: '1.4rem', fontWeight: '900'}}>
                  {remainingAmount.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td>نسبة الربح</td>
                <td>المبلغ المستلم {currentProject.receivedAmount} $</td>
                <td className="gold-text">{profitRatio}%</td>
              </tr>
            </tbody>
          </table>

          <div className="action-btns no-print" style={{marginTop:'30px'}}>
            <button className="primary-btn gold-fixed" style={{flex: 1}} onClick={() => window.print()}>🖨️ طباعة</button>
            <button className="cancel-btn" style={{flex: 1}} onClick={() => setScreen('expenses')}>رجوع</button>
          </div>
        </div>
      </div>
    );
  }
}
export default App;