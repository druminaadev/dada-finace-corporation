export const SEED_STATES = [
  { id: 1, name: 'Gujarat' }, { id: 2, name: 'Maharashtra' },
  { id: 3, name: 'Rajasthan' }, { id: 4, name: 'Delhi' },
  { id: 5, name: 'Karnataka' },
]

export const SEED_CITIES = [
  { id: 1, stateId: 1, name: 'Ahmedabad' }, { id: 2, stateId: 1, name: 'Surat' },
  { id: 3, stateId: 1, name: 'Vadodara' }, { id: 4, stateId: 2, name: 'Mumbai' },
  { id: 5, stateId: 2, name: 'Pune' }, { id: 6, stateId: 3, name: 'Jaipur' },
  { id: 7, stateId: 4, name: 'New Delhi' }, { id: 8, stateId: 5, name: 'Bengaluru' },
]

export const SEED_AREAS = [
  { id: 1, cityId: 1, name: 'Navrangpura' }, { id: 2, cityId: 1, name: 'Satellite' },
  { id: 3, cityId: 1, name: 'Bopal' }, { id: 4, cityId: 2, name: 'Adajan' },
  { id: 5, cityId: 2, name: 'Vesu' }, { id: 6, cityId: 4, name: 'Andheri' },
  { id: 7, cityId: 4, name: 'Bandra' }, { id: 8, cityId: 5, name: 'Kothrud' },
]

export const SEED_BRANCHES = [
  { id: 1, name: 'Ahmedabad Main', address: '12, CG Road, Ahmedabad' },
  { id: 2, name: 'Surat Branch', address: '45, Ring Road, Surat' },
  { id: 3, name: 'Mumbai Branch', address: '78, Andheri West, Mumbai' },
  { id: 4, name: 'Jaipur Branch', address: '23, MI Road, Jaipur' },
]

export const SEED_BANKS = [
  { id: 1, name: 'State Bank of India' }, { id: 2, name: 'HDFC Bank' },
  { id: 3, name: 'ICICI Bank' }, { id: 4, name: 'Axis Bank' },
  { id: 5, name: 'Bank of Baroda' }, { id: 6, name: 'Punjab National Bank' },
  { id: 7, name: 'Kotak Mahindra Bank' }, { id: 8, name: 'Union Bank of India' },
]

export const SEED_LOAN_TYPES = [
  { id: 1, name: 'Flat Rate', description: 'Interest on original principal throughout tenure' },
  { id: 2, name: 'Reducing Balance', description: 'Interest on outstanding principal' },
  { id: 3, name: 'Gold Loan', description: 'Loan against gold collateral' },
  { id: 4, name: 'Vehicle Loan', description: 'Loan against vehicle collateral' },
]

export const SEED_EMPLOYEES = [
  { id: 1, name: 'Jhanvi Patel', code: 'EMP001', branchId: 1, contact: '9876543210', role: 'Loan Officer', email: 'jhanvi@nexzen.com' },
  { id: 2, name: 'Ravi Sharma', code: 'EMP002', branchId: 1, contact: '9876543211', role: 'Senior Officer', email: 'ravi@nexzen.com' },
  { id: 3, name: 'Priya Mehta', code: 'EMP003', branchId: 2, contact: '9876543212', role: 'Loan Officer', email: 'priya@nexzen.com' },
  { id: 4, name: 'Amit Kumar', code: 'EMP004', branchId: 3, contact: '9876543213', role: 'Branch Manager', email: 'amit@nexzen.com' },
  { id: 5, name: 'Sunita Verma', code: 'EMP005', branchId: 2, contact: '9876543214', role: 'Loan Officer', email: 'sunita@nexzen.com' },
]

export const SEED_CUSTOMERS = [
  {
    id: 1, appNo: 'APP1001', name: 'Ramesh Patel', fatherName: 'Suresh Patel', motherName: 'Kamla Patel',
    dob: '1985-06-15', age: 39, gender: 'male', maritalStatus: 'married', bloodGroup: 'B+',
    occupation: 'Businessman', regDate: '2025-01-10', mobile: '9876501001', altMobile: '9876501002',
    email: 'ramesh.patel@email.com', aadhar: '123456789012', pan: 'ABCDE1234F',
    jobAddress: '45 Market Road, Ahmedabad', stateId: 1, cityId: 1, areaId: 1, branchId: 1, employeeId: 1,
    photoUrl: '', bank: { accountNo: '10234567890', holderName: 'Ramesh Patel', bankName: 'SBI', bankBranch: 'Navrangpura', ifsc: 'SBIN0001234', documentUrl: '' },
    nominee: { identityProof: 'Aadhar Card', identityNo: '234567890123', name: 'Sunita Patel', relation: 'Spouse', dob: '1988-03-20', age: 36, mobile: '9876501003', address: '45 Market Road, Ahmedabad', photoUrl: '', accountNo: '20234567890', holderName: 'Sunita Patel', bankName: 'HDFC Bank', bankBranch: 'Navrangpura', ifsc: 'HDFC0001234', documentUrl: '' },
    guarantor1: { slot: 1, identityProof: 'Aadhar Card', identityNo: '345678901234', name: 'Mahesh Patel', relation: 'Brother', dob: '1982-09-10', age: 42, mobile: '9876501004', address: '12 Gandhi Nagar, Ahmedabad', photoUrl: '', accountNo: '30234567890', holderName: 'Mahesh Patel', bankName: 'ICICI Bank', bankBranch: 'Satellite', ifsc: 'ICIC0001234', documentUrl: '' },
    guarantor2: null,
  },
  {
    id: 2, appNo: 'APP1002', name: 'Priya Shah', fatherName: 'Dinesh Shah', motherName: 'Rekha Shah',
    dob: '1990-11-22', age: 34, gender: 'female', maritalStatus: 'married', bloodGroup: 'A+',
    occupation: 'Teacher', regDate: '2025-01-15', mobile: '9876502001', altMobile: '',
    email: 'priya.shah@email.com', aadhar: '234567890123', pan: 'BCDEF2345G',
    jobAddress: 'City School, Surat', stateId: 1, cityId: 2, areaId: 4, branchId: 2, employeeId: 3,
    photoUrl: '', bank: { accountNo: '10345678901', holderName: 'Priya Shah', bankName: 'HDFC Bank', bankBranch: 'Adajan', ifsc: 'HDFC0002345', documentUrl: '' },
    nominee: null, guarantor1: null, guarantor2: null,
  },
  {
    id: 3, appNo: 'APP1003', name: 'Vijay Kumar', fatherName: 'Mohan Kumar', motherName: 'Lata Kumar',
    dob: '1978-04-05', age: 47, gender: 'male', maritalStatus: 'married', bloodGroup: 'O+',
    occupation: 'Farmer', regDate: '2025-02-01', mobile: '9876503001', altMobile: '9876503002',
    email: '', aadhar: '345678901234', pan: 'CDEFG3456H',
    jobAddress: 'Village Kadi, Mehsana', stateId: 1, cityId: 3, areaId: 3, branchId: 1, employeeId: 2,
    photoUrl: '', bank: { accountNo: '10456789012', holderName: 'Vijay Kumar', bankName: 'Bank of Baroda', bankBranch: 'Vadodara', ifsc: 'BARB0001234', documentUrl: '' },
    nominee: null, guarantor1: null, guarantor2: null,
  },
  {
    id: 4, appNo: 'APP1004', name: 'Anita Desai', fatherName: 'Ramesh Desai', motherName: 'Usha Desai',
    dob: '1992-08-18', age: 32, gender: 'female', maritalStatus: 'unmarried', bloodGroup: 'AB+',
    occupation: 'Software Engineer', regDate: '2025-02-10', mobile: '9876504001', altMobile: '',
    email: 'anita.desai@email.com', aadhar: '456789012345', pan: 'DEFGH4567I',
    jobAddress: 'Tech Park, Mumbai', stateId: 2, cityId: 4, areaId: 6, branchId: 3, employeeId: 4,
    photoUrl: '', bank: { accountNo: '10567890123', holderName: 'Anita Desai', bankName: 'Axis Bank', bankBranch: 'Andheri', ifsc: 'UTIB0001234', documentUrl: '' },
    nominee: null, guarantor1: null, guarantor2: null,
  },
  {
    id: 5, appNo: 'APP1005', name: 'Suresh Joshi', fatherName: 'Prakash Joshi', motherName: 'Meena Joshi',
    dob: '1975-12-30', age: 49, gender: 'male', maritalStatus: 'married', bloodGroup: 'B-',
    occupation: 'Shop Owner', regDate: '2025-03-05', mobile: '9876505001', altMobile: '9876505002',
    email: 'suresh.joshi@email.com', aadhar: '567890123456', pan: 'EFGHI5678J',
    jobAddress: 'Main Bazaar, Jaipur', stateId: 3, cityId: 6, areaId: 2, branchId: 4, employeeId: 2,
    photoUrl: '', bank: { accountNo: '10678901234', holderName: 'Suresh Joshi', bankName: 'PNB', bankBranch: 'MI Road', ifsc: 'PUNB0001234', documentUrl: '' },
    nominee: null, guarantor1: null, guarantor2: null,
  },
]

export const SEED_LOANS = [
  {
    id: 160, loanNo: 'LN160', customerId: 1, employeeId: 1, loanDate: '2025-01-15', emiStartDate: '2025-02-15',
    loanTypeId: 1, amount: 100000, installments: 12, interestRate: 12, interestAmount: 12000,
    fileCharges: 500, otherCharges: 200, intervalDays: 'Monthly', remarks: 'Regular customer',
    status: 'disbursed',
    security: { type: 'vehicle', modelName: 'Honda Activa', regNo: 'GJ01AB1234', chassisNo: 'ME4JF502XBT123456', keys: '2', rcReceived: true, fileUrls: [] },
    receiver: { mobile: '9876501001', documentUrl: '' },
  },
  {
    id: 161, loanNo: 'LN161', customerId: 2, employeeId: 3, loanDate: '2025-01-20', emiStartDate: '2025-02-20',
    loanTypeId: 3, amount: 50000, installments: 6, interestRate: 10, interestAmount: 2500,
    fileCharges: 300, otherCharges: 100, intervalDays: 'Monthly', remarks: 'Gold loan',
    status: 'approved',
    security: { type: 'gold', itemName: 'Gold Necklace', weight: 20, pieces: 1, fileUrls: [] },
    receiver: { mobile: '9876502001', documentUrl: '' },
  },
  {
    id: 162, loanNo: 'LN162', customerId: 3, employeeId: 2, loanDate: '2025-02-05', emiStartDate: '2025-03-05',
    loanTypeId: 1, amount: 75000, installments: 24, interestRate: 14, interestAmount: 17500,
    fileCharges: 400, otherCharges: 150, intervalDays: 'Monthly', remarks: 'Agricultural loan',
    status: 'pending',
    security: { type: 'vehicle', modelName: 'Bajaj Pulsar', regNo: 'GJ06CD5678', chassisNo: 'MD2A11CY9KCM12345', keys: '1', rcReceived: false, fileUrls: [] },
    receiver: { mobile: '9876503001', documentUrl: '' },
  },
  {
    id: 163, loanNo: 'LN163', customerId: 4, employeeId: 4, loanDate: '2025-02-12', emiStartDate: '2025-03-12',
    loanTypeId: 2, amount: 200000, installments: 36, interestRate: 11, interestAmount: 66000,
    fileCharges: 1000, otherCharges: 500, intervalDays: 'Monthly', remarks: 'Personal loan',
    status: 'disbursed',
    security: { type: 'gold', itemName: 'Gold Bangles', weight: 50, pieces: 4, fileUrls: [] },
    receiver: { mobile: '9876504001', documentUrl: '' },
  },
  {
    id: 164, loanNo: 'LN164', customerId: 5, employeeId: 2, loanDate: '2025-03-08', emiStartDate: '2025-04-08',
    loanTypeId: 4, amount: 150000, installments: 18, interestRate: 13, interestAmount: 29250,
    fileCharges: 750, otherCharges: 250, intervalDays: '7 Days', remarks: 'Vehicle loan',
    status: 'pending',
    security: { type: 'vehicle', modelName: 'Maruti Swift', regNo: 'RJ14EF9012', chassisNo: 'MA3FJEB1S00123456', keys: '2', rcReceived: true, fileUrls: [] },
    receiver: { mobile: '9876505001', documentUrl: '' },
  },
  {
    id: 165, loanNo: 'LN165', customerId: 1, employeeId: 1, loanDate: '2025-03-20', emiStartDate: '2025-04-20',
    loanTypeId: 1, amount: 80000, installments: 12, interestRate: 12, interestAmount: 9600,
    fileCharges: 400, otherCharges: 100, intervalDays: 'Monthly', remarks: 'Second loan',
    status: 'approved',
    security: { type: 'gold', itemName: 'Gold Ring', weight: 10, pieces: 2, fileUrls: [] },
    receiver: { mobile: '9876501001', documentUrl: '' },
  },
]
