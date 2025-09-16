

export type PaymentMethod = 'Cash' | 'E-Banking' | 'Online' | 'Card' | 'UPI' | 'Other';

export interface Farm {
  id: string;
  name: string;
  owner: string;
  location: string;
  area: number; // in acres
}

export type ZoneType = 'Open Field' | 'Greenhouse' | 'Pasture' | 'Agroforestry Plot' | 'Aquaponics System' | 'Vertical Farm Rack' | 'Silvopasture';

export interface Zone {
  id: string;
  farmId: string;
  name: string;
  type: ZoneType;
  area: number; // in acres or sq meters for indoor
  crop: Crop | null;
  polygon: string; // Simplified as a string for now
  diseaseRisk?: { level: 'Low' | 'Medium' | 'High'; reason: string };
  ceaSystemId?: string; // Link to a controlled environment system
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  sowingDate: string; // YYYY-MM-DD
  expectedHarvest: string; // YYYY-MM-DD
}

export interface SoilTest {
  id: string;
  zoneId: string;
  sampleDate: string; // YYYY-MM-DD
  ph: number;
  nitrogen: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
  organicMatter: number; // %
  fileUrl?: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    category: 'Seed' | 'Fertilizer' | 'Pesticide' | 'Equipment' | 'Beehive Supplies' | 'Aquaculture Feed' | 'CEA Supplies';
    quantity: number;
    unit: string;
    reorderLevel: number;
    unitCost: number;
}

export interface StockAdjustment {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  type: 'Correction' | 'Spoilage' | 'Damage' | 'Initial Stock' | 'Other';
  quantityChange: number; // positive for addition, negative for subtraction
  reason: string;
  adjustedBy: string; // User's name
}

export interface MaterialUsageRecord {
  id: string;
  date: string;
  itemId: string;
  itemName:string;
  quantityUsed: number;
  unit: string;
  purpose: 'Fertilizing' | 'Seeding' | 'Pest Control' | 'Repair' | 'Maintenance' | 'Other' | 'Nutrient Dosing';
  zoneId?: string;
  loggedBy: string;
}

export interface FinanceEntry {
    id:string;
    date: string;
    type: 'Income' | 'Expense';
    category: string;
    amount: number;
    notes: string;
    sourceId?: string; // Link to purchase, sale, etc.
    paymentMethod?: PaymentMethod;
}

export interface WeatherData {
    temperature: number; // Celsius
    humidity: number; // %
    windSpeed: number; // km/h
    precipitation: number; // mm in last 24h
    forecast: { day: string; temp: number; icon: string; }[];
}

export interface AiRecommendation {
  irrigation: {
    needed: boolean;
    amount?: number; // in mm
    duration?: number; // in minutes
    reason: string;
  };
  fertilizer: {
    needed: boolean;
    type?: 'Nitrogen' | 'Phosphorus' | 'Potassium';
    amount?: number; // kg/acre
    reason: string;
  };
}

export type TaskCategory = 
  'Planting' | 'Irrigation' | 'Fertilizing' | 'Pest Control' | 'Harvesting' | 'Maintenance' | 'Scouting' | 
  'General' | 'Apiary Work' | 'Aquaculture' | 'CEA Management' | 'Agroforestry' | 'Soil Health' | 'Organic Practices';

export interface Task {
  id: string;
  title: string;
  assignee: string;
  dueDate: string; // YYYY-MM-DD
  status: 'To-Do' | 'In Progress' | 'Completed';
  category: TaskCategory;
  zoneId?: string; // Optional: link task to a zone
  farmId: string;
  estimatedYield?: { value: number; unit: string; };
  actualYield?: { value: number; unit: string; };
}

// LABOR TYPES
export type Gender = 'Male' | 'Female' | 'Other';
export type WorkShift = 'Day' | 'Night' | 'Flexible';
export type WageType = 'Daily' | 'Weekly' | 'Monthly' | 'Hourly';
export type PaymentMode = 'Cash' | 'Bank Transfer' | 'UPI';

export interface Laborer {
  id: string;
  laborIdCode: string;
  status: 'Active' | 'Inactive';
  
  basicInfo: {
    fullName: string;
    relativeName?: string;
    dateOfBirth?: string;
    gender?: Gender;
    contactNumber: string;
    address: string;
    idProofNumber?: string;
  };

  employmentDetails: {
    department?: string;
    designation: string;
    joiningDate: string;
    supervisor?: string;
    workShift?: WorkShift;
    wageType: WageType;
    wageRate: number;
  };

  paymentDetails: {
    bankAccountNumber?: string;
    upiId?: string;
    paymentMode: PaymentMode;
  };
  
  compliance: {
    pfEsiNumber?: string;
    medicalCheckupStatus?: 'Completed' | 'Pending' | 'Not Required';
    safetyTraining: boolean;
    insurancePolicyNumber?: string;
  };

  remarks: {
    performanceNotes?: string;
    additionalComments?: string;
  };

  skills: string[];
}

export interface AttendanceRecord {
  id: string;
  laborerId: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Half-day';
}

export interface PurchaseRecord {
  id: string;
  date: string;
  itemName: string;
  supplier: string;
  quantity: number;
  unit: string;
  totalCost: number;
  financeEntryId: string;
  paymentMethod?: PaymentMethod;
}

export interface SalesRecord {
  id: string;
  date: string;
  cropName: string;
  buyer: string;
  quantity: number;
  unit: string;
  totalRevenue: number;
  financeEntryId: string;
  paymentMethod?: PaymentMethod;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  imageAnalysis?: CropHealthAnalysis;
}

export interface ControlDevice {
  id: string;
  name: string;
  type: 'Water Pump' | 'Motor' | 'Lighting System' | 'Ventilation Fan';
  location: string; 
  status: 'On' | 'Off';
  connectionType: 'Cloud Connected' | 'Local Network Only' | 'Unsupported';
  lastSeen: string; // ISO 8601 timestamp
}

export interface ManagedFile {
  id: string;
  name: string;
  type: 'image' | 'document';
  category: 'Soil Report' | 'Equipment Manual' | 'Invoice' | 'Field Photo' | 'Crop Health';
  url: string; 
  createdAt: string; // ISO 8601
  fileType: 'pdf' | 'docx' | 'xlsx' | 'jpg' | 'png';
  size: number; // in KB
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Farm Manager' | 'Worker';
  avatarUrl: string;
  phone: string;
  address: string;
  location: string;
  farmIds: string[]; // IDs of farms they are associated with
  notificationPreferences: {
    taskAlerts: boolean;
    aiRecommendations: boolean;
    systemUpdates: boolean;
  };
}

export interface Animal {
  id: string;
  tagId: string;
  species: 'Cattle' | 'Sheep' | 'Pig' | 'Chicken';
  breed: string;
  birthDate?: string; // YYYY-MM-DD
  status: 'Active' | 'Sold' | 'Deceased';
  location: string; // e.g., 'North Field', 'Barn 3'
  farmId: string;
}

export interface MaternityRecord {
  id: string;
  animalId: string; // The mother's ID
  animalTagId: string; // The mother's tag for easy display
  breedingDate: string; // YYYY-MM-DD
  expectedDueDate: string; // YYYY-MM-DD
  actualBirthDate?: string; // YYYY-MM-DD
  outcome: 'Successful' | 'Failed' | 'In Progress';
  offspringCount: number;
  notes?: string;
}

export interface Machine {
  id: string;
  name: string;
  type: 'Tractor' | 'Harvester' | 'Planter' | 'Sprayer' | 'Baler' | 'Other';
  status: 'Operational' | 'Maintenance' | 'Out of Service';
  purchaseDate: string; // YYYY-MM-DD
  purchaseCost: number;
  lastMaintenance: string; // YYYY-MM-DD
  nextMaintenance: string; // YYYY-MM-DD
  operationalHours: number;
  farmId: string;
}

export interface WaterQualityRecord {
  id: string;
  sourceId: string;
  date: string; // YYYY-MM-DD
  ph: number;
  turbidity: number; // NTU
  dissolvedOxygen: number; // mg/L
}

export interface WaterSource {
  id: string;
  farmId: string;
  name: string;
  type: 'Reservoir' | 'Well' | 'Tank' | 'Canal';
  capacity: number; // Liters
  currentLevel: number; // Liters
  alertThreshold?: number; // Percentage
  latestQuality?: Omit<WaterQualityRecord, 'id' | 'sourceId'>;
}

export interface WaterUsageRecord {
  id: string;
  sourceId: string;
  sourceName: string; // For easier display
  date: string; // YYYY-MM-DD
  amount: number; // Liters
  purpose: 'Irrigation' | 'Livestock' | 'Cleaning' | 'Other';
  zoneId?: string;
  notes?: string;
}

// BEEKEEPING TYPES
export interface Apiary {
  id: string;
  name: string;
  location: string;
  farmId: string;
}

export interface Hive {
  id:string;
  apiaryId: string;
  identifier: string; // e.g., "Hive 01"
  species: string; // e.g., "Apis mellifera"
  queenBirthDate: string; // YYYY-MM-DD
  status: 'Healthy' | 'Weak' | 'Queenless' | 'Swarmed';
  lastInspectionDate?: string; // YYYY-MM-DD
}

export interface HiveInspection {
  id: string;
  hiveId: string;
  date: string;
  queenSpotted: boolean;
  broodPattern: 'Good' | 'Spotty' | 'Poor';
  pests: ('Varroa Mites' | 'Hive Beetle' | 'Wax Moths')[];
  honeyStores: 'High' | 'Medium' | 'Low';
  notes: string;
}

// AQUACULTURE TYPES
export interface FishPond {
  id: string;
  name: string;
  farmId: string;
  dimensions: string; // e.g., "50m x 20m x 2m"
  waterTemperature: number; // Celsius
  ph: number;
  dissolvedOxygen: number; // mg/L
}

export interface FishBatch {
  id: string;
  pondId: string;
  species: 'Tilapia' | 'Catfish' | 'Trout';
  stockDate: string; // YYYY-MM-DD
  quantity: number;
  averageWeight: number; // in grams
}

export interface FeedingRecordAqua {
    id: string;
    pondId: string;
    date: string;
    feedType: string;
    quantity: number; // in kg
}

export interface FishHarvest {
    id: string;
    batchId: string;
    date: string;
    quantityHarvested: number;
    averageWeight: number; // in grams
    totalWeight: number; // in kg
}

// CONTROLLED ENVIRONMENT AGRICULTURE (CEA) TYPES
export interface NutrientSolution {
  ph: number;
  electricalConductivity: number; // in mS/cm
  temperature: number; // Celsius
}

export interface CEAControlSystem {
  id: string;
  zoneId: string;
  lighting: {
    status: 'On' | 'Off';
    dailyPhotoperiod: number; // hours
    intensity: number; // %
  };
  hvac: {
    temperature: number; // C
    humidity: number; // %
    co2Level: number; // ppm
  };
  nutrientSolution: NutrientSolution;
}

// ADVANCED FUNCTION TYPES
export interface ProactiveAlert {
    id: string;
    type: 'Disease Risk' | 'Nutrient Deficiency' | 'Low Stock' | 'Weather Warning' | 'System Anomaly';
    severity: 'Low' | 'Medium' | 'High';
    title: string;
    message: string;
    recommendation: string;
    relatedId: string; // e.g., zoneId, inventoryId, deviceId
    date: string;
}

export interface YieldForecast {
    cropName: string;
    forecastedYield: number; // in tons
    confidence: number; // 0 to 1
    notes: string;
}

export interface FinancialForecast {
    month: string;
    projectedIncome: number;
    projectedExpenses: number;
    projectedNet: number;
}

export interface BeekeepingSummary {
    totalHives: number;
    honeyProductionYTD: number; // in kg
    hivesHealthy: number;
    hivesAtRisk: number;
}

export interface AquacultureSummary {
    totalPonds: number;
    totalFishBiomass: number; // in kg
    pondsWithAlerts: number;
}

export interface CEASummary {
  activeSystems: number;
  systemsWithAlerts: number;
  powerConsumptionToday: number; // kWh
}

export type DashboardSummary = {
  alerts: ProactiveAlert[];
  yieldForecasts: YieldForecast[];
  financialForecasts: FinancialForecast[];
  beekeeping: BeekeepingSummary;
  aquaculture: AquacultureSummary;
  cea: CEASummary;
};


export type RuleTriggerCondition = 'soil_moisture_below' | 'temperature_above' | 'time_of_day_is';
export type RuleAction = 'turn_on' | 'turn_off';

export interface AutomationRule {
    id: string;
    name: string;
    trigger: {
        type: 'device_sensor' | 'weather' | 'schedule';
        condition: RuleTriggerCondition;
        targetId: string; // e.g., sensor ID, weather station
        value: number | string; // e.g., moisture level, temperature, time
    };
    action: {
        type: RuleAction;
        targetDeviceId: string;
        durationMinutes?: number;
    };
    isEnabled: boolean;
}

export interface CropRotationPlan {
    id: string;
    zoneId: string;
    zoneName: string;
    years: {
        year: number;
        crop: string;
        notes: string;
    }[];
}

export interface CropHealthAnalysis {
    condition: string;
    confidence: number;
    description: string;
    recommendations: string[];
}

export interface TransactionParty {
  name: string;
  location?: string;
  mobileNumber?: string;
  email?: string;
  address?: string;
}

export interface LivestockTransaction {
  id: string;
  type: 'Purchase' | 'Sale';
  date: string; // YYYY-MM-DDTHH:mm
  tagId: string;
  species: Animal['species'];
  breed: string;
  party: TransactionParty;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface AquacultureTransaction {
  id: string;
  type: 'Purchase' | 'Sale';
  date: string; // YYYY-MM-DDTHH:mm
  pondId: string;
  species: FishBatch['species'];
  quantity: number;
  averageWeight: number; // grams
  party: TransactionParty;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// DATA MANAGEMENT TYPES
export type DataTypeForCleanup = 'Completed Tasks' | 'Inactive Laborers' | 'Old Financial Entries';

export interface RecycledItem {
  id: string; // Unique ID for the recycle bin entry
  type: DataTypeForCleanup;
  data: any; // The original data object (Task, Laborer, etc.)
  deletedAt: string; // ISO 8601
}

// ROBOTICS TYPES
export interface Robot {
  id: string;
  name: string;
  type: 'Scout Rover' | 'Weeding Drone' | 'Harvester' | 'Spraying Drone';
  status: 'Idle' | 'Working' | 'Charging' | 'Maintenance' | 'Error' | 'Updating';
  batteryLevel: number; // percentage
  currentZoneId: string;
  softwareVersion: string;
  updateAvailable: boolean;
  activeMission?: {
    type: 'Scouting' | 'Weeding' | 'Harvesting' | 'Spraying' | 'Updating';
    progress: number; // percentage
  };
}