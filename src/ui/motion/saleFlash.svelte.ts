// Counts sales, so the top bar's money can flash when the floating amount is off.
let sales = $state(0)

export function noteSale(): void {
  sales++
}

export function saleCount(): number {
  return sales
}
