# Frappe / ERPNext DocType Architectural Patterns

In the Frappe framework, every business entity (e.g. Student, Course, Fee Invoice, Attendance Record) is represented as a **DocType**. This document defines the standard layout, interaction patterns, and lifecycle behavior required when constructing views.

---

## 1. DocType Page Anatomy

Every DocType record view follows a standardized 4-part structure:

```
+-----------------------------------------------------------------------------------+
|  DocTypePageHead: Breadcrumbs | Document Title | Status Badge   | [Secondary] [Primary] |
+-----------------------------------------------------------------------------------+
|  LAYOUT: 12-Column Grid (md:grid-cols-4)                                           |
|                                                                                   |
|  +------------------------+  +-------------------------------------------------+  |
|  | Aside (1 col):         |  | Main Content (3 cols):                          |  |
|  | - Metadata             |  | - General Information Section                   |  |
|  | - Creation Details     |  | - Link Fields (FK lookups)                      |  |
|  | - Assignment           |  | - Child Table Grids (line items, courses, etc.)  |  |
|  | - Tags / Workflow      |  | - Financial / Quantity Totals                   |  |
|  |                        |  | - DocTimeline (activity feed & audit logs)       |  |
|  +------------------------+  +-------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. DocStatus Lifecycle

Entities transition through specific states:
* `Draft` (docstatus: 0): The document can be freely edited, rows added/removed.
* `Submitted` (docstatus: 1): The document is finalized and locked. Edits require explicit cancellation or amendment.
* `Cancelled` (docstatus: 2): The document is voided.

---

## 3. Keyboard-First Interactions

Frappe Desk is built for fast data entry:
* `Ctrl + S` / `Cmd + S`: Trigger primary save / submit action.
* `Ctrl + K` / `Cmd + K`: Open universal command palette.
* `Tab` / `Shift + Tab`: Natural linear field-to-field traversal across form controls and child grid cells.
* `Escape`: Close modals, dismiss dropdown popovers.

---

## 4. School Management App Adaptations

When building school management modules (e.g., Students, Teachers, Enrollments, Fee Schedules, Grading Sheets):

| DocType Example | Master Record | Child Table | Key Foreign Keys (LinkField) |
| :--- | :--- | :--- | :--- |
| **Student** | Student Profile | Guardians, Medical Records | Program, Class / Section |
| **Course Enrollment** | Student Enrollment | Enrolled Modules / Subjects | Student, Academic Year, Term |
| **Fee Invoice** | Student Fee Bill | Fee Components (Tuition, Lab, Bus) | Student, Fee Structure |
| **Grading Sheet** | Assessment Exam | Student Grades & Remarks | Course, Academic Term, Teacher |
