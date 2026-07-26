import { useState } from 'react'
import FormField from '../common/FormField'
import Button from '../common/Button'
import ErrorBanner from '../common/ErrorBanner'
import { validateResourceForm } from '../../utils/validators'

const emptyForm = { name: '', category: '', description: '', isActive: true }

// Turns the backend's { field, message }[] validation details into a
// { fieldName: message } map matching the shape client-side validation
// already uses, so both sources render through the same FormField error prop.
function detailsToFieldErrors(details) {
  if (!details) return {}
  return Object.fromEntries(details.map((d) => [d.field, d.message]))
}

export default function ResourceForm({ initialValues = emptyForm, onSubmit, onCancel }) {
  const [values, setValues] = useState({ ...emptyForm, ...initialValues })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleChange = (field) => (e) => {
    const value = field === 'isActive' ? e.target.checked : e.target.value
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateResourceForm(values)
    setErrors(validationErrors)
    setSubmitError('')
    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      await onSubmit({
        name: values.name.trim(),
        category: values.category.trim() || undefined,
        description: values.description.trim() || undefined,
        isActive: values.isActive,
      })
    } catch (err) {
      // 422 responses carry per-field details -- show those inline on the
      // matching inputs. Anything else (network failure, 500, etc.) shows
      // as a single banner above the form.
      if (err.code === 'VALIDATION_ERROR' && err.details) {
        setErrors(detailsToFieldErrors(err.details))
      } else {
        setSubmitError(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <ErrorBanner message={submitError} />

      <FormField label="Name" error={errors.name}>
        <input
          type="text"
          value={values.name}
          onChange={handleChange('name')}
          placeholder="e.g. Conference Room A"
          className="rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </FormField>

      <FormField label="Category" hint="Optional — e.g. Room, Equipment, Vehicle">
        <input
          type="text"
          value={values.category}
          onChange={handleChange('category')}
          placeholder="e.g. Room"
          className="rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </FormField>

      <FormField label="Description" hint="Optional">
        <textarea
          value={values.description}
          onChange={handleChange('description')}
          rows={3}
          placeholder="What's this resource used for?"
          className="resize-none rounded-md border border-border px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </FormField>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={handleChange('isActive')}
          className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
        />
        Active (bookable)
      </label>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save resource'}
        </Button>
      </div>
    </form>
  )
}
