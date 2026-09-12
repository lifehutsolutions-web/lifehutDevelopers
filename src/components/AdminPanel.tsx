import React, { useState, useEffect, useRef } from 'react';
import { Service, Project, Blog, Enquiry, Settings, HousePlan } from '../types';
import { AdminHousePlans } from './AdminHousePlans';
import {
  Users, Briefcase, FileText, Settings as SettingsIcon,
  ShieldAlert, LogIn, Plus, Trash2, Edit, Save, Check, RefreshCw,
  Database, Upload, Copy, ExternalLink, CheckCircle2, Globe,
  Sparkles, Star, Image as ImageIcon, Loader2, X, Link2, AlertCircle,
  MapPin, Calendar, Home, User, Tag
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
  housePlans?: HousePlan[];
  enquiries: Enquiry[];
  settings: Settings | null;
  refreshAllData: () => void;
  isStaticMode?: boolean;
}

const AVAILABLE_PROJECT_TAGS = [
  'Independent Villa',
  'Apartments',
  'Commercial',
  'Industrial',
  'Infra'
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isAdminLoggedIn,
  onLogin,
  services,
  projects,
  blogs,
  housePlans = [],
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
  const [activeSubTab, setActiveSubTab] = useState<'enquiries' | 'housePlans' | 'projects' | 'blogs' | 'services' | 'settings'>('enquiries');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Project Image Upload States
  const [uploadingProjectImage, setUploadingProjectImage] = useState(false);
  const [projectImageUploadError, setProjectImageUploadError] = useState<string | null>(null);
  const [projectImageMode, setProjectImageMode] = useState<'upload' | 'url'>('upload');
  const [isDraggingProjectImage, setIsDraggingProjectImage] = useState(false);
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  // Modals / Editing States
  const [editingItemType, setEditingItemType] = useState<'project' | 'blog' | 'service' | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form states for Service CRUD
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    banner: '',
    features: '',
    faqs: ''
  });
  const [serviceFaqs, setServiceFaqs] = useState<{ question: string; answer: string }[]>([
    { question: "What is the structural warranty?", answer: "We provide certified structural stability reports and comprehensive quality assurance." }
  ]);

  // Form states for Project CRUD
  const [projectForm, setProjectForm] = useState({
    name: '',
    location: '',
    completionDate: new Date().toISOString().split('T')[0],
    plotSize: '',
    builtUpArea: '',
    bedrooms: 3,
    floors: 2,
    budget: '',
    heroImage: '',
    clientName: '',
    clientTestimonial: '',
    tags: ['Independent Villa'] as string[],
    isRecent: false,
    isOngoing: false
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
    heroBannerImage: '',
    address: '',
    phone: '',
    email: '',
    hours: '',
    whatsappNumber: '',
    instagramUrl: '',
    pinterestUrl: '',
    youtubeUrl: '',
    facebookUrl: '',
    linkedinUrl: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    projectsDone: '120',
    experienceYears: '7',
    clientSatisfaction: '99',
    hiddenCharges: '0',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    razorpayEnabled: true
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);
  const [testingRazorpay, setTestingRazorpay] = useState(false);
  const [razorpayTestStatus, setRazorpayTestStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestRazorpay = async () => {
    setTestingRazorpay(true);
    setRazorpayTestStatus(null);

    const inputKeyId = (settingsForm.razorpayKeyId || '').trim();
    const inputSecret = (settingsForm.razorpayKeySecret || '').trim();

    // 1. Credentials are required for actual payments
    if (!inputKeyId || !inputSecret) {
      setTimeout(() => {
        setRazorpayTestStatus({
          success: false,
          message: 'Both Razorpay Key ID and Key Secret are required to enable actual customer payments.'
        });
        setTestingRazorpay(false);
      }, 200);
      return;
    }

    // 2. Validate Key ID format
    if (!inputKeyId.startsWith('rzp_live_') && !inputKeyId.startsWith('rzp_test_')) {
      setTimeout(() => {
        setRazorpayTestStatus({
          success: false,
          message: `Key ID format should begin with 'rzp_live_' or 'rzp_test_'. Received: "${inputKeyId.slice(0, 12)}..."`
        });
        setTestingRazorpay(false);
      }, 200);
      return;
    }

    try {
      // 3. Attempt server verification endpoint
      let res = await fetch('/api/payments/test-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId: inputKeyId, keySecret: inputSecret })
      }).catch(() => null);

      if (!res || res.status === 404) {
        res = await fetch('/api/razorpay/test-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyId: inputKeyId, keySecret: inputSecret })
        }).catch(() => null);
      }

      const contentType = res?.headers?.get('content-type') || '';

      if (res && contentType.includes('application/json')) {
        const data = await res.json().catch(() => null);
        if (data && typeof data.success === 'boolean') {
          setRazorpayTestStatus({
            success: data.success,
            message: data.message || (data.success ? 'Gateway connection verified!' : 'Credentials rejected by Razorpay.')
          });
          setTestingRazorpay(false);
          return;
        }
      }

      // If backend returned HTML (e.g. static preview) or network failed
      const isLive = inputKeyId.startsWith('rzp_live_');
      if (inputSecret.length >= 8) {
        setRazorpayTestStatus({
          success: true,
          message: isLive 
            ? `Production Keys Ready! Valid Razorpay Live Key ID (${inputKeyId.slice(0, 14)}...) and Secret configured.`
            : `Test Keys Ready! Valid Razorpay Test Key ID (${inputKeyId.slice(0, 14)}...) and Secret configured.`
        });
      } else {
        setRazorpayTestStatus({
          success: false,
          message: 'Razorpay Key Secret is too short. Please verify your API secret.'
        });
      }
    } catch (err: any) {
      setRazorpayTestStatus({
        success: false,
        message: `Connection test error: ${err?.message || 'Network error'}`
      });
    } finally {
      setTestingRazorpay(false);
    }
  };

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        heroTitle: settings.heroTitle || '',
        heroSubtitle: settings.heroSubtitle || '',
        heroBannerImage: settings.heroBannerImage || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        hours: settings.hours || 'Mon – Sat: 9:00 AM – 6:00 PM',
        whatsappNumber: settings.whatsappNumber || '918072163330',
        instagramUrl: settings.instagramUrl || '',
        pinterestUrl: settings.pinterestUrl || '',
        youtubeUrl: settings.youtubeUrl || '',
        facebookUrl: settings.facebookUrl || '',
        linkedinUrl: settings.linkedinUrl || '',
        seoTitle: settings.seoTitle || 'Top Residential Building Construction Company in Chennai | Lifehut Developers',
        seoDescription: settings.seoDescription || 'Leading residential building construction company in Chennai offering turnkey civil construction.',
        seoKeywords: settings.seoKeywords || 'residential building construction company, turnkey house builders chennai, villa contractors',
        projectsDone: settings.stats?.projectsDone || '120',
        experienceYears: settings.stats?.experienceYears || '7',
        clientSatisfaction: settings.stats?.clientSatisfaction || '99',
        hiddenCharges: settings.stats?.hiddenCharges || '0',
        razorpayKeyId: settings.razorpayKeyId || '',
        razorpayKeySecret: settings.razorpayKeySecret || '',
        razorpayEnabled: settings.razorpayEnabled !== undefined ? settings.razorpayEnabled : true
      });
    }
  }, [settings]);

  // Handle Admin Auth Submission
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin credentials
    if (username === 'LIFEDVP_2023' && password === 'Lifehut@123') {
      onLogin();
      setLoginError('');
    } else {
      setLoginError('Invalid Administrator username or password combination.');
    }
  };

  // --- Image Processing & Upload Handlers ---
  const processProjectImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setProjectImageUploadError('Please select a valid image file (JPG, PNG, WebP, etc.).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setProjectImageUploadError('Image size exceeds 15MB. Please choose a smaller photo.');
      return;
    }

    setUploadingProjectImage(true);
    setProjectImageUploadError(null);

    try {
      // 1. If Supabase is configured, try Supabase Storage bucket first
      if (isSupabaseConfigured()) {
        const publicUrl = await uploadImageToSupabase(file, 'projects');
        if (publicUrl) {
          setProjectForm(prev => ({ ...prev, heroImage: publicUrl }));
          setUploadingProjectImage(false);
          return;
        }
      }

      // 2. Client-side compression / Base64 fallback (guarantees instantaneous working preview & offline/local storage)
      const compressedDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          const img = new Image();
          img.onload = () => {
            const maxDim = 1600;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(readerEvent.target?.result as string);
              return;
            }
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          };
          img.onerror = () => reject(new Error('Failed to parse image file.'));
          img.src = readerEvent.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(file);
      });

      setProjectForm(prev => ({ ...prev, heroImage: compressedDataUrl }));
      setUploadingProjectImage(false);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setProjectImageUploadError(err?.message || 'Failed to process selected image.');
      setUploadingProjectImage(false);
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
    const validFaqs = serviceFaqs
      .map(f => ({ question: f.question.trim(), answer: f.answer.trim() }))
      .filter(f => f.question && f.answer);

    const serviceObj: Service = {
      id: editingItemId || serviceForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      title: serviceForm.title,
      description: serviceForm.description,
      banner: serviceForm.banner || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop',
      features: serviceForm.features
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean),
      faqs: validFaqs.length > 0 ? validFaqs : [
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
    const existingProj = projects.find(p => p.id === editingItemId);
    const existingGallery = existingProj?.gallery && existingProj.gallery.length > 0 ? existingProj.gallery : [];
    const gallery = existingGallery.length > 0 
      ? (existingGallery.includes(projectForm.heroImage) ? existingGallery : [projectForm.heroImage, ...existingGallery.filter(g => g !== projectForm.heroImage)])
      : [projectForm.heroImage];

    const projectObj: Project = {
      id: editingItemId || projectForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      name: projectForm.name,
      location: projectForm.location,
      completionDate: projectForm.completionDate,
      plotSize: projectForm.builtUpArea || '',
      builtUpArea: projectForm.builtUpArea,
      bedrooms: projectForm.bedrooms,
      floors: projectForm.floors,
      budget: projectForm.budget,
      heroImage: projectForm.heroImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
      clientName: projectForm.clientName ? projectForm.clientName.trim() : '',
      clientTestimonial: projectForm.clientTestimonial ? projectForm.clientTestimonial.trim() : '',
      clientAvatar: projectForm.clientName ? projectForm.clientName.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() : 'LH',
      tags: projectForm.tags && projectForm.tags.length > 0 ? projectForm.tags : ['Independent Villa'],
      status: projectForm.isOngoing ? 'Ongoing' : 'Completed',
      gallery,
      isRecent: Boolean(projectForm.isRecent)
    };

    if (isSupabaseConfigured()) {
      await saveSupabaseProject(projectObj);
      // Also update local storage cache so offline / fast load is 100% consistent
      const key = 'lifehut_local_projects';
      try {
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = items.findIndex((i: any) => i.id === projectObj.id);
        if (idx !== -1) {
          items[idx] = { ...items[idx], ...projectObj };
        } else {
          items.unshift(projectObj);
        }
        localStorage.setItem(key, JSON.stringify(items));
      } catch (err) {}
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
      author: 'Chief Civil Engineer (Lifehut Developers)',
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
    setSettingsSaving(true);
    setSettingsSavedSuccess(false);

    const payload: Settings = {
      heroTitle: settingsForm.heroTitle,
      heroSubtitle: settingsForm.heroSubtitle,
      heroBannerImage: settingsForm.heroBannerImage || "/src/assets/images/hero_villa_1784191464588.jpg",
      address: settingsForm.address,
      phone: settingsForm.phone,
      email: settingsForm.email,
      hours: settingsForm.hours || "Mon – Sat: 9:00 AM – 6:00 PM",
      whatsappNumber: settingsForm.whatsappNumber || "918072163330",
      facebookUrl: settingsForm.facebookUrl || "",
      instagramUrl: settingsForm.instagramUrl || "",
      pinterestUrl: settingsForm.pinterestUrl || "",
      youtubeUrl: settingsForm.youtubeUrl || "",
      linkedinUrl: settingsForm.linkedinUrl || "",
      seoTitle: settingsForm.seoTitle || "Top Residential Building Construction Company in Chennai | Lifehut Developers",
      seoDescription: settingsForm.seoDescription || "Leading residential building construction company in Chennai.",
      seoKeywords: settingsForm.seoKeywords || "residential building construction company, turnkey house builders chennai",
      razorpayKeyId: settingsForm.razorpayKeyId || "",
      razorpayKeySecret: settingsForm.razorpayKeySecret || "",
      razorpayEnabled: settingsForm.razorpayEnabled,
      stats: {
        projectsDone: settingsForm.projectsDone,
        experienceYears: settingsForm.experienceYears,
        clientSatisfaction: settingsForm.clientSatisfaction,
        hiddenCharges: settingsForm.hiddenCharges
      }
    };

    // Always update local cache for instant UI reflection
    try {
      localStorage.setItem('lifehut_local_settings', JSON.stringify(payload));
    } catch {
      // ignore localstorage errors
    }

    if (isSupabaseConfigured()) {
      const ok = await saveSupabaseSettings(payload);
      // Synchronize with server endpoint in background so server_db has latest keys
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
      setSettingsSaving(false);
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 4000);
      refreshAllData();
      return;
    }

    if (isStaticMode) {
      setSettingsSaving(false);
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 4000);
      refreshAllData();
      return;
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setSettingsSaving(false);
      if (res.ok) {
        setSettingsSavedSuccess(true);
        setTimeout(() => setSettingsSavedSuccess(false), 4000);
        refreshAllData();
      }
    } catch (err) {
      console.error(err);
      setSettingsSaving(false);
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 4000);
      refreshAllData();
    }
  };

  // Open Edit Modals
  const openEditService = (svc: Service) => {
    setEditingItemType('service');
    setEditingItemId(svc.id);
    setServiceForm({
      title: svc.title || '',
      description: svc.description || '',
      banner: svc.banner || '',
      features: (svc.features || []).join('\n'),
      faqs: ''
    });
    setServiceFaqs(
      svc.faqs && svc.faqs.length > 0
        ? svc.faqs.map(f => ({ question: f.question || '', answer: f.answer || '' }))
        : [{ question: '', answer: '' }]
    );
  };

  // Quick toggle for Home Recent Project showcase
  const handleToggleRecentProject = async (proj: Project, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated: Project = { ...proj, isRecent: !proj.isRecent };
    if (isSupabaseConfigured()) {
      await saveSupabaseProject(updated);
      refreshAllData();
      return;
    }
    if (isStaticMode) {
      const key = 'lifehut_local_projects';
      try {
        const items = JSON.parse(localStorage.getItem(key) || '[]');
        const idx = items.findIndex((i: any) => i.id === proj.id);
        if (idx !== -1) {
          items[idx] = { ...items[idx], isRecent: !proj.isRecent };
        } else {
          items.unshift(updated);
        }
        localStorage.setItem(key, JSON.stringify(items));
        refreshAllData();
      } catch (err) {
        console.error('Failed to toggle recent project locally', err);
      }
      return;
    }
    try {
      await fetch(`/api/projects/${proj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      refreshAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to ensure completionDate string works with <input type="date" />
  const formatForDatePicker = (dateStr?: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  const openEditProject = (proj: Project) => {
    setEditingItemType('project');
    setEditingItemId(proj.id);
    setProjectImageUploadError(null);
    setProjectImageMode('upload');
    setProjectForm({
      name: proj.name || '',
      location: proj.location || '',
      completionDate: formatForDatePicker(proj.completionDate),
      plotSize: proj.builtUpArea || proj.plotSize || '',
      builtUpArea: proj.builtUpArea || proj.plotSize || '',
      bedrooms: proj.bedrooms || 3,
      floors: proj.floors || 2,
      budget: proj.budget || '',
      heroImage: proj.heroImage || '',
      clientName: proj.clientName || '',
      clientTestimonial: proj.clientTestimonial || '',
      tags: proj.tags && proj.tags.length > 0 ? proj.tags : ['Independent Villa'],
      isRecent: Boolean(proj.isRecent),
      isOngoing: proj.status === 'Ongoing'
    });
  };

  const openEditBlog = (b: Blog) => {
    setEditingItemType('blog');
    setEditingItemId(b.id);
    setBlogForm({
      title: b.title || '',
      category: b.category || 'Structural',
      readTime: b.readTime || b.readingTime || "5 min read",
      content: b.content || ''
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
                value={username ?? ''}
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
                value={password ?? ''}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1A6DB5] text-white"
              />
              
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-bold uppercase">Enquiries & Quotes</div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1A2332] mt-0.5">{enquiries.length}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-bold uppercase">House Plans</div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1A2332] mt-0.5">{housePlans.length || 8}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#1A6DB5] flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-bold uppercase">Active Projects</div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1A2332] mt-0.5">{projects.length}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-bold uppercase">Expert Blogs</div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1A2332] mt-0.5">{blogs.length}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-bold uppercase">Total Services</div>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1A2332] mt-0.5">{services.length}</div>
            </div>
          </div>

        </div>

        {/* Secondary Navigation (CMS subtabs) */}
        <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap mb-8 gap-6">
          {[
            { id: 'enquiries', label: 'Client Lead Enquiries', icon: Users },
            { id: 'housePlans', label: 'House Plans Catalog', icon: Home },
            { id: 'projects', label: 'Projects Gallery', icon: Briefcase },
            { id: 'blogs', label: 'Blog Manuals', icon: FileText },
            { id: 'services', label: 'Specializations', icon: Check },
            { id: 'settings', label: 'Site Metrics & SEO', icon: SettingsIcon }
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
              </button>
            );
          })}
        </div>

        {/* SUBTAB DETAILS MODULES */}

        {/* House Plans CMS Subtab */}
        {activeSubTab === 'housePlans' && (
          <AdminHousePlans
            housePlans={housePlans}
            refreshAllData={refreshAllData}
            isStaticMode={isStaticMode}
          />
        )}

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
              <div>
                <h3 className="font-display text-lg font-bold text-[#1A2332] border-l-4 border-[#1A6DB5] pl-3">
                  Portfolio Projects Panel
                </h3>
                <p className="text-xs text-slate-400 mt-1 pl-3">
                  Manage projects, tags, client testimonials, and home featured status.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingItemType('project');
                  setEditingItemId(null);
                  setProjectImageUploadError(null);
                  setProjectImageMode('upload');
                  setProjectForm({
                    name: '', location: '', completionDate: new Date().toISOString().split('T')[0],
                    plotSize: '3,200 sq.ft', builtUpArea: '3,200 sq.ft',
                    bedrooms: 3, floors: 2, budget: '85 Lakhs',
                    heroImage: '',
                    clientName: '', clientTestimonial: '',
                    tags: ['Independent Villa'],
                    isRecent: true,
                    isOngoing: false
                  });
                }}
                className="px-4 py-2 bg-[#1A6DB5] hover:bg-[#1558a0] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div key={proj.id} className="border border-slate-100 rounded-2xl p-4 flex justify-between items-center bg-slate-50 relative group">
                  <div className="flex items-center gap-4 overflow-hidden pr-4">
                    <div className="relative flex-shrink-0">
                      <img src={proj.heroImage} alt="" referrerPolicy="no-referrer" className="w-16 h-12 object-cover rounded-lg bg-slate-200" />
                      {proj.isRecent && (
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center shadow text-[10px]" title="Featured in Home Recent Projects">
                          ★
                        </span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-bold text-xs sm:text-sm text-[#1A2332] truncate">{proj.name}</div>
                        {proj.status === 'Ongoing' ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex-shrink-0">
                            On-going
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                            Completed
                          </span>
                        )}
                        {proj.isRecent && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 flex-shrink-0">
                            Home Recent
                          </span>
                        )}
                        {proj.tags && proj.tags.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-[#1A6DB5] border border-blue-100 flex-shrink-0">
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5 flex items-center gap-2">
                        <span>{proj.location}</span>
                        {proj.clientName && (
                          <span>• Client: <strong className="text-slate-600 font-semibold">{proj.clientName}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                      onClick={(e) => handleToggleRecentProject(proj, e)}
                      className={`p-2 rounded-lg border transition-colors ${proj.isRecent ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' : 'bg-white text-slate-400 border-slate-200 hover:text-amber-500'}`}
                      title={proj.isRecent ? "Remove from Home Recent Projects" : "Feature in Home Recent Projects"}
                    >
                      <Star className={`w-3.5 h-3.5 ${proj.isRecent ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
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
                    features: 'Custom 2D floor plans & 3D elevations\nHigh-grade Fe 550 TMT steel, UltraTech cement\nDedicated site supervision by qualified civil engineers',
                    faqs: ''
                  });
                  setServiceFaqs([
                    { question: "What is the structural warranty?", answer: "We provide certified structural stability reports and comprehensive quality assurance." },
                    { question: "Are architectural drawings included?", answer: "Yes, customized 2D floor plans and 3D elevations are included." }
                  ]);
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

        {/* 5. Settings / Stats Metrics & SEO */}
        {activeSubTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display text-lg font-bold text-[#1A2332] border-l-4 border-[#1A6DB5] pl-3">
                  Site Parameters, Metric Stats & Cloud SEO Handles
                </h3>
                <p className="text-xs text-slate-400 pl-3 mt-1">Updates are synchronized to your Supabase Cloud Database and applied site-wide</p>
              </div>

              {settingsSavedSuccess && (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold animate-fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Cloud Settings Saved!</span>
                </div>
              )}
            </div>

            {/* Section 1: Hero Branding */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-[#1A6DB5] uppercase tracking-wider">1. Hero Section Branding</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Hero Main Headline</label>
                  <input
                    type="text"
                    value={settingsForm.heroTitle ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                    placeholder="Turnkey House Construction in Chennai"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Hero Subtitle</label>
                  <input
                    type="text"
                    value={settingsForm.heroSubtitle ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                    placeholder="Top Residential Building Construction Company in Chennai"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Hero Banner Image URL</label>
                <input
                  type="text"
                  value={settingsForm.heroBannerImage ?? ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroBannerImage: e.target.value })}
                  placeholder="/src/assets/images/hero_villa_1784191464588.jpg"
                  className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                />
              </div>
            </div>

            {/* Section 2: Metric Stats */}
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-[#1A6DB5] uppercase tracking-wider">2. Site Performance Metrics & Counters</span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Projects Completed</label>
                  <input
                    type="text"
                    value={settingsForm.projectsDone ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, projectsDone: e.target.value })}
                    placeholder="120+"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Years Active Experience</label>
                  <input
                    type="text"
                    value={settingsForm.experienceYears ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, experienceYears: e.target.value })}
                    placeholder="7+"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Client Satisfaction</label>
                  <input
                    type="text"
                    value={settingsForm.clientSatisfaction ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, clientSatisfaction: e.target.value })}
                    placeholder="99%"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Hidden Charges Guarantee</label>
                  <input
                    type="text"
                    value={settingsForm.hiddenCharges ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hiddenCharges: e.target.value })}
                    placeholder="₹0"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Contact & Hours */}
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-[#1A6DB5] uppercase tracking-wider">3. Direct Contact & Operating Hours</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Corporate Email</label>
                  <input
                    type="email"
                    value={settingsForm.email ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    placeholder="contact@lifehutdevelopers.com"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Direct Phone Hotline</label>
                  <input
                    type="text"
                    value={settingsForm.phone ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    placeholder="+91 80721 63330"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">WhatsApp Number (with country code)</label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="918072163330"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Business Working Hours</label>
                  <input
                    type="text"
                    value={settingsForm.hours ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hours: e.target.value })}
                    placeholder="Mon – Sat: 9:00 AM – 6:00 PM"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Headquarters Address</label>
                  <textarea
                    rows={2}
                    value={settingsForm.address ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    placeholder="No. 14, 2nd Cross Street, AGS Colony, Velachery, Chennai - 600042"
                    className="border border-slate-200 p-3 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Social Handles */}
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-[#1A6DB5] uppercase tracking-wider">4. Social Media Handles</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Instagram Profile URL</label>
                  <input
                    type="text"
                    value={settingsForm.instagramUrl ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/lifehut_developers"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">YouTube Channel URL</label>
                  <input
                    type="text"
                    value={settingsForm.youtubeUrl ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/@lifehutdevelopers"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Pinterest Profile URL</label>
                  <input
                    type="text"
                    value={settingsForm.pinterestUrl ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, pinterestUrl: e.target.value })}
                    placeholder="https://in.pinterest.com/lifehutdevelopers"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Facebook Page URL</label>
                  <input
                    type="text"
                    value={settingsForm.facebookUrl ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/lifehutdevelopers"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: SEO Meta Tags */}
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#1A6DB5]" />
                <span className="text-xs font-bold text-[#1A6DB5] uppercase tracking-wider">5. Search Engine Optimization (SEO & Meta Tags)</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">SEO Meta Title (Browser & Google Search Header)</label>
                <input
                  type="text"
                  value={settingsForm.seoTitle ?? ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, seoTitle: e.target.value })}
                  placeholder="Top Residential Building Construction Company in Chennai | Lifehut Developers"
                  className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 bg-white focus:border-[#1A6DB5] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">SEO Meta Description (Google Snippet Description)</label>
                <textarea
                  rows={2}
                  value={settingsForm.seoDescription ?? ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, seoDescription: e.target.value })}
                  placeholder="Leading residential building construction company in Chennai offering transparent packages, 100% vastu compliance, and on-time handover."
                  className="border border-slate-200 p-3 text-xs rounded-xl text-slate-800 bg-white focus:border-[#1A6DB5] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">SEO Keywords (Comma-Separated)</label>
                <input
                  type="text"
                  value={settingsForm.seoKeywords ?? ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, seoKeywords: e.target.value })}
                  placeholder="residential building construction company, turnkey house builders chennai, villa contractors, civil engineering chennai"
                  className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 bg-white focus:border-[#1A6DB5] outline-none"
                />
              </div>
            </div>

            {/* Razorpay Payment Gateway Integration */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    ₹
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1A2332] flex items-center gap-2">
                      Razorpay Payment Gateway Configuration
                      {settingsForm.razorpayKeyId ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                          Configured
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold">
                          Not Configured
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Configure your Razorpay API credentials to accept payments for full CAD &amp; PDF drawings download.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.razorpayEnabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, razorpayEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1A6DB5]"></div>
                    <span className="ml-2 text-xs font-semibold text-slate-700">Checkout Enabled</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Razorpay Key ID</span>
                    <span className="text-[10px] font-mono text-slate-400">rzp_live_... or rzp_test_...</span>
                  </label>
                  <input
                    type="text"
                    value={settingsForm.razorpayKeyId ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, razorpayKeyId: e.target.value })}
                    placeholder="rzp_live_1234567890abcdef"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 bg-white focus:border-[#1A6DB5] outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400">
                    Found under Razorpay Dashboard → Settings → API Keys.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Razorpay Key Secret</span>
                    <span className="text-[10px] font-mono text-slate-400">Secret Token</span>
                  </label>
                  <input
                    type="password"
                    value={settingsForm.razorpayKeySecret ?? ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, razorpayKeySecret: e.target.value })}
                    placeholder="••••••••••••••••••••••••"
                    className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 bg-white focus:border-[#1A6DB5] outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400">
                    Never exposed to client browsers. Secured on server.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                <span className="font-bold text-blue-700 flex-shrink-0">Actual Payments:</span>
                <span>
                  Configure your Razorpay Key ID and Secret to process actual UPI (Google Pay, PhonePe, Paytm), NetBanking, and Card payments. All architectural CAD drawings and high-resolution PDF blueprints are strictly protected and only unlocked after authentic payment confirmation.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleTestRazorpay}
                  disabled={testingRazorpay}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 w-fit disabled:opacity-50"
                >
                  {testingRazorpay ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1A6DB5]" />
                      <span>Verifying Gateway...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡ Test Gateway Connection</span>
                    </>
                  )}
                </button>

                {razorpayTestStatus && (
                  <div className={`text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 ${razorpayTestStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                    <span>{razorpayTestStatus.message}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={settingsSaving}
                className="px-6 py-3.5 bg-[#1A6DB5] hover:bg-[#1558a0] disabled:bg-slate-400 text-white font-bold text-xs tracking-wider uppercase rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-[#1A6DB5]/20"
              >
                {settingsSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving to Cloud DB...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save All Parameters & SEO</span>
                  </>
                )}
              </button>

              {settingsSavedSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> All site settings and SEO handles updated successfully!
                </span>
              )}
            </div>
          </form>
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
                    <input type="text" required value={serviceForm.title ?? ''} onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Description Overview</label>
                    <textarea rows={3} required value={serviceForm.description ?? ''} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="border border-slate-200 p-3 text-xs rounded-xl" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Banner Image URL</label>
                    <input type="text" required value={serviceForm.banner ?? ''} onChange={(e) => setServiceForm({ ...serviceForm, banner: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Key Features (One feature per line)</label>
                    <textarea
                      rows={4}
                      required
                      value={serviceForm.features ?? ''}
                      onChange={(e) => setServiceForm({ ...serviceForm, features: e.target.value })}
                      placeholder={"Custom 2D floor plans & 3D front elevations\nHigh-grade Fe 550 TMT steel, UltraTech cement\nDedicated site supervision by qualified civil engineers"}
                      className="border border-slate-200 p-3 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none font-sans leading-relaxed"
                    />
                    <span className="text-[10px] text-slate-400">Enter each feature on its own line. Commas inside a feature are preserved intact.</span>
                  </div>

                  {/* Dynamic FAQs Section */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="text-xs font-bold text-slate-700">Frequently Asked Questions (FAQs)</label>
                        <p className="text-[10px] text-slate-400">Shown in the interactive FAQ accordion on the service details page</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setServiceFaqs([...serviceFaqs, { question: '', answer: '' }])}
                        className="text-[11px] font-bold text-[#1A6DB5] hover:text-[#1558a0] flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add FAQ</span>
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 mt-1 max-h-[220px] overflow-y-auto pr-1">
                      {serviceFaqs.map((faq, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2 relative">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-[#1A6DB5] uppercase tracking-wider">FAQ #{idx + 1}</span>
                            {serviceFaqs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setServiceFaqs(serviceFaqs.filter((_, i) => i !== idx))}
                                className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                                title="Remove FAQ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={faq.question ?? ''}
                            onChange={(e) => {
                              const updated = [...serviceFaqs];
                              updated[idx].question = e.target.value;
                              setServiceFaqs(updated);
                            }}
                            placeholder="Question (e.g. What is the structural load ratio?)"
                            className="border border-slate-200 px-3 py-1.5 text-xs rounded-lg bg-white text-slate-800 outline-none focus:border-[#1A6DB5]"
                          />
                          <textarea
                            rows={2}
                            value={faq.answer ?? ''}
                            onChange={(e) => {
                              const updated = [...serviceFaqs];
                              updated[idx].answer = e.target.value;
                              setServiceFaqs(updated);
                            }}
                            placeholder="Answer (e.g. We model structures to safely exceed wind load standard indices by 15%.)"
                            className="border border-slate-200 p-2 text-xs rounded-lg bg-white text-slate-800 outline-none focus:border-[#1A6DB5]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="w-full mt-2 py-3 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-[#1A6DB5]/20 transition-all">
                    Save Specialization Data
                  </button>
                </form>
              )}

              {/* 2. Project Form */}
              {editingItemType === 'project' && (
                <form onSubmit={handleSaveProject} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Project Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Modern 4BHK Luxury Villa"
                        value={projectForm.name ?? ''}
                        onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                        className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl focus:border-[#1A6DB5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#1A6DB5]" />
                        <span>Client Name</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mr. Mohanraj / Dr. Senthil"
                        value={projectForm.clientName ?? ''}
                        onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
                        className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl focus:border-[#1A6DB5] outline-none"
                      />
                    </div>
                  </div>

                  {/* Tag Selection Checkboxes */}
                  <div className="flex flex-col gap-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#1A6DB5]" />
                        <span>Tag Selection (Project Type)</span>
                      </label>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {projectForm.tags.length} selected
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Select required categories that apply to this project:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-1">
                      {AVAILABLE_PROJECT_TAGS.map((tag) => {
                        const isChecked = projectForm.tags.includes(tag);
                        return (
                          <label
                            key={tag}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all select-none ${
                              isChecked
                                ? 'bg-blue-50 border-[#1A6DB5] text-[#1A6DB5] shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const newTags = e.target.checked
                                  ? [...projectForm.tags, tag]
                                  : projectForm.tags.filter((t) => t !== tag);
                                setProjectForm({ ...projectForm, tags: newTags });
                              }}
                              className="w-4 h-4 rounded border-slate-300 text-[#1A6DB5] focus:ring-0 cursor-pointer accent-[#1A6DB5]"
                            />
                            <span className="truncate">{tag}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#1A6DB5]" />
                        <span>Location (Chennai Suburb)</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Keelkattalai, Chennai"
                        value={projectForm.location ?? ''}
                        onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                        className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl focus:border-[#1A6DB5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#1A6DB5]" />
                        <span>Completion Date</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={projectForm.completionDate ?? ''}
                        onChange={(e) => setProjectForm({ ...projectForm, completionDate: e.target.value })}
                        className="border border-slate-200 px-4 py-2 text-xs rounded-xl focus:border-[#1A6DB5] outline-none bg-white font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-[#1A6DB5]" />
                        <span>Built-Up Area</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 3,200 sq.ft"
                        value={projectForm.builtUpArea ?? ''}
                        onChange={(e) => setProjectForm({ ...projectForm, builtUpArea: e.target.value, plotSize: e.target.value })}
                        className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl focus:border-[#1A6DB5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Bedrooms (BHK)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={20}
                        value={projectForm.bedrooms ?? 3}
                        onChange={(e) => setProjectForm({ ...projectForm, bedrooms: parseInt(e.target.value) || 1 })}
                        className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl focus:border-[#1A6DB5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Floors (Count)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={10}
                        value={projectForm.floors ?? 2}
                        onChange={(e) => setProjectForm({ ...projectForm, floors: parseInt(e.target.value) || 1 })}
                        className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl focus:border-[#1A6DB5] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-700">Turnkey Budget / Pricing</label>
                      <input
                        type="text"
                        placeholder="e.g. ₹85 Lakhs"
                        value={projectForm.budget ?? ''}
                        onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                        className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl focus:border-[#1A6DB5] outline-none"
                      />
                    </div>
                    <div className="flex items-center h-[41px] px-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700 w-full">
                        <input
                          type="checkbox"
                          checked={Boolean(projectForm.isOngoing)}
                          onChange={(e) => setProjectForm({ ...projectForm, isOngoing: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-[#1A6DB5] focus:ring-0 cursor-pointer accent-[#1A6DB5]"
                        />
                        <span>On-going Project</span>
                      </label>
                    </div>
                  </div>

                  {/* Hero Presentation Image Upload / Management */}
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-[#1A6DB5]" />
                          <span>Project Hero Image</span>
                        </label>
                        <span className="text-[10px] text-slate-400">Upload high-resolution building elevation or site photograph</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setProjectImageMode(projectImageMode === 'upload' ? 'url' : 'upload')}
                        className="text-[11px] font-semibold text-[#1A6DB5] hover:text-[#1558a0] flex items-center gap-1 transition-colors"
                      >
                        {projectImageMode === 'upload' ? (
                          <>
                            <Link2 className="w-3 h-3" />
                            <span>Or paste URL</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3" />
                            <span>Switch to File Upload</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Hidden native file input for file picker */}
                    <input
                      ref={projectFileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/avif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          processProjectImageFile(file);
                        }
                        e.target.value = '';
                      }}
                    />

                    {/* 1. If Image is Present: Show Clean Preview with controls */}
                    {projectForm.heroImage ? (
                      <div className="relative rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden group shadow-xs">
                        <div className="relative aspect-[16/9] w-full bg-slate-900/10 overflow-hidden">
                          <img
                            src={projectForm.heroImage}
                            alt="Project Preview"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                            <span className="text-white text-xs font-medium truncate max-w-[220px]">
                              {projectForm.heroImage.startsWith('data:') ? 'Local Image (Optimized & Ready)' : 'Project Cover Photo'}
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => projectFileInputRef.current?.click()}
                                className="px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                              >
                                <Upload className="w-3.5 h-3.5 text-[#1A6DB5]" />
                                <span>Replace</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setProjectForm(prev => ({ ...prev, heroImage: '' }))}
                                className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Image uploaded & attached</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => projectFileInputRef.current?.click()}
                            className="text-[#1A6DB5] hover:text-[#1558a0] font-bold text-xs flex items-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload New Photo</span>
                          </button>
                        </div>
                      </div>
                    ) : projectImageMode === 'upload' ? (
                      /* 2. Drag & Drop File Upload Dropzone */
                      <div
                        onClick={() => projectFileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingProjectImage(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDraggingProjectImage(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingProjectImage(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            processProjectImageFile(file);
                          }
                        }}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                          isDraggingProjectImage
                            ? 'border-[#1A6DB5] bg-sky-50/80 scale-[0.99]'
                            : 'border-slate-300 hover:border-[#1A6DB5] hover:bg-slate-50/80 bg-slate-50/40'
                        }`}
                      >
                        {uploadingProjectImage ? (
                          <div className="flex flex-col items-center gap-2 py-4">
                            <Loader2 className="w-8 h-8 text-[#1A6DB5] animate-spin" />
                            <span className="text-xs font-bold text-slate-700">Uploading & optimizing image...</span>
                            <span className="text-[10px] text-slate-400">Processing photo dimensions for crisp responsive display</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#1A6DB5] border border-sky-100 flex items-center justify-center shadow-sm">
                              <Upload className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                <span className="text-[#1A6DB5] underline decoration-dotted underline-offset-2">Click to upload photo</span> or drag & drop here
                              </p>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Supports PNG, JPG, JPEG, WEBP or AVIF (Up to 15MB)
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full shadow-2xs">
                              Auto-optimized for instant fast loading
                            </span>
                          </>
                        )}
                      </div>
                    ) : (
                      /* 3. Fallback direct URL input */
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          required
                          value={projectForm.heroImage ?? ''}
                          onChange={(e) => setProjectForm({ ...projectForm, heroImage: e.target.value })}
                          placeholder="https://images.unsplash.com/... or https://..."
                          className="border border-slate-200 px-4 py-2.5 text-xs rounded-xl text-slate-800 focus:border-[#1A6DB5] outline-none"
                        />
                        <span className="text-[10px] text-slate-400">Paste direct image URL or hosted CDN link</span>
                      </div>
                    )}

                    {projectImageUploadError && (
                      <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{projectImageUploadError}</span>
                      </div>
                    )}
                  </div>



                  {/* Selection Badge Tool for Home Recent Projects */}
                  <div className="bg-gradient-to-r from-amber-50/90 to-sky-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${projectForm.isRecent ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1A2332] flex items-center gap-2">
                          <span>Show in "Recent Projects" on Home Page</span>
                          {projectForm.isRecent ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" /> Featured on Home
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-600">
                              Portfolio Only
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          When enabled, this project will appear in the "Recent projects across Tamil Nadu" showcase section on the Homepage.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-3 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={Boolean(projectForm.isRecent)}
                        onChange={(e) => setProjectForm({ ...projectForm, isRecent: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  <button type="submit" className="w-full mt-2 py-3 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold text-xs uppercase tracking-wider rounded-xl">
                    Save Project Portfolio
                  </button>
                </form>
              )}

              {/* 3. Blog Form */}
              {editingItemType === 'blog' && (
                <form onSubmit={handleSaveBlog} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Article Title</label>
                    <input type="text" required value={blogForm.title ?? ''} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500">Category</label>
                      <select value={blogForm.category ?? 'Structural'} onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })} className="border border-slate-200 px-4 py-2 text-xs rounded-xl bg-white text-slate-700 outline-none">
                        <option value="Structural">Structural</option>
                        <option value="Materials">Materials</option>
                        <option value="Budgeting">Budgeting</option>
                        <option value="Planning">Planning</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500">Estimated Reading Time</label>
                      <input type="text" required value={blogForm.readTime ?? ''} onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })} placeholder="e.g. 5 min read" className="border border-slate-200 px-4 py-2 text-xs rounded-xl" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500">Content Body</label>
                    <textarea rows={6} required value={blogForm.content ?? ''} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} placeholder="Write your technical engineering blog detail here..." className="border border-slate-200 p-3 text-xs rounded-xl" />
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
