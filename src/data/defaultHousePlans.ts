import { HousePlan } from '../types';

export const defaultHousePlans: HousePlan[] = [
  {
    id: "lh-hp-1500-single-storey",
    planCode: "LH-HP-1500",
    title: "1500 Sq.Ft Contemporary Single-Storey 3 BHK House Plan",
    slug: "one-storey-1500-sqft-contemporary-3bhk-house-plan",
    floors: 1,
    floorsLabel: "1 Storey (Ground Floor)",
    bedrooms: 3,
    bathrooms: 3,
    builtUpArea: 1500,
    plotDimensions: "30' x 50' (1,500 sq.ft plot)",
    buildingDimensions: "24'0\" x 42'0\"",
    facing: "East",
    vastuCompliant: true,
    vastuScore: "100% Vastu Compliant",
    vastuNotes: [
      "Main Entrance placed in Auspicious East / Jayanta zone for prosperity",
      "Pooja Room positioned in the North-East (Ishanya) sacred quarter",
      "Kitchen placed in the South-East (Agneya) fire corner with East-facing cooking",
      "Master Bedroom situated in the South-West (Niruthi) earth zone for stability",
      "Underground Sump in North-East and Overhead Tank above South-West zone"
    ],
    style: "Contemporary Modern Bungalow",
    carParking: 1,
    estimatedCostRange: "₹31.5 Lakhs – ₹36.0 Lakhs",
    costPerSqft: "₹2,100 – ₹2,400 / sq.ft (Turnkey in Chennai)",
    elevationImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    floorPlanImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1000&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "An elegantly engineered single-storey independent house design curated for standard 30x50 ft plots in Chennai. Features an expansive open-concept living and dining area, 3 well-ventilated master bedrooms with en-suite bathrooms, a dedicated Vastu-aligned pooja mandir, and a sheltered front car porch. Engineered for optimal cross-ventilation, abundant natural daylight, and zero space wastage.",
    roomDimensions: [
      { roomName: "Portico / Covered Car Parking", dimension: "11'0\" x 16'0\"", floor: "Ground Floor", vastuZone: "North-West" },
      { roomName: "Formal Living Hall", dimension: "16'0\" x 14'6\"", floor: "Ground Floor", vastuZone: "East / North-East" },
      { roomName: "Dining Area", dimension: "12'0\" x 10'6\"", floor: "Ground Floor", vastuZone: "Central (Brahmasthan Free)" },
      { roomName: "Modular Kitchen & Utility", dimension: "10'0\" x 9'6\"", floor: "Ground Floor", vastuZone: "South-East (Agneya)" },
      { roomName: "Pooja Room", dimension: "5'0\" x 6'0\"", floor: "Ground Floor", vastuZone: "North-East (Ishanya)" },
      { roomName: "Master Bedroom 1 with En-suite", dimension: "14'0\" x 12'0\"", floor: "Ground Floor", vastuZone: "South-West (Kubera)" },
      { roomName: "Bedroom 2 (Children / Parents)", dimension: "12'0\" x 11'6\"", floor: "Ground Floor", vastuZone: "North-West (Vayu)" },
      { roomName: "Bedroom 3 / Guest Room", dimension: "11'0\" x 10'6\"", floor: "Ground Floor", vastuZone: "South" },
      { roomName: "Attached Toilet 1", dimension: "7'6\" x 5'0\"", floor: "Ground Floor", vastuZone: "West" },
      { roomName: "Common / Attached Toilet 2", dimension: "7'0\" x 4'6\"", floor: "Ground Floor", vastuZone: "North-West" }
    ],
    features: [
      "Zero Dead Space Architectural Layout",
      "Dedicated North-East Pooja Mandir",
      "Spacious 11x16 ft Covered Car Portico",
      "Ventilated Kitchen with Attached Utility Wash Area",
      "3 Private Bathrooms with Concealed Plumbing Provisions",
      "Structurally Engineered for Future First Floor Expansion (G+1 Ready)"
    ],
    cadPackagePrice: 999,
    cadPackageFileName: "LH-HP-1500-Architectural-CAD-Package.zip",
    cadPackageSize: "18.5 MB",
    cadPackageIncludes: [
      "AutoCAD DWG Editable Vector Blueprints",
      "High-Definition Architectural PDF Floor Plans",
      "Column, Beam & Footing Structural Reinforcement Schedule",
      "Plumbing & Electrical Concealed Schematic Diagrams",
      "100% Vastu Shastra Directional Orientation Grid"
    ],
    seoMeta: {
      title: "1500 Sq Ft Single Storey House Plan 3 BHK | Lifehut Developers",
      description: "Explore this 1500 sq.ft single-storey 3 BHK house design on a 30x50 plot in Chennai. 100% Vastu compliant with 2D floor layout, room sizes, and turnkey cost estimate.",
      keywords: "1500 sqft house plan, single storey 3bhk floor plan, 30x50 house design chennai, vastu compliant house plan"
    },
    isFeatured: true,
    isActive: true,
    createdAt: "2026-08-10"
  },
  {
    id: "lh-hp-1800-duplex-villa",
    planCode: "LH-HP-1800",
    title: "1800 Sq.Ft Modern 3 BHK Duplex Villa Plan (G+1)",
    slug: "1800-sqft-modern-3bhk-duplex-villa-house-plan",
    floors: 2,
    floorsLabel: "2 Storey (Duplex G+1)",
    bedrooms: 3,
    bathrooms: 3,
    builtUpArea: 1800,
    plotDimensions: "30' x 40' (1,200 sq.ft plot)",
    buildingDimensions: "24'0\" x 33'0\"",
    facing: "North",
    vastuCompliant: true,
    vastuScore: "100% Vastu Compliant",
    vastuNotes: [
      "North-Facing Kubera entrance bringing prosperity and high positive energy",
      "Ground floor guest room and spacious South-West master suite on first floor",
      "Open-to-sky double height cut-out for ambient airflow and natural lighting",
      "External/internal staircase placed along the West wall per Vastu guidelines"
    ],
    style: "Modern Minimalist Duplex",
    carParking: 1,
    estimatedCostRange: "₹39.5 Lakhs – ₹45.0 Lakhs",
    costPerSqft: "₹2,200 – ₹2,500 / sq.ft (Turnkey in Chennai)",
    elevationImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    floorPlanImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "A high-efficiency 3 BHK duplex layout tailored for standard 30x40 ft (1200 sq.ft) plots popular across Keelkattalai, Medavakkam, and Tambaram. The ground floor hosts a large living hall, open kitchen-dining, and elderly-friendly guest bedroom. The first floor accommodates a luxury master bedroom with private balcony, study lounge, and children's suite.",
    roomDimensions: [
      { roomName: "Car Porch", dimension: "10'6\" x 15'0\"", floor: "Ground Floor", vastuZone: "North-West" },
      { roomName: "Ground Living Hall", dimension: "15'0\" x 14'0\"", floor: "Ground Floor", vastuZone: "North-East" },
      { roomName: "Dining Hall", dimension: "11'0\" x 10'0\"", floor: "Ground Floor", vastuZone: "Central" },
      { roomName: "Modular Kitchen", dimension: "10'0\" x 8'6\"", floor: "Ground Floor", vastuZone: "South-East" },
      { roomName: "Pooja Unit", dimension: "4'6\" x 5'0\"", floor: "Ground Floor", vastuZone: "North-East" },
      { roomName: "Ground Floor Bedroom", dimension: "12'0\" x 11'0\"", floor: "Ground Floor", vastuZone: "South-West" },
      { roomName: "Upper Family Lounge", dimension: "14'0\" x 11'0\"", floor: "First Floor", vastuZone: "North" },
      { roomName: "Master Bedroom Suite", dimension: "15'0\" x 12'6\"", floor: "First Floor", vastuZone: "South-West" },
      { roomName: "Kids Bedroom", dimension: "12'0\" x 11'0\"", floor: "First Floor", vastuZone: "North-West" },
      { roomName: "Covered Sitout Balcony", dimension: "11'0\" x 6'0\"", floor: "First Floor", vastuZone: "North" }
    ],
    features: [
      "Compact 30x40 Plot Maximum Floor Area Optimization",
      "Double-Height Ceiling Feature over Dining",
      "Dedicated Study / Work-From-Home Nook",
      "Private First-Floor Open Sitout Balcony",
      "Senior Citizen Friendly Ground Floor Bedroom with Attached Toilet"
    ],
    cadPackagePrice: 999,
    cadPackageFileName: "LH-HP-1800-Architectural-CAD-Package.zip",
    cadPackageSize: "21.2 MB",
    cadPackageIncludes: [
      "AutoCAD DWG Editable Vector Blueprints",
      "High-Definition Architectural PDF Floor Plans",
      "Column, Beam & Footing Structural Reinforcement Schedule",
      "Plumbing & Electrical Concealed Schematic Diagrams",
      "100% Vastu Shastra Directional Orientation Grid"
    ],
    seoMeta: {
      title: "1800 Sq Ft 3 BHK Duplex House Plan in 30x40 Plot | Lifehut",
      description: "Discover this 1800 sq.ft 3 BHK Duplex house plan for 30x40 plots in Chennai. 2 Storey modern architectural layout, complete room sizes, Vastu notes, and turnkey cost.",
      keywords: "1800 sqft duplex house plan, 30x40 duplex house design chennai, 3bhk g+1 floor plan, modern villa plan"
    },
    isFeatured: true,
    isActive: true,
    createdAt: "2026-08-12"
  },
  {
    id: "lh-hp-2400-luxury-villa",
    planCode: "LH-HP-2400",
    title: "2400 Sq.Ft Luxury 4 BHK Duplex Villa with Terrace Garden",
    slug: "2400-sqft-luxury-4bhk-duplex-villa-house-plan",
    floors: 2,
    floorsLabel: "2 Storey (Duplex G+1)",
    bedrooms: 4,
    bathrooms: 4,
    builtUpArea: 2400,
    plotDimensions: "40' x 60' (2,400 sq.ft plot)",
    buildingDimensions: "32'0\" x 45'0\"",
    facing: "East",
    vastuCompliant: true,
    vastuScore: "100% Vastu Compliant",
    vastuNotes: [
      "Grand East-facing main entrance with decorative double-door threshold",
      "Brahmasthan kept free from heavy structural columns or walls",
      "Kitchen in Agneya (South-East) with separate wet and dry utility zones",
      "South-West Master Bedroom with private walk-in wardrobe and en-suite bath"
    ],
    style: "Contemporary Luxury Villa",
    carParking: 2,
    estimatedCostRange: "₹52.8 Lakhs – ₹60.0 Lakhs",
    costPerSqft: "₹2,200 – ₹2,500 / sq.ft (Turnkey in Chennai)",
    elevationImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop",
    floorPlanImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "An opulent 4 BHK luxury duplex architectural blueprint designed for 40x60 ft plots. Boasts a grand double-car portico, expansive foyer, double-height living room with floor-to-ceiling glass fenestrations, wet/dry modular kitchen, 4 lavish master suites, home entertainment room, and a manicured rooftop terrace pergola.",
    roomDimensions: [
      { roomName: "Grand Double Car Parking", dimension: "18'0\" x 18'0\"", floor: "Ground Floor", vastuZone: "North-West / North" },
      { roomName: "Grand Foyer & Double-Height Living", dimension: "20'0\" x 16'0\"", floor: "Ground Floor", vastuZone: "East" },
      { roomName: "Formal Dining Hall", dimension: "14'0\" x 12'0\"", floor: "Ground Floor", vastuZone: "Central" },
      { roomName: "Luxury Kitchen & Scullery", dimension: "14'0\" x 10'0\"", floor: "Ground Floor", vastuZone: "South-East" },
      { roomName: "Pooja Mandir", dimension: "6'0\" x 7'0\"", floor: "Ground Floor", vastuZone: "North-East" },
      { roomName: "Guest Suite with En-suite", dimension: "14'0\" x 13'0\"", floor: "Ground Floor", vastuZone: "North-West" },
      { roomName: "Upper Family Living & Lounge", dimension: "16'0\" x 14'0\"", floor: "First Floor", vastuZone: "East" },
      { roomName: "Presidential Master Suite + Walk-in", dimension: "18'0\" x 15'0\"", floor: "First Floor", vastuZone: "South-West" },
      { roomName: "Bedroom 3 (Kids)", dimension: "14'0\" x 13'0\"", floor: "First Floor", vastuZone: "South" },
      { roomName: "Bedroom 4 / Home Theatre", dimension: "15'0\" x 12'0\"", floor: "First Floor", vastuZone: "West" },
      { roomName: "Rooftop Terrace Garden & Pergola", dimension: "22'0\" x 16'0\"", floor: "First Floor", vastuZone: "North" }
    ],
    features: [
      "2-Car Covered Driveway with Landscaped Entry Walkway",
      "Double-Height Ceiling with Natural Skylight",
      "Walk-in Dressing Closets in Master Suites",
      "Dedicated Home Office / Home Cinema Room",
      "Panoramic Rooftop Terrace Garden with Pergola Shade"
    ],
    cadPackagePrice: 1499,
    cadPackageFileName: "LH-HP-2400-Luxury-CAD-Package.zip",
    cadPackageSize: "28.4 MB",
    cadPackageIncludes: [
      "AutoCAD DWG Editable Vector Blueprints",
      "High-Definition Architectural PDF Floor Plans",
      "Column, Beam & Footing Structural Reinforcement Schedule",
      "Plumbing & Electrical Concealed Schematic Diagrams",
      "100% Vastu Shastra Directional Orientation Grid"
    ],
    seoMeta: {
      title: "2400 Sq Ft 4 BHK Luxury Duplex Villa Plan in 40x60 | Lifehut",
      description: "Architectural 2400 sq.ft 4 BHK duplex villa plan for 40x60 plots in Chennai. 2 cars parking, double-height living, terrace garden, and Vastu compliance details.",
      keywords: "2400 sqft house plan, 40x60 duplex villa plan, 4bhk luxury house plan chennai, modern villa blueprint"
    },
    isFeatured: true,
    isActive: true,
    createdAt: "2026-08-15"
  },
  {
    id: "lh-hp-1200-compact-single",
    planCode: "LH-HP-1200",
    title: "1200 Sq.Ft Smart 2 BHK Single-Storey House Plan",
    slug: "1200-sqft-smart-2bhk-single-storey-house-plan",
    floors: 1,
    floorsLabel: "1 Storey (Ground Floor)",
    bedrooms: 2,
    bathrooms: 2,
    builtUpArea: 1200,
    plotDimensions: "30' x 40' (1,200 sq.ft plot)",
    buildingDimensions: "24'0\" x 34'0\"",
    facing: "North",
    vastuCompliant: true,
    vastuScore: "100% Vastu Compliant",
    vastuNotes: [
      "North-facing entry door aligned with positive planetary magnetic lines",
      "Pooja corner in North-East with direct sunlight through east window",
      "Kitchen in Agneya (South-East) ensuring good health and energy balance",
      "Master bedroom located in the South-West corner for sound sleep and harmony"
    ],
    style: "Compact Urban Residence",
    carParking: 1,
    estimatedCostRange: "₹25.2 Lakhs – ₹28.8 Lakhs",
    costPerSqft: "₹2,100 – ₹2,400 / sq.ft (Turnkey in Chennai)",
    elevationImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop",
    floorPlanImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "An economical, brilliantly planned single-storey 2 BHK residential floor plan made specifically for 30x40 ft plots. Offers a smart balance of private bedrooms, common gathering spaces, wide car parking, and an airy kitchen layout. Ideal for nuclear families, retirees, and budget-conscious homeowners looking for high construction quality.",
    roomDimensions: [
      { roomName: "Car Portico & Two Wheeler Bay", dimension: "10'0\" x 15'0\"", floor: "Ground Floor", vastuZone: "North-West" },
      { roomName: "Living & Reception Hall", dimension: "14'0\" x 13'0\"", floor: "Ground Floor", vastuZone: "North / North-East" },
      { roomName: "Dining Space", dimension: "10'0\" x 9'6\"", floor: "Ground Floor", vastuZone: "Central" },
      { roomName: "Kitchen with Granite Counter", dimension: "9'0\" x 8'6\"", floor: "Ground Floor", vastuZone: "South-East" },
      { roomName: "Pooja Niche", dimension: "4'0\" x 4'0\"", floor: "Ground Floor", vastuZone: "North-East" },
      { roomName: "Master Bedroom with Attached Toilet", dimension: "13'0\" x 11'6\"", floor: "Ground Floor", vastuZone: "South-West" },
      { roomName: "Bedroom 2 (Children / Study)", dimension: "11'6\" x 10'6\"", floor: "Ground Floor", vastuZone: "North-West" },
      { roomName: "Common Bathroom", dimension: "6'6\" x 4'6\"", floor: "Ground Floor", vastuZone: "West" }
    ],
    features: [
      "Cost-Effective Blueprint with 0% Waste Area",
      "Dedicated Covered Car Parking Bay",
      "Optimum Cross-Ventilation Windows in All Rooms",
      "Low Maintenance Exterior Elevation Design",
      "Full Foundation Load Safety for Adding First Floor Later"
    ],
    cadPackagePrice: 799,
    cadPackageFileName: "LH-HP-1200-Architectural-CAD-Package.zip",
    cadPackageSize: "16.1 MB",
    cadPackageIncludes: [
      "AutoCAD DWG Editable Vector Blueprints",
      "High-Definition Architectural PDF Floor Plans",
      "Column, Beam & Footing Structural Reinforcement Schedule",
      "Plumbing & Electrical Concealed Schematic Diagrams",
      "100% Vastu Shastra Directional Orientation Grid"
    ],
    seoMeta: {
      title: "1200 Sq Ft 2 BHK Single Storey House Plan 30x40 | Lifehut",
      description: "Detailed 1200 sq.ft 2 BHK single storey house plan for 30x40 plots in Chennai. 100% Vastu compliant layout with 2D blueprint and cost per sq.ft estimate.",
      keywords: "1200 sqft house plan, single floor 2bhk plan 30x40, affordable house design chennai, turnkey villa plan"
    },
    isFeatured: false,
    isActive: true,
    createdAt: "2026-08-18"
  },
  {
    id: "lh-hp-2100-fusion-villa",
    planCode: "LH-HP-2100",
    title: "2100 Sq.Ft Traditional Fusion 3 BHK Duplex Villa Plan",
    slug: "2100-sqft-traditional-fusion-3bhk-duplex-house-plan",
    floors: 2,
    floorsLabel: "2 Storey (Duplex G+1)",
    bedrooms: 3,
    bathrooms: 3,
    builtUpArea: 2100,
    plotDimensions: "35' x 50' (1,750 sq.ft plot)",
    buildingDimensions: "27'0\" x 40'0\"",
    facing: "South",
    vastuCompliant: true,
    vastuScore: "100% Vastu Compliant",
    vastuNotes: [
      "South-Facing layout engineered strictly to Vastu Shastra: Main door in auspicious 4th pada",
      "Master bedroom in South-West (Niruthi) with enhanced ceiling height",
      "Traditional central courtyard / light-well (Brahmasthan) infusing pure air",
      "Kitchen in South-East (Agneya) with cooktop facing East"
    ],
    style: "Tamil Nadu Heritage & Modern Fusion",
    carParking: 1,
    estimatedCostRange: "₹46.2 Lakhs – ₹52.5 Lakhs",
    costPerSqft: "₹2,200 – ₹2,500 / sq.ft (Turnkey in Chennai)",
    elevationImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
    floorPlanImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1000&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "A breathtaking architectural masterpiece blending traditional Chettinad/Kerala heritage elements (Thinnai sitout, pitched clay tile accents, central courtyard light well) with sleek modern interiors. Perfectly engineered for South-facing plots in Tamil Nadu with rigorous Vastu remedies and thermal cooling strategies.",
    roomDimensions: [
      { roomName: "Traditional Thinnai & Car Porch", dimension: "12'0\" x 16'0\"", floor: "Ground Floor", vastuZone: "South / South-East" },
      { roomName: "Courtyard Living Lounge", dimension: "17'0\" x 15'0\"", floor: "Ground Floor", vastuZone: "Central / East" },
      { roomName: "Dining Hall overlooking Court", dimension: "13'0\" x 12'0\"", floor: "Ground Floor", vastuZone: "Central" },
      { roomName: "Kitchen & Store", dimension: "11'0\" x 9'6\"", floor: "Ground Floor", vastuZone: "South-East" },
      { roomName: "Pooja Mandir", dimension: "6'0\" x 5'6\"", floor: "Ground Floor", vastuZone: "North-East" },
      { roomName: "Elderly Suite (Ground Floor)", dimension: "13'6\" x 12'0\"", floor: "Ground Floor", vastuZone: "North-West" },
      { roomName: "Upper Family Verandah", dimension: "14'0\" x 12'0\"", floor: "First Floor", vastuZone: "East" },
      { roomName: "Master Bedroom with Balcony", dimension: "16'0\" x 13'6\"", floor: "First Floor", vastuZone: "South-West" },
      { roomName: "Bedroom 3 (Children)", dimension: "13'0\" x 12'0\"", floor: "First Floor", vastuZone: "North" }
    ],
    features: [
      "Thinnai (Verandah Sitout) for Welcoming Guests",
      "Central Skylight Courtyard for Passive Thermal Cooling",
      "Engineered South-Facing Vastu Compliance",
      "Pitched Clay Tile Canopy Accents on Facade",
      "Spacious Bedrooms with Cross-Ventilation Louvers"
    ],
    cadPackagePrice: 1199,
    cadPackageFileName: "LH-HP-2100-Fusion-CAD-Package.zip",
    cadPackageSize: "23.6 MB",
    cadPackageIncludes: [
      "AutoCAD DWG Editable Vector Blueprints",
      "High-Definition Architectural PDF Floor Plans",
      "Column, Beam & Footing Structural Reinforcement Schedule",
      "Plumbing & Electrical Concealed Schematic Diagrams",
      "100% Vastu Shastra Directional Orientation Grid"
    ],
    seoMeta: {
      title: "2100 Sq Ft South Facing 3 BHK Duplex House Plan | Lifehut",
      description: "Authentic 2100 sq.ft South-facing 3 BHK duplex villa design with traditional courtyard in Chennai. 100% Vastu approved floor plan with turnkey pricing.",
      keywords: "2100 sqft house plan, south facing duplex house plan chennai, traditional courtyard house plan, vastu compliant villa"
    },
    isFeatured: false,
    isActive: true,
    createdAt: "2026-08-20"
  },
  {
    id: "lh-hp-3200-triplex-residence",
    planCode: "LH-HP-3200",
    title: "3200 Sq.Ft Grand 5 BHK Triplex House Plan (G+2)",
    slug: "3200-sqft-grand-5bhk-triplex-residence-house-plan",
    floors: 3,
    floorsLabel: "3 Storey (G+2 Triplex)",
    bedrooms: 5,
    bathrooms: 5,
    builtUpArea: 3200,
    plotDimensions: "30' x 50' or 40' x 50' (1,500 – 2,000 sq.ft plot)",
    buildingDimensions: "25'0\" x 42'0\"",
    facing: "East",
    vastuCompliant: true,
    vastuScore: "100% Vastu Compliant",
    vastuNotes: [
      "Grand East entry with wide decorative portico",
      "Lift core strategically located on the West/North-West per structural & Vastu balance",
      "Full Vastu balance maintained across all three storeys",
      "Rooftop open entertainment deck in the North and East zones"
    ],
    style: "Premium Architectural Triplex",
    carParking: 2,
    estimatedCostRange: "₹70.4 Lakhs – ₹80.0 Lakhs",
    costPerSqft: "₹2,200 – ₹2,500 / sq.ft (Turnkey in Chennai)",
    elevationImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
    floorPlanImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "Designed for joint families and prime urban plots in Chennai where vertical living maximizes floor area. Spans Ground + 2 upper floors with 5 grand en-suite bedrooms, internal passenger elevator provision, multiple entertainment lounges, open terrace gym/barbecue zone, and dual covered car parking.",
    roomDimensions: [
      { roomName: "Dual Car Portico", dimension: "18'0\" x 16'0\"", floor: "Ground Floor", vastuZone: "North-West" },
      { roomName: "Ground Living Hall", dimension: "16'0\" x 15'0\"", floor: "Ground Floor", vastuZone: "East" },
      { roomName: "Dining & Kitchen", dimension: "16'0\" x 12'0\"", floor: "Ground Floor", vastuZone: "South-East" },
      { roomName: "Ground Master Bedroom 1", dimension: "14'0\" x 13'0\"", floor: "Ground Floor", vastuZone: "South-West" },
      { roomName: "First Floor Family Hall", dimension: "16'0\" x 14'0\"", floor: "First Floor", vastuZone: "East" },
      { roomName: "Master Suite 2 + Balcony", dimension: "16'0\" x 14'0\"", floor: "First Floor", vastuZone: "South-West" },
      { roomName: "Bedroom 3 (Children)", dimension: "14'0\" x 13'0\"", floor: "First Floor", vastuZone: "North-West" },
      { roomName: "Second Floor Media Room / WFH", dimension: "16'0\" x 14'0\"", floor: "Second Floor", vastuZone: "North" },
      { roomName: "Bedroom 4 (Guest Suite)", dimension: "14'0\" x 13'0\"", floor: "Second Floor", vastuZone: "South-West" },
      { roomName: "Bedroom 5 (Study / Fitness)", dimension: "13'0\" x 12'0\"", floor: "Second Floor", vastuZone: "West" },
      { roomName: "Open Sky Terrace Deck", dimension: "24'0\" x 16'0\"", floor: "Second Floor", vastuZone: "North-East" }
    ],
    features: [
      "In-Built Passenger Elevator / Lift Shaft Provision",
      "5 Luxury Master Bedrooms with Attached En-Suites",
      "Private Home Cinema / Audio-Visual Lounge",
      "2 Covered Car Parking Bays with EV Charging Provision",
      "Dual Balconies & Large Rooftop Party Terrace"
    ],
    cadPackagePrice: 1999,
    cadPackageFileName: "LH-HP-3200-Triplex-CAD-Package.zip",
    cadPackageSize: "34.8 MB",
    cadPackageIncludes: [
      "AutoCAD DWG Editable Vector Blueprints",
      "High-Definition Architectural PDF Floor Plans",
      "Column, Beam & Footing Structural Reinforcement Schedule",
      "Plumbing & Electrical Concealed Schematic Diagrams",
      "100% Vastu Shastra Directional Orientation Grid"
    ],
    seoMeta: {
      title: "3200 Sq Ft 5 BHK Triplex House Plan G+2 in Chennai | Lifehut",
      description: "Explore this 3200 sq.ft 5 BHK Triplex (G+2) house plan with lift provision in Chennai. Perfect for joint families, 100% Vastu compliant with turnkey construction cost.",
      keywords: "3200 sqft triplex house plan, 5bhk g+2 house design chennai, luxury triplex villa plan, house plan with lift"
    },
    isFeatured: true,
    isActive: true,
    createdAt: "2026-08-22"
  },
  {
    id: "lh-hp-1000-budget-villa",
    planCode: "LH-HP-1000",
    title: "1000 Sq.Ft Smart Budget 2 BHK Single-Storey House Plan",
    slug: "1000-sqft-smart-budget-2bhk-single-storey-house-plan",
    floors: 1,
    floorsLabel: "1 Storey (Ground Floor)",
    bedrooms: 2,
    bathrooms: 2,
    builtUpArea: 1000,
    plotDimensions: "25' x 40' (1,000 sq.ft plot)",
    buildingDimensions: "20'0\" x 33'0\"",
    facing: "West",
    vastuCompliant: true,
    vastuScore: "100% Vastu Compliant",
    vastuNotes: [
      "West-Facing Varuna entrance carefully positioned in positive 3rd/4th pada",
      "Master bedroom placed in South-West for family leadership and peace",
      "Kitchen in South-East (Agneya) ensuring correct fire element placement",
      "Pooja corner in Ishanya (North-East)"
    ],
    style: "Smart Budget Modern",
    carParking: 1,
    estimatedCostRange: "₹21.0 Lakhs – ₹24.0 Lakhs",
    costPerSqft: "₹2,100 – ₹2,400 / sq.ft (Turnkey in Chennai)",
    elevationImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
    floorPlanImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "A super-efficient 2 BHK single-floor architectural design optimized for standard 25x40 ft (1000 sq.ft) plots. Crafted to provide high structural integrity and comfortable modern living at an affordable turnkey cost under ₹25 Lakhs in Chennai and surrounding districts.",
    roomDimensions: [
      { roomName: "Front Porch / Parking", dimension: "9'6\" x 14'0\"", floor: "Ground Floor", vastuZone: "North-West" },
      { roomName: "Living & Dining Hall", dimension: "14'0\" x 12'0\"", floor: "Ground Floor", vastuZone: "Central / North" },
      { roomName: "Compact Modular Kitchen", dimension: "8'6\" x 7'6\"", floor: "Ground Floor", vastuZone: "South-East" },
      { roomName: "Pooja Shelf", dimension: "3'6\" x 3'0\"", floor: "Ground Floor", vastuZone: "North-East" },
      { roomName: "Master Bedroom with Bath", dimension: "12'0\" x 11'0\"", floor: "Ground Floor", vastuZone: "South-West" },
      { roomName: "Guest / Kids Bedroom", dimension: "10'6\" x 10'0\"", floor: "Ground Floor", vastuZone: "North-West" },
      { roomName: "Common Bathroom", dimension: "6'0\" x 4'0\"", floor: "Ground Floor", vastuZone: "West" }
    ],
    features: [
      "Engineered for Under ₹25 Lakhs Total Construction Budget",
      "Fits Narrow 25-Foot Width Residential Plots",
      "Full Concrete Frame Ready for Second Storey Expansion",
      "Natural Cross-Ventilation in All Living Areas",
      "Waterproofing & Anti-Termite Pre-Treatment Standard"
    ],
    cadPackagePrice: 699,
    cadPackageFileName: "LH-HP-1000-Architectural-CAD-Package.zip",
    cadPackageSize: "14.2 MB",
    cadPackageIncludes: [
      "AutoCAD DWG Editable Vector Blueprints",
      "High-Definition Architectural PDF Floor Plans",
      "Column, Beam & Footing Structural Reinforcement Schedule",
      "Plumbing & Electrical Concealed Schematic Diagrams",
      "100% Vastu Shastra Directional Orientation Grid"
    ],
    seoMeta: {
      title: "1000 Sq Ft 2 BHK House Plan 25x40 West Facing | Lifehut",
      description: "Affordable 1000 sq.ft 2 BHK house plan for 25x40 plots in Chennai. 100% Vastu compliant, estimated construction cost under 25 Lakhs, 2D floor blueprint.",
      keywords: "1000 sqft house plan, budget 2bhk house plan chennai, 25x40 house design, single floor house plan"
    },
    isFeatured: false,
    isActive: true,
    createdAt: "2026-08-25"
  },
  {
    id: "lh-hp-2700-duplex-glass",
    planCode: "LH-HP-2700",
    title: "2700 Sq.Ft Modern 4 BHK Duplex House Plan with Double Height Living",
    slug: "2700-sqft-modern-4bhk-duplex-house-plan-double-height",
    floors: 2,
    floorsLabel: "2 Storey (Duplex G+1)",
    bedrooms: 4,
    bathrooms: 4,
    builtUpArea: 2700,
    plotDimensions: "40' x 50' (2,000 sq.ft plot)",
    buildingDimensions: "32'0\" x 42'0\"",
    facing: "North",
    vastuCompliant: true,
    vastuScore: "100% Vastu Compliant",
    vastuNotes: [
      "North-Facing entry with broad steps and glass facade orientation",
      "Master bedroom in South-West with sound-dampened exterior wall insulation",
      "Pooja room directly in the North-East with direct natural light",
      "Kitchen in South-East with direct rear service courtyard access"
    ],
    style: "Ultra Modern Architectural Villa",
    carParking: 2,
    estimatedCostRange: "₹59.4 Lakhs – ₹67.5 Lakhs",
    costPerSqft: "₹2,200 – ₹2,500 / sq.ft (Turnkey in Chennai)",
    elevationImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop",
    floorPlanImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1000&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "An ultra-modern 4 BHK duplex architectural showpiece featuring a dramatic double-height living room with glass facade, cantilevered balconies, private study, 2-car covered portico, and 4 lavish en-suite bedrooms. Designed for contemporary urban living with premium thermal and acoustic insulation.",
    roomDimensions: [
      { roomName: "Wide 2-Car Porch", dimension: "18'0\" x 17'0\"", floor: "Ground Floor", vastuZone: "North-West" },
      { roomName: "Grand Double-Height Living Room", dimension: "18'0\" x 16'0\"", floor: "Ground Floor", vastuZone: "North-East / East" },
      { roomName: "Dining Space with Garden View", dimension: "14'0\" x 12'0\"", floor: "Ground Floor", vastuZone: "Central" },
      { roomName: "Chef's Kitchen with Island", dimension: "13'0\" x 10'6\"", floor: "Ground Floor", vastuZone: "South-East" },
      { roomName: "Dedicated Pooja Room", dimension: "6'0\" x 6'0\"", floor: "Ground Floor", vastuZone: "North-East" },
      { roomName: "Ground Guest Bedroom Suite", dimension: "14'0\" x 12'6\"", floor: "Ground Floor", vastuZone: "South" },
      { roomName: "Upper Family Living Mezzanine", dimension: "15'0\" x 13'0\"", floor: "First Floor", vastuZone: "East" },
      { roomName: "Grand Master Suite with Dresser", dimension: "17'0\" x 14'6\"", floor: "First Floor", vastuZone: "South-West" },
      { roomName: "Bedroom 3 (Children)", dimension: "14'0\" x 12'6\"", floor: "First Floor", vastuZone: "North-West" },
      { roomName: "Bedroom 4 (Study / Suite)", dimension: "13'6\" x 12'0\"", floor: "First Floor", vastuZone: "West" },
      { roomName: "Covered Balcony Lounge", dimension: "14'0\" x 6'0\"", floor: "First Floor", vastuZone: "North" }
    ],
    features: [
      "Floor-to-Ceiling Glass Facade in Double-Height Living Hall",
      "Mezzanine Floor Overlooking Ground Living Lounge",
      "Covered 2-Car Parking Portico with Landscaping Buffer",
      "Independent Service Entry to Utility & Kitchen",
      "High-Grade Fe 550D TMT Reinforcement Design"
    ],
    cadPackagePrice: 1499,
    cadPackageFileName: "LH-HP-2700-Duplex-CAD-Package.zip",
    cadPackageSize: "29.7 MB",
    cadPackageIncludes: [
      "AutoCAD DWG Editable Vector Blueprints",
      "High-Definition Architectural PDF Floor Plans",
      "Column, Beam & Footing Structural Reinforcement Schedule",
      "Plumbing & Electrical Concealed Schematic Diagrams",
      "100% Vastu Shastra Directional Orientation Grid"
    ],
    seoMeta: {
      title: "2700 Sq Ft 4 BHK Duplex House Plan in 40x50 Plot | Lifehut",
      description: "Modern 2700 sq.ft 4 BHK duplex house plan for 40x50 plots in Chennai. Double height living room, 2 cars parking, 100% Vastu approved with room sizes.",
      keywords: "2700 sqft duplex house plan, 4bhk double height house design, 40x50 house plan chennai, luxury modern villa"
    },
    isFeatured: true,
    isActive: true,
    createdAt: "2026-08-28"
  }
];
