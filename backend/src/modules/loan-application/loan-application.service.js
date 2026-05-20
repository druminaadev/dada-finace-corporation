const prisma = require('../../config/database');
const AppError = require('../../utils/appError');
const EMICalculator = require('../../utils/emiCalculator');
const crypto = require('crypto');

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function maskPhone(phone) {
  return phone.replace(/(\d{2})\d{6}(\d{2})/, '$1XXXXXX$2');
}

// Simulated Aadhaar data — in production this calls UIDAI API
function mockAadhaarData(aadhaar) {
  const mockDb = {
    '123456789012': { name: 'Ramesh Patel', dob: '1985-06-15', gender: 'Male', phone: '9876501001', address: '45 Market Road, Ahmedabad, Gujarat', photoUrl: null },
    '234567890123': { name: 'Priya Shah', dob: '1990-11-22', gender: 'Female', phone: '9876502001', address: 'City School Road, Surat, Gujarat', photoUrl: null },
  };
  return mockDb[aadhaar] || {
    name: 'Test Customer',
    dob: '1990-01-01',
    gender: 'Male',
    phone: '9999999999',
    address: 'Test Address, Test City',
    photoUrl: null,
  };
}

function generateLoanNo() {
  const ts = Date.now().toString().slice(-6);
  const rand = Math.floor(100 + Math.random() * 900);
  return `LN${ts}${rand}`;
}

function generateAppNo() {
  const ts = Date.now().toString().slice(-5);
  return `APP${ts}`;
}

// ─── OTP Stage ──────────────────────────────────────────────────────────────

async function sendOtp(aadhaar) {
  if (!/^\d{12}$/.test(aadhaar)) {
    throw new AppError('Aadhaar must be exactly 12 digits', 400);
  }

  const aadhaarData = mockAadhaarData(aadhaar);
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Invalidate previous OTPs for this Aadhaar
  await prisma.otpLog.updateMany({
    where: { aadhaar, verified: false },
    data: { expiresAt: new Date() },
  });

  await prisma.otpLog.create({
    data: { aadhaar, phone: aadhaarData.phone, otp, expiresAt },
  });

  // In production: call SMS gateway here
  console.log(`[OTP] Aadhaar: ${aadhaar} | OTP: ${otp} | Phone: ${aadhaarData.phone}`);

  return {
    maskedPhone: maskPhone(aadhaarData.phone),
    expiresInSeconds: 600,
    // DEV ONLY — remove in production
    devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
  };
}

async function verifyOtp(aadhaar, otp) {
  if (!/^\d{12}$/.test(aadhaar)) throw new AppError('Invalid Aadhaar number', 400);
  if (!/^\d{6}$/.test(otp)) throw new AppError('OTP must be 6 digits', 400);

  const log = await prisma.otpLog.findFirst({
    where: { aadhaar, verified: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!log) throw new AppError('No OTP found. Please request a new OTP.', 400);
  if (new Date() > log.expiresAt) throw new AppError('OTP has expired. Please request a new one.', 400);
  if (log.attempts >= 3) throw new AppError('Too many failed attempts. Please request a new OTP.', 429);

  if (log.otp !== otp) {
    await prisma.otpLog.update({
      where: { id: log.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = 3 - (log.attempts + 1);
    throw new AppError(`Invalid OTP. ${remaining} attempt(s) remaining.`, 400);
  }

  await prisma.otpLog.update({
    where: { id: log.id },
    data: { verified: true, verifiedAt: new Date() },
  });

  const aadhaarData = mockAadhaarData(aadhaar);

  return {
    verified: true,
    aadhaarData: {
      aadhaar,
      name: aadhaarData.name,
      dob: aadhaarData.dob,
      gender: aadhaarData.gender,
      phone: aadhaarData.phone,
      address: aadhaarData.address,
      photoUrl: aadhaarData.photoUrl,
    },
  };
}

// ─── Draft Management ────────────────────────────────────────────────────────

async function createDraft(userId) {
  const draft = await prisma.loanDraft.create({
    data: { createdBy: userId, currentStage: 1, status: 'DRAFT' },
  });
  return draft;
}

async function getDraft(draftId, userId) {
  const draft = await prisma.loanDraft.findFirst({
    where: { id: draftId, createdBy: userId },
    include: { customer: true, loan: true },
  });
  if (!draft) throw new AppError('Draft not found', 404);
  return draft;
}

async function getAllDrafts(userId) {
  return prisma.loanDraft.findMany({
    where: { createdBy: userId },
    orderBy: { updatedAt: 'desc' },
    include: { customer: { select: { name: true, phone: true, appNo: true } } },
  });
}

// ─── Stage Saves ─────────────────────────────────────────────────────────────

async function saveStage(draftId, userId, stage, data) {
  const draft = await getDraft(draftId, userId);

  // Enforce sequential stage access
  if (stage > 1 && !draft[`stage${stage - 1}Done`]) {
    throw new AppError(`Stage ${stage - 1} must be completed before saving Stage ${stage}`, 400);
  }

  const stageKey = `stage${stage}Data`;
  const stageDoneKey = `stage${stage}Done`;

  const updateData = {
    [stageKey]: data,
    [stageDoneKey]: true,
    currentStage: Math.max(draft.currentStage, stage),
    updatedAt: new Date(),
  };

  // Stage 1: store verified Aadhaar data
  if (stage === 1) {
    if (!data.aadhaarVerified) throw new AppError('Aadhaar OTP must be verified before saving Stage 1', 400);
  }

  // Stage 2: calculate EMI and store
  if (stage === 2) {
    const { amount, interestRate, tenure, interestType } = data.loanDetails || {};
    if (amount && interestRate && tenure) {
      const emiAmount = interestType === 'REDUCING'
        ? EMICalculator.calculateEMI(amount, interestRate, tenure)
        : Math.round((amount + (amount * interestRate / 100 * tenure / 12)) / tenure);
      data.loanDetails.emiAmount = emiAmount;
      data.loanDetails.totalAmount = emiAmount * tenure;
      updateData[stageKey] = data;
    }
  }

  // Stage 3: validate at least 1 nominee and 1 guarantor
  if (stage === 3) {
    const nominees = data.nominees?.filter(n => n.name && n.phone) || [];
    const guarantors = data.guarantors?.filter(g => g.name && g.phone) || [];
    if (nominees.length < 1) throw new AppError('At least 1 nominee is required', 400);
    if (guarantors.length < 1) throw new AppError('At least 1 guarantor is required', 400);
  }

  const updated = await prisma.loanDraft.update({
    where: { id: draftId },
    data: updateData,
  });

  return updated;
}

// ─── Final Submission ────────────────────────────────────────────────────────

async function submitDraft(draftId, userId) {
  const draft = await getDraft(draftId, userId);

  if (!draft.stage1Done) throw new AppError('Stage 1 (Aadhaar Verification) is incomplete', 400);
  if (!draft.stage2Done) throw new AppError('Stage 2 (Customer & Loan Details) is incomplete', 400);
  if (!draft.stage3Done) throw new AppError('Stage 3 (Guarantor & Nominee) is incomplete', 400);

  const s1 = draft.stage1Data;
  const s2 = draft.stage2Data;
  const s3 = draft.stage3Data;
  const s4 = draft.stage4Data || {};

  const customerDetails = s2.customerDetails || {};
  const loanDetails = s2.loanDetails || {};

  return prisma.$transaction(async (tx) => {
    // 1. Upsert customer
    let customer = await tx.customer.findFirst({
      where: { aadhaar: s1.aadhaarData?.aadhaar },
    });

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          appNo: generateAppNo(),
          name: customerDetails.name || s1.aadhaarData?.name || 'Unknown',
          phone: customerDetails.phone || s1.aadhaarData?.phone || '',
          altPhone: customerDetails.altPhone,
          email: customerDetails.email,
          aadhaar: s1.aadhaarData?.aadhaar,
          pan: customerDetails.pan,
          dob: customerDetails.dob ? new Date(customerDetails.dob) : null,
          age: customerDetails.age ? parseInt(customerDetails.age) : null,
          gender: customerDetails.gender || s1.aadhaarData?.gender,
          address: customerDetails.address || s1.aadhaarData?.address,
          occupation: customerDetails.occupation,
          income: customerDetails.income ? parseFloat(customerDetails.income) : null,
          businessInfo: customerDetails.businessInfo,
          maritalStatus: customerDetails.maritalStatus,
          bloodGroup: customerDetails.bloodGroup,
          fatherName: customerDetails.fatherName,
          motherName: customerDetails.motherName,
          bankAccountNo: customerDetails.bankAccountNo,
          bankHolderName: customerDetails.bankHolderName,
          bankName: customerDetails.bankName,
          bankBranch: customerDetails.bankBranch,
          bankIfsc: customerDetails.bankIfsc,
          createdBy: userId,
        },
      });
    } else {
      // Update existing customer with any new info
      customer = await tx.customer.update({
        where: { id: customer.id },
        data: {
          email: customerDetails.email || customer.email,
          occupation: customerDetails.occupation || customer.occupation,
          income: customerDetails.income ? parseFloat(customerDetails.income) : customer.income,
          pan: customerDetails.pan || customer.pan,
          bankAccountNo: customerDetails.bankAccountNo || customer.bankAccountNo,
          bankHolderName: customerDetails.bankHolderName || customer.bankHolderName,
          bankName: customerDetails.bankName || customer.bankName,
          bankBranch: customerDetails.bankBranch || customer.bankBranch,
          bankIfsc: customerDetails.bankIfsc || customer.bankIfsc,
        },
      });
    }

    // 2. Create loan
    const tenure = parseInt(loanDetails.tenure) || 12;
    const amount = parseFloat(loanDetails.amount) || 0;
    const interestRate = parseFloat(loanDetails.interestRate) || 0;
    const interestType = loanDetails.interestType || 'FLAT';

    const emiAmount = interestType === 'REDUCING'
      ? EMICalculator.calculateEMI(amount, interestRate, tenure)
      : Math.round((amount + (amount * interestRate / 100 * tenure / 12)) / tenure);

    const loan = await tx.loan.create({
      data: {
        loanNo: generateLoanNo(),
        customerId: customer.id,
        loanCategory: loanDetails.loanCategory || 'PERSONAL',
        amount,
        interestRate,
        interestType,
        tenure,
        emiAmount,
        totalAmount: emiAmount * tenure,
        processingFee: parseFloat(loanDetails.processingFee) || 0,
        purpose: loanDetails.purpose,
        notes: loanDetails.notes,
        securityType: loanDetails.securityType,
        securityData: loanDetails.securityData || null,
        status: 'PENDING_VERIFICATION',
        createdBy: userId,
      },
    });

    // 3. Create EMI schedule
    const startDate = loanDetails.emiStartDate ? new Date(loanDetails.emiStartDate) : new Date();
    const schedule = EMICalculator.generateSchedule(amount, interestRate, tenure, startDate);
    await tx.eMISchedule.createMany({
      data: schedule.map(e => ({
        loanId: loan.id,
        emiNumber: e.emiNumber,
        dueDate: e.dueDate,
        amount: e.amount,
        principal: e.principal,
        interest: e.interest,
      })),
    });

    // 4. Create nominees
    const nominees = (s3.nominees || []).filter(n => n.name && n.phone);
    for (let i = 0; i < nominees.length; i++) {
      const n = nominees[i];
      await tx.nominee.create({
        data: {
          loanId: loan.id,
          customerId: customer.id,
          slot: i + 1,
          name: n.name,
          phone: n.phone,
          relationship: n.relationship,
          address: n.address,
          aadhaar: n.aadhaar,
          occupation: n.occupation,
          income: n.income ? parseFloat(n.income) : null,
          dob: n.dob ? new Date(n.dob) : null,
        },
      });
    }

    // 5. Create guarantors
    const guarantors = (s3.guarantors || []).filter(g => g.name && g.phone);
    for (let i = 0; i < guarantors.length; i++) {
      const g = guarantors[i];
      await tx.guarantor.create({
        data: {
          loanId: loan.id,
          customerId: customer.id,
          slot: i + 1,
          name: g.name,
          phone: g.phone,
          email: g.email,
          address: g.address,
          relationship: g.relationship,
          aadhaar: g.aadhaar,
          pan: g.pan,
          occupation: g.occupation,
          income: g.income ? parseFloat(g.income) : null,
        },
      });
    }

    // 6. Initial status history entry
    await tx.loanStatusHistory.create({
      data: {
        loanId: loan.id,
        status: 'PENDING_VERIFICATION',
        note: 'Loan application submitted',
        changedBy: userId,
      },
    });

    // 7. Mark draft as submitted
    await tx.loanDraft.update({
      where: { id: draftId },
      data: {
        status: 'SUBMITTED',
        customerId: customer.id,
        loanId: loan.id,
        submittedAt: new Date(),
        currentStage: 5,
      },
    });

    return {
      loan: await tx.loan.findUnique({
        where: { id: loan.id },
        include: {
          customer: true,
          emiSchedules: { orderBy: { emiNumber: 'asc' } },
          nominees: true,
          guarantors: true,
        },
      }),
      customer,
    };
  });
}

// ─── Status Management ───────────────────────────────────────────────────────

async function updateLoanStatus(loanId, userId, status, note) {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) throw new AppError('Loan not found', 404);

  const validTransitions = {
    PENDING_VERIFICATION: ['UNDER_REVIEW', 'REJECTED'],
    UNDER_REVIEW: ['APPROVED', 'REJECTED'],
    APPROVED: ['ACTIVE', 'REJECTED'],
    ACTIVE: ['CLOSED', 'DEFAULTED'],
  };

  const allowed = validTransitions[loan.status] || [];
  if (!allowed.includes(status)) {
    throw new AppError(`Cannot transition from ${loan.status} to ${status}`, 400);
  }

  const updateData = { status };
  if (status === 'APPROVED') { updateData.approvedBy = userId; updateData.approvedAt = new Date(); }
  if (status === 'ACTIVE') { updateData.disbursedAt = new Date(); }
  if (status === 'REJECTED') { updateData.rejectionReason = note; }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.loan.update({ where: { id: loanId }, data: updateData });
    await tx.loanStatusHistory.create({
      data: { loanId, status, note: note || null, changedBy: userId },
    });
    return updated;
  });
}

module.exports = {
  sendOtp,
  verifyOtp,
  createDraft,
  getDraft,
  getAllDrafts,
  saveStage,
  submitDraft,
  updateLoanStatus,
};
