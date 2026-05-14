'use client';

import { useEffect, useState, useRef } from 'react'
import { getTableData, updateTableRow } from '../services/api'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    FileText, 
    FileSpreadsheet,
    Loader2, 
    AlertCircle, 
    Check, 
    Save, 
    Search, 
    Lock, 
    Plus, 
    ChevronLeft, 
    ChevronRight, 
    X, 
    Camera, 
    Image as ImageIcon,
    Download,
    MessageSquare,
    Pencil
} from 'lucide-react'
import { exportToExcel, exportToPDF } from '@/services/export'
import { useAuth } from '../hooks/use-auth'
import { cn } from '@/lib/utils'

function InspectionTable({ tableName, vesselId, vesselName }) {
    const { user } = useAuth()
    const [rows, setRows] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [savingRowId, setSavingRowId] = useState(null)
    const [error, setError] = useState(null)
    const [editData, setEditData] = useState({})
    const [isAdding, setIsAdding] = useState(false)
    const [newRow, setNewRow] = useState({ s_no: '', requirements: '', rule_ref: '', ans: 'EMPTY', comments: '', image: '' })
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [selectedRowForImage, setSelectedRowForImage] = useState(null)
    const [tempImageUrl, setTempImageUrl] = useState('')
    const [isSavingNew, setIsSavingNew] = useState(false)
    const [isSavingAll, setIsSavingAll] = useState(false)

    // Camera state
    const [isCameraActive, setIsCameraActive] = useState(false)
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const [stream, setStream] = useState(null)

    const isEditable = ['ADMIN', 'SUPERINTENDENT', 'USER'].includes(user?.role)

    useEffect(() => {
        async function loadData() {
            if (!tableName) return;
            
            try {
                setIsLoading(true);
                setError(null);
                
                console.log(`Loading data for table: ${tableName}, vessel: ${vesselId}`);
                
                let data, error;
                
                // Primary: Fetch via Supabase Client
                try {
                    let query = supabase.from(tableName).select('*');
                    
                    if (vesselId && vesselId !== 'null' && vesselId !== '') {
                        query = query.eq('vessel_id', vesselId);
                    } else {
                        query = query.is('vessel_id', null);
                    }

                    const result = await query.order('id', { ascending: true });
                    data = result.data;
                    error = result.error;
                } catch (clientErr) {
                    console.error('Supabase client fetch failed, trying legacy API...', clientErr);
                    // Fallback: Try the legacy API service
                    try {
                        data = await getTableData(tableName, { vessel_id: vesselId });
                    } catch (apiErr) {
                        throw apiErr;
                    }
                }

                if (error) throw error;

                // If no records found for this vessel, try fetching template records (vessel_id is null)
                if ((!data || data.length === 0) && vesselId) {
                    console.log('No vessel-specific data, fetching templates...');
                    const { data: templateData, error: templateError } = await supabase
                        .from(tableName)
                        .select('*')
                        .is('vessel_id', null)
                        .order('id', { ascending: true });
                    
                    if (!templateError && templateData && templateData.length > 0) {
                        data = templateData;
                    }
                }

                setRows(data || []);
            } catch (err) {
                console.error(`Error loading table ${tableName}:`, err);
                setError(`Database Connection Error: ${err.message || 'Failed to connect'}. Please ensure you are logged in.`);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [tableName, vesselId]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsCameraActive(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please ensure you have given permission.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg');
            setTempImageUrl(imageData);
            stopCamera();
        }
    };

    const handleEditChange = (id, field, value) => {
        setEditData(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }))
    }

    const handleSaveAll = async () => {
        const changedIds = Object.keys(editData)
        if (changedIds.length === 0) return

        try {
            setIsSavingAll(true)
            await Promise.all(changedIds.map(async (id) => {
                const { error } = await supabase
                    .from(tableName)
                    .update(editData[id])
                    .eq('id', id);
                if (error) throw error;
            }))
            
            setRows(prev => prev.map(row => 
                editData[row.id] ? { ...row, ...editData[row.id] } : row
            ))
            
            setEditData({})
            alert('All changes saved successfully!')
        } catch (err) {
            console.error('Failed to save all changes:', err)
            alert('Failed to save some changes.')
        } finally {
            setIsSavingAll(false)
        }
    }

    const handleSave = async (id) => {
        const updates = editData[id]
        if (!updates) return

        try {
            setSavingRowId(id)
            const { error } = await supabase
                .from(tableName)
                .update(updates)
                .eq('id', id);
            
            if (error) throw error;
            
            setRows(prev => prev.map(row => 
                row.id === id ? { ...row, ...updates } : row
            ))
            
            const newEditData = { ...editData }
            delete newEditData[id]
            setEditData(newEditData)
            
            alert('Record updated successfully!')
        } catch (err) {
            console.error('Failed to update record:', err)
            alert('Failed to save changes.')
        } finally {
            setSavingRowId(null)
        }
    }

    const handleAddRow = async (e) => {
        e.preventDefault()
        try {
            setIsSavingNew(true)
            const { data, error } = await supabase
                .from(tableName)
                .insert([{ 
                    ...newRow, 
                    vessel_id: vesselId,
                    company_id: user?.company_id 
                }])
                .select()

            if (error) throw error
            
            setRows(prev => [...prev, data[0]])
            setIsAdding(false)
            setNewRow({ s_no: '', requirements: '', rule_ref: '', ans: 'EMPTY', comments: '' })
            alert('New record added successfully!')
        } catch (err) {
            console.error('Failed to add record:', err)
            alert(`Error: ${err.message}`)
        } finally {
            setIsSavingNew(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading Technical Registry...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-12 text-center bg-red-500/5 rounded-xl border border-red-500/10">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-card rounded-xl overflow-hidden shadow-2xl border border-border relative">
            {/* PERMANENT ACTION BAR */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-secondary/50">
                <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <span className="text-[0.625rem] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-white/50">
                        Technical Registry: <span className="text-foreground dark:text-white">{tableName.split('_').join(' ')}</span>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 mr-4 border-r border-border pr-4">
                        <button 
                            onClick={() => exportToPDF(rows, `${vesselName || 'Fleet'} - ${tableName.split('_').join(' ')}`, `${vesselName || 'fleet'}_${tableName}`)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-red-500/10 rounded-xl text-red-500 transition-all border border-transparent hover:border-red-500/20 group/pdf"
                            title="Export PDF"
                        >
                            <FileText className="w-4 h-4 group-hover/pdf:scale-110 transition-transform" />
                            <span className="text-[11px] font-black uppercase tracking-widest">PDF</span>
                        </button>
                        <button 
                            onClick={() => exportToExcel(rows, `${vesselName || 'fleet'}_${tableName}`)}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-emerald-500/10 rounded-xl text-emerald-500 transition-all border border-transparent hover:border-emerald-500/20 group/excel"
                            title="Export Excel"
                        >
                            <FileSpreadsheet className="w-4 h-4 group-hover/excel:scale-110 transition-transform" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Excel</span>
                        </button>
                    </div>

                    <button 
                        onClick={handleSaveAll}
                        disabled={isSavingAll || Object.keys(editData).length === 0}
                        className={cn(
                            "px-6 py-2 rounded-full text-[0.625rem] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                            Object.keys(editData).length > 0 
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600" 
                                : "bg-secondary dark:bg-white/5 text-muted-foreground dark:text-white/40 cursor-not-allowed border border-border"
                        )}
                    >
                        {isSavingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-secondary/50 border-b border-border">
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-16 text-center">ID</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-20">S/NO</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-[350px]">RULE_REF</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">REQUIREMENTS</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-32">ANS</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-48">COMMENTS</th>
                            <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-20 text-center">IMAGE</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {rows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-8 py-20 text-center text-muted-foreground font-black uppercase italic opacity-30">
                                    No records found in this module.
                                </td>
                            </tr>
                        ) : (
                            rows.map((row) => (
                                <tr key={row.id} className="group hover:bg-secondary/20 transition-all">
                                    <td className="px-4 py-4 text-center font-bold text-xs text-muted-foreground">{row.id}</td>
                                    <td className="px-4 py-4 font-bold text-xs text-foreground uppercase">{row.s_no || row.item_no || '-'}</td>
                                    <td className="px-4 py-4">
                                        <span className="text-xs font-bold text-muted-foreground">{row.rule_ref || '-'}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        {isEditable ? (
                                            <div className="relative group/edit">
                                                <textarea
                                                    value={editData[row.id]?.requirements !== undefined ? editData[row.id].requirements : (row.requirements || '')}
                                                    onChange={(e) => {
                                                        handleEditChange(row.id, 'requirements', e.target.value);
                                                        e.target.style.height = 'auto';
                                                        e.target.style.height = e.target.scrollHeight + 'px';
                                                    }}
                                                    className="w-full bg-transparent text-xs font-bold text-foreground uppercase tracking-tight outline-none resize-none h-auto overflow-hidden border-b border-transparent group-hover/edit:border-accent/30 focus:border-accent transition-all pr-6"
                                                    placeholder="Edit Requirement..."
                                                />
                                                <Pencil className="absolute right-0 top-2 w-2.5 h-2.5 text-muted-foreground opacity-0 group-hover/edit:opacity-50 transition-opacity pointer-events-none" />
                                            </div>
                                        ) : (
                                            <p className="text-xs font-bold text-foreground uppercase leading-relaxed">
                                                {row.requirements}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {isEditable ? (
                                            <select
                                                value={editData[row.id]?.ans || row.ans || 'EMPTY'}
                                                onChange={(e) => handleEditChange(row.id, 'ans', e.target.value)}
                                                className={cn(
                                                    "w-full bg-transparent text-xs font-black uppercase outline-none cursor-pointer appearance-none",
                                                    (editData[row.id]?.ans || row.ans || 'EMPTY') === 'EMPTY' ? 'text-muted-foreground' : 'text-accent'
                                                )}
                                            >
                                                <option value="EMPTY">EMPTY</option>
                                                <option value="YES">YES</option>
                                                <option value="NO">NO</option>
                                                <option value="N/A">N/A</option>
                                            </select>
                                        ) : (
                                            <span className="text-xs font-black uppercase text-accent">{row.ans || 'EMPTY'}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {isEditable ? (
                                            <input 
                                                type="text"
                                                value={editData[row.id]?.comments || row.comments || ''}
                                                onChange={(e) => handleEditChange(row.id, 'comments', e.target.value)}
                                                placeholder="EMPTY"
                                                className="w-full bg-transparent text-xs font-bold text-foreground outline-none placeholder:opacity-30"
                                            />
                                        ) : (
                                            <span className="text-xs font-bold text-muted-foreground italic">{row.comments || 'EMPTY'}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <button 
                                            onClick={() => {
                                                setSelectedRowForImage(row.id);
                                                setTempImageUrl(row.image || '');
                                                setIsImageModalOpen(true);
                                            }}
                                            className={cn(
                                                "p-2 rounded-lg transition-all",
                                                row.image ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground hover:bg-secondary"
                                            )}
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* SUPABASE STYLE FOOTER */}
            <div className="h-10 border-t border-border flex items-center justify-between px-4 bg-secondary/30 text-[0.625rem] font-black uppercase tracking-widest text-slate-600 dark:text-white/80">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4 cursor-pointer hover:text-accent transition-colors text-slate-700 dark:text-white/60" />
                        <span className="text-slate-900 dark:text-white">Page 1 of 1</span>
                        <ChevronRight className="w-4 h-4 cursor-pointer hover:text-accent transition-colors text-slate-700 dark:text-white/60" />
                    </div>
                    <div className="flex items-center gap-2 border-l border-border pl-6">
                        <span className="text-slate-900 dark:text-white">{rows.length} records</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Save moved to top right for better visibility */}
                </div>
            </div>

            {/* INSERT MODAL - LIKE SUPABASE */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-[40px] p-10 w-full max-w-xl shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Insert into {tableName}</h2>
                                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>

                            <form onSubmit={handleAddRow} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[0.625rem] font-black uppercase text-slate-400 ml-2">Serial No</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={newRow.s_no}
                                            onChange={(e) => setNewRow({...newRow, s_no: e.target.value})}
                                            className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[0.625rem] font-black uppercase text-slate-400 ml-2">Rule Reference</label>
                                        <input 
                                            type="text"
                                            value={newRow.rule_ref}
                                            onChange={(e) => setNewRow({...newRow, rule_ref: e.target.value})}
                                            className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[0.625rem] font-black uppercase text-slate-400 ml-2">Requirement</label>
                                    <textarea 
                                        required
                                        rows={2}
                                        value={newRow.requirements}
                                        onChange={(e) => setNewRow({...newRow, requirements: e.target.value})}
                                        className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-sm"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[0.625rem] font-black uppercase text-slate-400 ml-2">Reference Image URL</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input 
                                            type="text"
                                            placeholder="https://example.com/image.jpg"
                                            value={newRow.image}
                                            onChange={(e) => setNewRow({...newRow, image: e.target.value})}
                                            className="w-full pl-12 pr-5 py-3 bg-slate-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isSavingNew}
                                        className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                    >
                                        {isSavingNew ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Insert Row
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* IMAGE UPDATE MODAL */}
            <AnimatePresence>
                {isImageModalOpen && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-[40px] p-10 w-full max-w-lg shadow-2xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                                    <Camera className="w-6 h-6 text-emerald-500" />
                                    Technical Evidence Capture
                                </h2>
                                <button 
                                    onClick={() => {
                                        stopCamera();
                                        setIsImageModalOpen(false);
                                    }}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"
                                >
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>
                            <div className="space-y-8">
                                <div className="aspect-video bg-slate-100 dark:bg-white/5 rounded-[32px] overflow-hidden relative border-2 border-dashed border-slate-200 dark:border-white/10 group">
                                    {isCameraActive ? (
                                        <video 
                                            ref={videoRef} 
                                            autoPlay 
                                            playsInline 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : tempImageUrl ? (
                                        <img src={tempImageUrl} className="w-full h-full object-cover" alt="Captured" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
                                            <ImageIcon className="w-16 h-16 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">No visual evidence selected</p>
                                        </div>
                                    )}
                                    
                                    {isCameraActive && (
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                                            <button 
                                                onClick={capturePhoto}
                                                className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                                            >
                                                Capture Photo
                                            </button>
                                            <button 
                                                onClick={stopCamera}
                                                className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <canvas ref={canvasRef} className="hidden" />

                                {!isCameraActive && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={startCamera}
                                            className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-[32px] transition-all border border-transparent hover:border-emerald-500/20 group"
                                        >
                                            <Camera className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Live Camera</span>
                                        </button>
                                        <div className="relative">
                                            <button 
                                                onClick={() => document.getElementById('image-input-hidden')?.click()}
                                                className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-white/5 hover:bg-blue-500/10 hover:text-blue-500 rounded-[32px] transition-all border border-transparent hover:border-blue-500/20 group"
                                            >
                                                <ImageIcon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Upload File</span>
                                            </button>
                                            <input 
                                                id="image-input-hidden"
                                                type="file" 
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setTempImageUrl(reader.result);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        onClick={() => {
                                            stopCamera();
                                            setIsImageModalOpen(false);
                                        }}
                                        className="flex-1 py-5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Close
                                    </button>
                                    <button 
                                        disabled={!tempImageUrl}
                                        onClick={async () => {
                                            try {
                                                if (selectedRowForImage) {
                                                    await updateTableRow(tableName, selectedRowForImage, { image: tempImageUrl })
                                                    setRows(prev => prev.map(r => r.id === selectedRowForImage ? { ...r, image: tempImageUrl } : r))
                                                }
                                                stopCamera();
                                                setIsImageModalOpen(false);
                                            } catch (err) {
                                                alert('Failed to update image')
                                            }
                                        }}
                                        className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        Apply Evidence
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default InspectionTable
