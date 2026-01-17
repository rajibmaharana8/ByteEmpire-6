
import { useState, useRef, useEffect } from 'react';
import { Shield, Upload, MapPin, Activity, CheckCircle, Smartphone, Globe, Download, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Landfill = () => {
    const [mode, setMode] = useState('sat'); // 'sat' or 'land'
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError("Please select an image first.");
            return;
        }

        setAnalyzing(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('mode', mode);

        // Mock geolocation for now or can be added if needed
        formData.append('lat', "22.5726");
        formData.append('lng', "88.3639");

        try {
            const response = await axios.post('/predict', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || "Analysis failed. Ensure backend is running.");
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            <span className="text-primary italic">Neural</span> Insight
                        </h1>
                        <p className="text-muted text-lg">Advanced Satellite & Ground Waste Surveillance</p>
                    </div>

                    <div className="glass-panel p-2 flex gap-2">
                        <button
                            onClick={() => setMode('sat')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'sat' ? 'bg-primary text-bg-dark' : 'hover:bg-white/5 text-muted'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" /> Satellite (Aerial)
                            </div>
                        </button>
                        <button
                            onClick={() => setMode('land')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'land' ? 'bg-primary text-bg-dark' : 'hover:bg-white/5 text-muted'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Smartphone className="w-4 h-4" /> Land/Drone (Ground)
                            </div>
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left side: Upload & Controls */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="glass-panel p-6">
                            <h3 className="text-primary font-bold text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Configuration
                            </h3>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative border-2 border-dashed border-white/10 rounded-2xl p-8 hover:border-primary/50 transition-all cursor-pointer bg-white/5 aspect-square flex flex-col items-center justify-center text-center overflow-hidden"
                            >
                                {preview ? (
                                    <img src={preview} alt="Upload selection" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                                ) : null}

                                <div className="relative z-10">
                                    <Upload className={`w-12 h-12 mx-auto mb-4 transition-transform group-hover:-translate-y-1 ${preview ? 'text-white' : 'text-primary'}`} />
                                    <p className="font-bold mb-1">{preview ? 'Change Image' : 'Source Entry'}</p>
                                    <p className="text-xs text-muted">TIFF, JPEG, PNG supported</p>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={analyzing || !file}
                                className="w-full mt-6 glow-button py-4 rounded-xl font-bold disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {analyzing ? (
                                    <div className="w-5 h-5 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5" /> Execute Neural Analysis
                                    </>
                                )}
                            </button>

                            {error && (
                                <div className="mt-4 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}
                        </div>

                        <div className="glass-panel p-6">
                            <h3 className="text-primary font-bold text-sm tracking-widest uppercase mb-4">System Status</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Inference Engine</span>
                                    <span className="text-success font-medium">ONLINE</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Primary Mode</span>
                                    <span className="text-white font-medium">{mode === 'sat' ? 'Satellite ResNet50' : 'Ground YOLOv8'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">Chaos Analysis</span>
                                    <span className="text-success font-medium">ENABLED</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Results Visualization */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Comparison Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="glass-panel p-4 pb-6">
                                <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-4 px-2">Source Feed</h4>
                                <div className="aspect-square rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
                                    {preview ? (
                                        <img src={preview} alt="Source" className="w-full h-full object-contain" />
                                    ) : (
                                        <span className="text-xs text-muted tracking-wide animate-pulse">Awaiting Signal...</span>
                                    )}
                                </div>
                            </div>

                            <div className="glass-panel p-4 pb-6 relative overflow-hidden">
                                <h4 className="text-xs font-bold text-muted uppercase tracking-widest mb-4 px-2">Neural Output (Heatmap)</h4>
                                <div className="aspect-square rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden relative">
                                    {result ? (
                                        <img src={result.heatmap} alt="Heatmap" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="text-center flex flex-col items-center gap-4">
                                            {analyzing ? (
                                                <div className="w-24 h-24 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                                            ) : (
                                                <div className="w-24 h-24 rounded-full border-2 border-white/5 flex items-center justify-center">
                                                    <Activity className="w-8 h-8 text-black/20" />
                                                </div>
                                            )}
                                            <span className="text-xs text-muted tracking-wide">{analyzing ? 'Processing Tensors...' : 'No Data Processed'}</span>
                                        </div>
                                    )}
                                </div>
                                {result && (
                                    <div className={`absolute bottom-8 right-8 px-4 py-1.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${result.status_type === 'danger' ? 'bg-danger/20 border-danger text-danger' :
                                        result.status_type === 'warning' ? 'bg-warning/20 border-warning text-warning' :
                                            'bg-success/20 border-success text-success'
                                        }`}>
                                        {result.status_type.toUpperCase()} SIGNAL
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Analysis Metrics */}
                        {result && (
                            <div className="glass-panel p-8">
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold mb-1">Environmental Analysis</h3>
                                        <p className="text-muted">Probabilistic Assessment Results</p>
                                    </div>
                                    <button className="flex items-center gap-2 text-primary hover:text-white transition-colors text-sm font-bold">
                                        <Download className="w-4 h-4" /> Export Telemetry
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <span className="text-xs font-bold text-muted tracking-widest uppercase">Confidence Score</span>
                                        <div className="flex items-end gap-2">
                                            <span className="text-5xl font-bold">{result.confidence}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary shadow-[0_0_10px_var(--primary)] transition-all duration-1000 ease-out"
                                                style={{ width: `${result.confidence}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <span className="text-xs font-bold text-muted tracking-widest uppercase">Classification</span>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full animate-pulse ${result.status_type === 'danger' ? 'bg-danger shadow-[0_0_8px_#ff3366]' :
                                                result.status_type === 'warning' ? 'bg-warning shadow-[0_0_8px_#ffcc00]' :
                                                    'bg-success shadow-[0_0_8px_#00ff88]'
                                                }`} />
                                            <span className="text-3xl font-bold">{result.prediction}</span>
                                        </div>
                                        <p className="text-xs text-muted leading-relaxed">
                                            {result.status_type === 'danger' ? 'High probability of illegal waste dumping or industrial contamination detected.' :
                                                result.status_type === 'warning' ? 'Suspicious land changes detected. Further investigation recommended.' :
                                                    'Environment appears stable. No significant waste anomalies identified.'}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <span className="text-xs font-bold text-muted tracking-widest uppercase">Telemetry</span>
                                        <div className="space-y-2">
                                            <div className="flex justify-between border-b border-white/5 py-2">
                                                <span className="text-xs text-muted">Geo-Tagged</span>
                                                <span className="text-xs font-mono">{result.geo_tagged ? 'YES' : 'NO'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 py-2">
                                                <span className="text-xs text-muted">Community Alert</span>
                                                <span className={`text-xs font-mono ${result.community_alert ? 'text-danger' : 'text-success'}`}>
                                                    {result.community_alert ? 'TRIGGERED' : 'CLEAR'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landfill;
