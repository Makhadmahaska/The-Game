import { FormEvent, useState } from 'react';
import { z } from 'zod';
import { api } from '../api';

// Validation schema
const registrationSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),

  // Allow empty string OR valid URL
  profilePictureUrl: z
    .string()
    .refine(
      (value) =>
        value === '' || /^https?:\/\/.+/.test(value),
      {
        message: 'Profile picture URL must be valid'
      }
    )
});

type FormState = {
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
};

const initialForm: FormState = {
  email: '',
  firstName: '',
  lastName: '',
  profilePictureUrl: ''
};

export function RegistrationPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const result = registrationSchema.safeParse(form);

    // ✅ Zod v4 uses "issues" not "errors"
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    try {
      await api.createUser(result.data);
      setSuccess('User registered successfully.');
      setForm(initialForm);
    } catch (apiError) {
      setError(
        apiError instanceof Error
          ? apiError.message
          : 'Could not register user'
      );
    }
  }

  return (
    <section className="card">
      <h2>Registration</h2>

      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Email *
          <input
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="name@example.com"
          />
        </label>

        <label>
          First Name *
          <input
            value={form.firstName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, firstName: e.target.value }))
            }
            placeholder="Alex"
          />
        </label>

        <label>
          Last Name *
          <input
            value={form.lastName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, lastName: e.target.value }))
            }
            placeholder="Johnson"
          />
        </label>

        <label>
          Profile Picture URL (optional)
          <input
            value={form.profilePictureUrl}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                profilePictureUrl: e.target.value
              }))
            }
            placeholder="https://..."
          />
        </label>

        <button type="submit">Register</button>
      </form>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}
    </section>
  );
}