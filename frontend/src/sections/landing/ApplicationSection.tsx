import type { FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { useApplicationForm } from '../../features/application/useApplicationForm';
import { API_BASE_URL } from '../../lib/api';

const MEMBERSHIP_EXPECTATIONS = [
  'Bring a prepared question and a willingness to be corrected.',
  'Read slowly enough to notice what the text refuses to explain.',
  'Leave room for others to shape the argument as well as yourself.',
];

const inputClass = (error?: string) =>
  `w-full rounded-md border bg-[#fffdf6] px-4 py-3 outline-none ring-0 transition focus-visible:outline focus-visible:outline-2 ${
    error
      ? 'border-red-400/70 focus-visible:outline-red-400'
      : 'border-[#5c4033]/20 focus-visible:outline-brass'
  }`;

export function ApplicationSection() {
  const {
    values,
    errors,
    submitted,
    serverError,
    isSubmitting,
    onName,
    onEmail,
    onQuestion,
    onIntent,
    submit,
  } = useApplicationForm();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    return submit(event, `${API_BASE_URL}/api/v1/applications`);
  }

  return (
    <section
      className="border-b border-brass/20 bg-[#f7ebd5] px-5 py-20 sm:px-8 lg:px-10"
      id="apply"
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="room-frame rounded-[1.4rem] bg-[#fdf7e8]/90 p-8 sm:p-10">
          <p className="font-serif text-sm uppercase tracking-[0.28em] text-[#5c4033]">
            Application Form
          </p>
          <h2 className="mt-4 font-serif text-4xl text-[#2b1e17] sm:text-5xl">
            Write your request as if in an antique journal.
          </h2>
          <form className="mt-8 space-y-4" noValidate onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="sr-only" htmlFor="applicant-name">
                  Name
                </label>
                <input
                  aria-invalid={Boolean(errors.name)}
                  aria-required
                  className={inputClass(errors.name)}
                  id="applicant-name"
                  name="name"
                  type="text"
                  value={values.name}
                  onChange={onName}
                />
                {errors.name && (
                  <p className="mt-2 text-xs text-red-700" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="sr-only" htmlFor="applicant-email">
                  Email
                </label>
                <input
                  aria-invalid={Boolean(errors.email)}
                  aria-required
                  className={inputClass(errors.email)}
                  id="applicant-email"
                  inputMode="email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={onEmail}
                />
                {errors.email && (
                  <p className="mt-2 text-xs text-red-700" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="sr-only" htmlFor="applicant-question">
                What question have you carried longest?
              </label>
              <input
                aria-invalid={Boolean(errors.question)}
                aria-required
                className={inputClass(errors.question)}
                id="applicant-question"
                name="question"
                type="text"
                value={values.question}
                onChange={onQuestion}
              />
              {errors.question && (
                <p className="mt-2 text-xs text-red-700" role="alert">
                  {errors.question}
                </p>
              )}
            </div>
            <div>
              <label className="sr-only" htmlFor="applicant-intent">
                Tell us what kind of conversation you hope to deepen.
              </label>
              <textarea
                aria-invalid={Boolean(errors.intent)}
                aria-required
                className={`min-h-32 ${inputClass(errors.intent)}`}
                id="applicant-intent"
                name="intent"
                value={values.intent}
                onChange={onIntent}
              />
              {errors.intent && (
                <p className="mt-2 text-xs text-red-700" role="alert">
                  {errors.intent}
                </p>
              )}
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-[#b08d57]/35 bg-[#2b1e17] px-5 py-3 font-serif text-sm uppercase tracking-[0.2em] text-[#f8efe0] transition hover:border-[#d1ae73] hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Submitting…' : 'Submit application'}{' '}
              <ArrowRight aria-hidden="true" className="size-4" />
            </button>
            {submitted && (
              <div
                aria-live="polite"
                className="rounded-[0.75rem] border border-[#b08d57]/20 bg-[#fff9e7] px-4 py-3 text-sm text-[#3e2a1f]"
                role="status"
              >
                Thank you, your response has been noted and will be reviewed by the curator.
              </div>
            )}
            {serverError && (
              <div
                aria-live="assertive"
                className="rounded-[0.75rem] border border-red-300/40 bg-red-50/80 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {serverError}
              </div>
            )}
          </form>
        </div>
        <div className="rounded-[1.4rem] border border-[#5c4033]/20 bg-[#2b1e17]/90 p-8 text-parchment shadow-[0_24px_70px_-34px_rgba(0,0,0,0.7)] sm:p-10">
          <p className="font-serif text-sm uppercase tracking-[0.28em] text-brass">
            Membership expectations
          </p>
          <h3 className="mt-4 font-serif text-3xl text-[#f8efe0]">
            The room asks for attention, not performance.
          </h3>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-parchment/80">
            {MEMBERSHIP_EXPECTATIONS.map((item) => (
              <li className="flex items-start gap-3" key={item}>
                <span aria-hidden className="mt-1 text-brass">
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
