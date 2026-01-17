
import React, { useState, useEffect } from 'react';
import {
    Leaf, Bell, MapPin, Calendar, User,
    Filter, Search, CheckCircle, Clock,
    AlertTriangle, Eye, XCircle, Download,
    Send, FileText, TrendingUp, Users,
    BarChart3, RefreshCw, Trash2, Activity, Shield, Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';

const GovDashboard = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);
    const [dispatched, setDispatched] = useState([]);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/reports');
            if (response.data && response.data.reports) {
                setReports(response.data.reports);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteReport = async (id) => {
        if (!window.confirm('Confirm permanent removal of this log from regional surveillance records?')) return;
        try {
            await axios.delete(`/api/reports/${id}`);
            setReports(reports.filter(r => r.id !== id));
            if (selectedReport?.id === id) setSelectedReport(null);
        } catch (error) {
            console.error('Error deleting report:', error);
        }
    };

    const handleDispatch = (id) => {
        if (!dispatched.includes(id)) {
            setDispatched([...dispatched, id]);
        }
    };

    const filteredReports = reports.filter(report => {
        const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || report.status.toLowerCase() === filterStatus.toLowerCase();

        let reportSeverity = 'Normal';
        if (report.score > 0.4) reportSeverity = 'critical';
        else if (report.score > 0.2) reportSeverity = 'high';
        else if (report.score > 0.05) reportSeverity = 'medium';
        else reportSeverity = 'low';

        const matchesSeverity = filterSeverity === 'all' || reportSeverity === filterSeverity;

        const matchesSearch =
            report.id.toString().includes(searchQuery) ||
            (report.lat && report.lat.toString().includes(searchQuery)) ||
            (report.lng && report.lng.toString().includes(searchQuery)) ||
            (report.category && report.category.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesStatus && matchesSearch && matchesSeverity;
    });

    const stats = {
        total: reports.length,
        landfill: reports.filter(r => r.category === 'landfill').length,
        deforestation: reports.filter(r => r.category === 'deforestation').length,
        critical: reports.filter(r => r.score > 0.4).length,
        pending: reports.length - dispatched.length
    };

    const getStatusColor = (status, score) => {
        if (score > 0.4) return 'text-danger border-danger/30 bg-danger/10';
        if (score > 0.2) return 'text-warning border-warning/30 bg-warning/10';
        return 'text-success border-success/30 bg-success/10';
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 bg-[#020804] text-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest mb-3">
                            <Shield className="w-3 h-3" /> Regional Intelligence Command
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter">
                            GOV<span className="text-primary">SURVEILLANCE</span>
                        </h1>
                        <p className="text-muted text-xs font-medium uppercase tracking-[0.3em] mt-1">Autonomous Environmental Response Terminal</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchReports}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 transition-all group active:scale-95"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : 'text-muted group-hover:text-primary transition-colors'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Update Feed</span>
                        </button>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                    {[
                        { label: 'Signal Logs', value: stats.total, icon: Bell, color: 'text-white' },
                        { label: 'Pending Response', value: stats.pending, icon: Clock, color: 'text-warning' },
                        { label: 'Deforestation', value: stats.deforestation, icon: Leaf, color: 'text-success' },
                        { label: 'Critical Zones', value: stats.critical, icon: AlertTriangle, color: 'text-danger' },
                        { label: 'Accuracy Rating', value: '98.4%', icon: Activity, color: 'text-primary' },
                    ].map((s, i) => (
                        <div key={i} className="glass-panel p-6 relative overflow-hidden group hover:border-primary/20 transition-all">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <s.icon size={80} />
                            </div>
                            <h3 className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">{s.label}</h3>
                            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* List Panel */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Advanced Filters */}
                        <div className="glass-panel p-6 space-y-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Scan ID / Geospatial Coords / Categories..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:text-white/20"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black uppercase focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="all" className="bg-bg-dark">All Sectors</option>
                                        <option value="landfill" className="bg-bg-dark">Landfill</option>
                                        <option value="deforestation" className="bg-bg-dark">Deforestation</option>
                                    </select>
                                    <select
                                        value={filterSeverity}
                                        onChange={(e) => setFilterSeverity(e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black uppercase focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="all" className="bg-bg-dark">All Risk Levels</option>
                                        <option value="critical" className="bg-bg-dark text-danger">Critical</option>
                                        <option value="high" className="bg-bg-dark text-warning">High</option>
                                        <option value="medium" className="bg-bg-dark">Medium</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Intelligence List */}
                        <div className="space-y-4">
                            {filteredReports.map((report) => (
                                <div
                                    key={report.id}
                                    onClick={() => setSelectedReport(report)}
                                    className={`glass-panel p-6 cursor-pointer border transition-all hover:scale-[1.01] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${selectedReport?.id === report.id ? 'border-primary/50 bg-primary/5' : 'border-white/5'} ${dispatched.includes(report.id) ? 'opacity-70' : ''}`}
                                >
                                    <div className="flex gap-6 items-center flex-1">
                                        <div className="relative group/thumb">
                                            {report.image_path ? (
                                                <img
                                                    src={report.image_path}
                                                    alt="Evidence"
                                                    className="w-16 h-16 rounded-2xl object-cover border border-white/10 group-hover/thumb:border-primary/50 transition-all"
                                                />
                                            ) : (
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${report.category === 'deforestation' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                                    {report.category === 'deforestation' ? <Leaf size={28} /> : <AlertTriangle size={28} />}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-[10px] font-black text-muted uppercase tracking-tighter">ID: #{report.id}</span>
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-widest ${getStatusColor(report.status, report.score)}`}>
                                                    {report.score > 0.4 ? 'CRITICAL' : report.score > 0.2 ? 'HIGH RISK' : 'STABLE'}
                                                </span>
                                                {dispatched.includes(report.id) && (
                                                    <span className="px-2 py-1 rounded-md text-[8px] font-black bg-primary text-bg-dark uppercase tracking-widest animate-pulse">
                                                        OPERATIONAL
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-xl font-bold mb-2">
                                                {report.category === 'deforestation' ? 'Unauthorized Tree Removal' : 'Industrial Contamination'}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-2 text-[10px] text-muted font-bold uppercase tracking-widest">
                                                    <MapPin size={12} className="text-primary" />
                                                    {report.lat ? `${report.lat.toFixed(4)}, ${report.lng.toFixed(4)}` : 'Geotag Missing'}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-muted font-bold uppercase tracking-widest">
                                                    <Clock size={12} className="text-primary" />
                                                    {new Date(report.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0 flex flex-col items-end">
                                        <div className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Inference Match</div>
                                        <div className="text-3xl font-black text-white">{Math.round(report.score * 100)}%</div>
                                    </div>
                                </div>
                            ))}

                            {filteredReports.length === 0 && !loading && (
                                <div className="glass-panel p-24 text-center">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="w-10 h-10 text-white/10" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Null Sector Result</h3>
                                    <p className="text-muted text-sm max-w-xs mx-auto">No surveillance logs matching current tactical filters were identified in the registry.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Operation Panel */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            {selectedReport ? (
                                <div className="glass-panel p-8 space-y-8 animate-fade-in border-primary/20 bg-primary/[0.02]">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-black italic tracking-tighter uppercase">Intelligence Brief</h3>
                                            <p className="text-[9px] text-muted font-bold uppercase tracking-widest">Report Ref: {selectedReport.id}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => deleteReport(selectedReport.id)}
                                                className="p-3 text-white/20 hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                                                title="Delete entry"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Vision Analytics Section */}
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
                                            <ImageIcon size={12} className="text-primary" /> Critical Evidence Vision
                                        </label>
                                        <div className="relative group overflow-hidden rounded-[2rem] border border-white/10 aspect-video bg-white/5">
                                            {selectedReport.image_path ? (
                                                <img
                                                    src={selectedReport.image_path}
                                                    alt="Report Vision"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-muted">
                                                    <ImageIcon size={48} className="opacity-20 mb-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">No Visual Telemetry</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                <div className="bg-bg-dark/80 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-[8px] font-black uppercase tracking-widest">
                                                    Sensors Active
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-muted uppercase tracking-widest">Sector</label>
                                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 uppercase font-bold text-[10px] text-primary transition-all">
                                                    {selectedReport.category === 'deforestation' ? <Leaf size={14} /> : <AlertTriangle size={14} />}
                                                    {selectedReport.category}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-muted uppercase tracking-widest">Threat Level</label>
                                                <div className={`flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 uppercase font-black text-[10px] ${selectedReport.score > 0.4 ? 'text-danger' : 'text-success'}`}>
                                                    {Math.round(selectedReport.score * 100)}% Risk
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-muted uppercase tracking-widest">Operational Status</label>
                                            <div className={`flex items-center gap-3 p-4 rounded-2xl border italic text-[10px] font-bold transition-all ${dispatched.includes(selectedReport.id) ? 'bg-primary border-bg-dark text-bg-dark' : 'bg-white/5 border-white/10 text-white/50'}`}>
                                                {dispatched.includes(selectedReport.id) ? (
                                                    <><CheckCircle size={16} /> RESPONSE UNIT DEPLOYED</>
                                                ) : (
                                                    <><RefreshCw size={16} className="animate-spin" /> AWAITING COMMAND</>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[9px] font-black text-muted uppercase tracking-widest">Neural Directives</label>
                                            <button
                                                onClick={() => handleDispatch(selectedReport.id)}
                                                disabled={dispatched.includes(selectedReport.id)}
                                                className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 ${dispatched.includes(selectedReport.id) ? 'bg-white/5 text-white/20' : 'glow-button'}`}
                                            >
                                                <Send size={18} /> {dispatched.includes(selectedReport.id) ? 'Unit Deployed' : 'Dispatch Response Team'}
                                            </button>

                                            <div className="grid grid-cols-2 gap-4">
                                                <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2">
                                                    <Download size={14} /> Log Data
                                                </button>
                                                <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2">
                                                    <FileText size={14} /> PDF Brief
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-panel aspect-square flex flex-col items-center justify-center text-center p-12 group opacity-40 border-dashed border-white/10">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8">
                                        <Eye size={40} className="text-white/10" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Tactical Overlay</h3>
                                    <p className="text-muted text-[11px] font-bold uppercase tracking-widest leading-loose">Select a signal coordinate from the log feed to view real-time environmental intelligence and response protocols.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovDashboard;
