import type { Farm, Zone, SoilTest, Crop, InventoryItem, FinanceEntry, WeatherData, Task, Laborer, PurchaseRecord, SalesRecord, AttendanceRecord, ControlDevice, ManagedFile, UserProfile, StockAdjustment, Animal, MaternityRecord, Machine, WaterSource, WaterUsageRecord, WaterQualityRecord, MaterialUsageRecord, ProactiveAlert, YieldForecast, FinancialForecast, AutomationRule, CropRotationPlan, Apiary, Hive, HiveInspection, FishPond, FishBatch, FeedingRecordAqua, FishHarvest, BeekeepingSummary, AquacultureSummary, DashboardSummary, CEAControlSystem, CEASummary, PaymentMethod, LivestockTransaction, AquacultureTransaction, DataTypeForCleanup, RecycledItem, Robot } from '../types';

let mockRecycleBin: RecycledItem[] = [];

const mockFarms: Farm[] = [
  { id: 'farm-1', name: 'Green Valley Farms', owner: 'John Farmer', location: 'Central Valley, CA', area: 500 },
  { id: 'farm-2', name: 'Sunrise Acres', owner: 'Jane Smith', location: 'Midwest, IL', area: 1200 },
];

const mockCrops: { [key: string]: Crop } = {
  'crop-1': { id: 'crop-1', name: 'Corn', variety: 'Golden Bantam', sowingDate: '2024-04-15', expectedHarvest: '2024-09-20' },
  'crop-2': { id: 'crop-2', name: 'Tomatoes', variety: 'Roma', sowingDate: '2024-05-01', expectedHarvest: '2024-08-10' },
  'crop-3': { id: 'crop-3', name: 'Wheat', variety: 'Winter Red', sowingDate: '2023-10-25', expectedHarvest: '2024-06-30' },
  'crop-4': { id: 'crop-4', name: 'Lettuce', variety: 'Butterhead', sowingDate: '2024-07-01', expectedHarvest: '2024-08-15' },
  'crop-5': { id: 'crop-5', name: 'Oak Trees', variety: 'English Oak', sowingDate: '2020-03-10', expectedHarvest: '2050-03-10' },
};

const mockZones: Zone[] = [
  { id: 'zone-101', farmId: 'farm-1', name: 'North Field', type: 'Open Field', area: 120, crop: mockCrops['crop-1'], polygon: '...', diseaseRisk: { level: 'High', reason: 'High humidity and previous fungal infections detected.' } },
  { id: 'zone-102', farmId: 'farm-1', name: 'West Creek Field', type: 'Open Field', area: 80, crop: mockCrops['crop-2'], polygon: '...', diseaseRisk: { level: 'Low', reason: 'Good air circulation and resistant variety.' } },
  { id: 'zone-103', farmId: 'farm-1', name: 'Greenhouse A', type: 'Greenhouse', area: 2, crop: mockCrops['crop-4'], polygon: '...', ceaSystemId: 'cea-1' },
  { id: 'zone-104', farmId: 'farm-1', name: 'Silvopasture Plot', type: 'Silvopasture', area: 50, crop: mockCrops['crop-5'], polygon: '...' },
  { id: 'zone-201', farmId: 'farm-2', name: 'Sector A', type: 'Open Field', area: 400, crop: mockCrops['crop-3'], polygon: '...', diseaseRisk: { level: 'Medium', reason: 'Dense planting may increase risk.' } },
  { id: 'zone-202', farmId: 'farm-2', name: 'Sector B', type: 'Open Field', area: 500, crop: mockCrops['crop-1'], polygon: '...' },
  { id: 'zone-203', farmId: 'farm-2', name: 'Homestead Plot', type: 'Open Field', area: 300, crop: null, polygon: '...' },
];

const mockSoilTests: SoilTest[] = [
    // Zone 101 History
    { id: 'st-1a', zoneId: 'zone-101', sampleDate: '2023-03-15', ph: 6.5, nitrogen: 10, phosphorus: 22, potassium: 140, organicMatter: 2.3 },
    { id: 'st-1b', zoneId: 'zone-101', sampleDate: '2023-09-10', ph: 6.7, nitrogen: 8, phosphorus: 20, potassium: 145, organicMatter: 2.4 },
    { id: 'st-1c', zoneId: 'zone-101', sampleDate: '2024-03-20', ph: 6.8, nitrogen: 12, phosphorus: 25, potassium: 150, organicMatter: 2.5 },
    
    // Zone 102 (single test)
    { id: 'st-2', zoneId: 'zone-102', sampleDate: '2024-03-22', ph: 6.5, nitrogen: 18, phosphorus: 35, potassium: 180, organicMatter: 3.1 },

    // Zone 201 History
    { id: 'st-3a', zoneId: 'zone-201', sampleDate: '2022-09-01', ph: 7.2, nitrogen: 7, phosphorus: 14, potassium: 115, organicMatter: 2.1 },
    { id: 'st-3b', zoneId: 'zone-201', sampleDate: '2023-09-15', ph: 7.1, nitrogen: 8, phosphorus: 15, potassium: 120, organicMatter: 2.2 },

    // Zone 202 (single test)
    { id: 'st-4', zoneId: 'zone-202', sampleDate: '2024-04-01', ph: 6.9, nitrogen: 22, phosphorus: 30, potassium: 165, organicMatter: 2.8 },
];

let mockInventory: InventoryItem[] = [
    { id: 'inv-1', name: 'Urea Fertilizer', category: 'Fertilizer', quantity: 500, unit: 'kg', reorderLevel: 200, unitCost: 5.0 },
    { id: 'inv-2', name: 'Golden Bantam Corn Seed', category: 'Seed', quantity: 45, unit: 'bags', reorderLevel: 50, unitCost: 20.0 },
    { id: 'inv-3', name: 'General Pesticide', category: 'Pesticide', quantity: 50, unit: 'liters', reorderLevel: 25, unitCost: 15.0 },
    { id: 'inv-4', name: 'Tractor Sprayer Attachment', category: 'Equipment', quantity: 1, unit: 'unit', reorderLevel: 1, unitCost: 1200.0 },
    { id: 'inv-5', name: 'Bee Hive Box (Langstroth)', category: 'Beehive Supplies', quantity: 10, unit: 'units', reorderLevel: 5, unitCost: 75.0 },
    { id: 'inv-6', name: 'Fish Feed Pellets (3mm)', category: 'Aquaculture Feed', quantity: 250, unit: 'kg', reorderLevel: 100, unitCost: 2.5 },
    { id: 'inv-7', name: 'Hydroponic Nutrient A', category: 'CEA Supplies', quantity: 20, unit: 'liters', reorderLevel: 10, unitCost: 22.0 },
];

const mockStockAdjustments: StockAdjustment[] = [
    { id: 'adj-1', date: '2024-06-20', itemId: 'inv-3', itemName: 'General Pesticide', type: 'Spoilage', quantityChange: -5, reason: 'Container leaked', adjustedBy: 'John Farmer' },
    { id: 'adj-2', date: '2024-06-15', itemId: 'inv-1', itemName: 'Urea Fertilizer', type: 'Correction', quantityChange: 10, reason: 'Stock count correction', adjustedBy: 'John Farmer' },
];

let mockMaterialUsageRecords: MaterialUsageRecord[] = [
    { id: 'use-1', date: '2024-07-25', itemId: 'inv-1', itemName: 'Urea Fertilizer', quantityUsed: 50, unit: 'kg', purpose: 'Fertilizing', zoneId: 'zone-101', loggedBy: 'Carlos Rey' },
    { id: 'use-2', date: '2024-07-26', itemId: 'inv-3', itemName: 'General Pesticide', quantityUsed: 10, unit: 'liters', purpose: 'Pest Control', zoneId: 'zone-102', loggedBy: 'Maria Garcia' },
    { id: 'use-3', date: '2024-07-28', itemId: 'inv-7', itemName: 'Hydroponic Nutrient A', quantityUsed: 2, unit: 'liters', purpose: 'Nutrient Dosing', zoneId: 'zone-103', loggedBy: 'John Farmer' },
];

const mockPurchases: PurchaseRecord[] = [
    { id: 'pur-1', date: '2024-05-10', itemName: 'Urea Fertilizer', supplier: 'AgriSupplies Inc.', quantity: 500, unit: 'kg', totalCost: 2500, financeEntryId: 'fin-1', paymentMethod: 'Card' },
    { id: 'pur-2', date: '2024-04-10', itemName: 'Golden Bantam Corn Seed', supplier: 'Seed Co.', quantity: 200, unit: 'bags', totalCost: 4000, financeEntryId: 'fin-4', paymentMethod: 'E-Banking' },
];

const mockSales: SalesRecord[] = [
    { id: 'sale-1', date: '2023-11-20', cropName: 'Wheat', buyer: 'Global Grains', quantity: 200, unit: 'tons', totalRevenue: 30000, financeEntryId: 'fin-5', paymentMethod: 'E-Banking' },
    { id: 'sale-2', date: '2023-09-15', cropName: 'Tomatoes', buyer: 'Local Market', quantity: 5, unit: 'tons', totalRevenue: 7500, financeEntryId: 'fin-6', paymentMethod: 'Cash' },
];

let mockLaborers: Laborer[] = [
    {
      id: 'lab-1',
      laborIdCode: 'LW-001',
      status: 'Active',
      basicInfo: {
        fullName: 'Carlos Rey',
        relativeName: 'Juan Rey',
        dateOfBirth: '1990-05-20',
        gender: 'Male',
        contactNumber: '555-0101',
        address: '123 Farm Rd, Central Valley, CA',
        idProofNumber: '1234 5678 9012',
      },
      employmentDetails: {
        department: 'North Field Operations',
        designation: 'Field Worker',
        joiningDate: '2022-03-15',
        supervisor: 'John Farmer',
        workShift: 'Day',
        wageType: 'Daily',
        wageRate: 80,
      },
      paymentDetails: {
        bankAccountNumber: '**** **** 1234',
        paymentMode: 'Bank Transfer',
      },
      compliance: {
        medicalCheckupStatus: 'Completed',
        safetyTraining: true,
      },
      remarks: {
        performanceNotes: 'Reliable and hard-working.',
      },
      skills: ['Harvesting', 'Weeding', 'Tractor Operation'],
    },
    {
      id: 'lab-2',
      laborIdCode: 'LW-002',
      status: 'Active',
      basicInfo: {
        fullName: 'Maria Garcia',
        relativeName: 'Luis Garcia',
        dateOfBirth: '1985-11-10',
        gender: 'Female',
        contactNumber: '555-0102',
        address: '456 Farmer Ln, Central Valley, CA',
        idProofNumber: '2345 6789 0123',
      },
      employmentDetails: {
        department: 'Irrigation & Pest Control',
        designation: 'Irrigation Specialist',
        joiningDate: '2021-09-01',
        supervisor: 'John Farmer',
        workShift: 'Day',
        wageType: 'Daily',
        wageRate: 95,
      },
      paymentDetails: {
        upiId: 'maria-garcia@upi',
        paymentMode: 'UPI',
      },
      compliance: {
        medicalCheckupStatus: 'Completed',
        safetyTraining: true,
        insurancePolicyNumber: 'POL-987654'
      },
      remarks: {},
      skills: ['Drip Irrigation', 'Pump Maintenance', 'Pest Identification'],
    },
     {
      id: 'lab-3',
      laborIdCode: 'LW-003',
      status: 'Active',
      basicInfo: {
        fullName: 'Sam Wilson',
        contactNumber: '555-0103',
        address: '789 Harvest Blvd, Central Valley, CA',
      },
      employmentDetails: {
        designation: 'Tractor Operator',
        joiningDate: '2023-01-20',
        wageType: 'Daily',
        wageRate: 110,
      },
      paymentDetails: {
        paymentMode: 'Cash',
      },
      compliance: {
        safetyTraining: false,
      },
      remarks: {},
      skills: ['Tractor Operation', 'Plowing', 'Spraying'],
    },
    {
      id: 'lab-4',
      laborIdCode: 'LW-004',
      status: 'Inactive',
      basicInfo: {
        fullName: 'David Chen',
        contactNumber: '555-0104',
        address: '101 Orchard Ave, Central Valley, CA',
      },
      employmentDetails: {
        designation: 'General Labor',
        joiningDate: '2023-08-01',
        wageType: 'Daily',
        wageRate: 75,
      },
      paymentDetails: {
        paymentMode: 'Cash',
      },
      compliance: {
        safetyTraining: false,
      },
      remarks: {
        additionalComments: 'Left for a different job on 2024-05-01.'
      },
      skills: [],
    },
];

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

let mockAttendance: AttendanceRecord[] = [];

// Generate more extensive mock attendance data for the last 3 months
for (let i = 90; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateString = formatDate(date);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) continue; // Skip Sundays

    // Carlos Rey (lab-1) works most days
    if (dayOfWeek !== 6) { // Takes Saturdays off sometimes
         mockAttendance.push({id: `att-c-${dateString}`, laborerId: 'lab-1', date: dateString, status: Math.random() > 0.1 ? 'Present' : 'Half-day' });
    }

    // Maria Garcia (lab-2) works weekdays
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        mockAttendance.push({id: `att-m-${dateString}`, laborerId: 'lab-2', date: dateString, status: 'Present' });
    }

    // Sam Wilson (lab-3) works intermittently
    if (Math.random() > 0.5) {
        mockAttendance.push({id: `att-s-${dateString}`, laborerId: 'lab-3', date: dateString, status: 'Present' });
    }
}


let mockFinance: FinanceEntry[] = [
    { id: 'fin-1', date: '2024-05-10', type: 'Expense', category: 'Fertilizer Purchase', amount: 2500, notes: 'Purchased Urea for corn', sourceId: 'pur-1', paymentMethod: 'Card' },
    { id: 'fin-4', date: '2024-04-10', type: 'Expense', category: 'Seed Purchase', amount: 4000, notes: 'Corn seeds for planting season', sourceId: 'pur-2', paymentMethod: 'E-Banking' },
    { id: 'fin-5', date: '2023-11-20', type: 'Income', category: 'Crop Sale', amount: 30000, notes: 'Sold last season\'s wheat', sourceId: 'sale-1', paymentMethod: 'E-Banking' },
    { id: 'fin-6', date: '2023-09-15', type: 'Income', category: 'Crop Sale', amount: 7500, notes: 'Tomato harvest sale', sourceId: 'sale-2', paymentMethod: 'Cash' },
    { id: 'fin-2', date: '2024-05-12', type: 'Expense', category: 'Fuel', amount: 300, notes: 'Diesel for tractor', paymentMethod: 'Card' },
    { id: 'fin-3', date: '2024-04-20', type: 'Income', category: 'Government Subsidy', amount: 5000, notes: 'Annual crop subsidy', paymentMethod: 'E-Banking' },
    { id: 'fin-7', date: '2024-07-01', type: 'Expense', category: 'Labor Payment', amount: 800, notes: 'Payment to Carlos Rey for June work', paymentMethod: 'Cash' },
    { id: 'fin-8', date: '2024-07-01', type: 'Expense', category: 'Labor Payment', amount: 950, notes: 'Payment to Maria Garcia for June work', paymentMethod: 'UPI' },
    { id: 'fin-old-1', date: '2022-01-15', type: 'Expense', category: 'Repair', amount: 1200, notes: 'Tractor engine repair', paymentMethod: 'Card' },
];

let mockTasks: Task[] = [
  { id: 'task-1', farmId: 'farm-1', zoneId: 'zone-101', title: 'Fertilize North Field', assignee: 'Carlos Rey', dueDate: '2024-07-25', status: 'In Progress', category: 'Fertilizing' },
  { id: 'task-2', farmId: 'farm-1', zoneId: 'zone-102', title: 'Inspect irrigation system', assignee: 'Maria Garcia', dueDate: '2024-07-22', status: 'To-Do', category: 'Irrigation' },
  { id: 'task-3', farmId: 'farm-2', zoneId: 'zone-201', title: 'Scout for pests in Sector A', assignee: 'Jane Smith', dueDate: '2024-07-28', status: 'To-Do', category: 'Scouting' },
  { id: 'task-4', farmId: 'farm-1', title: 'Repair fence on west border', assignee: 'Sam Wilson', dueDate: '2024-07-20', status: 'Completed', category: 'Maintenance' },
  { id: 'task-5', farmId: 'farm-2', zoneId: 'zone-202', title: 'Plowing Sector B', assignee: 'Sam Wilson', dueDate: '2024-08-01', status: 'To-Do', category: 'General' },
  { id: 'task-6', farmId: 'farm-2', zoneId: 'zone-201', title: 'Harvest Winter Wheat', assignee: 'Harvest Crew', dueDate: '2024-06-28', status: 'Completed', category: 'Harvesting', estimatedYield: { value: 200, unit: 'tons'}, actualYield: { value: 215, unit: 'tons'} },
  { id: 'task-7', farmId: 'farm-1', zoneId: 'zone-102', title: 'Begin tomato harvest', assignee: 'Maria Garcia', dueDate: '2024-08-05', status: 'To-Do', category: 'Harvesting', estimatedYield: { value: 5, unit: 'tons'} },
  { id: 'task-8', farmId: 'farm-1', title: 'Inspect hives in Bee Yard A', assignee: 'John Farmer', dueDate: '2024-08-02', status: 'To-Do', category: 'Apiary Work' },
  { id: 'task-9', farmId: 'farm-1', zoneId: 'zone-103', title: 'Check nutrient solution pH', assignee: 'John Farmer', dueDate: '2024-08-03', status: 'To-Do', category: 'CEA Management' },
  { id: 'task-10', farmId: 'farm-1', zoneId: 'zone-104', title: 'Prune oak tree branches', assignee: 'Carlos Rey', dueDate: '2024-08-10', status: 'To-Do', category: 'Agroforestry' },
];

const mockWeather: WeatherData = {
    temperature: 24,
    humidity: 65,
    windSpeed: 15,
    precipitation: 2, // 2mm in last 24h
    forecast: [
        { day: 'Today', temp: 26, icon: '☀️' },
        { day: 'Tomorrow', temp: 27, icon: '☀️' },
        { day: 'Day After', temp: 25, icon: '⛅️' },
    ]
};

const mockControlDevices: ControlDevice[] = [
    { id: 'dev-1', name: 'Main Irrigation Pump', type: 'Water Pump', location: 'North Field Well', status: 'Off', connectionType: 'Cloud Connected', lastSeen: new Date(Date.now() - 60000 * 5).toISOString() },
    { id: 'dev-2', name: 'Greenhouse Fan #1', type: 'Ventilation Fan', location: 'Greenhouse A', status: 'On', connectionType: 'Cloud Connected', lastSeen: new Date(Date.now() - 60000 * 2).toISOString() },
    { id: 'dev-3', name: 'Feed Auger Motor', type: 'Motor', location: 'Silo B', status: 'Off', connectionType: 'Local Network Only', lastSeen: new Date(Date.now() - 60000 * 30).toISOString() },
    { id: 'dev-4', name: 'Security Lighting', type: 'Lighting System', location: 'Main Barn', status: 'On', connectionType: 'Unsupported', lastSeen: new Date(Date.now() - 60000 * 60 * 24).toISOString() },
    { id: 'dev-5', name: 'Drip System Pump', type: 'Water Pump', location: 'West Creek Field', status: 'Off', connectionType: 'Cloud Connected', lastSeen: new Date(Date.now() - 60000 * 10).toISOString() },
];

const mockFiles: ManagedFile[] = [
    { id: 'file-1', name: 'North Field - Corn Growth (July)', type: 'image', category: 'Field Photo', url: 'https://picsum.photos/seed/northfield/400/300', createdAt: '2024-07-15T10:00:00Z', fileType: 'jpg', size: 1200 },
    { id: 'file-2', name: 'Tractor John Deere 8R Manual', type: 'document', category: 'Equipment Manual', url: '#', createdAt: '2023-01-20T14:30:00Z', fileType: 'pdf', size: 5400 },
    { id: 'file-3', name: 'Soil Test Results - Zone 101', type: 'document', category: 'Soil Report', url: '#', createdAt: '2024-03-21T09:00:00Z', fileType: 'pdf', size: 350 },
    { id: 'file-4', name: 'Fertilizer Invoice - May 2024', type: 'document', category: 'Invoice', url: '#', createdAt: '2024-05-11T16:45:00Z', fileType: 'pdf', size: 150 },
    { id: 'file-5', name: 'West Creek Field - Tomato Blight', type: 'image', category: 'Crop Health', url: 'https://picsum.photos/seed/tomatoblight/400/300', createdAt: '2024-07-18T11:20:00Z', fileType: 'jpg', size: 1500 },
    { id: 'file-6', name: 'Sector A - Wheat Harvest', type: 'image', category: 'Field Photo', url: 'https://picsum.photos/seed/wheatharvest/400/300', createdAt: '2024-06-25T18:00:00Z', fileType: 'jpg', size: 2100 },
    { id: 'file-7', name: '2023 Crop Yields.xlsx', type: 'document', category: 'Invoice', url: '#', createdAt: '2024-01-10T12:00:00Z', fileType: 'xlsx', size: 85 },
];

let mockUserProfile: UserProfile = {
  id: 'user-1',
  name: 'John Farmer',
  email: 'john.farmer@greenvalley.com',
  role: 'Admin',
  avatarUrl: 'https://picsum.photos/seed/user1/200/200',
  phone: '555-123-4567',
  address: '101 Farmstead Lane, Central Valley, CA 95201',
  location: 'Central Valley, CA',
  farmIds: ['farm-1', 'farm-2'],
  notificationPreferences: {
    taskAlerts: true,
    aiRecommendations: true,
    systemUpdates: false,
  }
};

let mockAnimals: Animal[] = [
  { id: 'animal-1', farmId: 'farm-1', tagId: 'CF001', species: 'Cattle', breed: 'Holstein', birthDate: '2021-05-20', status: 'Active', location: 'Silvopasture Plot' },
  { id: 'animal-2', farmId: 'farm-1', tagId: 'CF002', species: 'Cattle', breed: 'Holstein', birthDate: '2022-01-15', status: 'Active', location: 'Barn 3' },
  { id: 'animal-3', farmId: 'farm-2', tagId: 'SP001', species: 'Sheep', breed: 'Merino', birthDate: '2023-03-10', status: 'Active', location: 'Pasture 2' },
];

const mockMaternityRecords: MaternityRecord[] = [
  { id: 'mat-1', animalId: 'animal-1', animalTagId: 'CF001', breedingDate: '2023-11-01', expectedDueDate: '2024-08-10', outcome: 'In Progress', offspringCount: 0, notes: 'First pregnancy' },
  { id: 'mat-2', animalId: 'animal-3', animalTagId: 'SP001', breedingDate: '2024-04-05', expectedDueDate: '2024-09-05', outcome: 'In Progress', offspringCount: 0 },
];

const mockMachines: Machine[] = [
  { id: 'mach-1', farmId: 'farm-1', name: 'John Deere 8R 370', type: 'Tractor', status: 'Operational', purchaseDate: '2022-03-15', purchaseCost: 350000, lastMaintenance: '2024-06-01', nextMaintenance: '2024-12-01', operationalHours: 1250 },
  { id: 'mach-2', farmId: 'farm-1', name: 'Claas Lexion 8900', type: 'Harvester', status: 'Maintenance', purchaseDate: '2021-07-20', purchaseCost: 750000, lastMaintenance: '2024-07-10', nextMaintenance: '2024-08-01', operationalHours: 850 },
  { id: 'mach-3', farmId: 'farm-2', name: 'Kuhn VB 7190', type: 'Baler', status: 'Operational', purchaseDate: '2023-05-01', purchaseCost: 120000, lastMaintenance: '2024-05-15', nextMaintenance: '2025-05-15', operationalHours: 320 },
];

let mockWaterSources: WaterSource[] = [
  { id: 'ws-1', farmId: 'farm-1', name: 'Main Reservoir', type: 'Reservoir', capacity: 5000000, currentLevel: 3750000, alertThreshold: 25, latestQuality: { date: '2024-07-22', ph: 7.2, turbidity: 4.5, dissolvedOxygen: 8.1 } },
  { id: 'ws-2', farmId: 'farm-1', name: 'North Field Well', type: 'Well', capacity: 1000000, currentLevel: 150000, alertThreshold: 20, latestQuality: { date: '2024-07-21', ph: 6.8, turbidity: 8.2, dissolvedOxygen: 7.5 } },
  { id: 'ws-3', farmId: 'farm-2', name: 'Rainwater Harvest Tank', type: 'Tank', capacity: 50000, currentLevel: 45000, alertThreshold: 15 },
];

let mockWaterUsageRecords: WaterUsageRecord[] = [
    { id: 'wu-1', sourceId: 'ws-1', sourceName: 'Main Reservoir', date: '2024-07-20', amount: 50000, purpose: 'Irrigation', zoneId: 'zone-101', notes: 'Corn field irrigation cycle.' },
    { id: 'wu-2', sourceId: 'ws-2', sourceName: 'North Field Well', date: '2024-07-19', amount: 25000, purpose: 'Irrigation', zoneId: 'zone-102', notes: 'Tomato drip irrigation.' },
    { id: 'wu-3', sourceId: 'ws-1', sourceName: 'Main Reservoir', date: '2024-07-18', amount: 10000, purpose: 'Livestock', notes: 'Refilling cattle troughs.' },
];

let mockWaterQualityRecords: WaterQualityRecord[] = [
    { id: 'wq-1', sourceId: 'ws-1', date: '2024-06-15', ph: 7.0, turbidity: 5.1, dissolvedOxygen: 8.5 },
    { id: 'wq-2', sourceId: 'ws-1', date: '2024-07-01', ph: 7.1, turbidity: 4.8, dissolvedOxygen: 8.3 },
    { id: 'wq-3', sourceId: 'ws-1', date: '2024-07-15', ph: 7.1, turbidity: 4.8, dissolvedOxygen: 8.3 },
    { id: 'wq-4', sourceId: 'ws-1', date: '2024-07-22', ph: 7.2, turbidity: 4.5, dissolvedOxygen: 8.1 },
    { id: 'wq-5', sourceId: 'ws-2', date: '2024-06-21', ph: 6.9, turbidity: 7.9, dissolvedOxygen: 7.6 },
    { id: 'wq-6', sourceId: 'ws-2', date: '2024-07-21', ph: 6.8, turbidity: 8.2, dissolvedOxygen: 7.5 },
];

// NEW BEEKEEPING DATA
const mockApiaries: Apiary[] = [
    { id: 'apiary-1', farmId: 'farm-1', name: 'Orchard Apiary', location: 'East of North Field' },
    { id: 'apiary-2', farmId: 'farm-1', name: 'Wildflower Meadow Apiary', location: 'South Border' },
];

const mockHives: Hive[] = [
    { id: 'hive-1', apiaryId: 'apiary-1', identifier: 'OA-01', species: 'Apis mellifera', queenBirthDate: '2023-05-10', status: 'Healthy', lastInspectionDate: '2024-07-15' },
    { id: 'hive-2', apiaryId: 'apiary-1', identifier: 'OA-02', species: 'Apis mellifera', queenBirthDate: '2023-05-10', status: 'Weak', lastInspectionDate: '2024-07-15' },
    { id: 'hive-3', apiaryId: 'apiary-2', identifier: 'WM-01', species: 'Apis mellifera', queenBirthDate: '2024-04-02', status: 'Healthy' },
];

const mockHiveInspections: HiveInspection[] = [
    { id: 'insp-1', hiveId: 'hive-1', date: '2024-07-15', queenSpotted: true, broodPattern: 'Good', pests: [], honeyStores: 'High', notes: 'Strong colony, plenty of resources.' },
    { id: 'insp-2', hiveId: 'hive-2', date: '2024-07-15', queenSpotted: false, broodPattern: 'Spotty', pests: ['Varroa Mites'], honeyStores: 'Low', notes: 'Low population. Mite treatment needed.' },
];

// NEW AQUACULTURE DATA
let mockFishPonds: FishPond[] = [
    { id: 'pond-1', farmId: 'farm-1', name: 'Tilapia Pond 1', dimensions: '50m x 25m x 2m', waterTemperature: 28, ph: 7.5, dissolvedOxygen: 6.5 },
    { id: 'pond-2', farmId: 'farm-1', name: 'Catfish Pond', dimensions: '30m x 30m x 2.5m', waterTemperature: 26, ph: 7.2, dissolvedOxygen: 5.8 },
];

let mockFishBatches: FishBatch[] = [
    { id: 'batch-1', pondId: 'pond-1', species: 'Tilapia', stockDate: '2024-03-01', quantity: 5000, averageWeight: 350 },
    { id: 'batch-2', pondId: 'pond-2', species: 'Catfish', stockDate: '2024-04-15', quantity: 3000, averageWeight: 500 },
];

// NEW CEA DATA
const mockCEASystems: CEAControlSystem[] = [
    { 
        id: 'cea-1', 
        zoneId: 'zone-103',
        lighting: { status: 'On', dailyPhotoperiod: 16, intensity: 85 },
        hvac: { temperature: 22, humidity: 60, co2Level: 800 },
        nutrientSolution: { ph: 6.1, electricalConductivity: 1.8, temperature: 20 }
    }
];

// NEW TRANSACTION DATA
let mockLivestockTransactions: LivestockTransaction[] = [
    { id: 'lt-1', type: 'Purchase', date: '2024-01-15T11:00', tagId: 'CF002', species: 'Cattle', breed: 'Holstein', party: { name: 'Sunny Meadows Farm' }, amount: 1500, paymentMethod: 'E-Banking', notes: 'Purchased for breeding' },
    { id: 'lt-2', type: 'Sale', date: '2024-07-10T16:00', tagId: 'CF001', species: 'Cattle', breed: 'Holstein', party: { name: 'Local Market' }, amount: 1300, paymentMethod: 'Cash', notes: 'Sold mature cow' }
];

let mockAquacultureTransactions: AquacultureTransaction[] = [
    { id: 'at-1', type: 'Purchase', date: '2024-03-01T09:00', pondId: 'pond-1', species: 'Tilapia', quantity: 5000, averageWeight: 5, party: { name: 'AquaGrow Hatchery' }, totalAmount: 1500, paymentMethod: 'E-Banking', notes: 'Stocking Tilapia Pond 1 with fingerlings' },
    { id: 'at-2', type: 'Sale', date: '2024-07-20T11:00', pondId: 'pond-1', species: 'Tilapia', quantity: 1000, averageWeight: 350, party: { name: 'Fish Market Co.' }, totalAmount: 5250, paymentMethod: 'E-Banking', notes: 'Partial harvest' }
];


// ADVANCED FUNCTION MOCK DATA
const mockProactiveAlerts: ProactiveAlert[] = [
    { id: 'alert-1', type: 'Disease Risk', severity: 'High', title: 'High Blight Risk in North Field', message: 'Weather conditions (high humidity, moderate temperature) are favorable for late blight development in corn.', recommendation: 'Scout the North Field immediately. Consider a preventative fungicide application.', relatedId: 'zone-101', date: new Date().toISOString() },
    { id: 'alert-2', type: 'Low Stock', severity: 'Medium', title: 'Low on Pesticide', message: 'Stock of "General Pesticide" is below reorder level. Only 50 liters remaining.', recommendation: 'Create a purchase order for more pesticide to avoid stockout.', relatedId: 'inv-3', date: new Date(Date.now() - 86400000).toISOString() },
    { id: 'alert-3', type: 'Weather Warning', severity: 'High', title: 'Heavy Rain Forecasted', message: 'Forecast predicts over 50mm of rain in the next 48 hours.', recommendation: 'Postpone any planned irrigation for all fields. Ensure proper drainage is clear.', relatedId: 'farm-1', date: new Date().toISOString() },
    { id: 'alert-4', type: 'System Anomaly', severity: 'Medium', title: 'Nutrient pH rising in Greenhouse A', message: 'The pH of the nutrient solution has risen to 6.8, which is above the optimal range for lettuce.', recommendation: 'Calibrate pH sensor and add pH down solution.', relatedId: 'cea-1', date: new Date().toISOString() },
];

const mockYieldForecasts: YieldForecast[] = [
    { cropName: 'Corn', forecastedYield: 650, confidence: 0.85, notes: 'Based on current growth stage and favorable weather forecast.' },
    { cropName: 'Tomatoes', forecastedYield: 95, confidence: 0.78, notes: 'Slight risk of disease could impact final yield.' },
];

const mockFinancialForecasts: FinancialForecast[] = [
    { month: 'Aug', projectedIncome: 12000, projectedExpenses: 7500, projectedNet: 4500 },
    { month: 'Sep', projectedIncome: 85000, projectedExpenses: 15000, projectedNet: 70000 },
    { month: 'Oct', projectedIncome: 25000, projectedExpenses: 9000, projectedNet: 16000 },
];

let mockAutomationRules: AutomationRule[] = [
    { id: 'rule-1', name: 'Night Irrigation for North Field', trigger: { type: 'schedule', condition: 'time_of_day_is', targetId: 'scheduler', value: '22:00' }, action: { type: 'turn_on', targetDeviceId: 'dev-1', durationMinutes: 60 }, isEnabled: true },
    { id: 'rule-2', name: 'Greenhouse Emergency Ventilation', trigger: { type: 'device_sensor', condition: 'temperature_above', targetId: 'sensor-gh-1', value: 30 }, action: { type: 'turn_on', targetDeviceId: 'dev-2' }, isEnabled: true },
    { id: 'rule-3', name: 'Stop pump if moisture is high', trigger: { type: 'device_sensor', condition: 'soil_moisture_below', targetId: 'sensor-nf-1', value: 60 }, action: { type: 'turn_off', targetDeviceId: 'dev-1' }, isEnabled: false },
];

const mockCropRotationPlans: CropRotationPlan[] = [
    { id: 'plan-1', zoneId: 'zone-101', zoneName: 'North Field', years: [
        { year: 2024, crop: 'Corn', notes: 'Heavy nitrogen feeder.' },
        { year: 2025, crop: 'Soybeans', notes: 'Nitrogen-fixing legume to replenish soil.' },
        { year: 2026, crop: 'Alfalfa', notes: 'Cover crop for soil health improvement.' },
        { year: 2027, crop: 'Corn', notes: 'Return to primary crop.' },
    ]},
     { id: 'plan-2', zoneId: 'zone-102', zoneName: 'West Creek Field', years: [
        { year: 2024, crop: 'Tomatoes', notes: '' },
        { year: 2025, crop: 'Beans', notes: 'Avoid planting nightshades.' },
        { year: 2026, crop: 'Lettuce', notes: 'Light feeder.' },
    ]},
];

let mockRobots: Robot[] = [
    { id: 'robot-1', name: 'ScoutBot-01', type: 'Scout Rover', status: 'Idle', batteryLevel: 85, currentZoneId: 'zone-101', softwareVersion: 'v1.2.0', updateAvailable: true },
    { id: 'robot-2', name: 'WeedZap-A', type: 'Weeding Drone', status: 'Charging', batteryLevel: 45, currentZoneId: 'zone-102', softwareVersion: 'v2.1.1', updateAvailable: false },
    { id: 'robot-3', name: 'HarvesterMax', type: 'Harvester', status: 'Maintenance', batteryLevel: 100, currentZoneId: 'zone-201', softwareVersion: 'v1.0.3', updateAvailable: false },
    { id: 'robot-4', name: 'ScoutBot-02', type: 'Scout Rover', status: 'Working', batteryLevel: 62, currentZoneId: 'zone-102', activeMission: { type: 'Scouting', progress: 45 }, softwareVersion: 'v1.2.1', updateAvailable: false },
    { id: 'robot-5', name: 'SprayBot-Alpha', type: 'Spraying Drone', status: 'Idle', batteryLevel: 95, currentZoneId: 'zone-103', softwareVersion: 'v1.5.0', updateAvailable: true },
];

const apiCall = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 300));
}

export const getFarms = () => apiCall(mockFarms);
export const getZonesByFarmId = (farmId: string) => apiCall(mockZones.filter(f => f.farmId === farmId));
export const getSoilTestByZoneId = (zoneId: string) => apiCall(mockSoilTests.filter(st => st.zoneId === zoneId).sort((a, b) => new Date(b.sampleDate).getTime() - new Date(a.sampleDate).getTime()));
export const getInventory = () => apiCall(mockInventory);
export const getFinanceEntries = () => apiCall(mockFinance);
export const getWeather = () => apiCall(mockWeather);
export const getLaborers = () => apiCall(mockLaborers);
export const getPurchases = () => apiCall(mockPurchases);
export const getSales = () => apiCall(mockSales);


export const getTasksByFarmId = (farmId: string) => apiCall(mockTasks.filter(t => t.farmId === farmId));
export const getAllTasks = () => apiCall(mockTasks);

export const addFarm = (farm: Omit<Farm, 'id'>) => {
    const newFarm: Farm = { ...farm, id: `farm-${Date.now()}` };
    mockFarms.push(newFarm);
    return apiCall(newFarm);
};

export const updateFarm = (updatedFarm: Farm) => {
    const index = mockFarms.findIndex(f => f.id === updatedFarm.id);
    if (index !== -1) {
        mockFarms[index] = updatedFarm;
    }
    return apiCall(updatedFarm);
};

export const addZone = (zone: Omit<Zone, 'id'>) => {
    const newZone: Zone = { ...zone, id: `zone-${Date.now()}` };
    mockZones.push(newZone);
    return apiCall(newZone);
};

export const updateZone = (updatedZone: Zone) => {
    const index = mockZones.findIndex(f => f.id === updatedZone.id);
    if (index !== -1) {
        mockZones[index] = updatedZone;
    }
    return apiCall(updatedZone);
};

export const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: `task-${Date.now()}` };
    mockTasks.push(newTask);
    return apiCall(newTask);
};

export const updateTask = (updatedTask: Task) => {
    const index = mockTasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
        mockTasks[index] = updatedTask;
    }
    return apiCall(updatedTask);
};

export const addLaborer = (laborer: Omit<Laborer, 'id'>) => {
    const newLaborer: Laborer = { ...laborer, id: `lab-${Date.now()}` };
    mockLaborers.push(newLaborer);
    return apiCall(newLaborer);
};

export const updateLaborer = (updatedLaborer: Laborer) => {
    const index = mockLaborers.findIndex(l => l.id === updatedLaborer.id);
    if (index !== -1) {
        mockLaborers[index] = updatedLaborer;
    }
    return apiCall(updatedLaborer);
};

export const getAttendanceForDate = (date: string) => {
    const attendanceForDate = mockAttendance.filter(a => a.date === date);
    const result = mockLaborers.map(laborer => {
        const record = attendanceForDate.find(a => a.laborerId === laborer.id);
        return {
            laborerId: laborer.id,
            name: laborer.basicInfo.fullName,
            status: record ? record.status : 'Absent',
        };
    });
    return apiCall(result);
};

export const getAttendanceForDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const records = mockAttendance.filter(a => {
        const recordDate = new Date(a.date);
        return recordDate >= start && recordDate <= end;
    });
    return apiCall(records);
};


export const updateAttendance = (laborerId: string, date: string, status: AttendanceRecord['status']) => {
    let record = mockAttendance.find(a => a.laborerId === laborerId && a.date === date);
    if (record) {
        if(status === 'Absent') {
            mockAttendance = mockAttendance.filter(a => a.id !== record!.id);
        } else {
             record.status = status;
        }
    } else if (status !== 'Absent') {
        record = { id: `att-${Date.now()}`, laborerId, date, status };
        mockAttendance.push(record);
    }
    return apiCall(record);
};

export const addLaborPayment = (payment: Omit<FinanceEntry, 'id' | 'type' | 'category'>) => {
    const newPayment: FinanceEntry = { 
        ...payment, 
        id: `fin-${Date.now()}`,
        type: 'Expense',
        category: 'Labor Payment'
    };
    mockFinance.push(newPayment);
    return apiCall(newPayment);
};

export const addPurchase = (purchase: Omit<PurchaseRecord, 'id' | 'financeEntryId'>) => {
    const financeEntryId = `fin-${Date.now()}`;
    const newPurchase: PurchaseRecord = {
        ...purchase,
        id: `pur-${Date.now()}`,
        financeEntryId,
    };
    mockPurchases.push(newPurchase);

    const newFinanceEntry: FinanceEntry = {
        id: financeEntryId,
        date: purchase.date,
        type: 'Expense',
        category: `${purchase.itemName} Purchase`,
        amount: purchase.totalCost,
        notes: `Purchased ${purchase.quantity} ${purchase.unit} from ${purchase.supplier}`,
        sourceId: newPurchase.id,
        paymentMethod: purchase.paymentMethod,
    };
    mockFinance.push(newFinanceEntry);
    
    // Update inventory (simple add for now)
    const inventoryItem = mockInventory.find(i => i.name.toLowerCase().includes(purchase.itemName.split(' ')[0].toLowerCase()));
    if(inventoryItem) {
        inventoryItem.quantity += purchase.quantity;
    }

    return apiCall({newPurchase, newFinanceEntry});
};

export const addSale = (sale: Omit<SalesRecord, 'id' | 'financeEntryId'>) => {
    const financeEntryId = `fin-${Date.now()}`;
    const newSale: SalesRecord = {
        ...sale,
        id: `sale-${Date.now()}`,
        financeEntryId,
    };
    mockSales.push(newSale);

    const newFinanceEntry: FinanceEntry = {
        id: financeEntryId,
        date: sale.date,
        type: 'Income',
        category: 'Crop Sale',
        amount: sale.totalRevenue,
        notes: `Sold ${sale.quantity} ${sale.unit} of ${sale.cropName} to ${sale.buyer}`,
        sourceId: newSale.id,
        paymentMethod: sale.paymentMethod,
    };
    mockFinance.push(newFinanceEntry);
    
    return apiCall({newSale, newFinanceEntry});
};

export const getControlDevices = () => apiCall(mockControlDevices);

export const updateDeviceStatus = (deviceId: string, status: 'On' | 'Off') => {
    const device = mockControlDevices.find(d => d.id === deviceId);
    if (device && device.connectionType === 'Cloud Connected') {
        device.status = status;
        device.lastSeen = new Date().toISOString();
        return apiCall(device);
    }
    return Promise.reject(new Error("Device not found or not controllable"));
};

export const addDevice = (deviceData: Omit<ControlDevice, 'id' | 'status' | 'lastSeen'>) => {
    const newDevice: ControlDevice = {
        ...deviceData,
        id: `dev-${Date.now()}`,
        status: 'Off',
        lastSeen: new Date().toISOString(),
    };
    mockControlDevices.push(newDevice);
    return apiCall(newDevice);
};

export const updateDevice = (updatedDevice: Omit<ControlDevice, 'status' | 'lastSeen'>) => {
    const index = mockControlDevices.findIndex(d => d.id === updatedDevice.id);
    if (index !== -1) {
        mockControlDevices[index] = { ...mockControlDevices[index], ...updatedDevice };
        return apiCall(mockControlDevices[index]);
    }
     return Promise.reject(new Error("Device not found"));
};

export const getFiles = () => apiCall(mockFiles);

export const addFile = (fileData: Omit<ManagedFile, 'id'>) => {
    const newFile: ManagedFile = {
        ...fileData,
        id: `file-${Date.now()}`
    };
    mockFiles.unshift(newFile);
    return apiCall(newFile);
};

export const getUserProfile = () => apiCall(mockUserProfile);

export const updateUserProfile = (updatedProfile: Partial<UserProfile>) => {
    mockUserProfile = { ...mockUserProfile, ...updatedProfile };
    return apiCall(mockUserProfile);
};

export const getStockAdjustments = () => apiCall(mockStockAdjustments);

export const addStockAdjustment = (adjustment: Omit<StockAdjustment, 'id'| 'itemName'>) => {
    const item = mockInventory.find(i => i.id === adjustment.itemId);
    if (!item) {
        return Promise.reject(new Error("Inventory item not found"));
    }
    
    const newAdjustment: StockAdjustment = { 
        ...adjustment, 
        id: `adj-${Date.now()}`,
        itemName: item.name
    };
    mockStockAdjustments.unshift(newAdjustment);

    // Update inventory quantity
    item.quantity += adjustment.quantityChange;

    return apiCall(newAdjustment);
};

export const getAnimals = () => apiCall(mockAnimals);
export const getMaternityRecords = () => apiCall(mockMaternityRecords);
export const getMachines = () => apiCall(mockMachines);

export const addAnimal = (animal: Omit<Animal, 'id'>) => {
    const newAnimal: Animal = { ...animal, id: `animal-${Date.now()}` };
    mockAnimals.push(newAnimal);
    return apiCall(newAnimal);
};

export const updateAnimal = (updatedAnimal: Animal) => {
    const index = mockAnimals.findIndex(a => a.id === updatedAnimal.id);
    if (index !== -1) {
        mockAnimals[index] = updatedAnimal;
    }
    return apiCall(updatedAnimal);
};

export const addMaternityRecord = (record: Omit<MaternityRecord, 'id' | 'animalTagId'>) => {
    const animal = mockAnimals.find(a => a.id === record.animalId);
    if (!animal) return Promise.reject(new Error("Animal not found"));
    const newRecord: MaternityRecord = { ...record, id: `mat-${Date.now()}`, animalTagId: animal.tagId };
    mockMaternityRecords.unshift(newRecord);
    return apiCall(newRecord);
};

export const updateMaternityRecord = (updatedRecord: MaternityRecord) => {
    const index = mockMaternityRecords.findIndex(r => r.id === updatedRecord.id);
    if (index !== -1) {
        mockMaternityRecords[index] = updatedRecord;
    }
    return apiCall(updatedRecord);
};

export const addMachine = (machine: Omit<Machine, 'id'>) => {
    const newMachine: Machine = { ...machine, id: `mach-${Date.now()}` };
    mockMachines.push(newMachine);
    return apiCall(newMachine);
};

export const updateMachine = (updatedMachine: Machine) => {
    const index = mockMachines.findIndex(m => m.id === updatedMachine.id);
    if (index !== -1) {
        mockMachines[index] = updatedMachine;
    }
    return apiCall(updatedMachine);
};

export const getWaterSources = () => apiCall(mockWaterSources);
export const getWaterUsageRecords = () => apiCall(mockWaterUsageRecords);

export const addWaterSource = (source: Omit<WaterSource, 'id'>) => {
    const newSource: WaterSource = { ...source, id: `ws-${Date.now()}` };
    mockWaterSources.push(newSource);
    return apiCall(newSource);
};

export const updateWaterSource = (updatedSource: WaterSource) => {
    const index = mockWaterSources.findIndex(s => s.id === updatedSource.id);
    if (index !== -1) {
        mockWaterSources[index] = updatedSource;
    }
    return apiCall(updatedSource);
};

export const addWaterUsageRecord = (record: Omit<WaterUsageRecord, 'id' | 'sourceName'>) => {
    const source = mockWaterSources.find(s => s.id === record.sourceId);
    if (!source) {
        return Promise.reject(new Error("Water source not found"));
    }

    const newRecord: WaterUsageRecord = { 
        ...record, 
        id: `wu-${Date.now()}`,
        sourceName: source.name
    };
    mockWaterUsageRecords.unshift(newRecord);

    // Update source level
    source.currentLevel -= record.amount;
    if(source.currentLevel < 0) source.currentLevel = 0; // Prevent negative levels

    return apiCall(newRecord);
};

export const getWaterQualityBySourceId = (sourceId: string) => apiCall(mockWaterQualityRecords.filter(wq => wq.sourceId === sourceId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

export const addWaterQualityRecord = (record: Omit<WaterQualityRecord, 'id'>) => {
    const newRecord: WaterQualityRecord = { ...record, id: `wq-${Date.now()}` };
    mockWaterQualityRecords.unshift(newRecord);
    
    const source = mockWaterSources.find(s => s.id === record.sourceId);
    if (source) {
        source.latestQuality = {
            date: newRecord.date,
            ph: newRecord.ph,
            turbidity: newRecord.turbidity,
            dissolvedOxygen: newRecord.dissolvedOxygen
        };
    }
    return apiCall(newRecord);
};

export const getMaterialUsageRecords = () => apiCall(mockMaterialUsageRecords);

export const addMaterialUsageRecord = (record: Omit<MaterialUsageRecord, 'id' | 'itemName' | 'unit' | 'loggedBy'>) => {
    const item = mockInventory.find(i => i.id === record.itemId);
    if (!item) {
        return Promise.reject(new Error("Inventory item not found"));
    }

    const newRecord: MaterialUsageRecord = {
        ...record,
        id: `use-${Date.now()}`,
        itemName: item.name,
        unit: item.unit,
        loggedBy: 'John Farmer' // Mock user
    };
    mockMaterialUsageRecords.unshift(newRecord);

    // DECREMENT INVENTORY
    item.quantity -= record.quantityUsed;
    
    return apiCall(newRecord);
};

// NEW BEEKEEPING & AQUACULTURE API CALLS
export const getApiaries = () => apiCall(mockApiaries);
export const getHives = () => apiCall(mockHives);
export const getHiveInspectionsByHiveId = (hiveId: string) => apiCall(mockHiveInspections.filter(i => i.hiveId === hiveId));
export const getFishPonds = () => apiCall(mockFishPonds);
export const getFishBatches = () => apiCall(mockFishBatches);

export const getBeekeepingSummary = (): Promise<BeekeepingSummary> => {
    const healthy = mockHives.filter(h => h.status === 'Healthy').length;
    const atRisk = mockHives.length - healthy;
    return apiCall({
        totalHives: mockHives.length,
        honeyProductionYTD: 450, // mock value
        hivesHealthy: healthy,
        hivesAtRisk: atRisk,
    });
};

export const getAquacultureSummary = (): Promise<AquacultureSummary> => {
    const totalBiomass = mockFishBatches.reduce((acc, batch) => acc + (batch.quantity * batch.averageWeight / 1000), 0);
    const pondsWithAlerts = mockFishPonds.filter(p => p.ph < 6.5 || p.ph > 8.5 || p.dissolvedOxygen < 5).length;
    return apiCall({
        totalPonds: mockFishPonds.length,
        totalFishBiomass: totalBiomass,
        pondsWithAlerts: pondsWithAlerts,
    });
};

export const getCEASystems = () => apiCall(mockCEASystems);
export const getCEASummary = (): Promise<CEASummary> => {
    const systemsWithAlerts = mockCEASystems.filter(sys => sys.nutrientSolution.ph > 6.5 || sys.hvac.temperature > 25).length;
    return apiCall({
        activeSystems: mockCEASystems.length,
        systemsWithAlerts: systemsWithAlerts,
        powerConsumptionToday: 125.5, // Mock value
    });
};

export const getDashboardSummary = (): Promise<DashboardSummary> => {
    const summary = {
        alerts: mockProactiveAlerts,
        yieldForecasts: mockYieldForecasts,
        financialForecasts: mockFinancialForecasts,
        beekeeping: {
            totalHives: mockHives.length,
            honeyProductionYTD: 450,
            hivesHealthy: mockHives.filter(h => h.status === 'Healthy').length,
            hivesAtRisk: mockHives.filter(h => h.status !== 'Healthy').length,
        },
        aquaculture: {
            totalPonds: mockFishPonds.length,
            totalFishBiomass: mockFishBatches.reduce((acc, batch) => acc + (batch.quantity * batch.averageWeight / 1000), 0),
            pondsWithAlerts: mockFishPonds.filter(p => p.ph < 6.5 || p.ph > 8.5 || p.dissolvedOxygen < 5).length,
        },
        cea: {
            activeSystems: mockCEASystems.length,
            systemsWithAlerts: mockCEASystems.filter(sys => sys.nutrientSolution.ph > 6.5 || sys.hvac.temperature > 25).length,
            powerConsumptionToday: 125.5,
        }
    };
    return apiCall(summary);
};

// ADVANCED FUNCTION API CALLS
export const getProactiveAlerts = () => apiCall(mockProactiveAlerts);
export const getYieldForecasts = () => apiCall(mockYieldForecasts);
export const getFinancialForecasts = () => apiCall(mockFinancialForecasts);
export const getAutomationRules = () => apiCall(mockAutomationRules);
export const updateAutomationRule = (updatedRule: AutomationRule) => {
    const index = mockAutomationRules.findIndex(r => r.id === updatedRule.id);
    if (index !== -1) {
        mockAutomationRules[index] = updatedRule;
    }
    return apiCall(updatedRule);
};

export const addAutomationRule = (rule: Omit<AutomationRule, 'id'>) => {
    const newRule: AutomationRule = { ...rule, id: `rule-${Date.now()}` };
    mockAutomationRules.push(newRule);
    return apiCall(newRule);
};

export const getCropRotationPlans = (farmId: string) => apiCall(mockCropRotationPlans);

export const getRobots = () => apiCall(mockRobots);

export const addRobot = (robot: Omit<Robot, 'id' | 'status' | 'batteryLevel' | 'activeMission'>) => {
    const newRobot: Robot = {
        ...robot,
        id: `robot-${Date.now()}`,
        status: 'Idle',
        batteryLevel: 100,
    };
    mockRobots.push(newRobot);
    return apiCall(newRobot);
};

export const startRobotMission = (robotId: string, missionType: 'Scouting' | 'Weeding' | 'Harvesting' | 'Spraying') => {
    const robot = mockRobots.find(r => r.id === robotId);
    if (robot && robot.status === 'Idle' && robot.batteryLevel > 20) {
        robot.status = 'Working';
        robot.activeMission = { type: missionType, progress: 0 };
        // Simulate mission progress
        const intervalId = setInterval(() => {
            const currentRobot = mockRobots.find(r => r.id === robotId);
            if (currentRobot && currentRobot.status === 'Working' && currentRobot.activeMission) {
                currentRobot.activeMission.progress += 5;
                currentRobot.batteryLevel -= 2;
                if (currentRobot.activeMission.progress >= 100 || currentRobot.batteryLevel <= 10) {
                    currentRobot.status = 'Idle';
                    currentRobot.activeMission = undefined;
                    clearInterval(intervalId);
                }
            } else {
                clearInterval(intervalId);
            }
        }, 5000);
        return apiCall(robot);
    }
    return Promise.reject(new Error("Robot is not available for a mission."));
};

export const returnRobotToBase = (robotId: string) => {
    const robot = mockRobots.find(r => r.id === robotId);
    if (robot) {
        robot.status = 'Idle';
        robot.activeMission = undefined;
        return apiCall(robot);
    }
    return Promise.reject(new Error("Robot not found."));
};

export const updateRobotSoftware = (robotId: string) => {
    const robot = mockRobots.find(r => r.id === robotId);
    if (robot && robot.updateAvailable) {
        robot.status = 'Updating';
        robot.activeMission = { type: 'Updating', progress: 0 };
        // Simulate update progress
        const intervalId = setInterval(() => {
            const currentRobot = mockRobots.find(r => r.id === robotId);
            if (currentRobot && currentRobot.status === 'Updating' && currentRobot.activeMission) {
                currentRobot.activeMission.progress += 10;
                if (currentRobot.activeMission.progress >= 100) {
                    currentRobot.status = 'Idle';
                    currentRobot.activeMission = undefined;
                    currentRobot.updateAvailable = false;
                    // Increment version
                    const versionParts = currentRobot.softwareVersion.split('.').map(Number);
                    versionParts[1] += 1;
                    versionParts[2] = 0;
                    currentRobot.softwareVersion = `v${versionParts.join('.')}`;

                    clearInterval(intervalId);
                }
            } else {
                clearInterval(intervalId);
            }
        }, 500);
        return apiCall(robot);
    }
    return Promise.reject(new Error("Robot not available for update."));
};


// TRANSACTION API CALLS
export const getLivestockTransactions = () => apiCall(mockLivestockTransactions);
export const addLivestockTransaction = (transaction: Omit<LivestockTransaction, 'id'>) => {
    const newTransaction: LivestockTransaction = { ...transaction, id: `lt-${Date.now()}`};
    mockLivestockTransactions.unshift(newTransaction);
    if(transaction.type === 'Purchase') {
        const newAnimal: Animal = {
            id: `animal-${Date.now()}`,
            farmId: 'farm-1',
            tagId: transaction.tagId,
            species: transaction.species,
            breed: transaction.breed,
            status: 'Active',
            location: 'Reception Pen',
        };
        mockAnimals.push(newAnimal);
    } else { // Sale
        const soldAnimal = mockAnimals.find(a => a.tagId === transaction.tagId);
        if (soldAnimal) {
            soldAnimal.status = 'Sold';
        }
    }
    return apiCall(newTransaction);
};

export const getAquacultureTransactions = () => apiCall(mockAquacultureTransactions);
export const addAquacultureTransaction = (transaction: Omit<AquacultureTransaction, 'id'>) => {
    const newTransaction: AquacultureTransaction = { ...transaction, id: `at-${Date.now()}`};
    mockAquacultureTransactions.unshift(newTransaction);
    if (transaction.type === 'Purchase') {
        let batch = mockFishBatches.find(b => b.pondId === transaction.pondId && b.species === transaction.species);
        if (batch) {
            const totalWeightOld = batch.quantity * batch.averageWeight;
            const totalWeightNew = transaction.quantity * transaction.averageWeight;
            const newTotalQuantity = batch.quantity + transaction.quantity;
            batch.averageWeight = Math.round((totalWeightOld + totalWeightNew) / newTotalQuantity);
            batch.quantity = newTotalQuantity;
        } else {
            const newBatch: FishBatch = {
                id: `batch-${Date.now()}`,
                pondId: transaction.pondId,
                species: transaction.species,
                stockDate: transaction.date.split('T')[0],
                quantity: transaction.quantity,
                averageWeight: transaction.averageWeight,
            };
            mockFishBatches.push(newBatch);
        }
    } else { // Sale
        let batch = mockFishBatches.find(b => b.pondId === transaction.pondId && b.species === transaction.species);
        if (batch) {
            batch.quantity -= transaction.quantity;
            if (batch.quantity < 0) batch.quantity = 0;
        }
    }
    return apiCall(newTransaction);
};

// DATA MANAGEMENT API
export const getDataForCleanup = (dataType: DataTypeForCleanup, startDate: string, endDate: string) => {
    let data: any[] = [];

    if (dataType === 'Inactive Laborers') {
        data = mockLaborers.filter(l => l.status === 'Inactive');
        return apiCall(data);
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999); // Inclusive end date

    switch (dataType) {
        case 'Completed Tasks':
            data = mockTasks.filter(t => {
                if (t.status !== 'Completed') return false;
                const taskDate = new Date(t.dueDate);
                return taskDate >= startDateObj && taskDate <= endDateObj;
            });
            break;
        case 'Old Financial Entries':
            data = mockFinance.filter(f => {
                const entryDate = new Date(f.date);
                return entryDate >= startDateObj && entryDate <= endDateObj;
            });
            break;
    }
    return apiCall(data);
};

export const moveItemsToRecycleBin = (dataType: DataTypeForCleanup, itemIds: string[]) => {
    let sourceArray: any[] = [];

    switch (dataType) {
        case 'Completed Tasks':
            sourceArray = mockTasks;
            break;
        case 'Inactive Laborers':
            sourceArray = mockLaborers;
            break;
        case 'Old Financial Entries':
            sourceArray = mockFinance;
            break;
    }

    itemIds.forEach(id => {
        const index = sourceArray.findIndex(item => item.id === id);
        if (index > -1) {
            const [item] = sourceArray.splice(index, 1);
            mockRecycleBin.unshift({
                id: `rec-${Date.now()}-${Math.random()}`,
                type: dataType,
                data: item,
                deletedAt: new Date().toISOString(),
            });
        }
    });

    return apiCall({ success: true, moved: itemIds.length });
};

export const getRecycleBinItems = () => apiCall(mockRecycleBin);

export const restoreRecycleBinItem = (recycleId: string) => {
    const index = mockRecycleBin.findIndex(item => item.id === recycleId);
    if (index > -1) {
        const [recycledItem] = mockRecycleBin.splice(index, 1);
        switch (recycledItem.type) {
            case 'Completed Tasks':
                mockTasks.push(recycledItem.data);
                break;
            case 'Inactive Laborers':
                mockLaborers.push(recycledItem.data);
                break;
            case 'Old Financial Entries':
                mockFinance.push(recycledItem.data);
                break;
        }
    }
    return apiCall({ success: true });
};

export const deleteRecycleBinItemPermanently = (recycleId: string) => {
    const index = mockRecycleBin.findIndex(item => item.id === recycleId);
    if (index > -1) {
        mockRecycleBin.splice(index, 1);
    }
    return apiCall({ success: true });
};