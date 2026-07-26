export function required(value, label) {
  if (!value || !String(value).trim()) return `${label} is required`
  return null
}

export function validateResourceForm(values) {
  const errors = {}
  const nameError = required(values.name, 'Name')
  if (nameError) errors.name = nameError
  return errors
}

export function validateBookingForm(values) {
  const errors = {}
  if (!values.resourceId) errors.resourceId = 'Resource is required'
  const titleError = required(values.title, 'Title')
  if (titleError) errors.title = titleError
  const bookedByError = required(values.bookedBy, 'Booked by')
  if (bookedByError) errors.bookedBy = bookedByError
  if (!values.date) errors.date = 'Date is required'
  if (!values.startTime) errors.startTime = 'Start time is required'
  if (!values.endTime) errors.endTime = 'End time is required'
  if (values.startTime && values.endTime && values.startTime >= values.endTime) {
    errors.endTime = 'End time must be after start time'
  }
  return errors
}
