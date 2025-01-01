import { Currency, convertCurrency, EXCHANGE_RATES } from './utils';

// Types
type TaxBracket = {
  min: number;
  max: number | null;
  rate: number;
};

type TaxSystem = {
  basicPersonalAmount: number;
  brackets: TaxBracket[];
};

// Tax Systems Data
const BCProvincialTax: TaxSystem = {
  basicPersonalAmount: 12580,
  brackets: [
    { min: 0, max: 47937, rate: 0.0506 },
    { min: 47937.01, max: 95875, rate: 0.0770 },
    { min: 95875.01, max: 110076, rate: 0.1050 },
    { min: 110076.01, max: 133664, rate: 0.1229 },
    { min: 133664.01, max: 181232, rate: 0.1470 },
    { min: 181232.01, max: 252752, rate: 0.1680 },
    { min: 252752.01, max: null, rate: 0.2050 },
  ],
};

const CanadaFederalTax: TaxSystem = {
  basicPersonalAmount: 15000,
  brackets: [
    { min: 0, max: 55867, rate: 0.1500 },
    { min: 55867.01, max: 111733, rate: 0.2050 },
    { min: 111733.01, max: 173205, rate: 0.2600 },
    { min: 173205.01, max: 246752, rate: 0.2900 },
    { min: 246752.01, max: null, rate: 0.3300 },
  ],
};

const USFederalTax: TaxSystem = {
  basicPersonalAmount: 14600,
  brackets: [
    { min: 0, max: 11600, rate: 0.1000 },
    { min: 11600.01, max: 47150, rate: 0.1200 },
    { min: 47150.01, max: 100525, rate: 0.2200 },
    { min: 100525.01, max: 191950, rate: 0.2400 },
    { min: 191950.01, max: 243725, rate: 0.3200 },
    { min: 243725.01, max: 609350, rate: 0.3500 },
    { min: 609350.01, max: null, rate: 0.3700 },
  ],
};

// Helper function to calculate tax for a single bracket
const calculateBracketTax = (income: number, bracket: TaxBracket): number => {
  const min = bracket.min;
  const max = bracket.max ?? Infinity;
  const taxableInBracket = Math.min(Math.max(income - min, 0), max - min);
  return taxableInBracket * bracket.rate;
};

// Calculate tax for a single tax system
const calculateTaxForSystem = (income: number, taxSystem: TaxSystem): number => {
  // Apply basic personal amount
  const taxableIncome = Math.max(income - taxSystem.basicPersonalAmount, 0);
  
  // Calculate tax for each bracket and sum
  return taxSystem.brackets.reduce((totalTax, bracket) => {
    return totalTax + calculateBracketTax(taxableIncome, bracket);
  }, 0);
};

// Calculate combined Canadian taxes (Federal + Provincial)
export const calculateCanadianTax = (
  income: number,
  currency: Currency = 'CAD'
): {
  federalTax: number;
  provincialTax: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  currency: Currency;
} => {
  const incomeCAD = currency === 'USD' 
    ? convertCurrency(income, 'USD', 'CAD')
    : income;

  const federalTax = calculateTaxForSystem(incomeCAD, CanadaFederalTax);
  const provincialTax = calculateTaxForSystem(incomeCAD, BCProvincialTax);
  const totalTax = federalTax + provincialTax;

  const currencyMultiplier = currency === 'USD' ? EXCHANGE_RATES.CAD_TO_USD : 1;

  // Calculate marginal rate considering basic personal amount
  const taxableIncome = Math.max(incomeCAD - CanadaFederalTax.basicPersonalAmount, 0);
  const federalMarginal = CanadaFederalTax.brackets.reduce((highest, bracket) => 
    taxableIncome >= bracket.min ? bracket.rate : highest, 0);
  
  const provincialTaxableIncome = Math.max(incomeCAD - BCProvincialTax.basicPersonalAmount, 0);
  const provincialMarginal = BCProvincialTax.brackets.reduce((highest, bracket) => 
    provincialTaxableIncome >= bracket.min ? bracket.rate : highest, 0);

  // If income is below basic personal amount, marginal rate is 0
  const marginalRate = incomeCAD <= Math.min(
    CanadaFederalTax.basicPersonalAmount,
    BCProvincialTax.basicPersonalAmount
  ) ? 0 : (federalMarginal + provincialMarginal) * 100;

  return {
    federalTax: Math.round(federalTax * currencyMultiplier * 100) / 100,
    provincialTax: Math.round(provincialTax * currencyMultiplier * 100) / 100,
    totalTax: Math.round(totalTax * currencyMultiplier * 100) / 100,
    effectiveRate: Math.round((totalTax / incomeCAD) * 10000) / 100,
    marginalRate,
    currency
  };
};

// Calculate US Federal tax
export const calculateUSTax = (
  income: number,
  currency: Currency = 'USD'
): {
  federalTax: number;
  effectiveRate: number;
  marginalRate: number;
  currency: Currency;
} => {
  const incomeUSD = currency === 'CAD'
    ? convertCurrency(income, 'CAD', 'USD')
    : income;

  const federalTax = calculateTaxForSystem(incomeUSD, USFederalTax);
  const currencyMultiplier = currency === 'CAD' ? EXCHANGE_RATES.USD_TO_CAD : 1;

  // Calculate marginal rate considering basic personal amount
  const taxableIncome = Math.max(incomeUSD - USFederalTax.basicPersonalAmount, 0);
  const marginalRate = taxableIncome <= 0 
    ? 0 
    : USFederalTax.brackets.reduce((highest, bracket) => 
        taxableIncome >= bracket.min ? bracket.rate * 100 : highest, 0);

  return {
    federalTax: Math.round(federalTax * currencyMultiplier * 100) / 100,
    effectiveRate: Math.round((federalTax / incomeUSD) * 10000) / 100,
    marginalRate,
    currency
  };
};
