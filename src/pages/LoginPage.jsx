
import { useState } from "react";
import * as yup from "yup";
import { useAuth } from "../auth/AuthContext.js";

const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required("L'adresse e-mail est obligatoire.")
    .email("Saisissez une adresse e-mail valide."),
  password: yup
    .string()
    .required("Le mot de passe est obligatoire."),
});

const features = [
  {
    title: "Gestion des élèves",
    description: "Suivi complet du parcours scolaire",
    icon: "users",
    colors: "bg-[#DCEBFF] text-[#1260DA]",
  },
  {
    title: "Gestion académique",
    description: "Classes, cours et évaluations",
    icon: "book",
    colors: "bg-[#D6F5EE] text-[#0AA989]",
  },
  {
    title: "Rapports et statistiques",
    description: "Des insights pour de meilleures décisions",
    icon: "chart",
    colors: "bg-[#EAE4FF] text-[#7545E8]",
  },
  {
    title: "Accès sécurisé",
    description: "Protection de vos données",
    icon: "shield",
    colors: "bg-[#FFF0D6] text-[#F49A00]",
  },
];

function Icon({ name, className = "h-5 w-5" }) {
  const paths = {
    cap: (
      <>
        <path d="m2 9 10-5 10 5-10 5L2 9Z" />
        <path d="M6 11v6c3.6 2.7 8.4 2.7 12 0v-6M22 9v7" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2H3Zm14-15a3 3 0 0 1 0 6m0 4a5 5 0 0 1 4 5" />
      </>
    ),
    book: (
      <>
        <path d="M12 6C9 4 6 4 2 5v14c4-1 7-1 10 1V6Zm0 0c3-2 6-2 10-1v14c-4-1-7-1-10 1V6Z" />
      </>
    ),
    chart: (
      <path d="M3 21h18M6 17v-5m5 5V5m5 12V9m5 8v-7" />
    ),
    shield: (
      <>
        <path d="m12 2 9 4v6c0 6-4 9-9 10-5-1-9-4-9-10V6l9-4Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 1 1 8 0v3" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    eyeOff: (
      <>
        <path d="m3 3 18 18M10 5.2A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3 3.6M6 6.3A17 17 0 0 0 2 12s4 7 10 7c1.6 0 3.1-.5 4.4-1.3" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    alert: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7v6m0 4h.01" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function getLoginError(error) {
  const status =
    error?.status ??
    error?.statusCode ??
    error?.response?.status;

  if (status === 400) {
    return "Vérifiez les informations saisies.";
  }
  if (status === 401) {
    return "Adresse e-mail ou mot de passe incorrect.";
  }
  if (status === 403) {
    return "Accès refusé pour ce compte.";
  }
  if (status === 503) {
    return "Le service est temporairement indisponible.";
  }

  return "Connexion au service impossible. Veuillez réessayer.";
}

const inputClass =
  "h-[52px] w-full rounded-xl border border-[#D7E1F0] " +
  "bg-white pl-12 pr-12 text-[14px] text-[#102348] " +
  "outline-none transition-all placeholder:text-[#91A0BC] " +
  "focus:border-[#1958D6] focus:ring-4 focus:ring-[#1958D6]/10 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const busy = submitting || Boolean(isLoading);

  async function handleSubmit(event) {
    event.preventDefault();

    if (busy) return;

    setErrors({});
    setServerError("");

    let validated;

    try {
      validated = loginSchema.validateSync(
        { email, password },
        { abortEarly: false }
      );
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const nextErrors = {};

        for (const issue of error.inner) {
          if (issue.path && !nextErrors[issue.path]) {
            nextErrors[issue.path] = issue.message;
          }
        }

        if (Object.keys(nextErrors).length === 0 && error.path) {
          nextErrors[error.path] = error.message;
        }

        setErrors(nextErrors);
        return;
      }

      setServerError("Une erreur est survenue.");
      return;
    }

    setSubmitting(true);

    try {
      await login({
        email: validated.email,
        password: validated.password,
      });
    } catch (error) {
      setServerError(getLoginError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-svh w-full bg-[#F7FAFF] font-sans lg:flex lg:h-svh lg:overflow-hidden">
      <section className="relative isolate hidden h-svh w-[50.8%] shrink-0 overflow-hidden bg-[#DFEFFF] lg:block">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[48%] overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 30%, black 68%)",
          }}
        >
          <img
            src="/school-campus-strip.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-[#287DCC]/15" />
        </div>

        <div className="relative z-10 px-10 pt-8 xl:px-16">
          <div className="flex items-center gap-3">
            <Icon name="cap" className="h-9 w-9 text-[#125DD8]" />
            <span className="text-[19px] font-bold tracking-tight text-[#102348]">
              School Management
            </span>
          </div>

          <div className="mt-8 xl:mt-10">
            <span className="inline-flex rounded-full bg-[#D6E8FF] px-4 py-1.5 text-[13px] font-medium text-[#1659CC]">
              Gestion scolaire simplifiée
            </span>

            <h1 className="mt-4 max-w-[590px] text-[clamp(30px,2.55vw,40px)] font-extrabold leading-[1.13] tracking-tight text-[#0D2249]">
              Une plateforme complète pour votre établissement
            </h1>

            <p className="mt-3 max-w-[545px] text-[15px] leading-6 text-[#526A91] xl:text-base">
              Gérez facilement vos élèves, enseignants, cours,
              notes et bien plus encore, dans un seul espace
              sécurisé.
            </p>
          </div>

          <div className="mt-7 grid gap-3 xl:gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-4"
              >
                <div
                  className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-2xl ${feature.colors}`}
                >
                  <Icon
                    name={feature.icon}
                    className="h-6 w-6"
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="text-[15px] font-bold leading-5 text-[#102348]">
                    {feature.title}
                  </h2>
                  <p className="mt-0.5 text-[13px] leading-5 text-[#597092]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex min-h-svh flex-1 items-center justify-center overflow-hidden bg-[#F7FAFF] px-4 py-8 sm:px-8 lg:h-svh lg:min-h-0 lg:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-44 h-[480px] w-[480px] rounded-full bg-[#E4F0FF]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -left-40 h-[420px] w-[420px] rounded-full bg-[#EAF3FF]"
        />

        <div className="relative z-10 max-h-[calc(100svh-32px)] w-full max-w-[510px] overflow-y-auto rounded-[26px] bg-white px-6 py-8 shadow-[0_18px_65px_rgba(30,71,125,0.10)] sm:px-9 lg:px-10">
          <div className="flex items-center justify-center gap-3">
            <span className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl bg-[#E6F0FF] text-[#1764DA]">
              <Icon name="cap" className="h-8 w-8" />
            </span>

            <span className="text-[18px] font-bold text-[#102348]">
              School Management
            </span>
          </div>

          <div className="mt-5 text-center">
            <h2 className="text-[32px] font-extrabold tracking-tight text-[#102348]">
              Connexion
            </h2>
            <p className="mt-1 text-[14px] text-[#657A9D]">
              Accédez à votre espace School Management
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulaire de connexion"
            className="mt-7 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[14px] font-semibold text-[#102348]"
              >
                Adresse e-mail
              </label>

              <div className="relative">
                <Icon
                  name="mail"
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7086A8]"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="votre@email.com"
                  value={email}
                  disabled={busy}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "email-error" : undefined
                  }
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      email: "",
                    }));
                    setServerError("");
                  }}
                  className={inputClass}
                />
              </div>

              {errors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="mt-1.5 text-[13px] text-red-600"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[14px] font-semibold text-[#102348]"
              >
                Mot de passe
              </label>

              <div className="relative">
                <Icon
                  name="lock"
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7086A8]"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Votre mot de passe"
                  value={password}
                  disabled={busy}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      password: "",
                    }));
                    setServerError("");
                  }}
                  className={inputClass}
                />

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword
                      ? "Masquer les caractères saisis"
                      : "Afficher les caractères saisis"
                  }
                  aria-controls="password"
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#657B9C] hover:bg-[#EEF4FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1958D6] disabled:opacity-50"
                >
                  <Icon
                    name={showPassword ? "eyeOff" : "eye"}
                    className="h-5 w-5"
                  />
                </button>
              </div>

              {errors.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="mt-1.5 text-[13px] text-red-600"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-700"
              >
                <Icon name="alert" className="h-5 w-5 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-[#1059DC] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(16,89,220,0.17)] transition-colors hover:bg-[#084AC3] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1059DC] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <Icon name="arrow" className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-[#EFF5FF] p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DDEBFF] text-[#135FDB]">
              <Icon name="shield" className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#102348]">
                Accès sécurisé
              </p>
              <p className="mt-0.5 text-[12px] text-[#647A9C]">
                Espace réservé aux utilisateurs autorisés.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
