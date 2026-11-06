"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronRightIcon,
  FileTextIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { siteConfig } from "@/lib/site";
import {
  ADMISSION_LIMITS,
  applicationStatusLabels,
  createAdmissionFormData,
  formatApplicationDate,
  initialAdmissionValues,
  mapServerFieldErrors,
  parseApiProblem,
  validateAdmission,
  validateAdmissionStep,
  type AdmissionFieldErrors,
  type AdmissionFormValues,
  type AdmissionResponse,
} from "@/lib/admission";

const steps = [
  {
    title: "Eleve",
    description: "Informations du candidat",
    icon: UserIcon,
  },
  {
    title: "Parent ou tuteur",
    description: "Coordonnees de contact",
    icon: UsersIcon,
  },
  {
    title: "Verification",
    description: "Controle et envoi",
    icon: FileTextIcon,
  },
];

const inputClassName =
  "h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:bg-slate-50";

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
};

function Field({
  id,
  label,
  required,
  optional,
  hint,
  error,
  children,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-medium text-slate-800"
      >
        <span>
          {label}
          {required && (
            <span className="ml-1 text-rose-600" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {optional && (
          <span className="text-[11px] font-normal text-slate-400">
            Facultatif
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-rose-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs leading-5 text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function fieldDescribedBy(id: string, error?: string, hint?: string) {
  if (error) {
    return `${id}-error`;
  }
  if (hint) {
    return `${id}-hint`;
  }
  return undefined;
}

function todayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AdmissionForm() {
  const [values, setValues] = useState<AdmissionFormValues>(
    initialAdmissionValues,
  );
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<AdmissionFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AdmissionResponse | null>(null);

  const currentStep = steps[step];
  const today = useMemo(() => todayInputValue(), []);

  function updateField<Key extends keyof AdmissionFormValues>(
    key: Key,
    value: AdmissionFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) {
        return current;
      }
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function goNext() {
    const stepErrors = validateAdmissionStep(step, values);
    if (Object.keys(stepErrors).length > 0) {
      setErrors((current) => ({ ...current, ...stepErrors }));
      setFormError("");
      return;
    }
    setErrors({});
    setFormError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setFormError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const validationErrors = validateAdmission(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormError(
        "Certains champs doivent etre corriges avant l'envoi de la candidature.",
      );
      if (validationErrors.candidateName || validationErrors.candidateBirthDate) {
        setStep(0);
      } else {
        setStep(1);
      }
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/admissions", {
        method: "POST",
        body: createAdmissionFormData(values),
      });

      const text = await response.text();
      let payload: unknown = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const problem = parseApiProblem(payload);
        const serverFieldErrors = mapServerFieldErrors(problem.invalidParams);
        setErrors(serverFieldErrors);
        if (
          serverFieldErrors.candidateName ||
          serverFieldErrors.candidateBirthDate
        ) {
          setStep(0);
        } else if (Object.keys(serverFieldErrors).length > 0) {
          setStep(1);
        }
        setFormError(
          problem.detail ||
            problem.title ||
            "La candidature n'a pas pu etre envoyee. Veuillez verifier les informations saisies.",
        );
        return;
      }

      const data = payload as AdmissionResponse | null;
      if (!data || typeof data.id !== "number") {
        setFormError(
          "L'envoi a ete transmis, mais la reference de candidature n'a pas pu etre lue. Contactez l'administration avant de soumettre a nouveau.",
        );
        return;
      }

      setResult(data);
    } catch {
      setFormError(
        "Impossible de joindre le service d'admission. Verifiez votre connexion, puis reessayez.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result) {
    const reference = `#${result.id}`;
    const status = applicationStatusLabels[result.status] ?? result.status;

    return (
      <div className="rounded-xl border border-emerald-200 bg-white p-6 shadow-2xs sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircleIcon className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Votre candidature a bien ete enregistree
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              L&apos;administration dispose maintenant de votre dossier.
            </p>
          </div>
        </div>

        <dl className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Numero de candidature
            </dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {reference}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Statut
            </dt>
            <dd className="mt-1 inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-800">
              {status}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Eleve
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">
              {result.candidateName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Date d&apos;envoi
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-800">
              {formatApplicationDate(result.submittedAt)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 rounded border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
          <p className="font-semibold text-slate-900">
            Conservez ce numero de candidature.
          </p>
          <p className="mt-1">
            Il vous sera demande pour toute question relative a votre dossier.
            Le suivi en ligne n&apos;etant pas encore disponible, contactez
            l&apos;administration en indiquant cette reference.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex h-11 items-center justify-center rounded bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Contacter l&apos;administration
          </Link>
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setValues(initialAdmissionValues);
              setErrors({});
              setFormError("");
              setStep(0);
            }}
            className="inline-flex h-11 items-center justify-center rounded border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
          >
            Deposer une autre candidature
          </button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          {siteConfig.name}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div className="border-b border-slate-200 p-5 sm:p-6">
        <ol className="grid gap-3 sm:grid-cols-3" aria-label="Etapes de la candidature">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isDone = index < step;
            const isCurrent = index === step;
            return (
              <li
                key={item.title}
                className={[
                  "flex items-center gap-2.5 rounded-lg border p-2.5",
                  isCurrent
                    ? "border-slate-900 bg-slate-900 text-white"
                    : isDone
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-slate-50 text-slate-500",
                ].join(" ")}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                    isCurrent
                      ? "bg-white/10 text-white"
                      : isDone
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-white text-slate-500 ring-1 ring-slate-200",
                  ].join(" ")}
                >
                  {isDone ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold">
                    {index + 1}. {item.title}
                  </span>
                  <span
                    className={[
                      "block truncate text-[11px]",
                      isCurrent
                        ? "text-slate-300"
                        : isDone
                          ? "text-emerald-700"
                          : "text-slate-400",
                    ].join(" ")}
                  >
                    {item.description}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6" noValidate>
        <div className="mb-5 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <currentStep.icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {currentStep.title}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {currentStep.description}
            </p>
          </div>
        </div>

        {formError && (
          <div className="mb-5">
            <Alert tone="error">{formError}</Alert>
          </div>
        )}

        {step === 0 && (
          <div className="space-y-5">
            <Field
              id="candidateName"
              label="Nom complet de l'eleve"
              required
              error={errors.candidateName}
              hint="Indiquez le nom et le prenom de l'enfant candidat."
            >
              <input
                id="candidateName"
                name="candidateName"
                type="text"
                autoComplete="name"
                maxLength={ADMISSION_LIMITS.candidateName}
                value={values.candidateName}
                onChange={(event) =>
                  updateField("candidateName", event.target.value)
                }
                aria-invalid={Boolean(errors.candidateName)}
                aria-describedby={fieldDescribedBy(
                  "candidateName",
                  errors.candidateName,
                )}
                className={inputClassName}
                placeholder="Ex. : Amina Diallo"
                required
              />
            </Field>

            <Field
              id="candidateBirthDate"
              label="Date de naissance de l'eleve"
              required
              error={errors.candidateBirthDate}
              hint="La date doit etre anterieure a aujourd'hui."
            >
              <div className="relative">
                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="candidateBirthDate"
                  name="candidateBirthDate"
                  type="date"
                  max={today}
                  value={values.candidateBirthDate}
                  onChange={(event) =>
                    updateField("candidateBirthDate", event.target.value)
                  }
                  aria-invalid={Boolean(errors.candidateBirthDate)}
                  aria-describedby={fieldDescribedBy(
                    "candidateBirthDate",
                    errors.candidateBirthDate,
                  )}
                  className={`${inputClassName} pl-10`}
                  required
                />
              </div>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <p className="rounded border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              Ces informations permettent a l&apos;administration de vous
              contacter au sujet de la candidature. Elles sont facultatives dans
              le formulaire en ligne.
            </p>

            <Field
              id="guardianFullName"
              label="Nom complet du parent ou du tuteur"
              optional
              error={errors.guardianFullName}
            >
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="guardianFullName"
                  name="guardianFullName"
                  type="text"
                  autoComplete="name"
                  maxLength={ADMISSION_LIMITS.guardianFullName}
                  value={values.guardianFullName}
                  onChange={(event) =>
                    updateField("guardianFullName", event.target.value)
                  }
                  aria-invalid={Boolean(errors.guardianFullName)}
                  aria-describedby={fieldDescribedBy(
                    "guardianFullName",
                    errors.guardianFullName,
                  )}
                  className={`${inputClassName} pl-10`}
                  placeholder="Ex. : Fatou Diallo"
                />
              </div>
            </Field>

            <Field
              id="guardianPhoneNumber"
              label="Telephone"
              optional
              error={errors.guardianPhoneNumber}
              hint="Numero auquel l'administration peut joindre la famille."
            >
              <div className="relative">
                <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="guardianPhoneNumber"
                  name="guardianPhoneNumber"
                  type="tel"
                  autoComplete="tel"
                  maxLength={ADMISSION_LIMITS.guardianPhoneNumber}
                  value={values.guardianPhoneNumber}
                  onChange={(event) =>
                    updateField("guardianPhoneNumber", event.target.value)
                  }
                  aria-invalid={Boolean(errors.guardianPhoneNumber)}
                  aria-describedby={fieldDescribedBy(
                    "guardianPhoneNumber",
                    errors.guardianPhoneNumber,
                    "Numero auquel l'administration peut joindre la famille.",
                  )}
                  className={`${inputClassName} pl-10`}
                  placeholder="Ex. : +221 77 000 00 00"
                />
              </div>
            </Field>

            <Field
              id="guardianProfession"
              label="Profession"
              optional
              error={errors.guardianProfession}
            >
              <div className="relative">
                <BriefcaseIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="guardianProfession"
                  name="guardianProfession"
                  type="text"
                  autoComplete="organization-title"
                  maxLength={ADMISSION_LIMITS.guardianProfession}
                  value={values.guardianProfession}
                  onChange={(event) =>
                    updateField("guardianProfession", event.target.value)
                  }
                  aria-invalid={Boolean(errors.guardianProfession)}
                  aria-describedby={fieldDescribedBy(
                    "guardianProfession",
                    errors.guardianProfession,
                  )}
                  className={`${inputClassName} pl-10`}
                  placeholder="Ex. : Enseignante"
                />
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-lg border border-slate-200">
              <div className="border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Recapitulatif de la candidature
                </h3>
              </div>
              <dl className="divide-y divide-slate-100">
                <SummaryRow label="Eleve" value={values.candidateName} />
                <SummaryRow
                  label="Date de naissance"
                  value={values.candidateBirthDate}
                />
                <SummaryRow
                  label="Parent ou tuteur"
                  value={values.guardianFullName || "Non renseigne"}
                />
                <SummaryRow
                  label="Telephone"
                  value={values.guardianPhoneNumber || "Non renseigne"}
                />
                <SummaryRow
                  label="Profession"
                  value={values.guardianProfession || "Non renseignee"}
                />
              </dl>
            </div>

            <div className="flex gap-3 rounded border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
              <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <p>
                En validant, vous transmettez ces informations a
                l&apos;administration de {siteConfig.name} pour l&apos;etude de
                la candidature. Aucune piece jointe n&apos;est demandee dans ce
                formulaire.
              </p>
            </div>

            <div className="flex gap-3 rounded border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
              <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Verifiez les informations ci-dessus. Apres l&apos;envoi, un
                numero de candidature s&apos;affichera : conservez-le.
              </p>
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center rounded border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Retour
              </button>
            ) : (
              <Link
                href="/"
                className="inline-flex h-11 items-center text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Annuler
              </Link>
            )}
          </div>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-11 items-center justify-center gap-2 rounded bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Continuer
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden="true"
                  />
                  Envoi en cours...
                </>
              ) : (
                <>
                  Envoyer la candidature
                  <ChevronRightIcon className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:items-baseline">
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd className="text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}
