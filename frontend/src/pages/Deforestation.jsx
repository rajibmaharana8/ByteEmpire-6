
import { useState, useRef } from 'react';
import { Leaf, Upload, AlertTriangle, CheckCircle, Activity, ArrowRight, Info, MapPin } from 'lucide-react';
import axios from 'axios';

const Deforestation = () => {
    const [beforeImage, setBeforeImage] = useState(null);
    const [afterImage, setAfterImage] = useState(null);
    const [beforePreview, setBeforePreview] = useState(null);
    const [afterPreview, setAfterPreview] = useState(null);
    const [location, setLocation] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [coordinates, setCoordinates] = useState({ lat: null, lng: null });

    const beforeInputRef = useRef(null);
    const afterInputRef = useRef(null);

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'before') {
                setBeforeImage(file);
                setBeforePreview(URL.createObjectURL(file));
            } else {
                setAfterImage(file);
                setAfterPreview(URL.createObjectURL(file));
            }
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!beforeImage || !afterImage) {
            setError('Both reference and temporal images are required for comparison.');
            return;
        }

        setAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append('before_image', beforeImage);
        formData.append('after_image', afterImage);

        // Parse coordinates from location string if possible
        let lat = "null";
        let lng = "null";
        if (location) {
            const parts = location.split(',').map(p => p.trim());
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                lat = parts[0];
                lng = parts[1];
            }
        }

        formData.append('lat', lat);
        formData.append('lng', lng);

        try {
            const response = await axios.post('/api/analyze/deforestation', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data);
            if (response.data.geo_tagged) {
                setCoordinates({ lat, lng });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Temporal analysis failed. Ensure backend is active.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            <span className="text-success italic">Spectral</span> Monitoring
                        </h1>
                        <p className="text-muted text-lg">Autonomous Vegetation & Forest Loss Tracking</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left side: Upload & Settings */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-panel p-6">
                            <h3 className="text-success font-bold text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Temporal Context
                            </h3>

                            <div className="space-y-4">
                                <div
                                    onClick={() => beforeInputRef.current?.click()}
                                    className="relative h-32 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-success/50 transition-all overflow-hidden bg-white/5"
                                >
                                    {beforePreview ? (
                                        <img src={beforePreview} alt="Before" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="w-6 h-6 mx-auto mb-2 text-success" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Historical Ref</p>
                                        </div>
                                    )}
                                    <input type="file" ref={beforeInputRef} className="hidden" onChange={(e) => handleImageChange(e, 'before')} accept="image/*" />
                                </div>

                                <div
                                    onClick={() => afterInputRef.current?.click()}
                                    className="relative h-32 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-success/50 transition-all overflow-hidden bg-white/5"
                                >
                                    {afterPreview ? (
                                        <img src={afterPreview} alt="After" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="w-6 h-6 mx-auto mb-2 text-success" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Current Signal</p>
                                        </div>
                                    )}
                                    <input type="file" ref={afterInputRef} className="hidden" onChange={(e) => handleImageChange(e, 'after')} accept="image/*" />
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Zone Coordinates</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="Region ID / Latitude, Longitude"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-success/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing || !beforeImage || !afterImage}
                                    className="w-full bg-success text-bg-dark py-4 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {analyzing ? (
                                        <div className="w-5 h-5 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Activity className="w-5 h-5" /> Start Comparison
                                        </>
                                    )}
                                </button>

                                {error && (
                                    <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-[10px] flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass-panel p-6">
                            <h3 className="text-success font-bold text-sm tracking-widest uppercase mb-4">Spectral Details</h3>
                            <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                <Info className="w-5 h-5 text-success flex-shrink-0" />
                                <p className="text-[11px] text-muted leading-relaxed">
                                    Our system calculates the Greenness Entropy Index (GEI) across temporal samples to identify
                                    anomalies in forest density that are invisible to the naked eye.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Visualization & Metrics */}
                    <div className="lg:col-span-8 space-y-8">
                        {result ? (
                            <div className="animate-fade-in space-y-8">
                                <div className="glass-panel p-8">
                                    <div className="flex justify-between items-center mb-10">
                                        <div>
                                            <h3 className="text-2xl font-bold mb-1">Vegetation Analysis Result</h3>
                                            <p className="text-muted text-sm">Temporal Delta Assessment Completed</p>
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold border tracking-widest ${result.severity === 'High' ? 'bg-danger/20 border-danger text-danger' :
                                            result.severity === 'Medium' ? 'bg-warning/20 border-warning text-warning' :
                                                'bg-success/20 border-success text-success'
                                            }`}>
                                            {result.severity.toUpperCase()} RISK LEVEL
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            {/* Heatmap Visualization */}
                                            <div className="space-y-4">
                                                <span className="text-xs font-bold text-muted tracking-widest uppercase italic">Neural Heatmap Visualization</span>
                                                <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-square bg-black/20">
                                                    {result.heatmap ? (
                                                        <img
                                                            src={result.heatmap}
                                                            alt="Deforestation Heatmap"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-muted text-xs">
                                                            Generating Visualization...
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                                                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Loss Detected</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <span className="text-xs font-bold text-muted tracking-widest uppercase italic">Vegetation Loss Intensity</span>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-6xl font-black">{result.vegetation_loss}%</span>
                                                    <span className="text-muted text-sm pb-1">Delta</span>
                                                </div>
                                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full shadow-[0_0_15px] transition-all duration-1000 ease-out ${result.severity === 'Critical' ? 'bg-danger shadow-danger' :
                                                                result.severity === 'High' ? 'bg-warning shadow-warning' :
                                                                    'bg-success shadow-success'
                                                            }`}
                                                        style={{ width: `${result.vegetation_loss}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {result.geo_tagged && (
                                                <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/10">
                                                    <div className="p-2 bg-blue-500/20 rounded-xl">
                                                        <MapPin className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm mb-1">Geospatial Tagging</h4>
                                                        <p className="text-xs text-muted leading-relaxed">
                                                            Analysis pinned to: {coordinates.lat}, {coordinates.lng}.
                                                            Data synced with regional monitoring network.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/10">
                                                <div className="p-2 bg-success/20 rounded-xl">
                                                    <Leaf className="w-5 h-5 text-success" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm mb-1">Environmental Impact</h4>
                                                    <p className="text-xs text-muted leading-relaxed">
                                                        Based on the detected {result.vegetation_loss}% loss, the local ecosystem
                                                        resilience has decreased significantly. Immediate intervention recommended.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Detected Anomalies</h4>
                                            <div className="space-y-3">
                                                {result.changes.map((change, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-success/10 group hover:border-success/30 transition-colors">
                                                        <Activity className="w-4 h-4 text-success" />
                                                        <span className="text-xs font-medium text-white/80">{change}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Priority Protocols</h4>
                                            <div className="space-y-3">
                                                {result.recommendations.map((rec, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                                                        <CheckCircle className="w-4 h-4 text-success" />
                                                        <span className="text-xs font-medium text-white/80">{rec}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setResult(null)}
                                    className="w-full py-4 text-xs font-bold text-muted uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    Dismiss Analysis & Return to Monitor
                                </button>
                            </div>
                        ) : (
                            <div className="glass-panel aspect-video flex flex-col items-center justify-center text-center p-12 group overflow-hidden relative">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className="absolute top-0 left-0 w-full h-full border border-primary/10 scale-95 group-hover:scale-100 transition-transform rounded-2xl pointer-events-none" />

                                <Leaf className="w-16 h-16 text-white/5 mb-6 group-hover:text-success/20 transition-colors duration-500" />
                                <h3 className="text-xl font-bold mb-4">Awaiting Signal Synchronization</h3>
                                <p className="text-muted max-w-sm text-sm">
                                    Upload historical reference and current temporal signals to begin
                                    neural vegetation comparison.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Deforestation;
