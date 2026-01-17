
import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle, User, Leaf, Smartphone } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('user'); // 'user' or 'official'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    officialId: '',
    department: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Validate government email - taken from ecotest
  const isValidGovEmail = (email) => {
    const govDomains = ['@gov.in', '@nic.in', '@mygov.in', '@india.gov.in', '@forest.gov.in', '@moef.gov.in'];
    return govDomains.some(domain => email.toLowerCase().endsWith(domain));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (userType === 'official' && !isValidGovEmail(formData.email)) {
      setError('Government officials MUST use a valid .gov.in or .nic.in institutional email.');
      setIsLoading(false);
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Password confirmation delta detected. Please re-enter.');
      setIsLoading(false);
      return;
    }

    // Simple mock authentication pipeline
    setTimeout(() => {
      const mockUser = {
        name: isLogin ? formData.email.split('@')[0].toUpperCase() : formData.name.toUpperCase(),
        email: formData.email,
        role: userType === 'official' ? 'OFFICIAL' : 'USER',
        department: formData.department,
        officialId: formData.officialId
      };

      localStorage.setItem('user', JSON.stringify(mockUser));
      setSuccess(true);

      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl glass-panel relative overflow-hidden group grid md:grid-cols-2">
        {/* Decorative scanning line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30 animate-scan z-20" />

        {/* Left Panel: Context & Mode Selection */}
        <div className="p-10 border-r border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-10">
            <Shield className="w-10 h-10 text-primary" />
            <div>
              <h2 className="text-xl font-bold tracking-tighter">AUTHENTICATION</h2>
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Protocol v4.0.2</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setUserType('user')}
              className={`w-full p-6 rounded-2xl border transition-all text-left group/btn ${userType === 'user' ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${userType === 'user' ? 'bg-primary text-bg-dark' : 'bg-white/5 text-muted'}`}>
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Citizen Access</h3>
                  <p className="text-[10px] text-muted">Reporting & Community Monitoring</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setUserType('official')}
              className={`w-full p-6 rounded-2xl border transition-all text-left group/btn ${userType === 'official' ? 'border-success bg-success/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${userType === 'official' ? 'bg-success text-bg-dark' : 'bg-white/5 text-muted'}`}>
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Official Terminal</h3>
                  <p className="text-[10px] text-muted">Governmental Intelligence Access</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-12 p-5 bg-white/5 rounded-2xl border border-white/5">
            <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">Notice</h4>
            <p className="text-[11px] text-muted leading-relaxed italic">
              All unauthorized access attempts are logged with geolocation and IP tracking.
              {userType === 'official' ? ' Official access requires verified institutional credentials.' : ' Citizen accounts enable community reporting features.'}
            </p>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="p-10 relative">
          {success ? (
            <div className="flex flex-col items-center justify-center h-full py-10 animate-fade-in">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-6 border border-success/30 shadow-[0_0_30px_rgba(0,255,136,0.3)]">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-bold mb-2">ACCESS GRANTED</h2>
              <p className="text-muted text-xs text-center">Neural Sync Completed.<br />Initializing Environment...</p>
            </div>
          ) : (
            <>
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${isLogin ? 'border-primary text-primary' : 'border-transparent text-muted'}`}
                >
                  Authorize
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${!isLogin ? 'border-primary text-primary' : 'border-transparent text-muted'}`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Legal Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-primary/50 transition-all font-medium"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">
                    {userType === 'official' ? 'Institutional Email' : 'Personal Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder={userType === 'official' ? 'officer@gov.in' : 'name@example.com'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-primary/50 transition-all font-medium"
                    />
                  </div>
                </div>

                {!isLogin && userType === 'official' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">ID Code</label>
                      <input
                        type="text"
                        name="officialId"
                        value={formData.officialId}
                        onChange={handleChange}
                        required
                        placeholder="GOV-XXXX"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary/50 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Dept</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-[10px] focus:outline-none focus:border-primary/50 transition-all font-bold uppercase appearance-none"
                      >
                        <option value="" disabled className="bg-bg-dark text-white">Select</option>
                        <option value="forest" className="bg-bg-dark text-white">Forest Dept</option>
                        <option value="pollution" className="bg-bg-dark text-white">PCB Board</option>
                        <option value="municipal" className="bg-bg-dark text-white">Municipality</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Neural Key (Password)</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-primary/50 transition-all font-medium"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Confirm Key</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-primary/50 transition-all font-medium"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-[10px] font-bold animate-shake">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full glow-button py-4 rounded-xl font-bold flex items-center justify-center gap-2 group disabled:opacity-50 mt-4"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Verify Authorization' : 'Initialize Account'}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;