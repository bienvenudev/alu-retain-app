// Sample data for the optional demo user. Dates are relative to the day the
// seed runs, so the current month always has expenses to show.
export interface DemoExpense {
  amount: string
  category: string // a category name from the seed
  daysAgo: number
  description?: string
  notes?: string
  paymentMethod: 'bank_transfer' | 'card' | 'cash' | 'mobile_money'
  title: string
}

export const demoExpenses: DemoExpense[] = [
  { amount: '450000', category: 'Housing', daysAgo: 2, description: 'Apartment rent', paymentMethod: 'bank_transfer', title: 'Monthly rent' },
  { amount: '25000', category: 'Food & Dining', daysAgo: 0, notes: 'Weekly groceries', paymentMethod: 'card', title: 'Grocery run' },
  { amount: '15000', category: 'Transport', daysAgo: 1, paymentMethod: 'cash', title: 'Bus pass' },
  { amount: '18000', category: 'Utilities', daysAgo: 3, paymentMethod: 'mobile_money', title: 'Electricity bill' },
  { amount: '8000', category: 'Entertainment', daysAgo: 4, description: 'Two tickets', paymentMethod: 'card', title: 'Movie night' },
  { amount: '12000', category: 'Food & Dining', daysAgo: 5, paymentMethod: 'card', title: 'Lunch with team' },
  { amount: '6500', category: 'Health', daysAgo: 6, paymentMethod: 'cash', title: 'Pharmacy' },
  { amount: '45000', category: 'Shopping', daysAgo: 8, notes: 'Sale item', paymentMethod: 'card', title: 'Running shoes' },
  { amount: '9000', category: 'Food & Dining', daysAgo: 9, paymentMethod: 'mobile_money', title: 'Coffee beans' },
  { amount: '20000', category: 'Transport', daysAgo: 11, paymentMethod: 'cash', title: 'Taxi to airport' },
  { amount: '35000', category: 'Utilities', daysAgo: 13, description: 'Monthly fibre plan', paymentMethod: 'bank_transfer', title: 'Internet' },
  { amount: '15000', category: 'Uncategorized', daysAgo: 15, paymentMethod: 'cash', title: 'Gift for a friend' },
  { amount: '450000', category: 'Housing', daysAgo: 32, paymentMethod: 'bank_transfer', title: 'Rent (last month)' },
  { amount: '32000', category: 'Food & Dining', daysAgo: 35, paymentMethod: 'card', title: 'Groceries' },
  { amount: '7500', category: 'Entertainment', daysAgo: 38, paymentMethod: 'card', title: 'Streaming subscription' },
  { amount: '40000', category: 'Health', daysAgo: 41, paymentMethod: 'card', title: 'Dentist visit' },
  { amount: '30000', category: 'Transport', daysAgo: 44, paymentMethod: 'cash', title: 'Fuel' },
  { amount: '25000', category: 'Shopping', daysAgo: 50, paymentMethod: 'card', title: 'Backpack' },
  { amount: '450000', category: 'Housing', daysAgo: 62, paymentMethod: 'bank_transfer', title: 'Rent (two months ago)' },
  { amount: '60000', category: 'Food & Dining', daysAgo: 66, paymentMethod: 'card', title: 'Birthday dinner' },
]

export const demoBudgets = [
  { amount: '700000', monthsAgo: 0 },
  { amount: '650000', monthsAgo: 1 },
]
