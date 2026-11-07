# 01 - Backend Feature Inventory & API Catalog

## 1. Executive Summary & Architecture
- **Framework:** Spring Boot 3.4.1, Java 21, Spring Security 6, Spring Data JPA / Hibernate, Flyway migrations (`V1` to `V8`).
- **Data Stores:** MySQL (Relational persistence), Redis (JWT token revocation blacklist & session invalidation).
- **API Architecture:** RESTful JSON API with unified response wrapper `ApiResponse<T>` and Spring Data `PageResponse<T>` pagination.
- **Security Enforcement:** Stateless JWT Bearer tokens, Method-level `@PreAuthorize` security, custom security expressions (`CommunicationAccess`, `UserOrganizationAccessPolicy`).
- **Total Backend Modules:** 26 functional modules.
- **Total Endpoints:** 134 verified REST endpoints.

---

## 2. Core User Roles & Authority Model
The database schema and Flyway migration `V8__seed_initial_data.sql` define exactly 5 roles:
1. **ROLE_ADMIN** (`admin@school.edu`): Unrestricted administrative and system configuration authority.
2. **ROLE_TEACHER** (`professeur@school.edu`): Academic instruction, exam creation, grading, report cards, homework grading.
3. **ROLE_STUDENT** (`eleve@school.edu`): Enrolled student access to personal academic records, homework submissions, report cards, exams.
4. **ROLE_PARENT** (`parent@school.edu`): Legal guardian access to linked children's academic performance, pedagogical AI observations, and consent management.
5. **ROLE_STAFF** (`staff@school.edu`): Administrative personnel managing admissions, student registrations, fee types, invoices, expenses, and departments.

> [!IMPORTANT]
> `ROLE_LIBRARIAN` **does not exist** in the backend. There are no library, book, catalog, or borrowing entities or endpoints.


---

## 3. Discovered Backend Gaps & Inconsistencies
1. **Absence of Attendance Module:** No attendance entity, repository, service, or controller exists in the backend. Any attendance percentages or records in frontend are unbacked.
2. **Absence of Class/Classroom Entity:** No separate `Class` entity exists. Students and teachers are organized under `Department` or linked via `Exam`.
3. **Absence of Timetable/Schedule:** No timetable or schedule entity exists in the backend.
4. **Pedagogical AI Teacher Authorization:** `UserOrganizationAccessPolicy` throws `AccessDeniedException` for teachers because teacher-student assignment relationships are not yet modeled in the backend.

---

## 4. Complete Endpoint Inventory by Module

### Module: AIAnalysis (7 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `POST` | `/api/ai-analyses/generate` | Générer un brouillon et une stratégie, avec consentement parental | Body: `AIAnalysisGenerateReq` | `AIAnalysisDtoResp` | `Default Authenticated` |
| `GET` | `/api/ai-analyses/student/{studentId}` | Lister les analyses autorisées d'un élève | Params: studentId (path, req), page (query), size (query) | `PageResponseAIAnalysisDtoResp` | `Default Authenticated` |
| `GET` | `/api/ai-analyses/{id}` | Lire une analyse ; publication obligatoire pour les familles | Params: id (path, req) | `AIAnalysisDtoResp` | `Default Authenticated` |
| `GET` | `/api/ai-analyses/{id}/generation-logs` | Consulter les diagnostics, personnel habilité uniquement | Params: id (path, req), page (query), size (query) | `PageResponseAIGenerationLogDtoResp` | `Default Authenticated` |
| `PUT` | `/api/ai-analyses/{id}/publish` | Publier une analyse validée | Params: id (path, req) | `AIAnalysisDtoResp` | `Default Authenticated` |
| `PUT` | `/api/ai-analyses/{id}/reject` | Rejeter un brouillon avec motif | Params: id (path, req)<br>Body: `AIAnalysisRejectReq` | `AIAnalysisDtoResp` | `Default Authenticated` |
| `PUT` | `/api/ai-analyses/{id}/validate` | Valider humainement un brouillon | Params: id (path, req) | `AIAnalysisDtoResp` | `Default Authenticated` |


### Module: AIConsent (3 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `POST` | `/api/ai-consents` | Enregistrer son propre consentement parental | Body: `AIConsentDtoReq` | `AIConsentDtoResp` | `Default Authenticated` |
| `GET` | `/api/ai-consents/student/{studentId}` | Lister les consentements autorisés ; liste vide si aucun | Params: studentId (path, req), page (query), size (query) | `PageResponseAIConsentDtoResp` | `Default Authenticated` |
| `PUT` | `/api/ai-consents/{id}/revoke` | Retirer son consentement parental | Params: id (path, req) | `AIConsentDtoResp` | `Default Authenticated` |


### Module: Authentication (3 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/change-password` | Changement du mot de passe de l'utilisateur connecté | Body: `ChangePasswordRequest` | `ApiResponseVoid` | `Default Authenticated` |
| `POST` | `/api/v1/auth/login` | Authentification utilisateur et obtention des jetons JWT | Body: `LoginRequest` | `ApiResponseTokenResponse` | `Default Authenticated` |
| `POST` | `/api/v1/auth/logout` | Déconnexion et révocation du token via blacklist Redis | Params: Authorization (header) | `ApiResponseVoid` | `Default Authenticated` |


### Module: Departments (5 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/v1/departments` | Lister tous les départements | None | `ApiResponseListDepartmentResponse` | `Default Authenticated` |
| `POST` | `/api/v1/departments` | Créer un nouveau département | Body: `DepartmentRequest` | `ApiResponseDepartmentResponse` | `Default Authenticated` |
| `DELETE` | `/api/v1/departments/{id}` | Supprimer un département | Params: id (path, req) | `ApiResponseVoid` | `Default Authenticated` |
| `GET` | `/api/v1/departments/{id}` | Obtenir un département par son identifiant | Params: id (path, req) | `ApiResponseDepartmentResponse` | `Default Authenticated` |
| `PUT` | `/api/v1/departments/{id}` | Mettre à jour un département existant | Params: id (path, req)<br>Body: `DepartmentRequest` | `ApiResponseDepartmentResponse` | `Default Authenticated` |


### Module: Finance - Dépenses (5 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/v1/finances/expenses` | Lister les dépenses avec filtres par catégorie et période | Params: category (query), dateFrom (query), dateTo (query), pageable (query, req) | `ApiResponsePageExpenseResponse` | `Default Authenticated` |
| `POST` | `/api/v1/finances/expenses` | Créer une dépense | Body: `CreateExpenseRequest` | `ApiResponseExpenseResponse` | `Default Authenticated` |
| `DELETE` | `/api/v1/finances/expenses/{id}` | Supprimer une dépense | Params: id (path, req) | `ApiResponseVoid` | `Default Authenticated` |
| `GET` | `/api/v1/finances/expenses/{id}` | Obtenir une dépense par son identifiant | Params: id (path, req) | `ApiResponseExpenseResponse` | `Default Authenticated` |
| `PUT` | `/api/v1/finances/expenses/{id}` | Mettre à jour une dépense | Params: id (path, req)<br>Body: `UpdateExpenseRequest` | `ApiResponseExpenseResponse` | `Default Authenticated` |


### Module: Finance - Factures (10 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/v1/finances/invoices` | Lister les factures avec filtres par élève, statut, numéro et échéance | Params: studentId (query), status (query), number (query), dueFrom (query), dueTo (query), pageable (query, req) | `ApiResponsePageInvoiceSummaryResponse` | `Default Authenticated` |
| `POST` | `/api/v1/finances/invoices` | Créer une facture avec ses lignes | Body: `CreateInvoiceRequest` | `ApiResponseInvoiceResponse` | `Default Authenticated` |
| `POST` | `/api/v1/finances/invoices/generate` | Générer des factures périodiques pour une liste d'élèves | Body: `GenerateInvoicesRequest` | `ApiResponseListInvoiceSummaryResponse` | `Default Authenticated` |
| `GET` | `/api/v1/finances/invoices/students/{studentId}` | Lister les factures d'un élève | Params: studentId (path, req), pageable (query, req) | `ApiResponsePageInvoiceSummaryResponse` | `Default Authenticated` |
| `DELETE` | `/api/v1/finances/invoices/{id}` | Supprimer une facture sans paiement | Params: id (path, req) | `ApiResponseVoid` | `Default Authenticated` |
| `GET` | `/api/v1/finances/invoices/{id}` | Obtenir une facture détaillée par son identifiant | Params: id (path, req) | `ApiResponseInvoiceResponse` | `Default Authenticated` |
| `PUT` | `/api/v1/finances/invoices/{id}` | Mettre à jour l'échéance et la réduction d'une facture | Params: id (path, req)<br>Body: `UpdateInvoiceRequest` | `ApiResponseInvoiceResponse` | `Default Authenticated` |
| `POST` | `/api/v1/finances/invoices/{id}/lines` | Ajouter une ligne à une facture sans paiement | Params: id (path, req)<br>Body: `InvoiceLineRequest` | `ApiResponseInvoiceResponse` | `Default Authenticated` |
| `DELETE` | `/api/v1/finances/invoices/{id}/lines/{lineId}` | Supprimer une ligne de facture sans paiement | Params: id (path, req), lineId (path, req) | `ApiResponseInvoiceResponse` | `Default Authenticated` |
| `PUT` | `/api/v1/finances/invoices/{id}/lines/{lineId}` | Mettre à jour une ligne de facture sans paiement | Params: id (path, req), lineId (path, req)<br>Body: `InvoiceLineRequest` | `ApiResponseInvoiceResponse` | `Default Authenticated` |


### Module: Finance - Paiements (4 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `POST` | `/api/v1/finances/payments` | Enregistrer un paiement pour une facture | Body: `CreatePaymentRequest` | `ApiResponsePaymentResponse` | `Default Authenticated` |
| `GET` | `/api/v1/finances/payments/invoice/{invoiceId}` | Lister les paiements d'une facture | Params: invoiceId (path, req) | `ApiResponseListPaymentResponse` | `Default Authenticated` |
| `GET` | `/api/v1/finances/payments/{id}` | Obtenir un paiement par son identifiant | Params: id (path, req) | `ApiResponsePaymentResponse` | `Default Authenticated` |
| `GET` | `/api/v1/finances/payments/{id}/receipt` | Télécharger le reçu PDF d'un paiement | Params: id (path, req) | `string` | `Default Authenticated` |


### Module: Finance - Types de frais (5 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/v1/finances/fee-types` | Lister tous les types de frais | None | `ApiResponseListFeeTypeResponse` | `Default Authenticated` |
| `POST` | `/api/v1/finances/fee-types` | Créer un type de frais | Body: `CreateFeeTypeRequest` | `ApiResponseFeeTypeResponse` | `Default Authenticated` |
| `DELETE` | `/api/v1/finances/fee-types/{id}` | Supprimer un type de frais non utilisé | Params: id (path, req) | `ApiResponseVoid` | `Default Authenticated` |
| `GET` | `/api/v1/finances/fee-types/{id}` | Obtenir un type de frais par son identifiant | Params: id (path, req) | `ApiResponseFeeTypeResponse` | `Default Authenticated` |
| `PUT` | `/api/v1/finances/fee-types/{id}` | Mettre à jour un type de frais | Params: id (path, req)<br>Body: `UpdateFeeTypeRequest` | `ApiResponseFeeTypeResponse` | `Default Authenticated` |


### Module: FollowUpAction (4 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `POST` | `/api/follow-up-actions` | Créer une action dans une stratégie DRAFT | Body: `FollowUpActionDtoReq` | `FollowUpActionDtoResp` | `Default Authenticated` |
| `GET` | `/api/follow-up-actions/{id}` | Lire une action autorisée | Params: id (path, req) | `FollowUpActionDtoResp` | `Default Authenticated` |
| `PUT` | `/api/follow-up-actions/{id}` | Modifier une action avant validation | Params: id (path, req)<br>Body: `FollowUpActionDtoReq` | `FollowUpActionDtoResp` | `Default Authenticated` |
| `PATCH` | `/api/follow-up-actions/{id}/complete` | Terminer une action après publication | Params: id (path, req) | `FollowUpActionDtoResp` | `Default Authenticated` |


### Module: Gestion & Soumission des Devoirs (5 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/v1/homework/students/{studentId}/submissions` | Lister les soumissions d'un élève | Params: studentId (path, req) | `ApiResponseListHomeworkSubmissionResponse` | `Default Authenticated` |
| `GET` | `/api/v1/homework/submissions/{id}` | Obtenir les détails d'une soumission par son ID | Params: id (path, req) | `ApiResponseHomeworkSubmissionResponse` | `Default Authenticated` |
| `PUT` | `/api/v1/homework/submissions/{id}/grade` | Noter et commenter la soumission d'un devoir | Params: id (path, req)<br>Body: `GradeSubmissionRequest` | `ApiResponseHomeworkSubmissionResponse` | `Default Authenticated` |
| `GET` | `/api/v1/homework/{id}/submissions` | Lister toutes les soumissions pour un devoir donné | Params: id (path, req) | `ApiResponseListHomeworkSubmissionResponse` | `Default Authenticated` |
| `POST` | `/api/v1/homework/{id}/submit` | Soumettre un devoir avec fichier | Params: id (path, req), title (query), studentId (query, req)<br>Body: `object` | `ApiResponseHomeworkSubmissionResponse` | `Default Authenticated` |


### Module: Guardians (3 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/v1/guardians` | Lister et rechercher les tuteurs (par nom, prénom ou email) | Params: query (query) | `ApiResponseListGuardianResponse` | `Default Authenticated` |
| `POST` | `/api/v1/guardians` | Créer un nouveau tuteur | Body: `CreateGuardianRequest` | `ApiResponseGuardianResponse` | `Default Authenticated` |
| `GET` | `/api/v1/guardians/{id}` | Obtenir un tuteur par son identifiant | Params: id (path, req) | `ApiResponseGuardianResponse` | `Default Authenticated` |


### Module: LearningStrategy (4 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `POST` | `/api/learning-strategies` | Créer la stratégie unique d'un brouillon généré | Body: `LearningStrategyDtoReq` | `LearningStrategyDtoResp` | `Default Authenticated` |
| `GET` | `/api/learning-strategies/{id}` | Lire la stratégie et les conseils parent/élève autorisés | Params: id (path, req) | `LearningStrategyDtoResp` | `Default Authenticated` |
| `PUT` | `/api/learning-strategies/{id}` | Modifier une stratégie avant validation | Params: id (path, req)<br>Body: `LearningStrategyDtoReq` | `LearningStrategyDtoResp` | `Default Authenticated` |
| `GET` | `/api/learning-strategies/{id}/follow-up-actions` | Filtrer les actions par réalisation et échéance | Params: id (path, req), done (query), from (query), to (query), page (query), size (query) | `PageResponseFollowUpActionDtoResp` | `Default Authenticated` |


### Module: Moteur de Calcul & Bulletins Scolaires (4 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/v1/report-cards` | Lister les bulletins avec filtres facultatifs par période, année ou élève | Params: term (query), academicYear (query), studentId (query) | `ApiResponseListReportCardResponse` | `Default Authenticated` |
| `POST` | `/api/v1/report-cards/generate` | Calculer les moyennes, rangs et générer les bulletins officiels en PDF | Body: `GenerateReportCardRequest` | `ApiResponseReportCardSummaryResponse` | `Default Authenticated` |
| `GET` | `/api/v1/report-cards/{id}` | Obtenir les détails d'un bulletin par ID | Params: id (path, req) | `ApiResponseReportCardResponse` | `Default Authenticated` |
| `GET` | `/api/v1/report-cards/{id}/download` | Télécharger le bulletin officiel au format PDF | Params: id (path, req) | `string` | `Default Authenticated` |


### Module: Observation (5 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `POST` | `/api/observations` | Créer une observation, auteur issu de l'identité vérifiée | Body: `ObservationDtoReq` | `ObservationDtoResp` | `Default Authenticated` |
| `GET` | `/api/observations/student/{studentId}` | Filtrer les observations d'un élève | Params: studentId (path, req), category (query), from (query), to (query), level (query), source (query), page (query), size (query) | `PageResponseObservationDtoResp` | `Default Authenticated` |
| `DELETE` | `/api/observations/{id}` | Supprimer sa propre observation inutilisée | Params: id (path, req) | `ApiResponse` | `Default Authenticated` |
| `GET` | `/api/observations/{id}` | Lire une observation autorisée | Params: id (path, req) | `ObservationDtoResp` | `Default Authenticated` |
| `PUT` | `/api/observations/{id}` | Modifier sa propre observation inutilisée | Params: id (path, req)<br>Body: `ObservationUpdateReq` | `ObservationDtoResp` | `Default Authenticated` |


### Module: Staff (5 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/v1/staff` | Lister le personnel (avec filtre optionnel par département) | Params: departmentId (query) | `ApiResponseListStaffResponse` | `Default Authenticated` |
| `POST` | `/api/v1/staff` | Créer un nouveau membre du personnel | Body: `CreateStaffRequest` | `ApiResponseStaffResponse` | `Default Authenticated` |
| `DELETE` | `/api/v1/staff/{id}` | Supprimer un membre du personnel | Params: id (path, req) | `ApiResponseVoid` | `Default Authenticated` |
| `GET` | `/api/v1/staff/{id}` | Obtenir un membre du personnel par son identifiant | Params: id (path, req) | `ApiResponseStaffResponse` | `Default Authenticated` |
| `PUT` | `/api/v1/staff/{id}` | Mettre à jour un membre du personnel | Params: id (path, req)<br>Body: `UpdateStaffRequest` | `ApiResponseStaffResponse` | `Default Authenticated` |


### Module: Students (6 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/v1/students` | Lister les élèves avec pagination et filtres (nom, numéro d'étudiant, statut) | Params: name (query), studentNumber (query), status (query), pageable (query, req) | `ApiResponsePageStudentResponse` | `Default Authenticated` |
| `POST` | `/api/v1/students` | Créer un élève avec génération automatique du compte User et matricule | Body: `CreateStudentRequest` | `ApiResponseStudentResponse` | `Default Authenticated` |
| `DELETE` | `/api/v1/students/{id}` | Supprimer un élève | Params: id (path, req) | `ApiResponseVoid` | `Default Authenticated` |
| `GET` | `/api/v1/students/{id}` | Obtenir un élève par son identifiant avec ses tuteurs | Params: id (path, req) | `ApiResponseStudentResponse` | `Default Authenticated` |
| `PUT` | `/api/v1/students/{id}` | Mettre à jour les informations d'un élève | Params: id (path, req)<br>Body: `UpdateStudentRequest` | `ApiResponseStudentResponse` | `Default Authenticated` |
| `POST` | `/api/v1/students/{id}/guardians` | Associer un tuteur légal à un élève avec lien de parenté et contact principal | Params: id (path, req)<br>Body: `AssignGuardianRequest` | `ApiResponseStudentResponse` | `Default Authenticated` |


### Module: Teachers (5 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/v1/teachers` | Lister les enseignants (avec filtre optionnel par département) | Params: departmentId (query) | `ApiResponseListTeacherResponse` | `Default Authenticated` |
| `POST` | `/api/v1/teachers` | Créer un nouvel enseignant | Body: `CreateTeacherRequest` | `ApiResponseTeacherResponse` | `Default Authenticated` |
| `DELETE` | `/api/v1/teachers/{id}` | Supprimer un enseignant | Params: id (path, req) | `ApiResponseVoid` | `Default Authenticated` |
| `GET` | `/api/v1/teachers/{id}` | Obtenir un enseignant par son identifiant | Params: id (path, req) | `ApiResponseTeacherResponse` | `Default Authenticated` |
| `PUT` | `/api/v1/teachers/{id}` | Mettre à jour les informations d'un enseignant | Params: id (path, req)<br>Body: `UpdateTeacherRequest` | `ApiResponseTeacherResponse` | `Default Authenticated` |


### Module: announcement-controller (5 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/announcements` | list_2 | Params: targetRole (query), page (query), size (query) | `PageResponseAnnouncementDtoResp` | `Default Authenticated` |
| `POST` | `/api/announcements` | create_7 | Body: `AnnouncementDtoReq` | `AnnouncementDtoResp` | `Default Authenticated` |
| `DELETE` | `/api/announcements/{id}` | delete_2 | Params: id (path, req) | `ApiResponse` | `Default Authenticated` |
| `GET` | `/api/announcements/{id}` | get_5 | Params: id (path, req) | `AnnouncementDtoResp` | `Default Authenticated` |
| `PUT` | `/api/announcements/{id}` | update_5 | Params: id (path, req)<br>Body: `AnnouncementDtoReq` | `AnnouncementDtoResp` | `Default Authenticated` |


### Module: application-controller (6 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/v1/applications` | getAllApplications | Params: status (query), pageable (query, req) | `PageApplicationResponseDto` | `Default Authenticated` |
| `GET` | `/api/v1/applications/{id}` | getApplicationById | Params: id (path, req) | `ApplicationResponseDto` | `Default Authenticated` |
| `POST` | `/api/v1/applications/{id}/convert` | convertToStudent | Params: id (path, req) | `StudentResponseDto` | `Default Authenticated` |
| `PATCH` | `/api/v1/applications/{id}/decision` | recordDecision | Params: id (path, req)<br>Body: `RecordDecisionRequestDto` | `ApplicationResponseDto` | `Default Authenticated` |
| `PATCH` | `/api/v1/applications/{id}/status` | updateStatus | Params: id (path, req)<br>Body: `UpdateApplicationStatusRequestDto` | `ApplicationResponseDto` | `Default Authenticated` |
| `POST` | `/api/v1/public/applications` | submitApplication | Params: documentTypeIds (query), expiresAt (query)<br>Body: `object` | `ApplicationResponseDto` | `Default Authenticated` |


### Module: audit-log-controller (3 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/audit-logs` | list_5 | Params: userId (query), action (query), entity (query), from (query), to (query), page (query), size (query) | `PageResponseAuditLogDtoResp` | `Default Authenticated` |
| `GET` | `/api/audit-logs/user/{userId}` | byUser_1 | Params: userId (path, req), action (query), entity (query), from (query), to (query), page (query), size (query) | `PageResponseAuditLogDtoResp` | `Default Authenticated` |
| `GET` | `/api/audit-logs/{id}` | get_8 | Params: id (path, req) | `AuditLogDtoResp` | `Default Authenticated` |


### Module: document-controller (5 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/v1/documents/files/{fileKey}` | downloadFile | Params: fileKey (path, req), expires (query, req), signature (query, req) | `string` | `Default Authenticated` |
| `GET` | `/api/v1/documents/my-documents` | getMyDocuments | None | `array` | `Default Authenticated` |
| `POST` | `/api/v1/documents/upload` | uploadDocument | Params: documentTypeId (query, req), expiresAt (query)<br>Body: `object` | `DocumentResponseDto` | `Default Authenticated` |
| `GET` | `/api/v1/documents/{id}` | getDocument | Params: id (path, req) | `DocumentResponseDto` | `Default Authenticated` |
| `PATCH` | `/api/v1/documents/{id}/verify` | verifyDocument | Params: id (path, req)<br>Body: `VerifyDocumentRequestDto` | `DocumentResponseDto` | `Default Authenticated` |


### Module: event-controller (5 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/events` | list_1 | Params: organizerId (query), from (query), to (query), page (query), size (query) | `PageResponseEventDtoResp` | `Default Authenticated` |
| `POST` | `/api/events` | create_6 | Body: `EventDtoReq` | `EventDtoResp` | `Default Authenticated` |
| `DELETE` | `/api/events/{id}` | delete_1 | Params: id (path, req) | `ApiResponse` | `Default Authenticated` |
| `GET` | `/api/events/{id}` | get_4 | Params: id (path, req) | `EventDtoResp` | `Default Authenticated` |
| `PUT` | `/api/events/{id}` | update_4 | Params: id (path, req)<br>Body: `EventDtoReq` | `EventDtoResp` | `Default Authenticated` |


### Module: leave-request-controller (8 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/leave-requests` | list | Params: userId (query), status (query), type (query), from (query), to (query), page (query), size (query) | `PageResponseLeaveRequestDtoResp` | `Default Authenticated` |
| `POST` | `/api/leave-requests` | create_3 | Body: `LeaveRequestDtoReq` | `LeaveRequestDtoResp` | `Default Authenticated` |
| `GET` | `/api/leave-requests/user/{userId}` | byUser | Params: userId (path, req), status (query), type (query), from (query), to (query), page (query), size (query) | `PageResponseLeaveRequestDtoResp` | `Default Authenticated` |
| `GET` | `/api/leave-requests/{id}` | get_1 | Params: id (path, req) | `LeaveRequestDtoResp` | `Default Authenticated` |
| `PUT` | `/api/leave-requests/{id}` | update_1 | Params: id (path, req)<br>Body: `LeaveRequestDtoReq` | `LeaveRequestDtoResp` | `Default Authenticated` |
| `PUT` | `/api/leave-requests/{id}/approve` | approve | Params: id (path, req) | `LeaveRequestDtoResp` | `Default Authenticated` |
| `PUT` | `/api/leave-requests/{id}/cancel` | cancel | Params: id (path, req) | `LeaveRequestDtoResp` | `Default Authenticated` |
| `PUT` | `/api/leave-requests/{id}/reject` | reject | Params: id (path, req) | `LeaveRequestDtoResp` | `Default Authenticated` |


### Module: message-controller (6 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `POST` | `/api/messages` | create_2 | Body: `MessageDtoReq` | `MessageDtoResp` | `Default Authenticated` |
| `GET` | `/api/messages/inbox/{userId}` | inbox | Params: userId (path, req), page (query), size (query) | `PageResponseMessageDtoResp` | `Default Authenticated` |
| `GET` | `/api/messages/sent/{userId}` | sent | Params: userId (path, req), page (query), size (query) | `PageResponseMessageDtoResp` | `Default Authenticated` |
| `DELETE` | `/api/messages/{id}` | delete_4 | Params: id (path, req) | `ApiResponse` | `Default Authenticated` |
| `GET` | `/api/messages/{id}` | get_7 | Params: id (path, req) | `MessageDtoResp` | `Default Authenticated` |
| `PUT` | `/api/messages/{id}/read` | markRead_1 | Params: id (path, req) | `MessageDtoResp` | `Default Authenticated` |


### Module: notification-controller (5 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `POST` | `/api/notifications` | create_1 | Body: `NotificationDtoReq` | `NotificationDtoResp` | `Default Authenticated` |
| `GET` | `/api/notifications/user/{userId}` | list_4 | Params: userId (path, req), page (query), size (query) | `PageResponseNotificationDtoResp` | `Default Authenticated` |
| `DELETE` | `/api/notifications/{id}` | delete_3 | Params: id (path, req) | `ApiResponse` | `Default Authenticated` |
| `GET` | `/api/notifications/{id}` | get_6 | Params: id (path, req) | `NotificationDtoResp` | `Default Authenticated` |
| `PUT` | `/api/notifications/{id}/read` | markRead | Params: id (path, req) | `NotificationDtoResp` | `Default Authenticated` |


### Module: Évaluations & Notes (8 endpoints)

| Method | Endpoint | Summary | Params / Request Body | Response | Authorization / Rules |
|---|---|---|---|---|---|
| `GET` | `/api/v1/exams` | Lister tous les examens | None | `ApiResponseListExamResponse` | `Default Authenticated` |
| `POST` | `/api/v1/exams` | Créer un nouvel examen | Body: `CreateExamRequest` | `ApiResponseExamResponse` | `Default Authenticated` |
| `DELETE` | `/api/v1/exams/{id}` | Supprimer un examen non verrouillé | Params: id (path, req) | `ApiResponseVoid` | `Default Authenticated` |
| `GET` | `/api/v1/exams/{id}` | Obtenir les détails d'un examen par ID | Params: id (path, req) | `ApiResponseExamResponse` | `Default Authenticated` |
| `PUT` | `/api/v1/exams/{id}` | Mettre à jour un examen existant | Params: id (path, req)<br>Body: `UpdateExamRequest` | `ApiResponseExamResponse` | `Default Authenticated` |
| `GET` | `/api/v1/exams/{id}/grades` | Obtenir les notes d'un examen | Params: id (path, req) | `ApiResponseListGradeResponse` | `Default Authenticated` |
| `POST` | `/api/v1/exams/{id}/grades/batch` | Saisie en masse des notes d'un examen | Params: id (path, req)<br>Body: `BatchGradeRequest` | `ApiResponseListGradeResponse` | `Default Authenticated` |
| `PATCH` | `/api/v1/exams/{id}/lock` | Verrouiller ou déverrouiller administrativement un examen | Params: id (path, req), locked (query) | `ApiResponseExamResponse` | `Default Authenticated` |

