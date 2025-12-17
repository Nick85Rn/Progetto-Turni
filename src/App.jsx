import React, { useState, useEffect, useMemo } from 'react';
import { Users, Calendar, Plus, Trash2, Edit3, Clock, ChefHat, Coffee, Utensils, Settings, X, Briefcase, Truck, Gift, Phone, Mail, FileText, Euro, UserCheck, Palette, Tag, StickyNote, TrendingUp, AlertOctagon, CalendarX, Calculator, Plane, ArrowRight } from 'lucide-react';

// --- CONFIGURAZIONE E COSTANTI ---

const ICON_MAP = {
  ChefHat: <ChefHat size={16} />,
  Utensils: <Utensils size={16} />,
  Coffee: <Coffee size={16} />,
  Truck: <Truck size={16} />,
  Gift: <Gift size={16} />,
  Briefcase: <Briefcase size={16} />
};

const COLOR_THEMES = {
  red: { label: 'Rosso', classes: 'bg-red-50 text-red-800 border-red-200' },
  orange: { label: 'Arancio', classes: 'bg-orange-50 text-orange-800 border-orange-200' },
  amber: { label: 'Giallo/Ambra', classes: 'bg-amber-50 text-amber-800 border-amber-200' },
  green: { label: 'Verde', classes: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  teal: { label: 'Turchese', classes: 'bg-teal-50 text-teal-800 border-teal-200' },
  blue: { label: 'Blu', classes: 'bg-blue-50 text-blue-800 border-blue-200' },
  indigo: { label: 'Indaco', classes: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  purple: { label: 'Viola', classes: 'bg-purple-50 text-purple-800 border-purple-200' },
  pink: { label: 'Rosa', classes: 'bg-pink-50 text-pink-800 border-pink-200' },
  slate: { label: 'Grigio', classes: 'bg-slate-50 text-slate-800 border-slate-200' },
};

const CONTRACT_TYPES = [
  { id: 'indeterminato', label: 'Tempo Indeterminato' },
  { id: 'determinato', label: 'Tempo Determinato' },
  { id: 'apprendistato', label: 'Apprendistato' },
  { id: 'chiamata', label: 'A Chiamata (Intermittente)' },
  { id: 'extra', label: 'Prestazione Occasionale (Extra)' }
];

const ABSENCE_TYPES = [
  { id: 'ferie', label: 'Ferie', color: 'bg-green-100 text-green-800', deducts: true },
  { id: 'permesso', label: 'Permesso (ROL)', color: 'bg-yellow-100 text-yellow-800', deducts: true },
  { id: 'malattia', label: 'Malattia', color: 'bg-red-100 text-red-800', deducts: false },
  { id: 'riposo', label: 'Riposo Compensativo', color: 'bg-gray-100 text-gray-800', deducts: false },
];

const INITIAL_TAGS = ['Full-Time', 'Part-Time', 'Studente', 'Senior', 'Apprendista'];

const INITIAL_DEPARTMENTS = [
  { 
    id: 'kitchen', label: 'Cucina', theme: 'red', iconKey: 'ChefHat',
    shifts: [
      { id: 'k_lunch', label: 'Pranzo', start: '10:30', end: '15:00' },
      { id: 'k_dinner', label: 'Cena', start: '17:30', end: '23:30' }
    ]
  },
  { 
    id: 'service', label: 'Sala', theme: 'blue', iconKey: 'Utensils',
    shifts: [
      { id: 's_lunch', label: 'Servizio Pranzo', start: '11:30', end: '15:30' },
      { id: 's_dinner', label: 'Servizio Cena', start: '18:30', end: '00:00' }
    ]
  },
  { 
    id: 'bar', label: 'Bar', theme: 'amber', iconKey: 'Coffee',
    shifts: [
      { id: 'b_aperitif', label: 'Aperitivo', start: '16:00', end: '20:00' },
      { id: 'b_night', label: 'Serale', start: '20:00', end: '02:00' }
    ]
  },
];

const INITIAL_STAFF = [
  { 
    id: 1, 
    name: 'Giovanni Rossi', 
    roles: ['kitchen'], 
    tags: ['Full-Time', 'Senior'],
    maxHours: 40, 
    usedHours: 0,
    email: 'giovanni.r@email.com',
    phone: '+39 333 1234567',
    contractType: 'indeterminato',
    level: '4° Livello',
    grossSalary: 1600,
    hourlyCost: 18.50,
    balanceHours: 160, // Saldo Ferie Iniziale (ore)
    notes: 'Capo Partita.',
    emergencyContact: 'Maria (Moglie)'
  },
  { 
    id: 2, 
    name: 'Laura Bianchi', 
    roles: ['service', 'bar'], 
    tags: ['Part-Time', 'Studente'],
    maxHours: 30, 
    usedHours: 0,
    email: 'laura.b@email.com',
    phone: '+39 333 7654321',
    contractType: 'determinato',
    level: '5° Livello',
    grossSalary: 1200,
    hourlyCost: 14.00,
    balanceHours: 80, // Saldo Ferie Iniziale (ore)
    notes: 'Ha lezione universitaria il martedì.',
    emergencyContact: 'Luigi (Padre)'
  }
];

const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

// --- COMPONENTI UI ---

const WeatherWidget = ({ dayIndex }) => {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=41.9028&longitude=12.4964&daily=weather_code,temperature_2m_max&timezone=Europe%2FRome`)
      .then(res => res.json())
      .then(data => { if (data.daily) setWeather({ code: data.daily.weather_code[dayIndex], max: data.daily.temperature_2m_max[dayIndex] }); })
      .catch(() => {});
  }, [dayIndex]);

  if (!weather) return <div className="h-4 w-4 bg-gray-100 rounded-full mx-auto mt-1"></div>;
  let icon = "☀️"; if (weather.code > 3) icon = "☁️"; if (weather.code > 50) icon = "🌧️";
  return <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1"><span>{icon}</span><span>{Math.round(weather.max)}°</span></div>;
};

const StaffCard = ({ person, onDragStart, departments, onAddAbsence }) => {
  const percentUsed = (person.usedHours / person.maxHours) * 100;
  const isOverworked = percentUsed > 100;
  return (
    <div 
      draggable onDragStart={(e) => onDragStart(e, person)}
      className={`p-2 mb-2 bg-white border rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${isOverworked ? 'border-red-500' : 'border-gray-200'}`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="font-bold text-gray-700 text-xs truncate">{person.name}</span>
        <div className="flex gap-0.5">
          {person.roles.map(rId => {
            const d = departments.find(dep => dep.id === rId);
            if (!d) return null; 
            return <span key={rId} className={`w-2 h-2 rounded-full ${COLOR_THEMES[d.theme].classes.split(' ')[0].replace('bg-', 'bg-')}`} title={d.label}></span>
          })}
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1">
        <div className={`h-1 rounded-full ${isOverworked ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(percentUsed, 100)}%` }}></div>
      </div>
      <div className="flex justify-between items-center mt-1">
         <span className="text-[9px] text-gray-400 bg-gray-50 px-1 rounded border">{person.contractType === 'indeterminato' ? 'IND' : 'DET'}</span>
         <div className="flex items-center gap-2">
            <p className="text-[10px] text-gray-400">{person.usedHours}/{person.maxHours}h</p>
            {/* Pulsante rapido card per malattia improvvisa */}
            <button onClick={(e) => {e.stopPropagation(); onAddAbsence(person)}} className="text-gray-400 hover:text-orange-500 p-0.5 rounded hover:bg-orange-50" title="Segna Assenza">
              <CalendarX size={12}/>
            </button>
         </div>
      </div>
    </div>
  );
};

const DepartmentShiftSlot = ({ dayIndex, dept, shift, assignedStaff, onDrop, onRemove, onAddClick }) => {
  const handleDragOver = (e) => e.preventDefault();
  const themeClasses = COLOR_THEMES[dept.theme].classes; 
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{shift.label}</span>
        <span className="text-[9px] text-gray-400 bg-gray-50 px-1 rounded">{shift.start}-{shift.end}</span>
      </div>
      <div 
        onDragOver={handleDragOver}
        onDrop={(e) => onDrop(e, dayIndex, dept.id, shift.id)}
        className={`min-h-[60px] border border-dashed rounded-lg p-1 transition-colors hover:bg-gray-50 ${themeClasses.replace('text-', 'border-').replace('800', '200')}`}
      >
        {assignedStaff.map((assignment, idx) => (
          <div key={`${assignment.staffId}-${idx}`} className="group relative bg-white border border-gray-100 p-1 mb-1 rounded shadow-sm flex justify-between items-center">
             <span className="text-xs font-medium truncate max-w-[80px]">{assignment.name}</span>
             <button onClick={() => onRemove(dayIndex, dept.id, shift.id, assignment.staffId)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={10}/></button>
          </div>
        ))}
        <button onClick={() => onAddClick(dayIndex, dept.id, shift.id)} className="w-full mt-1 py-1 text-[10px] text-gray-400 hover:text-indigo-600 flex justify-center hover:bg-white rounded transition-colors"><Plus size={12}/></button>
      </div>
    </div>
  );
};

// --- NUOVO MODALE GESTIONE FERIE/PERMESSI ---

const LeaveManagementModal = ({ isOpen, onClose, staffList, onSaveLeave }) => {
  if (!isOpen) return null;

  const [selectedStaffId, setSelectedStaffId] = useState(staffList[0]?.id || '');
  const [leaveType, setLeaveType] = useState('ferie');
  const [dayIndexStart, setDayIndexStart] = useState(0); // Semplificazione: per ora gestiamo giorni della settimana corrente
  const [dayIndexEnd, setDayIndexEnd] = useState(0);
  const [notes, setNotes] = useState('');

  const selectedPerson = staffList.find(s => s.id === parseInt(selectedStaffId));
  const selectedAbsenceType = ABSENCE_TYPES.find(t => t.id === leaveType);

  // Calcolo impatto (Stima: 8 ore al giorno)
  const daysCount = parseInt(dayIndexEnd) - parseInt(dayIndexStart) + 1;
  const hoursToDeduct = daysCount > 0 ? daysCount * 8 : 0;
  
  const currentBalance = selectedPerson?.balanceHours || 0;
  const futureBalance = selectedAbsenceType?.deducts ? currentBalance - hoursToDeduct : currentBalance;

  const handleSubmit = () => {
    if (daysCount <= 0) return alert("La data di fine deve essere dopo o uguale all'inizio.");
    
    // Genera un'assenza per ogni giorno nel range
    const newAbsences = [];
    for (let i = parseInt(dayIndexStart); i <= parseInt(dayIndexEnd); i++) {
        newAbsences.push({
            staffId: parseInt(selectedStaffId),
            dayIndex: i,
            type: leaveType,
            notes: notes
        });
    }
    
    onSaveLeave(newAbsences, selectedAbsenceType?.deducts ? hoursToDeduct : 0, parseInt(selectedStaffId));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
        <div className="bg-orange-50 p-6 border-b border-orange-100 flex justify-between items-center">
           <h3 className="font-bold text-xl text-orange-800 flex items-center gap-2"><Plane size={24}/> Carica Ferie & Permessi</h3>
           <button onClick={onClose} className="p-2 hover:bg-orange-100 rounded-full text-orange-800"><X size={20}/></button>
        </div>
        
        <div className="p-6 space-y-6">
           {/* SELEZIONE DIPENDENTE E SALDO */}
           <div className="grid grid-cols-2 gap-6">
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Seleziona Collaboratore</label>
                 <select value={selectedStaffId} onChange={e => setSelectedStaffId(e.target.value)} className="w-full border p-2.5 rounded-lg font-medium">
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                 <p className="text-xs text-gray-500 uppercase font-bold mb-1">Saldo Ferie Attuale</p>
                 <p className="text-2xl font-bold text-gray-800">{currentBalance} <span className="text-xs font-normal text-gray-400">ore</span></p>
              </div>
           </div>

           <div className="h-px bg-gray-100"></div>

           {/* DETTAGLI RICHIESTA */}
           <div className="space-y-4">
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Tipologia Assenza</label>
                 <div className="flex gap-2 overflow-x-auto pb-1">
                    {ABSENCE_TYPES.map(type => (
                       <button 
                         key={type.id} 
                         onClick={() => setLeaveType(type.id)}
                         className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${leaveType === type.id ? 'ring-2 ring-offset-1 ring-orange-400 ' + type.color : 'bg-white border-gray-200 text-gray-500'}`}
                       >
                         {type.label}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Da (Giorno Settimana)</label>
                    <select value={dayIndexStart} onChange={e => setDayIndexStart(e.target.value)} className="w-full border p-2 rounded-lg">
                       {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">A (Giorno Settimana)</label>
                    <select value={dayIndexEnd} onChange={e => setDayIndexEnd(e.target.value)} className="w-full border p-2 rounded-lg">
                       {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                 </div>
              </div>
              
              <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">Note (Opzionale)</label>
                 <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Es. Visita medica, Viaggio..." className="w-full border p-2 rounded-lg text-sm"/>
              </div>
           </div>

           {/* ANTEPRIMA IMPATTO */}
           <div className={`p-4 rounded-xl border ${selectedAbsenceType?.deducts ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
              <div className="flex items-center justify-between">
                 <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Prima</p>
                    <p className="font-bold text-lg">{currentBalance}h</p>
                 </div>
                 <div className="text-gray-400"><ArrowRight/></div>
                 <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Richiesta</p>
                    <p className={`font-bold text-lg ${selectedAbsenceType?.deducts ? 'text-red-500' : 'text-gray-700'}`}>
                       {selectedAbsenceType?.deducts ? `-${hoursToDeduct}h` : '0h'}
                    </p>
                 </div>
                 <div className="text-gray-400"><ArrowRight/></div>
                 <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Dopo</p>
                    <p className={`font-bold text-lg ${futureBalance < 0 ? 'text-red-600' : 'text-gray-800'}`}>{futureBalance}h</p>
                 </div>
              </div>
              {!selectedAbsenceType?.deducts && <p className="text-[10px] text-center text-green-600 mt-2 font-medium">* La {selectedAbsenceType?.label.toLowerCase()} non scala ore dal saldo ferie.</p>}
           </div>

        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
           <button onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-lg">Annulla</button>
           <button onClick={handleSubmit} className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 shadow-md">Conferma Inserimento</button>
        </div>
      </div>
    </div>
  );
};

// --- ALTRI MODALI (StaffEditor, Selector...) ---
// (Per brevità, li mantengo uguali alla versione 9.0 ma devono essere inclusi nel file finale.
// Qui li riporto per completezza)

const StaffSelectorModal = ({ isOpen, onClose, onSelect, staff, currentAssignedIds, dayIndex, absences }) => {
  if (!isOpen) return null;
  const absentStaffIds = absences.filter(a => a.dayIndex === dayIndex).map(a => a.staffId);
  const availableStaff = staff.filter(s => !currentAssignedIds.includes(s.id) && !absentStaffIds.includes(s.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col max-h-[60vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h3 className="font-bold text-gray-800">Seleziona Personale</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="overflow-y-auto p-2">
          {availableStaff.length === 0 ? <p className="text-center text-gray-400 py-4 text-sm">Nessuno disponibile</p> : 
           availableStaff.map(p => (
            <button key={p.id} onClick={() => onSelect(p)} className="w-full text-left p-3 hover:bg-indigo-50 rounded-lg flex justify-between items-center border-b border-gray-50 last:border-0">
              <span className="font-medium text-gray-700">{p.name}</span>
              <div className="flex gap-2 items-center"><span className="text-xs text-indigo-600 font-bold">€{p.hourlyCost}</span><span className="text-xs text-gray-400">{p.usedHours}h</span></div>
            </button>
           ))
          }
        </div>
      </div>
    </div>
  );
};

const StaffEditorModal = ({ isOpen, onClose, onSave, departments, availableTags, setAvailableTags, initialData }) => {
  if (!isOpen) return null;
  const [formData, setFormData] = useState({
    id: initialData ? initialData.id : Date.now(),
    name: initialData ? initialData.name : '',
    roles: initialData ? initialData.roles : [],
    tags: initialData ? initialData.tags : [],
    email: initialData ? initialData.email : '',
    phone: initialData ? initialData.phone : '',
    contractType: initialData ? initialData.contractType : 'determinato',
    level: initialData ? initialData.level : '',
    grossSalary: initialData ? initialData.grossSalary : '',
    hourlyCost: initialData ? initialData.hourlyCost : '',
    maxHours: initialData ? initialData.maxHours : 40,
    balanceHours: initialData ? initialData.balanceHours : 0, // NEW FIELD
    emergencyContact: initialData ? initialData.emergencyContact : '',
    notes: initialData ? initialData.notes : ''
  });
  const [newTagInput, setNewTagInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const toggleRole = (roleId) => {
    if (formData.roles.includes(roleId)) setFormData(prev => ({ ...prev, roles: prev.roles.filter(id => id !== roleId) }));
    else setFormData(prev => ({ ...prev, roles: [...prev.roles, roleId] }));
  };
  const toggleTag = (tag) => {
    if (formData.tags.includes(tag)) setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    else setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
  };
  const handleAddNewTag = () => {
    if (newTagInput && !availableTags.includes(newTagInput)) {
      setAvailableTags([...availableTags, newTagInput]);
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTagInput] }));
      setNewTagInput('');
    }
  };
  const calculateHourlyCost = () => {
    if (formData.grossSalary && formData.maxHours) {
      const monthlyCost = parseFloat(formData.grossSalary) * 1.35; 
      const monthlyHours = parseFloat(formData.maxHours) * 4.33;
      setFormData(prev => ({ ...prev, hourlyCost: (monthlyCost / monthlyHours).toFixed(2) }));
    }
  };
  const handleSubmit = () => {
    if (!formData.name || formData.roles.length === 0) return alert("Inserisci nome e almeno un reparto");
    onSave({ ...formData, usedHours: initialData ? initialData.usedHours : 0 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2"><UserCheck size={24} className="text-indigo-600"/> {initialData ? 'Modifica Dipendente' : 'Nuova Assunzione'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
        </div>
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Anagrafica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1">Nome e Cognome</label>
              <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="Es. Mario Rossi"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded-lg"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Telefono</label>
              <input name="phone" type="text" value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded-lg"/>
            </div>
          </div>
          <div className="h-px bg-gray-100"></div>
          {/* Contratto & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Briefcase size={14}/> Ruolo & Contratto</h4>
                <div className="space-y-3">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1">Tipologia</label>
                     <select name="contractType" value={formData.contractType} onChange={handleChange} className="w-full border p-2 rounded-lg text-sm">{CONTRACT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1">Ore Settimanali</label>
                     <input name="maxHours" type="number" value={formData.maxHours} onChange={handleChange} className="w-full border p-2 rounded-lg text-sm"/>
                   </div>
                </div>
             </div>
             <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Tag size={14}/> Tag Profilanti</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableTags.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${formData.tags.includes(tag) ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{tag}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                   <input type="text" value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)} placeholder="Nuovo tag..." className="flex-1 border p-1.5 rounded-lg text-xs"/>
                   <button onClick={handleAddNewTag} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 rounded-lg text-xs font-bold">+</button>
                </div>
             </div>
          </div>
          <div className="h-px bg-gray-100"></div>
          {/* Reparti & Economici */}
          <div className="space-y-4">
            <div>
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Reparti</h4>
               <div className="flex flex-wrap gap-2">
                  {departments.map(dept => (
                    <button key={dept.id} onClick={() => toggleRole(dept.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${formData.roles.includes(dept.id) ? 'ring-2 ring-offset-1 ring-indigo-500 ' + COLOR_THEMES[dept.theme].classes : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{ICON_MAP[dept.iconKey]} {dept.label}</button>
                  ))}
               </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg grid grid-cols-3 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Stipendio Lordo (€)</label>
                  <input name="grossSalary" type="number" value={formData.grossSalary} onChange={handleChange} onBlur={calculateHourlyCost} className="w-full border p-1.5 rounded-lg bg-white"/>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Costo Orario (€)</label>
                  <input name="hourlyCost" type="number" step="0.50" value={formData.hourlyCost} onChange={handleChange} className="w-full border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold p-1.5 rounded-lg"/>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Saldo Ferie (h)</label>
                  <input name="balanceHours" type="number" value={formData.balanceHours} onChange={handleChange} className="w-full border border-green-200 bg-green-50 text-green-700 font-bold p-1.5 rounded-lg"/>
               </div>
            </div>
          </div>
          <div className="h-px bg-gray-100"></div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><StickyNote size={14}/> Note & Limitazioni</h4>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full border p-3 rounded-lg text-sm h-24 bg-yellow-50/50 focus:bg-white transition-colors" placeholder="Note..."></textarea>
          </div>
        </div>
        <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl flex gap-3">
           <button onClick={onClose} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-lg">Annulla</button>
           <button onClick={handleSubmit} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Salva</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function RestaurantShiftManager() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [availableTags, setAvailableTags] = useState(INITIAL_TAGS);
  const [newGlobalTag, setNewGlobalTag] = useState('');
  
  // STATI
  const [absences, setAbsences] = useState([]); 
  const [leaveModalOpen, setLeaveModalOpen] = useState(false); // NUOVO MODALE FERIE
  
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState(null);
  const [selectorModal, setSelectorModal] = useState({ isOpen: false, dayIndex: null, deptId: null, shiftId: null });
  
  const [schedule, setSchedule] = useState(() => {
    const initialSchedule = {};
    DAYS.forEach((_, dIdx) => {
      initialSchedule[dIdx] = {};
      INITIAL_DEPARTMENTS.forEach(dept => {
        initialSchedule[dIdx][dept.id] = {};
        dept.shifts.forEach(shift => {
          initialSchedule[dIdx][dept.id][shift.id] = [];
        });
      });
    });
    return initialSchedule;
  });

  const totalWeeklyCost = useMemo(() => {
    let total = 0;
    staff.forEach(person => {
      if(person.hourlyCost && person.usedHours) total += (parseFloat(person.hourlyCost) * parseFloat(person.usedHours));
    });
    return total;
  }, [staff]);

  useEffect(() => {
    const newStaff = staff.map(person => {
      let count = 0;
      Object.keys(schedule).forEach(dIdx => {
        Object.keys(schedule[dIdx]).forEach(deptId => {
           if (!schedule[dIdx][deptId]) return;
           Object.keys(schedule[dIdx][deptId]).forEach(shiftId => {
             const assignments = schedule[dIdx][deptId][shiftId];
             if (assignments.find(a => a.staffId === person.id)) {
                const dept = departments.find(d => d.id === deptId);
                const shift = dept?.shifts.find(s => s.id === shiftId);
                if (shift) {
                  let startH = parseInt(shift.start.split(':')[0]);
                  let endH = parseInt(shift.end.split(':')[0]);
                  let duration = endH - startH;
                  if (duration < 0) duration += 24;
                  count += duration;
                }
             }
           });
        });
      });
      return { ...person, usedHours: count };
    });
    if (JSON.stringify(newStaff) !== JSON.stringify(staff)) setStaff(newStaff);
  }, [schedule, departments]);

  const handleDrop = (e, dayIndex, deptId, shiftId) => {
    e.preventDefault();
    const personId = parseInt(e.dataTransfer.getData('personId'));
    const person = staff.find(p => p.id === personId);
    if (!person) return;
    if(absences.find(a => a.staffId === person.id && a.dayIndex === dayIndex)) {
      alert(`${person.name} è assente in questo giorno!`);
      return;
    }
    addStaffToShift(dayIndex, deptId, shiftId, person);
  };

  const addStaffToShift = (dayIndex, deptId, shiftId, person) => {
    const currentShift = schedule[dayIndex]?.[deptId]?.[shiftId] || [];
    if (!currentShift.find(x => x.staffId === person.id)) {
      const newSchedule = { ...schedule };
      if (!newSchedule[dayIndex]) newSchedule[dayIndex] = {};
      if (!newSchedule[dayIndex][deptId]) newSchedule[dayIndex][deptId] = {};
      if (!newSchedule[dayIndex][deptId][shiftId]) newSchedule[dayIndex][deptId][shiftId] = [];
      newSchedule[dayIndex][deptId][shiftId] = [...currentShift, { staffId: person.id, name: person.name }];
      setSchedule(newSchedule);
    }
  };

  const handleRemove = (dayIndex, deptId, shiftId, personId) => {
    const newSchedule = { ...schedule };
    newSchedule[dayIndex][deptId][shiftId] = newSchedule[dayIndex][deptId][shiftId].filter(x => x.staffId !== personId);
    setSchedule(newSchedule);
  };

  const handleSaveStaff = (personData) => {
    if (staff.find(s => s.id === personData.id)) setStaff(staff.map(s => s.id === personData.id ? personData : s));
    else setStaff([...staff, personData]);
  };

  const handleDeleteStaff = (id) => {
    if(confirm("Eliminare questo dipendente?")) setStaff(staff.filter(s => s.id !== id));
  };

  // --- SETTINGS LOGIC (Stesso codice precedente) ---
  const addDepartment = () => {
    const name = prompt("Nome nuovo reparto (es. Delivery):");
    if (!name) return;
    const newId = name.toLowerCase().replace(/\s/g, '_') + '_' + Date.now();
    const newDept = { id: newId, label: name, theme: 'slate', iconKey: 'Briefcase', shifts: [] };
    setDepartments([...departments, newDept]);
    const newSchedule = { ...schedule };
    DAYS.forEach((_, dIdx) => { if (!newSchedule[dIdx][newId]) newSchedule[dIdx][newId] = {}; });
    setSchedule(newSchedule);
  };
  const deleteDepartment = (deptId) => {
    if(!confirm("Sicuro di voler eliminare questo reparto?")) return;
    setDepartments(departments.filter(d => d.id !== deptId));
  };
  const addShiftToDept = (deptId) => {
    const label = prompt("Nome Turno (es. Colazione):");
    if (!label) return;
    const start = prompt("Ora Inizio (HH:MM):", "08:00");
    const end = prompt("Ora Fine (HH:MM):", "12:00");
    setDepartments(departments.map(d => { if (d.id === deptId) return { ...d, shifts: [...d.shifts, { id: Date.now().toString(), label, start, end }] }; return d; }));
  };
  const removeShiftFromDept = (deptId, shiftId) => {
    if(!confirm("Eliminare questo turno?")) return;
    setDepartments(departments.map(d => { if(d.id === deptId) return { ...d, shifts: d.shifts.filter(s => s.id !== shiftId)}; return d; }));
  };
  const changeDeptTheme = (deptId, themeKey) => { setDepartments(departments.map(d => d.id === deptId ? { ...d, theme: themeKey } : d)); };
  const addGlobalTag = () => { if(newGlobalTag && !availableTags.includes(newGlobalTag)) { setAvailableTags([...availableTags, newGlobalTag]); setNewGlobalTag(''); } };
  const removeGlobalTag = (tag) => { if(confirm(`Eliminare il tag "${tag}"?`)) { setAvailableTags(availableTags.filter(t => t !== tag)); } };
  
  const handleAddClick = (dayIndex, deptId, shiftId) => { setSelectorModal({ isOpen: true, dayIndex, deptId, shiftId }); };
  const handleSelectorSelect = (person) => { addStaffToShift(selectorModal.dayIndex, selectorModal.deptId, selectorModal.shiftId, person); setSelectorModal({ isOpen: false, dayIndex: null, deptId: null, shiftId: null }); };

  // --- LOGICA SALVATAGGIO FERIE ---
  const handleSaveLeave = (newAbsences, deductedHours, staffId) => {
    // 1. Aggiungi le assenze al calendario
    setAbsences(prev => [...prev, ...newAbsences]);
    
    // 2. Aggiorna il saldo ferie del dipendente se necessario
    if (deductedHours > 0) {
        setStaff(staff.map(s => {
            if (s.id === staffId) {
                return { ...s, balanceHours: s.balanceHours - deductedHours };
            }
            return s;
        }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white"><Calendar size={20} /></div>
            <div><h1 className="text-lg font-bold leading-none">Gestore Turni Pro</h1><p className="text-[10px] text-gray-500">v10.0 - Leave Management</p></div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* WIDGET BUDGET */}
            <div className="hidden md:flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg">
                <TrendingUp size={16} className="text-indigo-600"/>
                <div>
                   <p className="text-[10px] font-bold text-indigo-400 uppercase leading-none">Budget Settimanale</p>
                   <p className="text-sm font-bold text-indigo-700 leading-none">€ {totalWeeklyCost.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            {/* NUOVO BOTTONE GESTIONE FERIE */}
            <button onClick={() => setLeaveModalOpen(true)} className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors border border-orange-200">
               <Plane size={16}/> <span className="hidden sm:inline">Gestione Ferie</span>
            </button>

            <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
              {['calendar', 'staff', 'settings'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>
                  {tab === 'calendar' && <Calendar size={14}/>}
                  {tab === 'staff' && <Users size={14}/>}
                  {tab === 'settings' && <Settings size={14}/>}
                  <span className="capitalize">{tab === 'calendar' ? 'Turni' : tab === 'staff' ? 'Brigata' : 'Config'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 md:px-4 py-6">
        
        {activeTab === 'calendar' && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="hidden lg:block lg:w-1/6">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 sticky top-28 max-h-[85vh] overflow-y-auto">
                <h2 className="text-xs font-bold text-gray-400 uppercase mb-3">Brigata & Assenze</h2>
                {staff.map(person => (
                  <StaffCard 
                    key={person.id} 
                    person={person} 
                    departments={departments} 
                    onDragStart={(e, p) => e.dataTransfer.setData('personId', p.id)} 
                    // Scorciatoia rapida da card (opzionale, apre lo stesso modale)
                    onAddAbsence={() => setLeaveModalOpen(true)} 
                  />
                ))}
              </div>
            </div>
            <div className="w-full lg:w-5/6 overflow-x-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-w-[1000px]">
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  {DAYS.map((day, i) => (
                    <div key={day} className="p-3 border-r border-gray-200 text-center last:border-r-0 relative">
                      <div className="font-bold text-gray-800 text-sm">{day}</div>
                      <WeatherWidget dayIndex={i} />
                      {/* INDICATORE ASSENZE NEL Giorno */}
                      {absences.filter(a => a.dayIndex === i).length > 0 && (
                        <div className="mt-1 flex flex-wrap justify-center gap-1">
                          {absences.filter(a => a.dayIndex === i).map((abs, idx) => (
                            <span key={idx} className={`text-[9px] px-1 rounded ${ABSENCE_TYPES.find(t=>t.id===abs.type)?.color} border border-transparent`}>
                               {staff.find(s=>s.id===abs.staffId)?.name.split(' ')[0]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 divide-x divide-gray-200">
                  {DAYS.map((_, dayIndex) => (
                    <div key={dayIndex} className="p-2 space-y-4 bg-white relative">
                      {departments.map(dept => (
                        <div key={dept.id} className="relative">
                          <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 px-2 py-1 rounded ${COLOR_THEMES[dept.theme].classes} flex items-center gap-1`}>
                            {ICON_MAP[dept.iconKey]} {dept.label}
                          </div>
                          <div className="space-y-2 pl-1 border-l-2 border-gray-100">
                            {dept.shifts.map(shift => (
                              <DepartmentShiftSlot 
                                key={shift.id}
                                dayIndex={dayIndex}
                                dept={dept}
                                shift={shift}
                                assignedStaff={schedule[dayIndex]?.[dept.id]?.[shift.id] || []}
                                onDrop={handleDrop}
                                onRemove={handleRemove}
                                onAddClick={handleAddClick}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAFF E SETTINGS SONO INVARIATI, MA USANO I NUOVI CAMPI AGGIUNTI */}
        {activeTab === 'staff' && (
          <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div><h2 className="font-bold text-lg text-gray-800">Gestione Brigata (HRM)</h2></div>
              <button onClick={() => { setStaffToEdit(null); setStaffModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-sm"><Plus size={16}/> Aggiungi Membro</button>
            </div>
            <div className="divide-y divide-gray-100">
              {staff.map(person => (
                <div key={person.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">{person.name.charAt(0)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                         <p className="font-bold text-gray-900">{person.name}</p>
                         <span className="text-[10px] bg-gray-100 px-2 rounded-full border border-gray-200 text-gray-500 uppercase">{person.contractType || 'N/D'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">{person.roles.map(rId => { const d = departments.find(dep => dep.id === rId); return d ? <span key={rId} className={`text-[10px] px-2 py-0.5 rounded-full border ${COLOR_THEMES[d.theme].classes.replace('text-', 'border-').replace('800', '200')}`}>{d.label}</span> : null })}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                         {person.tags?.map(tag => <span key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 rounded border">{tag}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 justify-end">
                    <div className="text-right">
                       <p className="text-xs text-gray-400 uppercase font-bold mb-0.5">Ferie Residue</p>
                       <p className="text-sm font-bold text-green-600">{person.balanceHours}h</p>
                    </div>
                    <div className="text-right border-l pl-4 border-gray-100">
                       <p className="text-xs text-gray-400 uppercase font-bold mb-0.5">Costo Orario</p>
                       <p className="text-sm font-bold text-indigo-600">€ {person.hourlyCost || '0.00'}/h</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => { setStaffToEdit(person); setStaffModalOpen(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit3 size={18}/></button>
                       <button onClick={() => handleDeleteStaff(person.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS (omesso codice ripetitivo, uguale a v9.0) */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Tag className="text-gray-600"/> Gestione Tag Profilanti</h2>
               <div className="flex gap-2 mb-4">
                  <input type="text" value={newGlobalTag} onChange={(e) => setNewGlobalTag(e.target.value)} className="border p-2 rounded-lg text-sm flex-1" placeholder="Nuovo Tag..."/>
                  <button onClick={addGlobalTag} className="bg-slate-800 text-white px-4 rounded-lg text-sm font-bold">Aggiungi</button>
               </div>
               <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                     <div key={tag} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-sm text-slate-700">
                        <span>{tag}</span>
                        <button onClick={() => removeGlobalTag(tag)} className="text-slate-400 hover:text-red-500"><X size={14}/></button>
                     </div>
                  ))}
               </div>
            </div>
            {/* ... Reparti (identico a v9.0) ... */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><Settings className="text-gray-600"/> Configurazione Reparti</h2>
                <button onClick={addDepartment} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"><Plus size={16}/> Crea Reparto</button>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {departments.map(dept => (
                  <div key={dept.id} className="border border-gray-200 rounded-xl overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                    <div className={`p-4 border-b border-gray-100 flex items-center justify-between ${COLOR_THEMES[dept.theme].classes.replace('text-', 'bg-').replace('800', '50')}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-white shadow-sm text-gray-700`}>{ICON_MAP[dept.iconKey]}</div>
                        <h3 className="font-bold text-gray-800">{dept.label}</h3>
                      </div>
                      <button onClick={() => deleteDepartment(dept.id)} className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-white"><Trash2 size={16}/></button>
                    </div>
                    <div className="p-3 bg-white border-b border-gray-100 flex items-center gap-2">
                      <Palette size={14} className="text-gray-400"/>
                      <select value={dept.theme} onChange={(e) => changeDeptTheme(dept.id, e.target.value)} className="text-xs border-none bg-transparent font-medium text-gray-600 focus:ring-0 cursor-pointer w-full">
                        {Object.entries(COLOR_THEMES).map(([key, theme]) => (<option key={key} value={key}>{theme.label}</option>))}
                      </select>
                    </div>
                    <div className="p-4 flex-1 bg-gray-50">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Turni Attivi</h4>
                      <div className="space-y-2">
                        {dept.shifts.map(shift => (
                          <div key={shift.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border border-gray-100">
                            <div><div className="text-sm font-bold text-gray-700">{shift.label}</div><div className="text-xs text-gray-400 font-mono">{shift.start} - {shift.end}</div></div>
                            <button onClick={() => removeShiftFromDept(dept.id, shift.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14}/></button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => addShiftToDept(dept.id)} className="mt-4 w-full py-2 border border-dashed border-gray-300 rounded text-xs font-bold text-gray-500 hover:bg-white hover:text-indigo-600 flex items-center justify-center gap-2"><Plus size={14}/> Aggiungi Turno</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <StaffEditorModal isOpen={staffModalOpen} onClose={() => setStaffModalOpen(false)} onSave={handleSaveStaff} departments={departments} availableTags={availableTags} setAvailableTags={setAvailableTags} initialData={staffToEdit} />
      
      <StaffSelectorModal 
        isOpen={selectorModal.isOpen} 
        staff={staff}
        currentAssignedIds={selectorModal.dayIndex !== null ? schedule[selectorModal.dayIndex][selectorModal.deptId][selectorModal.shiftId].map(x => x.staffId) : []}
        dayIndex={selectorModal.dayIndex}
        absences={absences}
        onClose={() => setSelectorModal({ isOpen: false, dayIndex: null, deptId: null, shiftId: null })}
        onSelect={handleSelectorSelect}
      />

      {/* NUOVO MODALE GESTIONE FERIE */}
      <LeaveManagementModal 
         isOpen={leaveModalOpen}
         onClose={() => setLeaveModalOpen(false)}
         staffList={staff}
         onSaveLeave={handleSaveLeave}
      />
    </div>
  );
}