export function buildFormData(
  payload: Record<string, unknown>,
  files: Record<string, File | null | undefined> = {},
  method?: 'PUT' | 'PATCH',
): FormData {
  const form = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    form.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value))
  })

  Object.entries(files).forEach(([key, file]) => {
    if (file) form.append(key, file)
  })

  if (method) form.append('_method', method)

  return form
}
