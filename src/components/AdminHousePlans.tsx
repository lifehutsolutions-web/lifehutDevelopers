import React, { useState, useRef } from 'react';
import { HousePlan, RoomDimension } from '../types';
import { defaultHousePlans } from '../data/defaultHousePlans';
import { saveSupabaseHousePlan, deleteSupabaseHousePlan, isSupabaseConfigured, uploadImageToSupabase, uploadZipToSupabase } from '../lib/supabase';
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  Compass, 
  Ruler, 
  Check, 
  X, 
  Upload, 
  Save, 
  Layers, 
  Bed, 
  Bath, 
  Car, 
  Sparkles, 
  Eye, 
  Search,
  RotateCcw,
  Image as ImageIcon,
  UploadCloud,
  FileImage,
  AlertCircle,
  Loader2,
  Paperclip,
  ExternalLink,
  Archive,
  Download,
  CheckCircle2,
  FileArchive,
  FileCode,
  CreditCard,
  Maximize2
} from 'lucide-react';

// Client-side image processing helper: tries Supabase Storage first, with automatic Canvas compression/Base64 fallback
const processImageFile = async (file: File, folder: string = 'house-plans'): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPG, PNG, WebP, etc.).');
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Image size exceeds 15MB. Please choose a smaller photo.');
  }

  // 1. If Supabase is configured, upload to Supabase Storage bucket
  if (isSupabaseConfigured()) {
    try {
      const publicUrl = await uploadImageToSupabase(file, folder);
      if (publicUrl) return publicUrl;
    } catch (err) {
      console.warn('Supabase storage upload notice, proceeding with optimized local compression:', err);
    }
  }

  // 2. Client-side canvas compression & Base64 fallback (guarantees instantaneous working preview & storage)
  return new Promise<string>((resolve, reject) => {
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
};

interface AdminHousePlansProps {
  housePlans: HousePlan[];
  refreshAllData: () => void;
  isStaticMode?: boolean;
}

export const AdminHousePlans: React.FC<AdminHousePlansProps> = ({
  housePlans = [],
  refreshAllData,
  isStaticMode = false
}) => {
  const plans = housePlans && housePlans.length > 0 ? housePlans : defaultHousePlans;

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formPlanCode, setFormPlanCode] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formBuiltUpArea, setFormBuiltUpArea] = useState<number>(1500);
  const [formPlotDimensions, setFormPlotDimensions] = useState("30' x 50'");
  const [formBuildingDimensions, setFormBuildingDimensions] = useState("24'0\" x 42'0\"");
  const [formBedrooms, setFormBedrooms] = useState<number>(3);
  const [formBathrooms, setFormBathrooms] = useState<number>(3);
  const [formCarParking, setFormCarParking] = useState<number>(1);
  const [formFloors, setFormFloors] = useState<number>(1);
  const [formFloorsLabel, setFormFloorsLabel] = useState('1 Storey (Ground Floor)');
  const [formFacing, setFormFacing] = useState<'East' | 'North' | 'South' | 'West'>('East');
  const [formStyle, setFormStyle] = useState('Modern Minimalist Villa');
  const [formCostRange, setFormCostRange] = useState('₹31.5L – ₹36.0L');
  const [formCostPerSqft, setFormCostPerSqft] = useState('₹2,100 – ₹2,400 / sq.ft');
  const [formElevationImage, setFormElevationImage] = useState('');
  const [formFloorPlanImage, setFormFloorPlanImage] = useState('');
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([]);
  const [formDescription, setFormDescription] = useState('');
  const [formVastuCompliant, setFormVastuCompliant] = useState(true);
  const [formVastuScore, setFormVastuScore] = useState('100% Vastu');
  const [formFeaturesText, setFormFeaturesText] = useState('');
  const [formVastuNotesText, setFormVastuNotesText] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  const [formRoomDimensions, setFormRoomDimensions] = useState<RoomDimension[]>([
    { roomName: 'Living & Dining', dimension: "14'0\" x 20'6\"", floor: 'Ground Floor', vastuZone: 'North-East' },
    { roomName: 'Master Bedroom', dimension: "13'0\" x 14'0\"", floor: 'Ground Floor', vastuZone: 'South-West' },
    { roomName: 'Kitchen & Utility', dimension: "10'0\" x 9'0\"", floor: 'Ground Floor', vastuZone: 'South-East' },
    { roomName: 'Bedroom 2', dimension: "12'0\" x 12'0\"", floor: 'Ground Floor', vastuZone: 'North-West' }
  ]);

  // Image Attachment & Upload states
  const [elevationInputMode, setElevationInputMode] = useState<'upload' | 'url'>('upload');
  const [floorPlanInputMode, setFloorPlanInputMode] = useState<'upload' | 'url'>('upload');
  const [uploadingElevation, setUploadingElevation] = useState(false);
  const [uploadingFloorPlan, setUploadingFloorPlan] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [elevationError, setElevationError] = useState<string | null>(null);
  const [floorPlanError, setFloorPlanError] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');

  // Drag states
  const [isDraggingElevation, setIsDraggingElevation] = useState(false);
  const [isDraggingFloorPlan, setIsDraggingFloorPlan] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);

  // File input refs
  const elevationFileInputRef = useRef<HTMLInputElement>(null);
  const floorPlanFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const zipFileInputRef = useRef<HTMLInputElement>(null);

  // Full CAD & PDF Drawings ZIP Package states
  const [formCadPackageZipUrl, setFormCadPackageZipUrl] = useState('');
  const [formCadPackageFileName, setFormCadPackageFileName] = useState('');
  const [formCadPackageSize, setFormCadPackageSize] = useState('');
  const [formCadPackagePrice, setFormCadPackagePrice] = useState<number>(999);
  const [formCadPackageIncludesText, setFormCadPackageIncludesText] = useState('');
  const [uploadingZip, setUploadingZip] = useState(false);
  const [zipUploadError, setZipUploadError] = useState<string | null>(null);
  const [isDraggingZip, setIsDraggingZip] = useState(false);

  // CAD ZIP upload handler
  const handleZipFileSelect = async (file: File) => {
    setUploadingZip(true);
    setZipUploadError(null);
    try {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      
      // Convert file to Base64 for server storage
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsDataURL(file);
      });

      const fileBase64 = await base64Promise;

      // 1. Try Express server upload endpoint
      try {
        const res = await fetch('/api/upload-cad-zip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileBase64,
            planId: editingId || undefined
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) {
            setFormCadPackageZipUrl(data.url);
            setFormCadPackageFileName(data.fileName || file.name);
            setFormCadPackageSize(data.size || sizeMb);
            setUploadingZip(false);
            return;
          }
        }
      } catch (srvErr) {
        console.warn('Server zip upload endpoint error, trying Supabase storage fallback:', srvErr);
      }

      // 2. Try Supabase storage
      if (isSupabaseConfigured()) {
        const supaResult = await uploadZipToSupabase(file);
        if (supaResult && supaResult.url) {
          setFormCadPackageZipUrl(supaResult.url);
          setFormCadPackageFileName(supaResult.fileName);
          setFormCadPackageSize(supaResult.size);
          setUploadingZip(false);
          return;
        }
      }

      // 3. Fallback: Store locally as data URI
      setFormCadPackageZipUrl(fileBase64);
      setFormCadPackageFileName(file.name);
      setFormCadPackageSize(sizeMb);
    } catch (err: any) {
      console.error('CAD Zip upload failed:', err);
      setZipUploadError(err?.message || 'Failed to upload ZIP archive. Please verify file size.');
    } finally {
      setUploadingZip(false);
    }
  };

  // Upload handlers
  const handleElevationFileSelect = async (file: File) => {
    setUploadingElevation(true);
    setElevationError(null);
    try {
      const url = await processImageFile(file, 'house-plans/elevation');
      setFormElevationImage(url);
    } catch (err: any) {
      setElevationError(err?.message || 'Failed to upload elevation image.');
    } finally {
      setUploadingElevation(false);
    }
  };

  const handleFloorPlanFileSelect = async (file: File) => {
    setUploadingFloorPlan(true);
    setFloorPlanError(null);
    try {
      const url = await processImageFile(file, 'house-plans/floorplans');
      setFormFloorPlanImage(url);
    } catch (err: any) {
      setFloorPlanError(err?.message || 'Failed to upload floor plan blueprint.');
    } finally {
      setUploadingFloorPlan(false);
    }
  };

  const handleGalleryFilesSelect = async (files: FileList | File[]) => {
    setUploadingGallery(true);
    setGalleryError(null);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const url = await processImageFile(file, 'house-plans/gallery');
          newUrls.push(url);
        }
      }
      if (newUrls.length > 0) {
        setFormGalleryImages(prev => [...prev, ...newUrls]);
      }
    } catch (err: any) {
      setGalleryError(err?.message || 'Failed to upload attached images.');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!galleryUrlInput.trim()) return;
    setFormGalleryImages(prev => [...prev, galleryUrlInput.trim()]);
    setGalleryUrlInput('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormTitle('');
    setFormPlanCode(`LH-HP-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormSlug('');
    setFormBuiltUpArea(1500);
    setFormPlotDimensions("30' x 50'");
    setFormBuildingDimensions("24'0\" x 42'0\"");
    setFormBedrooms(3);
    setFormBathrooms(3);
    setFormCarParking(1);
    setFormFloors(1);
    setFormFloorsLabel('1 Storey (Ground Floor)');
    setFormFacing('East');
    setFormStyle('Modern Contemporary');
    setFormCostRange('₹31.5L – ₹36.0L');
    setFormCostPerSqft('₹2,100 – ₹2,400 / sq.ft');
    setFormElevationImage('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop');
    setFormFloorPlanImage('https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop');
    setFormGalleryImages([]);
    setElevationError(null);
    setFloorPlanError(null);
    setGalleryError(null);
    setElevationInputMode('upload');
    setFloorPlanInputMode('upload');
    setGalleryUrlInput('');
    setFormDescription('Thoughtfully drafted architectural house plan featuring optimized spatial efficiency, 100% Vastu compliance, natural ventilation, and zero corridor dead space.');
    setFormVastuCompliant(true);
    setFormVastuScore('100% Vastu');
    setFormFeaturesText("Zero corridor dead space\n100% Vastu compliant layout\nSeparate dry utility & pooja space\nCovered car porch with pavers");
    setFormVastuNotesText("Main entrance located in East (Indra zone)\nMaster bedroom positioned in South-West (Kubera stability zone)\nKitchen aligned in South-East (Agneya fire quadrant)\nPooja room oriented towards North-East (Ishanya zone)");
    setFormSeoTitle('');
    setFormSeoDescription('');
    setFormCadPackageZipUrl('');
    setFormCadPackageFileName('');
    setFormCadPackageSize('');
    setFormCadPackagePrice(999);
    setFormCadPackageIncludesText("AutoCAD 2018+ DWG Architectural Floor Plan\nHigh-Resolution PDF Blueprints & Working Drawings\nStructural RCC Column & Beam Reinforcement Schedule\n100% Vastu Shastra Room Dimension Grid\nIS 456:2000 Civil Foundation Specifications\n10-Year Structural Frame Warranty Certificate");
    setZipUploadError(null);
    setFormRoomDimensions([
      { roomName: 'Living & Dining', dimension: "14'0\" x 20'6\"", floor: 'Ground Floor', vastuZone: 'North-East' },
      { roomName: 'Master Bedroom', dimension: "13'0\" x 14'0\"", floor: 'Ground Floor', vastuZone: 'South-West' },
      { roomName: 'Kitchen & Utility', dimension: "10'0\" x 9'0\"", floor: 'Ground Floor', vastuZone: 'South-East' },
      { roomName: 'Bedroom 2', dimension: "12'0\" x 12'0\"", floor: 'Ground Floor', vastuZone: 'North-West' }
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: HousePlan) => {
    setEditingId(plan.id);
    setFormTitle(plan.title || '');
    setFormPlanCode(plan.planCode || '');
    setFormSlug(plan.slug || '');
    setFormBuiltUpArea(plan.builtUpArea || 1500);
    setFormPlotDimensions(plan.plotDimensions || '');
    setFormBuildingDimensions(plan.buildingDimensions || '');
    setFormBedrooms(plan.bedrooms || 3);
    setFormBathrooms(plan.bathrooms || 2);
    setFormCarParking(plan.carParking || 1);
    setFormFloors(plan.floors || 1);
    setFormFloorsLabel(plan.floorsLabel || '1 Storey');
    setFormFacing((plan.facing as any) || 'East');
    setFormStyle(plan.style || '');
    setFormCostRange(plan.estimatedCostRange || '');
    setFormCostPerSqft(plan.costPerSqft || '');
    setFormElevationImage(plan.elevationImage || '');
    setFormFloorPlanImage(plan.floorPlanImage || '');
    setFormGalleryImages(plan.galleryImages && plan.galleryImages.length > 0 ? [...plan.galleryImages] : []);
    setElevationError(null);
    setFloorPlanError(null);
    setGalleryError(null);
    setElevationInputMode('upload');
    setFloorPlanInputMode('upload');
    setGalleryUrlInput('');
    setFormDescription(plan.description || '');
    setFormVastuCompliant(Boolean(plan.vastuCompliant));
    setFormVastuScore(plan.vastuScore || '100% Vastu');
    setFormFeaturesText((plan.features || []).join('\n'));
    setFormVastuNotesText((plan.vastuNotes || []).join('\n'));
    setFormSeoTitle(plan.seoMeta?.title || '');
    setFormSeoDescription(plan.seoMeta?.description || '');
    setFormCadPackageZipUrl(plan.cadPackageZipUrl || '');
    setFormCadPackageFileName(plan.cadPackageFileName || '');
    setFormCadPackageSize(plan.cadPackageSize || '');
    setFormCadPackagePrice(plan.cadPackagePrice !== undefined ? plan.cadPackagePrice : 999);
    setFormCadPackageIncludesText(
      (plan.cadPackageIncludes && plan.cadPackageIncludes.length > 0
        ? plan.cadPackageIncludes
        : [
            "AutoCAD 2018+ DWG Architectural Floor Plan",
            "High-Resolution PDF Blueprints & Working Drawings",
            "Structural RCC Column & Beam Reinforcement Schedule",
            "100% Vastu Shastra Room Dimension Grid",
            "IS 456:2000 Civil Foundation Specifications",
            "10-Year Structural Frame Warranty Certificate"
          ]
      ).join('\n')
    );
    setZipUploadError(null);
    setFormRoomDimensions(
      plan.roomDimensions && plan.roomDimensions.length > 0
        ? plan.roomDimensions.map(r => ({
            roomName: r.roomName || '',
            dimension: r.dimension || '',
            floor: r.floor || '',
            vastuZone: r.vastuZone || ''
          }))
        : [{ roomName: 'Hall', dimension: "16' x 12'", floor: 'Ground', vastuZone: 'NE' }]
    );
    setIsModalOpen(true);
  };

  const handleAddRoomRow = () => {
    setFormRoomDimensions([
      ...formRoomDimensions,
      { roomName: 'New Room', dimension: "12'0\" x 12'0\"", floor: formFloors > 1 ? 'First Floor' : 'Ground Floor', vastuZone: 'North' }
    ]);
  };

  const handleRemoveRoomRow = (index: number) => {
    setFormRoomDimensions(formRoomDimensions.filter((_, i) => i !== index));
  };

  const handleUpdateRoom = (index: number, field: keyof RoomDimension, val: string) => {
    const next = [...formRoomDimensions];
    next[index] = { ...next[index], [field]: val };
    setFormRoomDimensions(next);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSaving(true);
    const slug = formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const planId = editingId || `lh-hp-${Date.now()}`;

    const featuresArray = formFeaturesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const vastuNotesArray = formVastuNotesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const cadIncludesArray = formCadPackageIncludesText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const finalGalleryImages = formGalleryImages.length > 0
      ? formGalleryImages
      : [formElevationImage, formFloorPlanImage].filter(Boolean);

    const updatedPlan: HousePlan = {
      id: planId,
      planCode: formPlanCode || `LH-HP-${Math.floor(1000 + Math.random() * 9000)}`,
      title: formTitle,
      slug,
      floors: Number(formFloors),
      floorsLabel: formFloorsLabel,
      bedrooms: Number(formBedrooms),
      bathrooms: Number(formBathrooms),
      builtUpArea: Number(formBuiltUpArea),
      plotDimensions: formPlotDimensions,
      buildingDimensions: formBuildingDimensions,
      facing: formFacing,
      vastuCompliant: Boolean(formVastuCompliant),
      vastuScore: formVastuScore,
      vastuNotes: vastuNotesArray,
      style: formStyle,
      carParking: Number(formCarParking),
      estimatedCostRange: formCostRange,
      costPerSqft: formCostPerSqft,
      elevationImage: formElevationImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
      floorPlanImage: formFloorPlanImage || 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop',
      galleryImages: finalGalleryImages,
      description: formDescription,
      roomDimensions: formRoomDimensions,
      features: featuresArray,
      cadPackageZipUrl: formCadPackageZipUrl || '',
      cadPackageFileName: formCadPackageFileName || '',
      cadPackageSize: formCadPackageSize || '',
      cadPackagePrice: Number(formCadPackagePrice) || 999,
      cadPackageIncludes: cadIncludesArray.length > 0 ? cadIncludesArray : undefined,
      seoMeta: {
        title: formSeoTitle || `${formTitle} | Lifehut Developers`,
        description: formSeoDescription || formDescription.slice(0, 160),
        keywords: `${formBuiltUpArea} sqft house plan, ${formBedrooms} bhk floor plan, ${formFacing} facing house plan chennai`
      },
      isFeatured: true,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Save to Supabase and Local Storage
    await saveSupabaseHousePlan(updatedPlan);

    // Save to Express server
    try {
      await fetch('/api/house-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', plan: updatedPlan })
      });
    } catch {
      // safe fallback
    }

    setIsSaving(false);
    setIsModalOpen(false);
    refreshAllData();
  };

  const handleDelete = async (id: string, planCode: string) => {
    if (!window.confirm(`Are you sure you want to delete House Plan ${planCode}? This action cannot be undone.`)) {
      return;
    }

    await deleteSupabaseHousePlan(id);

    try {
      await fetch(`/api/house-plans/${id}`, { method: 'DELETE' });
    } catch {
      // safe fallback
    }

    refreshAllData();
  };

  const filteredPlans = plans.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.title.toLowerCase().includes(q) ||
      p.planCode.toLowerCase().includes(q) ||
      p.facing.toLowerCase().includes(q) ||
      `${p.bedrooms} bhk`.includes(q) ||
      `${p.builtUpArea}`.includes(q)
    );
  });

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="font-display text-lg font-bold text-[#1A2332] border-l-4 border-[#1A6DB5] pl-3 flex items-center gap-2">
            <Home className="w-5 h-5 text-[#1A6DB5]" />
            <span>House Plans Catalog Management</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 pl-3">
            Add, update, or remove 2D floor plans, 3D elevations, room dimensions, Vastu notes, and turnkey cost ranges. Stored directly to database &amp; Supabase.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#1A6DB5] hover:bg-[#1558a0] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New House Plan</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery ?? ''}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by plan code (e.g. LH-HP-1500), area, BHK, or facing..."
          className="bg-transparent text-xs w-full text-slate-800 placeholder:text-slate-400 outline-none font-medium"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 text-xs">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Plans List Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="border border-slate-100 rounded-2xl p-4 bg-slate-50 hover:bg-slate-100/60 transition-colors flex flex-col justify-between gap-4 relative group"
          >
            <div className="flex items-start gap-4">
              <img
                src={plan.elevationImage}
                alt={plan.title}
                className="w-20 h-16 object-cover rounded-xl bg-slate-200 flex-shrink-0"
              />
              <div className="overflow-hidden flex-grow">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {plan.planCode}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {plan.facing} Facing
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {plan.floorsLabel}
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1A2332] truncate">
                  {plan.title}
                </h4>
                <div className="text-[11px] text-slate-500 flex items-center flex-wrap gap-2 mt-1">
                  <span>Plot: <strong className="text-slate-700 font-medium">{plan.plotDimensions}</strong></span>
                  {plan.buildingDimensions && (
                    <>
                      <span>•</span>
                      <span>Bldg: <strong className="text-slate-700 font-medium">{plan.buildingDimensions}</strong></span>
                    </>
                  )}
                  <span>•</span>
                  <span>Area: <strong className="text-slate-700 font-medium">{plan.builtUpArea} sq.ft</strong></span>
                  <span>•</span>
                  <span>{plan.bedrooms} BHK ({plan.bathrooms}B)</span>
                  <span>•</span>
                  <span className="font-bold text-blue-900">{plan.estimatedCostRange}</span>
                  {plan.cadPackageZipUrl ? (
                    <>
                      <span>•</span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold flex items-center gap-1">
                        <Archive className="w-3 h-3 text-emerald-600" />
                        ZIP Attached {plan.cadPackageSize ? `(${plan.cadPackageSize})` : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>•</span>
                      <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold flex items-center gap-1">
                        <FileCode className="w-3 h-3 text-amber-600" />
                        Auto-Gen CAD (₹{plan.cadPackagePrice || 999})
                      </span>
                    </>
                  )}
                  {plan.galleryImages && plan.galleryImages.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-[#1A6DB5] font-semibold flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {plan.galleryImages.length} attached
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-slate-400">
                /{plan.slug}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(plan)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(plan.id, plan.planCode)}
                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-xs">
          No house plans match "{searchQuery}".
        </div>
      )}

      {/* ======================= EDIT / CREATE MODAL ======================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A6DB5] font-mono">
                  {editingId ? 'Edit House Plan' : 'Create New House Plan'}
                </span>
                <h3 className="font-display text-xl font-bold text-[#1A2332]">
                  {formPlanCode} — {formTitle || 'Untitled House Plan'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Row 1: Title & Plan Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    House Plan Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle ?? ''}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. One Storey House Design 1500 sq.ft (East Facing)"
                    className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#1A6DB5] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Plan Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPlanCode ?? ''}
                    onChange={(e) => setFormPlanCode(e.target.value)}
                    placeholder="e.g. LH-HP-1500"
                    className="w-full text-xs font-bold font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#1A6DB5] outline-none text-blue-900"
                  />
                </div>
              </div>

              {/* Row 2: URL Slug */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Slug (lifehutdevelopers.com/house-plans/<span className="text-[#1A6DB5] font-mono">{formSlug || 'auto-generated'}</span>)
                </label>
                <input
                  type="text"
                  value={formSlug ?? ''}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="one-storey-house-design-1500-sqft"
                  className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#1A6DB5] outline-none"
                />
              </div>

              {/* Row 3: Dimensions & Metric Specs (Plot, Building, Built-Up Area, BHK, Baths) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Built-Up Area (sq.ft)
                  </label>
                  <input
                    type="number"
                    required
                    value={formBuiltUpArea ?? 1500}
                    onChange={(e) => setFormBuiltUpArea(Number(e.target.value) || 0)}
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Plot Dimensions
                  </label>
                  <input
                    type="text"
                    value={formPlotDimensions ?? ''}
                    onChange={(e) => setFormPlotDimensions(e.target.value)}
                    placeholder="30' x 50'"
                    className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Building Dimensions
                  </label>
                  <input
                    type="text"
                    value={formBuildingDimensions ?? ''}
                    onChange={(e) => setFormBuildingDimensions(e.target.value)}
                    placeholder="24'0&quot; x 42'0&quot;"
                    className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bedrooms (BHK)
                  </label>
                  <select
                    value={formBedrooms ?? 3}
                    onChange={(e) => setFormBedrooms(Number(e.target.value) || 3)}
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                  >
                    <option value={2}>2 BHK</option>
                    <option value={3}>3 BHK</option>
                    <option value={4}>4 BHK</option>
                    <option value={5}>5 BHK</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={formBathrooms ?? 2}
                    onChange={(e) => setFormBathrooms(Number(e.target.value) || 1)}
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                  />
                </div>
              </div>

              {/* Row 4: Floors, Facing & Parking */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Floors / Storey
                  </label>
                  <select
                    value={formFloors ?? 1}
                    onChange={(e) => {
                      const fl = Number(e.target.value) || 1;
                      setFormFloors(fl);
                      if (fl === 1) setFormFloorsLabel('1 Storey (Ground Floor)');
                      else if (fl === 2) setFormFloorsLabel('2 Storey (Duplex G+1)');
                      else if (fl === 3) setFormFloorsLabel('3 Storey (Triplex G+2)');
                    }}
                    className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                  >
                    <option value={1}>1 Storey</option>
                    <option value={2}>2 Storey (Duplex)</option>
                    <option value={3}>3 Storey (Triplex)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Storey Label
                  </label>
                  <input
                    type="text"
                    value={formFloorsLabel ?? ''}
                    onChange={(e) => setFormFloorsLabel(e.target.value)}
                    placeholder="1 Storey (Ground Floor)"
                    className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Facing Orientation
                  </label>
                  <select
                    value={formFacing ?? 'East'}
                    onChange={(e) => setFormFacing(e.target.value as any)}
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                  >
                    <option value="East">East Facing</option>
                    <option value="North">North Facing</option>
                    <option value="South">South Facing</option>
                    <option value="West">West Facing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Car Parking
                  </label>
                  <input
                    type="number"
                    value={formCarParking ?? 1}
                    onChange={(e) => setFormCarParking(Number(e.target.value) || 0)}
                    className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                  />
                </div>
              </div>

              {/* Row 5: Financials / Turnkey Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimated Cost Range
                  </label>
                  <input
                    type="text"
                    value={formCostRange ?? ''}
                    onChange={(e) => setFormCostRange(e.target.value)}
                    placeholder="₹31.5L – ₹36.0L"
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5] text-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rate per sq.ft
                  </label>
                  <input
                    type="text"
                    value={formCostPerSqft ?? ''}
                    onChange={(e) => setFormCostPerSqft(e.target.value)}
                    placeholder="₹2,100 – ₹2,400 / sq.ft"
                    className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Architectural Style
                  </label>
                  <input
                    type="text"
                    value={formStyle ?? ''}
                    onChange={(e) => setFormStyle(e.target.value)}
                    placeholder="Modern Minimalist Villa"
                    className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                  />
                </div>
              </div>

              {/* Row 6: Visual Image Attachments & Drawings Manager */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1A6DB5] flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display text-xs sm:text-sm font-bold text-[#1A2332]">
                        House Plan Visual Attachments &amp; Architectural Drawings
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Upload or attach 3D elevation renders, 2D architectural CAD floor plans, and additional construction views.
                      </p>
                    </div>
                  </div>
                  {isSupabaseConfigured() && (
                    <span className="self-start sm:self-auto text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Cloud Storage Ready
                    </span>
                  )}
                </div>

                {/* Dual Column: Front Elevation & 2D Floor Plan */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {/* 1. Front Elevation Attachment */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1A2332]">3D Front Elevation Render</span>
                          {formElevationImage && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Attached
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
                          <button
                            type="button"
                            onClick={() => setElevationInputMode('upload')}
                            className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                              elevationInputMode === 'upload' ? 'bg-white shadow text-[#1A6DB5] font-bold' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setElevationInputMode('url')}
                            className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                              elevationInputMode === 'url' ? 'bg-white shadow text-[#1A6DB5] font-bold' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Web URL
                          </button>
                        </div>
                      </div>

                      {elevationError && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{elevationError}</span>
                        </div>
                      )}

                      {elevationInputMode === 'upload' ? (
                        <div>
                          <input
                            ref={elevationFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleElevationFileSelect(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />

                          {uploadingElevation ? (
                            <div className="h-36 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center gap-2">
                              <Loader2 className="w-6 h-6 text-[#1A6DB5] animate-spin" />
                              <span className="text-xs font-semibold text-[#1A6DB5]">Optimizing &amp; attaching elevation...</span>
                            </div>
                          ) : formElevationImage ? (
                            <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-36 flex items-center justify-center">
                              <img
                                src={formElevationImage}
                                alt="Elevation Preview"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => elevationFileInputRef.current?.click()}
                                  className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg shadow hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Upload className="w-3 h-3" /> Change File
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormElevationImage('')}
                                  className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow hover:bg-red-700 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Remove image"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onDragOver={(e) => { e.preventDefault(); setIsDraggingElevation(true); }}
                              onDragLeave={() => setIsDraggingElevation(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDraggingElevation(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  handleElevationFileSelect(e.dataTransfer.files[0]);
                                }
                              }}
                              onClick={() => elevationFileInputRef.current?.click()}
                              className={`h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                                isDraggingElevation
                                  ? 'border-[#1A6DB5] bg-blue-50/70 scale-[1.01]'
                                  : 'border-slate-300 hover:border-[#1A6DB5] hover:bg-slate-50'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1A6DB5] flex items-center justify-center mb-1.5">
                                <UploadCloud className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold text-slate-700">Click to browse or drag &amp; drop</span>
                              <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP (auto-compressed up to 15MB)</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={formElevationImage ?? ''}
                            onChange={(e) => setFormElevationImage(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                          />
                          {formElevationImage && (
                            <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                              <img
                                src={formElevationImage}
                                alt="URL preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {formElevationImage && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate max-w-[200px] font-mono text-[10px] text-slate-400">{formElevationImage.slice(0, 32)}...</span>
                        <button
                          type="button"
                          onClick={() => elevationFileInputRef.current?.click()}
                          className="text-[#1A6DB5] hover:underline font-semibold text-[11px] cursor-pointer"
                        >
                          Attach Different Image
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. 2D Floor Plan Blueprint Attachment */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1A2332]">2D Architectural Blueprint</span>
                          {formFloorPlanImage && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Attached
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
                          <button
                            type="button"
                            onClick={() => setFloorPlanInputMode('upload')}
                            className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                              floorPlanInputMode === 'upload' ? 'bg-white shadow text-[#1A6DB5] font-bold' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setFloorPlanInputMode('url')}
                            className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                              floorPlanInputMode === 'url' ? 'bg-white shadow text-[#1A6DB5] font-bold' : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Web URL
                          </button>
                        </div>
                      </div>

                      {floorPlanError && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{floorPlanError}</span>
                        </div>
                      )}

                      {floorPlanInputMode === 'upload' ? (
                        <div>
                          <input
                            ref={floorPlanFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFloorPlanFileSelect(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />

                          {uploadingFloorPlan ? (
                            <div className="h-36 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center gap-2">
                              <Loader2 className="w-6 h-6 text-[#1A6DB5] animate-spin" />
                              <span className="text-xs font-semibold text-[#1A6DB5]">Optimizing &amp; attaching blueprint...</span>
                            </div>
                          ) : formFloorPlanImage ? (
                            <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-36 flex items-center justify-center">
                              <img
                                src={formFloorPlanImage}
                                alt="Floor Plan Preview"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => floorPlanFileInputRef.current?.click()}
                                  className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg shadow hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Upload className="w-3 h-3" /> Change File
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFormFloorPlanImage('')}
                                  className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow hover:bg-red-700 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Remove image"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onDragOver={(e) => { e.preventDefault(); setIsDraggingFloorPlan(true); }}
                              onDragLeave={() => setIsDraggingFloorPlan(false)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDraggingFloorPlan(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  handleFloorPlanFileSelect(e.dataTransfer.files[0]);
                                }
                              }}
                              onClick={() => floorPlanFileInputRef.current?.click()}
                              className={`h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                                isDraggingFloorPlan
                                  ? 'border-[#1A6DB5] bg-blue-50/70 scale-[1.01]'
                                  : 'border-slate-300 hover:border-[#1A6DB5] hover:bg-slate-50'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1A6DB5] flex items-center justify-center mb-1.5">
                                <FileImage className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold text-slate-700">Attach CAD Blueprint / Floor Plan</span>
                              <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP (auto-compressed up to 15MB)</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={formFloorPlanImage ?? ''}
                            onChange={(e) => setFormFloorPlanImage(e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                          />
                          {formFloorPlanImage && (
                            <div className="h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                              <img
                                src={formFloorPlanImage}
                                alt="Floor Plan preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=600&auto=format&fit=crop';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {formFloorPlanImage && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate max-w-[200px] font-mono text-[10px] text-slate-400">{formFloorPlanImage.slice(0, 32)}...</span>
                        <button
                          type="button"
                          onClick={() => floorPlanFileInputRef.current?.click()}
                          className="text-[#1A6DB5] hover:underline font-semibold text-[11px] cursor-pointer"
                        >
                          Attach Different File
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                {/* 3. Additional Gallery & Drawing Attachments (Multi-image) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-[#1A6DB5]" />
                        <h5 className="font-bold text-xs text-[#1A2332]">
                          Additional Plan Drawings &amp; Gallery Views ({formGalleryImages.length} attached)
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Attach multiple drawings: Ground Floor, First Floor, Electrical schematics, 3D Interior Views, or Site Layouts.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={galleryFileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleGalleryFilesSelect(e.target.files);
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => galleryFileInputRef.current?.click()}
                        disabled={uploadingGallery}
                        className="px-3 py-1.5 bg-[#1A6DB5] hover:bg-[#1558a0] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {uploadingGallery ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Attaching...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Attach Drawings / Images</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {galleryError && (
                    <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{galleryError}</span>
                    </div>
                  )}

                  {/* Multi-file Drag & Drop Area */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingGallery(true); }}
                    onDragLeave={() => setIsDraggingGallery(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingGallery(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleGalleryFilesSelect(e.dataTransfer.files);
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-3 text-center transition-all ${
                      isDraggingGallery
                        ? 'border-[#1A6DB5] bg-blue-50/70'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-left">
                        <span className="text-xs font-semibold text-slate-700">Drag &amp; drop multiple drawings or photos here</span>
                        <span className="text-[10px] text-slate-400 block">Select multiple JPG, PNG, or WebP files at once</span>
                      </div>

                      {/* Quick Add by URL */}
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <input
                          type="text"
                          value={galleryUrlInput ?? ''}
                          onChange={(e) => setGalleryUrlInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGalleryUrl(); } }}
                          placeholder="Or paste image URL..."
                          className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-[#1A6DB5] w-full sm:w-48 font-mono text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={handleAddGalleryUrl}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Attached Gallery Grid */}
                  {formGalleryImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                      {formGalleryImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video sm:aspect-square flex items-center justify-center">
                          <img
                            src={imgUrl}
                            alt={`Attachment ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 cursor-pointer shadow-sm"
                            title="Remove attachment"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100">
                      No additional drawings or views attached yet. You can attach multiple blueprints or 3D views above.
                    </div>
                  )}

                </div>

              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Architectural Description &amp; Layout Philosophy
                </label>
                <textarea
                  rows={3}
                  value={formDescription ?? ''}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed architectural concept description..."
                  className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                />
              </div>

              {/* Key Features & Vastu Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Key Features (one bullet per line)
                  </label>
                  <textarea
                    rows={4}
                    value={formFeaturesText ?? ''}
                    onChange={(e) => setFormFeaturesText(e.target.value)}
                    placeholder="Zero corridor dead space&#10;100% Vastu compliant&#10;Separate utility area"
                    className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vastu Shastra Notes (one bullet per line)
                  </label>
                  <textarea
                    rows={4}
                    value={formVastuNotesText ?? ''}
                    onChange={(e) => setFormVastuNotesText(e.target.value)}
                    placeholder="Main entrance in East&#10;Master bedroom in South-West&#10;Kitchen in South-East"
                    className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                  />
                </div>
              </div>

              {/* Dedicated CAD & PDF Drawings ZIP Package & PhonePe Configuration */}
              <div className="bg-slate-50 p-5 rounded-2xl border-2 border-dashed border-purple-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-sm">
                      <Archive className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1A2332] flex items-center gap-2">
                        Full CAD &amp; PDF Drawings ZIP Package
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-semibold">
                          PhonePe Download
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Upload the production AutoCAD DWG, structural schedules &amp; PDF bundle delivered to clients after PhonePe checkout.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Price (₹):</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formCadPackagePrice}
                        onChange={(e) => setFormCadPackagePrice(Number(e.target.value))}
                        className="w-24 pl-6 pr-2 py-1 text-xs font-bold font-mono bg-white border border-slate-300 rounded-lg outline-none focus:border-[#1A6DB5]"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload or Drop Area */}
                <input
                  ref={zipFileInputRef}
                  type="file"
                  accept=".zip,.rar,.7z,.dwg,.pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleZipFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingZip(true); }}
                  onDragLeave={() => setIsDraggingZip(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingZip(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleZipFileSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`p-4 rounded-xl border-2 border-dashed text-center transition-all ${
                    isDraggingZip
                      ? 'border-[#1A6DB5] bg-blue-50'
                      : formCadPackageZipUrl
                      ? 'border-emerald-300 bg-emerald-50/40'
                      : 'border-slate-300 bg-white hover:border-[#1A6DB5]/60'
                  }`}
                >
                  {uploadingZip ? (
                    <div className="py-4 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-[#1A6DB5]" />
                      <span className="text-xs font-bold text-slate-700">Uploading CAD &amp; Drawing Archive...</span>
                      <span className="text-[10px] text-slate-400">Saving securely to project storage</span>
                    </div>
                  ) : formCadPackageZipUrl ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                          <FileArchive className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {formCadPackageFileName || `${formPlanCode || 'HousePlan'}-CAD-Package.zip`}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                              {formCadPackageSize || 'Ready'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block truncate max-w-sm">
                            {formCadPackageZipUrl.slice(0, 50)}...
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={formCadPackageZipUrl}
                          download={formCadPackageFileName || 'CAD-Package.zip'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Test Download</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => zipFileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Replace ZIP</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormCadPackageZipUrl('');
                            setFormCadPackageFileName('');
                            setFormCadPackageSize('');
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                          title="Remove custom ZIP (will fallback to auto-generated architectural ZIP)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => zipFileInputRef.current?.click()}
                      className="cursor-pointer py-2 flex flex-col items-center justify-center gap-1.5"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1A6DB5] flex items-center justify-center mb-0.5">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        Click to Upload or Drag &amp; Drop CAD / PDF Drawing ZIP
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Supports .ZIP, .RAR, .7Z, or AutoCAD .DWG (up to 50MB)
                      </span>
                      <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                        If left blank, our system will auto-generate an architectural DWG/PDF bundle upon payment.
                      </span>
                    </div>
                  )}
                </div>

                {zipUploadError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{zipUploadError}</span>
                  </div>
                )}

                {/* Direct ZIP Link or Storage URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Direct ZIP / Storage URL (Optional override)
                    </label>
                    <input
                      type="text"
                      value={formCadPackageZipUrl ?? ''}
                      onChange={(e) => setFormCadPackageZipUrl(e.target.value)}
                      placeholder="/uploads/cad-packages/... or https://..."
                      className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Downloadable File Display Name
                    </label>
                    <input
                      type="text"
                      value={formCadPackageFileName ?? ''}
                      onChange={(e) => setFormCadPackageFileName(e.target.value)}
                      placeholder={`${formPlanCode || 'LH-HP'}-AutoCAD-Package.zip`}
                      className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                    />
                  </div>
                </div>

                {/* What's included checklist */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    What's Included in this Drawing Package (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={formCadPackageIncludesText ?? ''}
                    onChange={(e) => setFormCadPackageIncludesText(e.target.value)}
                    placeholder="AutoCAD 2018+ DWG Architectural Floor Plan&#10;High-Resolution PDF Blueprints&#10;Structural RCC Column & Beam Schedule&#10;100% Vastu Shastra Room Dimension Grid"
                    className="w-full text-xs font-medium p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5]"
                  />
                </div>
              </div>

              {/* Room-by-room dimensions table editor */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800 uppercase font-mono">
                    Room Dimension Schedule
                  </span>
                  <button
                    type="button"
                    onClick={handleAddRoomRow}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Room</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formRoomDimensions.map((room, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={room.roomName ?? ''}
                        onChange={(e) => handleUpdateRoom(idx, 'roomName', e.target.value)}
                        placeholder="Room Name"
                        className="col-span-4 text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                      <input
                        type="text"
                        value={room.dimension ?? ''}
                        onChange={(e) => handleUpdateRoom(idx, 'dimension', e.target.value)}
                        placeholder="14' x 20'"
                        className="col-span-3 text-xs font-mono p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                      <input
                        type="text"
                        value={room.floor ?? ''}
                        onChange={(e) => handleUpdateRoom(idx, 'floor', e.target.value)}
                        placeholder="Ground Floor"
                        className="col-span-2 text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                      <input
                        type="text"
                        value={room.vastuZone ?? ''}
                        onChange={(e) => handleUpdateRoom(idx, 'vastuZone', e.target.value)}
                        placeholder="Vastu Zone"
                        className="col-span-2 text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveRoomRow(idx)}
                        className="col-span-1 p-2 text-slate-400 hover:text-red-600 flex justify-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#1A6DB5] hover:bg-[#1558a0] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving House Plan...' : 'Save House Plan to Database'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
