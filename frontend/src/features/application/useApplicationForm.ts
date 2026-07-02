import { useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError } from '../../lib/api/client';
import { submissionsApi } from '../../lib/api/applications';

export type ApplicationErrors = Partial<Record<'name' | 'email' | 'question' | 'intent', string>>;

type Values = {
  name: string;
  email: string;
  question: string;
  intent: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateApplication(values: Values): ApplicationErrors {
  const errors: ApplicationErrors = {};
  if (!values.name.trim()) errors.name = 'Please tell us your name.';
  if (!values.email.trim()) errors.email = 'An email is required.';
  else if (!EMAIL_PATTERN.test(values.email.trim()))
    errors.email = 'That email address does not look right.';
  if (!values.question.trim()) errors.question = 'Share at least one question.';
  if (!values.intent.trim() || values.intent.trim().length < 20)
    errors.intent = 'A short paragraph (about a sentence) helps us reply with care.';
  return errors;
}

export function emptyApplication(): Values {
  return { name: '', email: '', question: '', intent: '' };
}

type Updater = {
  onName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEmail: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onQuestion: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onIntent: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export function useApplicationForm() {
  const [values, setValues] = useState<Values>(emptyApplication);
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setField<K extends keyof Values>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  const updater: Updater = {
    onName: (event) => setField('name', event.target.value),
    onEmail: (event) => setField('email', event.target.value),
    onQuestion: (event) => setField('question', event.target.value),
    onIntent: (event) => setField('intent', event.target.value),
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(false);
    setServerError('');

    const nextErrors = validateApplication(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      await submissionsApi.submit({
        name: values.name,
        email: values.email,
        question: values.question,
        intent: values.intent,
      });
      setSubmitted(true);
      setValues(emptyApplication());
    } catch (error) {
      setServerError(messageFromError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    values,
    errors,
    submitted,
    serverError,
    isSubmitting,
    ...updater,
    submit,
  };
}

function messageFromError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 422 && error.fieldErrors) {
      const first = Object.values(error.fieldErrors)[0];
      if (first) return first;
    }
    return error.message || 'The submission was rejected. Please review your details.';
  }
  if (error instanceof Error) return error.message;
  return 'The submission could not be completed. Please try again in a moment.';
}
