class EMICalculator {
  static calculateEMI(principal, annualRate, tenureMonths) {
    const monthlyRate = annualRate / 12 / 100;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi * 100) / 100;
  }

  static generateSchedule(loanAmount, interestRate, tenure, startDate) {
    const emiAmount = this.calculateEMI(loanAmount, interestRate, tenure);
    const monthlyRate = interestRate / 12 / 100;
    let balance = loanAmount;
    const schedule = [];

    for (let i = 1; i <= tenure; i++) {
      const interest = Math.round(balance * monthlyRate * 100) / 100;
      const principal = Math.round((emiAmount - interest) * 100) / 100;
      balance = Math.round((balance - principal) * 100) / 100;

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        emiNumber: i,
        dueDate,
        amount: emiAmount,
        principal,
        interest,
        balance: balance < 0 ? 0 : balance,
      });
    }

    return schedule;
  }

  static calculateTotalAmount(principal, interestRate, tenure) {
    const emi = this.calculateEMI(principal, interestRate, tenure);
    return Math.round(emi * tenure * 100) / 100;
  }
}

module.exports = EMICalculator;
