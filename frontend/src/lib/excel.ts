import * as XLSX from 'xlsx'

export interface ExcelPeriod {
  id: number
  label: string
}

export interface ExcelMember {
  nrp: string
  name: string
  payments: Record<number, number | null>
}

export function exportClassPaymentsToExcel(params: {
  className: string
  periods: ExcelPeriod[]
  members: ExcelMember[]
}): void {
  const { className, periods, members } = params

  const header = ['No', 'Nama', 'NRP', ...periods.map((period) => period.label), 'Total']

  const rows = members.map((member, index) => {
    const monthly = periods.map((period) => {
      const value = member.payments[period.id]
      return typeof value === 'number' ? value : 0
    })
    const total = monthly.reduce((sum, value) => sum + value, 0)
    return [index + 1, member.name, member.nrp, ...monthly, total]
  })

  const totals = periods.map((_, columnIndex) =>
    members.reduce((sum, member) => sum + (member.payments[periods[columnIndex].id] ?? 0), 0),
  )
  const totalRow = ['', 'TOTAL', '', ...totals, totals.reduce((sum, value) => sum + value, 0)]

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows, totalRow])
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 28 },
    { wch: 14 },
    ...periods.map(() => ({ wch: 14 })),
    { wch: 16 },
  ]

  const safeName = (className || 'Kelas').replace(/[\\/?*[\]:]/g, '-').slice(0, 31)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, safeName)
  XLSX.writeFile(workbook, `Kas ${className || 'Kelas'}.xlsx`)
}
