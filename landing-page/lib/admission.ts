export const ADMISSION_LIMITS = {
  candidateName: 100,
  guardianFullName: 100,
  guardianPhoneNumber: 20,
  guardianProfession: 100,
} as const;

export type AdmissionFormValues = {
  candidateName: string;
  candidateBirthDate: string;
  guardianFullName: string;
  guardianPhoneNumber: string;
  guardianProfession: string;
};

export type AdmissionFieldErrors = Partial<
  Record<keyof AdmissionFormValues, string>
>;

export type AdmissionResponse = {
  id: number;
  candidateName: string;
  candidateBirthDate: string;
  status: string;
  submittedAt: string;
  decisionNote?: string | null;
  guardian?: {
    id?: number;
    fullName?: string | null;
    phoneNumber?: string | null;
    profession?: string | null;
  } | null;
};

export type ApiProblemDetail = {
  title?: string;
  detail?: string;
  invalidParams?: Record<string, string>;
};

export const initialAdmissionValues: AdmissionFormValues = {
  candidateName: "",
  candidateBirthDate: "",
  guardianFullName: "",
  guardianPhoneNumber: "",
  guardianProfession: "",
};

export const applicationStatusLabels: Record<string, string> = {
  SUBMITTED: "Soumise",
  UNDER_REVIEW: "En cours d'examen",
  ACCEPTED: "Acceptee",
  WAITLISTED: "Liste d'attente",
  REJECTED: "Refusee",
};

const knownFields: Array<keyof AdmissionFormValues> = [
  "candidateName",
  "candidateBirthDate",
  "guardianFullName",
  "guardianPhoneNumber",
  "guardianProfession",
];

function isKnownField(field: string): field is keyof AdmissionFormValues {
  return knownFields.includes(field as keyof AdmissionFormValues);
}

export function validateAdmissionStep(
  step: number,
  values: AdmissionFormValues,
): AdmissionFieldErrors {
  const errors: AdmissionFieldErrors = {};
  const candidateName = values.candidateName.trim();
  const candidateBirthDate = values.candidateBirthDate.trim();
  const guardianFullName = values.guardianFullName.trim();
  const guardianPhoneNumber = values.guardianPhoneNumber.trim();
  const guardianProfession = values.guardianProfession.trim();

  if (step === 0) {
    if (!candidateName) {
      errors.candidateName = "Le nom complet de l'eleve est obligatoire.";
    } else if (candidateName.length > ADMISSION_LIMITS.candidateName) {
      errors.candidateName = `Le nom ne doit pas depasser ${ADMISSION_LIMITS.candidateName} caracteres.`;
    }

    if (!candidateBirthDate) {
      errors.candidateBirthDate = "La date de naissance est obligatoire.";
    } else {
      const birthDate = new Date(`${candidateBirthDate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(birthDate.getTime())) {
        errors.candidateBirthDate = "La date de naissance est invalide.";
      } else if (birthDate >= today) {
        errors.candidateBirthDate =
          "La date de naissance doit etre situee dans le passe.";
      }
    }
  }

  if (step === 1) {
    if (guardianFullName.length > ADMISSION_LIMITS.guardianFullName) {
      errors.guardianFullName = `Le nom du parent ou tuteur ne doit pas depasser ${ADMISSION_LIMITS.guardianFullName} caracteres.`;
    }
    if (
      guardianPhoneNumber.length > ADMISSION_LIMITS.guardianPhoneNumber
    ) {
      errors.guardianPhoneNumber = `Le telephone ne doit pas depasser ${ADMISSION_LIMITS.guardianPhoneNumber} caracteres.`;
    }
    if (guardianProfession.length > ADMISSION_LIMITS.guardianProfession) {
      errors.guardianProfession = `La profession ne doit pas depasser ${ADMISSION_LIMITS.guardianProfession} caracteres.`;
    }
  }

  return errors;
}

export function validateAdmission(values: AdmissionFormValues) {
  return {
    ...validateAdmissionStep(0, values),
    ...validateAdmissionStep(1, values),
  };
}

export function createAdmissionFormData(values: AdmissionFormValues) {
  const payload: Record<string, string> = {
    candidateName: values.candidateName.trim(),
    candidateBirthDate: values.candidateBirthDate.trim(),
  };

  const optionalFields: Array<
    | "guardianFullName"
    | "guardianPhoneNumber"
    | "guardianProfession"
  > = [
    "guardianFullName",
    "guardianPhoneNumber",
    "guardianProfession",
  ];

  for (const field of optionalFields) {
    const value = values[field].trim();
    if (value) {
      payload[field] = value;
    }
  }

  const formData = new FormData();
  formData.append(
    "data",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
    "data.json",
  );

  return formData;
}

export function parseApiProblem(payload: unknown): ApiProblemDetail {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const problem = payload as ApiProblemDetail;
  return {
    title: typeof problem.title === "string" ? problem.title : undefined,
    detail: typeof problem.detail === "string" ? problem.detail : undefined,
    invalidParams:
      problem.invalidParams && typeof problem.invalidParams === "object"
        ? problem.invalidParams
        : undefined,
  };
}

export function mapServerFieldErrors(
  invalidParams?: Record<string, string>,
): AdmissionFieldErrors {
  if (!invalidParams) {
    return {};
  }

  const errors: AdmissionFieldErrors = {};
  for (const [field, message] of Object.entries(invalidParams)) {
    if (isKnownField(field) && typeof message === "string") {
      errors[field] = message;
    }
  }
  return errors;
}

export function formatApplicationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}
