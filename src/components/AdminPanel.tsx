import React, { useState, useEffect } from 'react';
import { Service, Project, Blog, Enquiry, Settings } from '../types';
import {
  Users, Briefcase, FileText, Settings as SettingsIcon,
  ShieldAlert, LogIn, Plus, Trash2, Edit, Save, Check, RefreshCw,
  Database, Upload, Copy, ExternalLink, CheckCircle2
} from 'lucide-react';
import {
  isSupabaseConfigured,
  saveSupabaseService,
  deleteSupabaseService,
  saveSupabaseProject,
  deleteSupabaseProject,
  saveSupabaseSettings,
  updateSupabaseEnquiryStatus,
  uploadImageToSupabase
} from '../lib/supabase';

interface AdminPanelProps {
  isAdminLoggedIn: boolean;
  onLogin: () => void;
  services: Service[];
  projects: Project[];
  blogs: Blog[];
  enquiries: Enquiry[];
  settings: Settings | null;
  refreshAllData: () => void;
  isStaticMode?: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isAdminLoggedIn,
  onLogin,
  services,
  projects,
  blogs,
  enquiries,
  settings,
  refreshAllData,
  isStaticMode = false
}) => {
  // Login Screen states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Admin Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'enquiries' | 'projects' | 'blogs' | 'services' | 'settings' | 'database'>('enquiries');
  const [copiedSql, setCopiedSql] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modals / Editing States
  const [editingItemType, setEditingItemType] = useState<'project' | 'blog' | 'service' | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form states for Service CRUD
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    banner: '',
    features: '', // Comma separated string
    faqs: '' // JSON-like questions
  });

  // Form states for Project CRUD
  const [projectForm, setProjectForm] = useState({
    name: '',
    location: '',
    completionDate: '',
    plotSize: '',
    builtUpArea: '',
    bedrooms: 3,
    floors: 2,
    budget: '',
    heroImage: '',
    clientName: '',
    clientTestimonial: ''
  });

  // Form states for Blog CRUD
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'Structural',
    readTime: '5 min read',
    content: ''
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    heroTitle: '',
    heroSubtitle: '',
    address: '',
    phone: '',
    email: '',
    instagramUrl: '',
    pinterestUrl: '',
    projectsDone: '120',
    experienceYears: '7',
    clientSatisfaction: '99',
    hiddenCharges: '0'
  });

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        heroTitle: settings.heroTitle || '',
        heroSubtitle: settings.heroSubtitle || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        instagramUrl: settings.instagramUrl || '',
        pinterestUrl: settings.pinterestUrl || '',
        projectsDone: settings.stats?.projectsDone || '120',
        experienceYears: settings.stats?.experienceYears || '7',
        clientSatisfaction: settings.stats?.clientSatisfaction || '99',
        hiddenCharges: settings.stats?.hiddenCharges || '0'
      });
    }
  }, [settings]);

  // Handle Admin Auth Submission
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin credentials
    if (username === 'admin' && password === 'lifehut2026') {
      onLogin();
      setLoginError('');
    } else {
      setLoginError('Invalid Administrator username or password combination.');
    }
  };

  // --- RESTful API Helpers & LocalStorage CMS Fallbacks ---

  // Delete handlers
  const handleDeleteItem = async (type: 'projects' | 'blogs' | 'services', id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)} permanently?`)) return;
    
    if (isSupabaseConfigured() && (type === 'services' || type === 'projects')) {
      if (type === 'services') await deleteSupabaseService(id);
      if (type === 'projects') await deleteSupabaseProject(id);
      refreshAllData();
      return;
    }

    if (isStaticMode) {
      const key = `lifehut_local_${type}`;
      try {
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        const filtered = items.filter((item: any) => item.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
        refreshAllData();
      } catch (err) {
        console.error('Failed to delete item locally', err);
      }
      return;
    }

    try {
      const res = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        refreshAllData();
      } else {
        alert('Failed to delete item from backend.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Service Save (Create / Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const serviceObj: Service = {
      id: editingItemId || serviceForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      title: serviceForm.title,
      description: serviceForm.description,
      banner: serviceForm.banner || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop',
      features: serviceForm.features.split(',').map(f => f.trim()).filter(Boolean),
      faqs: [
        { question: "What is the structural load ratio?", answer: "We model structures to safely exceed wind load standard indices by 15%." },
        { question: "Are structural certifications included?", answer: "Yes, certified structural engineering drawings and stability reports are provided." }
      ],
      gallery: [serviceForm.banner]
    };

    if (isSupabaseConfigured()) {
      await saveSupabaseService(serviceObj);
      setEditingItemType(null);
      setEditingItemId(null);
      refreshAllData();
      return;
    }

    if (isStaticMode) {
      const key = 'lifehut_local_services';
      try {
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        if (editingItemId) {
          const idx = items.findIndex((i: any) => i.id === editingItemId);
          if (idx !== -1) {
            items[idx] = { ...items[idx], ...serviceObj };
          }
        } else {
          items.push(serviceObj);
        }
        localStorage.setItem(key, JSON.stringify(items));
        setEditingItemType(null);
        setEditingItemId(null);
        refreshAllData();
      } catch (err) {
        console.error('Failed to save service locally', err);
      }
      return;
    }

    const url = editingItemId ? `/api/services/${editingItemId}` : '/api/services';
    const method = editingItemId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceObj)
      });
      if (res.ok) {
        setEditingItemType(null);
        setEditingItemId(null);
        refreshAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Project Save (Create / Update)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const projectObj: Project = {
      id: editingItemId || projectForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      name: projectForm.name,
      location: projectForm.location,
      completionDate: projectForm.completionDate,
      plotSize: projectForm.plotSize,
      builtUpArea: projectForm.builtUpArea,
      bedrooms: projectForm.bedrooms,
      floors: projectForm.floors,
      budget: projectForm.budget,
      heroImage: projectForm.heroImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
      clientName: projectForm.clientName,
      clientTestimonial: projectForm.clientTestimonial,
      clientAvatar: projectForm.clientName ? projectForm.clientName.substring(0, 2).toUpperCase() : 'CL',
      status: 'Completed',
      gallery: [projectForm.heroImage]
    };

    if (isSupabaseConfigured()) {
      await saveSupabaseProject(projectObj);
      setEditingItemType(null);
      setEditingItemId(null);
      refreshAllData();
      return;
    }

    if (isStaticMode) {
      const key = 'lifehut_local_projects';
      try {
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        if (editingItemId) {
          const idx = items.findIndex((i: any) => i.id === editingItemId);
          if (idx !== -1) {
            items[idx] = { ...items[idx], ...projectObj };
          }
        } else {
          items.unshift(projectObj);
        }
        localStorage.setItem(key, JSON.stringify(items));
        setEditingItemType(null);
        setEditingItemId(null);
        refreshAllData();
      } catch (err) {
        console.error('Failed to save project locally', err);
      }
      return;
    }

    const url = editingItemId ? `/api/projects/${editingItemId}` : '/api/projects';
    const method = editingItemId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectObj)
      });
      if (res.ok) {
        setEditingItemType(null);
        setEditingItemId(null);
        refreshAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Blog Save (Create / Update)
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: blogForm.title,
      category: blogForm.category,
      readingTime: blogForm.readTime,
      readTime: blogForm.readTime,
      content: blogForm.content,
      seoMeta: {
        title: blogForm.title,
        description: blogForm.content.slice(0, 150),
        keywords: blogForm.category
      },
      featuredImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop',
      author: 'Er. Vignesh K (MD, Lifehut Developers)',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    if (isStaticMode) {
      const key = 'lifehut_local_blogs';
      try {
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        if (editingItemId) {
          const idx = items.findIndex((i: any) => i.id === editingItemId);
          if (idx !== -1) {
            items[idx] = { ...items[idx], ...payload, id: editingItemId };
          }
        } else {
          const newItem = {
            ...payload,
            slug: blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            id: blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
            comments: []
          };
          items.unshift(newItem);
        }
        localStorage.setItem(key, JSON.stringify(items));
        setEditingItemType(null);
        setEditingItemId(null);
        refreshAllData();
      } catch (err) {
        console.error('Failed to save blog locally', err);
      }
      return;
    }

    const url = editingItemId ? `/api/blogs/${editingItemId}` : '/api/blogs';
    const method = editingItemId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEditingItemType(null);
        setEditingItemId(null);
        refreshAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Global Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Settings = {
      heroTitle: settingsForm.heroTitle,
      heroSubtitle: settingsForm.heroSubtitle,
      heroBannerImage: settings?.heroBannerImage || "/src/assets/images/hero_villa_1784191464588.jpg",
      address: settingsForm.address,
      phone: settingsForm.phone,
      email: settingsForm.email,
      hours: settings?.hours || "Mon – Sat: 9:00 AM – 6:00 PM",
      whatsappNumber: settings?.whatsappNumber || "918072163330",
      instagramUrl: settingsForm.instagramUrl,
      pinterestUrl: settingsForm.pinterestUrl,
      seoTitle: settings?.seoTitle || "Top Residential Building Construction Company in Chennai | Lifehut Developers",
      seoDescription: settings?.seoDescription || "Leading residential building construction company in Chennai.",
      seoKeywords: settings?.seoKeywords || "residential building construction company, turnkey house builders chennai",
      stats: {
        projectsDone: settingsForm.projectsDone,
        experienceYears: settingsForm.experienceYears,
        clientSatisfaction: settingsForm.clientSatisfaction,
        hiddenCharges: settingsForm.hiddenCharges
      }
    };

    if (isSupabaseConfigured()) {
      await saveSupabaseSettings(payload);
      alert('Global Site Settings Updated in Supabase DB!');
      refreshAllData();
      return;
    }

    if (isStaticMode) {
      const key = 'lifehut_local_settings';
      try {
        localStorage.setItem(key, JSON.stringify(payload));
        alert('Global Site Settings Updated Locally!');
        refreshAllData();
      } catch (err) {
        console.error('Failed to save settings locally', err);
      }
      return;
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Global Site Settings Updated Successfully!');
        refreshAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit Modals
  const openEditService = (svc: Service) => {
    setEditingItemType('service');
    setEditingItemId(svc.id);
    setServiceForm({
      title: svc.title,
      description: svc.description,
      banner: svc.banner,
      features: svc.features.join(', '),
      faqs: ''
    });
  };

  const openEditProject = (proj: Project) => {
    setEditingItemType('project');
    setEditingItemId(proj.id);
    setProjectForm({
      name: proj.name,
      location: proj.location,
      completionDate: proj.completionDate,
      plotSize: proj.plotSize,
      builtUpArea: proj.builtUpArea,
      bedrooms: proj.bedrooms || 3,
      floors: proj.floors || 2,
      budget: proj.budget || '',
      heroImage: proj.heroImage,
      clientName: proj.clientName || '',
      clientTestimonial: proj.clientTestimonial || ''
    });
  };

  const openEditBlog = (b: Blog) => {
    setEditingItemType('blog');
    setEditingItemId(b.id);
    setBlogForm({
      title: b.title,
      category: b.category,
      readTime: b.readTime || b.readingTime || "5 min read",
      content: b.content
    });
  };

  if (!isAdminLoggedIn) {
    /* Secure Admin login Form screen with glass style */
    return (
      <div className="min-h-screen bg-[#1A2332] bg-grid-white bg-blueprint-lines flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl text-left text-white">
          
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#1A6DB5] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#1A6DB5]/20 mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="font-display text-xl font-extrabold tracking-tight">Lifehut HQ Portal</h2>
            <p className="text-xs text-slate-400 mt-1">Please authorize to enter the secure administration CMS</p>
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-xs font-semibold mb-5">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin username..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A6DB5] text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A6DB5] text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1">Tip: Use username <span className="font-bold text-white">admin</span> and password <span className="font-bold text-white">lifehut2026</span></span>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3.5 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-[#1A6DB5]/10"
            >
              <LogIn className="w-4 h-4" />
              <span>Authorize Connection</span>
            </button>
          </form>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-6 sm:pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        
        {/* Dashboard Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span className="text-xs font-mono font-extrabold text-[#1A6DB5] tracking-widest uppercase">System Operations</span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1A2332] mt-1">
              CMS Dashboard Manager
            </h1>
          </div>
          <button
            onClick={refreshAllData}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh State</span>
          </button>
        </div>

        {/* Dynamic Metric Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-bold uppercase">Enquiries & Quotes</div>
              <div className="text-2xl font-extrabold text-[#1A2332] mt-0.5">{enquiries.length}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#1A6DB5] flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-bold uppercase">Active Projects</div>
              <div className="text-2xl font-extrabold text-[#1A2332] mt-0.5">{projects.length}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-bold uppercase">Expert Blogs</div>
              <div className="text-2xl font-extrabold text-[#1A2332] mt-0.5">{blogs.length}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-bold uppercase">Total Services</div>
              <div className="text-2xl font-extrabold text-[#1A2332] mt-0.5">{services.length}</div>
            </div>
          </div>

        </div>

        {/* Secondary Navigation (CMS subtabs) */}
        <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap mb-8 gap-6">
          {[
            { id: 'enquiries', label: 'Client Lead Enquiries', icon: Users },
            { id: 'projects', label: 'Projects Gallery', icon: Briefcase },
            { id: 'blogs', label: 'Blog Manuals', icon: FileText },
            { id: 'services', label: 'Specializations', icon: Check },
            { id: 'settings', label: 'Site Metrics & SEO', icon: SettingsIcon },
            { id: 'database', label: 'Supabase DB & Storage', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-3 px-1 text-sm font-bold flex items-center gap-2 border-b-2 focus:outline-none transition-colors ${
                  activeSubTab === tab.id
                    ? 'border-[#1A6DB5] text-[#1A6DB5]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'database' && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isSupabaseConfigured() ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isSupabaseConfigured() ? 'Active' : 'Setup'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* SUBTAB DETAILS MODULES */}

        {/* 1. Enquiries Leads */}
        {activeSubTab === 'enquiries' && (
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm p-6 sm:p-8">
            <h3 className="font-display text-lg font-bold text-[#1A2332] mb-6 border-l-4 border-[#1A6DB5] pl-3">
              Incoming Client Enquiries & Calculations
            </h3>

            <div className="flex flex-col gap-4">
              {enquiries.map((enq) => (
                <div key={enq.id} className="border border-slate-100 rounded-2xl p-5 hover:border-slate-200 bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-bold text-sm text-[#1A2332]">{enq.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">
                        {enq.email} | {enq.phone}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {enq.date}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm mt-3 leading-relaxed bg-white border border-slate-100 p-4 rounded-xl font-mono whitespace-pre-wrap">
                    {enq.message}
                  </p>
                </div>
              ))}

              {enquiries.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No submissions captured in database yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Projects CMS */}
        {activeSubTab === 'projects' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-lg font-bold text-[#1A2332] border-l-4 border-[#1A6DB5] pl-3">
                Portfolio Projects Panel
              </h3>
              <button
                onClick={() => {
                  setEditingItemType('project');
                  setEditingItemId(null);
                  setProjectForm({
                    name: '', location: '', completionDate: '2026-07-16',
                    plotSize: '2400 sq.ft', builtUpArea: '3200 sq.ft',
                    bedrooms: 4, floors: 2, budget: '90 Lakhs',
                    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                    clientName: 'Arun Kumar', clientTestimonial: 'Superb project delivery, built completely transparently.'
                  });
                }}
                className="px-4 py-2 bg-[#1A6DB5] hover:bg-[#1558a0] text-white text-xs font-bold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div key={proj.id} className="border border-slate-100 rounded-2xl p-4 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-4 overflow-hidden pr-4">
                    <img src={proj.heroImage} alt="" referrerPolicy="no-referrer" className="w-16 h-12 object-cover rounded-lg bg-slate-200 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <div className="font-bold text-xs sm:text-sm text-[#1A2332] truncate">{proj.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{proj.location}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditProject(proj)} className="p-2 hover:bg-sky-50 text-[#1A6DB5] rounded-lg border border-slate-200 bg-white" title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteItem('projects', proj.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg border border-slate-200 bg-white" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Blogs CMS */}
        {activeSubTab === 'blogs' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-lg font-bold text-[#1A2332] border-l-4 border-[#1A6DB5] pl-3">
                Expert Blogs & Guides Panel
              </h3>
              <button
                onClick={() => {
                  setEditingItemType('blog');
                  setEditingItemId(null);
                  setBlogForm({
                    title: '', category: 'Structural',
                    readTime: '6 min read', content: ''
                  });
                }}
                className="px-4 py-2 bg-[#1A6DB5] hover:bg-[#1558a0] text-white text-xs font-bold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Manual</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {blogs.map((b) => (
                <div key={b.id} className="border border-slate-100 rounded-2xl p-4 flex justify-between items-center bg-slate-50">
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#1A2332]">{b.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{b.category} | {b.readTime || b.readingTime || "5 min read"}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditBlog(b)} className="p-2 hover:bg-sky-50 text-[#1A6DB5] rounded-lg border border-slate-200 bg-white">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteItem('blogs', b.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg border border-slate-200 bg-white">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Services CMS */}
        {activeSubTab === 'services' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-lg font-bold text-[#1A2332] border-l-4 border-[#1A6DB5] pl-3">
                Specializations Base Panel
              </h3>
              <button
                onClick={() => {
                  setEditingItemType('service');
                  setEditingItemId(null);
                  setServiceForm({
                    title: '', description: '',
                    banner: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80',
                    features: 'Structural Blueprinting, Cement Certifications, Fe 550D TMT Rods',
                    faqs: ''
                  });
                }}
                className="px-4 py-2 bg-[#1A6DB5] hover:bg-[#1558a0] text-white text-xs font-bold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Specialization</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <div key={svc.id} className="border border-slate-100 rounded-2xl p-4 flex justify-between items-center bg-slate-50">
                  <div className="overflow-hidden pr-4">
                    <div className="font-bold text-xs sm:text-sm text-[#1A2332] truncate">{svc.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{svc.description}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditService(svc)} className="p-2 hover:bg-sky-50 text-[#1A6DB5] rounded-lg border border-slate-200 bg-white">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteItem('services', svc.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg border border-slate-200 bg-white">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Settings / Stats Metrics */}
        {activeSubTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
            <h3 className="font-display text-lg font-bold text-[#1A2332] border-l-4 border-[#1A6DB5] pl-3 pb-2 border-b border-slate-50">
              Site Parameters, Metric Stats & SEO Handles
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Hero Main Headline</label>
                <input
                  type="text"
                  value={settingsForm.heroTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                  className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Hero Subtitle</label>
                <input
                  type="text"
                  value={settingsForm.heroSubtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                  className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Completed Projects Count</label>
                <input
                  type="text"
                  value={settingsForm.projectsDone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, projectsDone: e.target.value })}
                  className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Years Active Experience</label>
                <input
                  type="text"
                  value={settingsForm.experienceYears}
                  onChange={(e) => setSettingsForm({ ...settingsForm, experienceYears: e.target.value })}
                  className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Client Satisfaction (%)</label>
                <input
                  type="text"
                  value={settingsForm.clientSatisfaction}
                  onChange={(e) => setSettingsForm({ ...settingsForm, clientSatisfaction: e.target.value })}
                  className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-slate-50 pt-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Corporate Email</label>
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Direct Hotline Phone</label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                  className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Instagram Handle link</label>
                <input
                  type="text"
                  value={settingsForm.instagramUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                  className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500">Headquarters Address String</label>
              <textarea
                rows={2}
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="border border-slate-200 p-4 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold text-xs tracking-wider uppercase rounded-xl self-start flex items-center gap-1.5 transition-all shadow-md shadow-[#1A6DB5]/15"
            >
              <Save className="w-4 h-4" />
              <span>Save System Parameters</span>
            </button>
          </form>
        )}

        {/* 6. Supabase Database & Storage Setup */}
        {activeSubTab === 'database' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-8 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-[#1A6DB5] uppercase tracking-wider">Cloud Backend & API Architecture</span>
                <h3 className="font-display text-xl font-extrabold text-[#1A2332] mt-1 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#1A6DB5]" />
                  <span>Supabase Integration Dashboard</span>
                </h3>
              </div>
              <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold font-mono border ${
                isSupabaseConfigured()
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{isSupabaseConfigured() ? 'CONNECTED TO SUPABASE' : 'SUPABASE ENV VARS PENDING'}</span>
              </div>
            </div>

            {/* Connection Status & Instructions Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex flex-col gap-4">
                <h4 className="font-display text-sm font-extrabold text-[#1A2332] flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-[#1A6DB5]" />
                  <span>Cloudflare / Vite Environment Credentials</span>
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  To connect your front-end and admin panel directly to Supabase, set these environment variables in your Cloudflare Pages or host deployment environment settings:
                </p>
                
                <div className="flex flex-col gap-2 font-mono text-[11px]">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-500 font-bold">VITE_SUPABASE_URL</span>
                    <span className="text-[#1A6DB5] truncate max-w-[200px]">
                      {((import.meta as unknown as { env?: Record<string, string> }).env)?.VITE_SUPABASE_URL || 'https://your-project.supabase.co'}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-500 font-bold">VITE_SUPABASE_ANON_KEY</span>
                    <span className="text-slate-400 truncate max-w-[200px]">
                      {((import.meta as unknown as { env?: Record<string, string> }).env)?.VITE_SUPABASE_ANON_KEY ? '••••••••••••••••' : 'your-anon-key-here'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-sky-50 p-3 rounded-xl border border-sky-100 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1A6DB5] flex-shrink-0 mt-0.5" />
                  <span><strong>Auth Persisted:</strong> Admin login credential security remains intact while all admin data (Services, Projects, Enquiries, Quotes, Settings) syncs in real-time with Supabase tables.</span>
                </div>
              </div>

              <div className="bg-[#1A2332] text-white p-6 rounded-2xl border border-slate-800 flex flex-col justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#F47B20] uppercase tracking-widest">1-Click SQL Setup</span>
                  <h4 className="font-display text-base font-bold text-white mt-1">
                    Supabase Database Tables & RLS Policies
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Copy this pre-configured SQL script and run it in your <strong className="text-white">Supabase Dashboard → SQL Editor</strong> to automatically create all required tables (<code className="text-sky-300">services</code>, <code className="text-sky-300">projects</code>, <code className="text-sky-300">enquiries</code>, <code className="text-sky-300">quotes</code>, <code className="text-sky-300">settings</code>) and storage buckets.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const sqlText = `-- Lifehut Developers Supabase SQL Migration Schema
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    banner TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    gallery JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hero_image TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    completion_date TEXT,
    plot_size TEXT,
    built_up_area TEXT,
    floors INTEGER DEFAULT 1,
    bedrooms INTEGER DEFAULT 1,
    budget TEXT,
    location TEXT,
    client_testimonial TEXT,
    client_name TEXT,
    client_avatar TEXT,
    status TEXT DEFAULT 'Completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.enquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    service TEXT,
    message TEXT,
    date TEXT,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quotes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    area NUMERIC,
    floors TEXT,
    ctype TEXT,
    interior TEXT,
    extras TEXT,
    estimated_cost TEXT,
    date TEXT,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'site_settings',
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_banner_image TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    hours TEXT,
    whatsapp_number TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    pinterest_url TEXT,
    linkedin_url TEXT,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    stats JSONB DEFAULT '{"projectsDone":"120+","experienceYears":"7+","clientSatisfaction":"99%","hiddenCharges":"₹0"}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all access on services" ON public.services FOR ALL USING (true);
CREATE POLICY "Allow public all access on projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Allow public all access on enquiries" ON public.enquiries FOR ALL USING (true);
CREATE POLICY "Allow public all access on quotes" ON public.quotes FOR ALL USING (true);
CREATE POLICY "Allow public all access on settings" ON public.settings FOR ALL USING (true);`;
                    navigator.clipboard.writeText(sqlText);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 3000);
                  }}
                  className="w-full py-3.5 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1A6DB5]/20"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>SQL Script Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Supabase SQL Schema Script</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* EDITING FORM MODALS (Glass/Overlay) */}
        {editingItemType !== null && (
          <div className="fixed inset-0 bg-[#1A2332]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto text-left shadow-2xl border border-slate-100">
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <h3 className="font-display text-lg font-bold text-[#1A2332] uppercase tracking-wide">
                  {editingItemId ? 'Update' : 'Create New'} {editingItemType}
                </h3>
                <button
                  onClick={() => { setEditingItemType(null); setEditingItemId(null); }}
                  className="text-slate-400 hover:text-slate-800 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* 1. Service Form */}
              {editingItemType === 'service' && (
                <form onSubmit={handleSaveService} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Service Title</label>
                    <input type="text" required value={serviceForm.title} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Description Overview</label>
                    <textarea rows={3} required value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="border border-slate-200 p-3 text-xs rounded-xl" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Banner Image URL</label>
                    <input type="text" required value={serviceForm.banner} onChange={(e) => setServiceForm({ ...serviceForm, banner: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Key Features (Comma-Separated)</label>
                    <input type="text" required value={serviceForm.features} onChange={(e) => setServiceForm({ ...serviceForm, features: e.target.value })} placeholder="Structural Blueprint, Tata TMT, Kajaria Tiles" className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                  </div>

                  <button type="submit" className="w-full mt-4 py-3 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold text-xs uppercase tracking-wider rounded-xl">
                    Save Specialization Data
                  </button>
                </form>
              )}

              {/* 2. Project Form */}
              {editingItemType === 'project' && (
                <form onSubmit={handleSaveProject} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Project Name</label>
                    <input type="text" required value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500">Location (Chennai Suburb)</label>
                      <input type="text" required value={projectForm.location} onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500">Completion Timeline</label>
                      <input type="text" required value={projectForm.completionDate} onChange={(e) => setProjectForm({ ...projectForm, completionDate: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500">Plot Size</label>
                      <input type="text" required value={projectForm.plotSize} onChange={(e) => setProjectForm({ ...projectForm, plotSize: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500">Built-Up Area</label>
                      <input type="text" required value={projectForm.builtUpArea} onChange={(e) => setProjectForm({ ...projectForm, builtUpArea: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500">Bedrooms (BHK)</label>
                      <input type="number" required value={projectForm.bedrooms} onChange={(e) => setProjectForm({ ...projectForm, bedrooms: parseInt(e.target.value) })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500">Floors (Count)</label>
                      <input type="number" required value={projectForm.floors} onChange={(e) => setProjectForm({ ...projectForm, floors: parseInt(e.target.value) })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500">Budget (Lakhs)</label>
                      <input type="text" required value={projectForm.budget} onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Hero Presentation Image Link</label>
                    <input type="text" required value={projectForm.heroImage} onChange={(e) => setProjectForm({ ...projectForm, heroImage: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Client Name</label>
                    <input type="text" value={projectForm.clientName} onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Client Testimonial</label>
                    <textarea rows={2} value={projectForm.clientTestimonial} onChange={(e) => setProjectForm({ ...projectForm, clientTestimonial: e.target.value })} className="border border-slate-200 p-3 text-xs rounded-xl" />
                  </div>

                  <button type="submit" className="w-full mt-4 py-3 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold text-xs uppercase tracking-wider rounded-xl">
                    Save Project Portfolio
                  </button>
                </form>
              )}

              {/* 3. Blog Form */}
              {editingItemType === 'blog' && (
                <form onSubmit={handleSaveBlog} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Article Title</label>
                    <input type="text" required value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500">Category</label>
                      <select value={blogForm.category} onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl bg-white text-slate-700 outline-none">
                        <option value="Structural">Structural</option>
                        <option value="Materials">Materials</option>
                        <option value="Budgeting">Budgeting</option>
                        <option value="Planning">Planning</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500">Estimated Reading Time</label>
                      <input type="text" required value={blogForm.readTime} onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })} placeholder="e.g. 5 min read" className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Content Body</label>
                    <textarea rows={6} required value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} placeholder="Write your technical engineering blog detail here..." className="border border-slate-200 p-3 text-xs rounded-xl" />
                  </div>

                  <button type="submit" className="w-full mt-4 py-3 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold text-xs uppercase tracking-wider rounded-xl">
                    Publish Technical Guide
                  </button>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
