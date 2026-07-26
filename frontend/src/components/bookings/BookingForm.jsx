import { useState } from 'react'
import FormField from '../common/FormField'
import Button from '../common/Button'
import ErrorBanner from '../common/ErrorBanner'
import ResourceSelect from '../resources/ResourceSelect'
import { validateBookingForm } from '../../utils/validators'
import { toIsoDateTime, fromIsoDateTime, todayIso } from '../../utils/dateHelpers'

function buildInitialValues(booking, defaultResourceId, defaultDate) {
  if (booking) {
    const start = fromIsoDateTime(booking.startTime)
    const end = fromIsoDateTime(booking.endTime)
    return {
      resourceId: booking.resourceId,
      title: booking.title,
      bookedBy: booking.bookedBy,
      date: start.date,
      startTime: start.time,
      endTime: end.time,
    }
  }
  return {
    resourceId: defaultResourceId || '',
    title: '',
    bookedBy: '',
    date: defaultDate || todayIso(),
    startTime: '',
    endTime: '',
  }
}

// Turns the backend's { field, message }[] validation details into a
// { fieldName: message } map, matching the shape client-side validation
// already produces so both render through the same FormField error prop.
function detailsToFieldErrors(details) {
  if (!details) return {}
  return Object.fromEntries(details.map((d) => [d.field, d.message]))
}

export default function BookingForm({
  resources,
  booking = null,
  defaultResourceId = '',
  defaultDate = '',
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(buildInitialValues(booking, defaultResourceId, defaultDate))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isConflict, setIsConflict] = useState(false)

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateBookingForm(values)
    setErrors(validationErrors)
    setSubmitError('')
    setIsConflict(false)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      const payload = {
        resourceId: values.resourceId,
        title: values.title.trim(),
        bookedBy: values.bookedBy.trim(),
        startTime: toIsoDateTime(values.date, values.startTime),
        endTime: toIsoDateTime(values.date, values.endTime),
      }
      await onSubmit(payload)
    } catch (err) {
      if (err.code === 'VALIDATION_ERROR' && err.details) {
        // Field-level errors (e.g. missing title, malformed time) render
        // inline on the matching inputs.
        setErrors(detailsToFieldErrors(err.details))
      } else if (err.code === 'BOOKING_OVERLAP') {
        // The backend message already names the conflicting booking and
        // its time range -- surface it verbatim, just flagged distinctly.
        setIsConflict(true)
        setSubmitError(err.message)
      } else {
        setSubmitError(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {submitError && (
        <div>
          {isConflict && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-danger">
              Scheduling conflict
            </p>
          )}
          <ErrorBanner message={submitError} />
        </div>
      )}

      <FormField label="Resource" error={errors.resourceId}>
        <ResourceSelect
          resources={resources}
          value={values.resourceId}
          onChange={(id) => setValues((prev) => ({ ...prev, resourceId: id }))}
          disabled={!!booking}
        />
      </FormField>

      <FormField label="Title" error={errors.title}>
        <input
          type="text"
          value={values.title}
          onChange={handleChange('title')}
          placeholder="e.g. Team standup"
          className="rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </FormField>

      <FormField label="Booked by" error={errors.bookedBy}>
        <input
          type="text"
          value={values.bookedBy}
          onChange={handleChange('bookedBy')}
          placeholder="Your name or email"
          className="rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </FormField>

      <FormField label="Date" error={errors.date}>
        <input
          type="date"
          value={values.date}
          onChange={handleChange('date')}
          className="rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Start time" error={errors.startTime}>
          <input
            type="time"
            value={values.startTime}
            onChange={handleChange('startTime')}
            className="rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </FormField>
        <FormField label="End time" error={errors.endTime}>
          <input
            type="time"
            value={values.endTime}
            onChange={handleChange('endTime')}
            className="rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </FormField>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : booking ? 'Save changes' : 'Create booking'}
        </Button>
      </div>
    </form>
  )
}
