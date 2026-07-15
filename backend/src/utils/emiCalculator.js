import Decimal from 'decimal.js';

// Configure Decimal for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Convert annual interest rate to periodic rate.
 * @param {number|string} annualRate - Annual rate as percentage (e.g. 12 for 12%)
 * @param {'monthly'|'weekly'|'fortnightly'} frequency
 * @returns {Decimal}
 */
function periodicRate(annualRate, frequency = 'monthly') {
  const annual = new Decimal(annualRate).div(100);
  switch (frequency) {
    case 'weekly':
      return annual.div(52);
    case 'fortnightly':
      return annual.div(26);
    default:
      return annual.div(12);
  }
}

/**
 * Periods per year for a given frequency.
 */
function periodsPerYear(frequency = 'monthly') {
  return { monthly: 12, weekly: 52, fortnightly: 26 }[frequency] ?? 12;
}

/**
 * Calculate reducing-balance EMI.
 * Formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 * @param {number|string} principal
 * @param {number|string} annualRate - Annual % rate
 * @param {number} tenureMonths
 * @param {'monthly'|'weekly'|'fortnightly'} frequency
 * @returns {string} EMI amount rounded to 2 decimal places
 */
export function calcReducingEMI(principal, annualRate, tenureMonths, frequency = 'monthly') {
  const P = new Decimal(principal);
  const r = periodicRate(annualRate, frequency);
  const ppy = periodsPerYear(frequency);
  // Convert tenure months to periods
  const n = new Decimal(tenureMonths).mul(ppy).div(12).toDecimalPlaces(0, Decimal.ROUND_CEIL);

  if (r.isZero()) {
    return P.div(n).toDecimalPlaces(2).toString();
  }

  const onePlusR = r.plus(1);
  const onePlusRn = onePlusR.pow(n);
  const emi = P.mul(r).mul(onePlusRn).div(onePlusRn.minus(1));
  return emi.toDecimalPlaces(2).toString();
}

/**
 * Calculate flat-rate EMI.
 * Total interest = P × r × n (years); EMI = (P + total_interest) / n_periods
 * @param {number|string} principal
 * @param {number|string} annualRate
 * @param {number} tenureMonths
 * @returns {string}
 */
export function calcFlatEMI(principal, annualRate, tenureMonths) {
  const P = new Decimal(principal);
  const totalInterest = P.mul(new Decimal(annualRate).div(100)).mul(
    new Decimal(tenureMonths).div(12)
  );
  const emi = P.plus(totalInterest).div(tenureMonths);
  return emi.toDecimalPlaces(2).toString();
}

/**
 * Generate reducing-balance EMI schedule.
 * Returns immutable schedule with principal/interest breakup and closing balance.
 * @param {object} params
 * @returns {Array<object>}
 */
export function generateReducingSchedule({
  principal,
  annualRate,
  tenureMonths,
  startDate,
  frequency = 'monthly',
}) {
  const P = new Decimal(principal);
  const r = periodicRate(annualRate, frequency);
  const ppy = periodsPerYear(frequency);
  const n = Math.ceil((tenureMonths * ppy) / 12);
  const emiStr = calcReducingEMI(principal, annualRate, tenureMonths, frequency);
  const emi = new Decimal(emiStr);

  let balance = P;
  const schedule = [];
  const start = new Date(startDate);

  for (let i = 1; i <= n; i++) {
    const interest = balance.mul(r).toDecimalPlaces(2);
    let principalPart = emi.minus(interest).toDecimalPlaces(2);

    // Last EMI: pay exact remaining balance
    if (i === n) {
      principalPart = balance.toDecimalPlaces(2);
    }

    const closingBalance = balance.minus(principalPart).toDecimalPlaces(2);
    const openingBalance = balance.toDecimalPlaces(2);

    const dueDate = new Date(start);
    if (frequency === 'monthly') {
      dueDate.setMonth(dueDate.getMonth() + i);
    } else if (frequency === 'weekly') {
      dueDate.setDate(dueDate.getDate() + i * 7);
    } else if (frequency === 'fortnightly') {
      dueDate.setDate(dueDate.getDate() + i * 14);
    }

    const actualEmi = i === n ? principalPart.plus(interest).toDecimalPlaces(2) : emi;

    schedule.push({
      emiNumber: i,
      dueDate,
      amount: actualEmi.toString(),
      principal: principalPart.toString(),
      interest: interest.toString(),
      openingBalance: openingBalance.toString(),
      closingBalance: closingBalance.isNegative() ? '0' : closingBalance.toString(),
    });

    balance = closingBalance.isNegative() ? new Decimal(0) : closingBalance;
  }

  return schedule;
}

/**
 * Generate flat-rate EMI schedule.
 * @param {object} params
 * @returns {Array<object>}
 */
export function generateFlatSchedule({ principal, annualRate, tenureMonths, startDate }) {
  const P = new Decimal(principal);
  const totalInterest = P.mul(new Decimal(annualRate).div(100)).mul(
    new Decimal(tenureMonths).div(12)
  );
  const emi = P.plus(totalInterest).div(tenureMonths).toDecimalPlaces(2);
  const interestPerEmi = totalInterest.div(tenureMonths).toDecimalPlaces(2);
  const principalPerEmi = P.div(tenureMonths).toDecimalPlaces(2);

  const schedule = [];
  const start = new Date(startDate);
  let balance = P;

  for (let i = 1; i <= tenureMonths; i++) {
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + i);

    const openingBalance = balance.toDecimalPlaces(2);
    const closingBalance = balance.minus(principalPerEmi).toDecimalPlaces(2);

    schedule.push({
      emiNumber: i,
      dueDate,
      amount: emi.toString(),
      principal: principalPerEmi.toString(),
      interest: interestPerEmi.toString(),
      openingBalance: openingBalance.toString(),
      closingBalance: closingBalance.isNegative() ? '0' : closingBalance.toString(),
    });

    balance = closingBalance.isNegative() ? new Decimal(0) : closingBalance;
  }

  return schedule;
}

/**
 * Calculate total repayable amount.
 */
export function calcTotalAmount(principal, annualRate, tenureMonths, interestType = 'REDUCING') {
  if (interestType === 'FLAT') {
    const P = new Decimal(principal);
    const totalInterest = P.mul(new Decimal(annualRate).div(100)).mul(
      new Decimal(tenureMonths).div(12)
    );
    return P.plus(totalInterest).toDecimalPlaces(2).toString();
  }
  const emi = new Decimal(calcReducingEMI(principal, annualRate, tenureMonths));
  return emi.mul(tenureMonths).toDecimalPlaces(2).toString();
}

/**
 * Calculate late fee for overdue EMI.
 * @param {string|number} emiAmount
 * @param {number} daysOverdue
 * @param {object} penaltyConfig - { type: 'FIXED'|'PERCENTAGE', value: number }
 */
export function calcLateFee(emiAmount, daysOverdue, penaltyConfig = { type: 'FIXED', value: 0 }) {
  if (daysOverdue <= 0) return '0';
  const amount = new Decimal(emiAmount);
  if (penaltyConfig.type === 'PERCENTAGE') {
    return amount.mul(new Decimal(penaltyConfig.value).div(100)).toDecimalPlaces(2).toString();
  }
  return new Decimal(penaltyConfig.value).toDecimalPlaces(2).toString();
}

/**
 * Allocate a payment across: penalty → charges → interest → principal
 * @param {string} paymentAmount
 * @param {object} outstanding - { penalty, charges, interest, principal }
 * @returns {object} allocation
 */
export function allocatePayment(paymentAmount, outstanding) {
  let remaining = new Decimal(paymentAmount);
  const alloc = { penalty: '0', charges: '0', interest: '0', principal: '0', excess: '0' };

  const fields = ['penalty', 'charges', 'interest', 'principal'];
  for (const field of fields) {
    const due = new Decimal(outstanding[field] || 0);
    if (remaining.isZero() || remaining.isNegative()) break;
    const paid = Decimal.min(remaining, due);
    alloc[field] = paid.toDecimalPlaces(2).toString();
    remaining = remaining.minus(paid);
  }

  if (remaining.isPositive()) {
    alloc.excess = remaining.toDecimalPlaces(2).toString();
  }

  return alloc;
}

/**
 * Calculate foreclosure amount.
 * @param {string} outstandingPrincipal
 * @param {string} pendingInterest
 * @param {string} foreclosureCharge - percentage
 */
export function calcForeclosure(outstandingPrincipal, pendingInterest, foreclosureCharge = '0') {
  const principal = new Decimal(outstandingPrincipal);
  const interest = new Decimal(pendingInterest);
  const charge = principal.mul(new Decimal(foreclosureCharge).div(100));
  return {
    principal: principal.toDecimalPlaces(2).toString(),
    interest: interest.toDecimalPlaces(2).toString(),
    foreclosureCharge: charge.toDecimalPlaces(2).toString(),
    total: principal.plus(interest).plus(charge).toDecimalPlaces(2).toString(),
  };
}
