import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { FormsModule, NgForm } from "@angular/forms";
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { filter } from "rxjs";
import { MockPaginationComponent } from "./shared/mock-pagination.component";

interface EducationRow {
  code: string;
  name: string;
  detail: string;
  values: string[];
  status: string;
  amount: string;
  email?: string;
}
interface EducationField {
  label: string;
  required?: boolean;
  type?: string;
  options?: string[];
  wide?: boolean;
  placeholder?: string;
  readOnly?: boolean;
}
interface EducationPage {
  app: string;
  base: string;
  title: string;
  description: string;
  kind: "home" | "list" | "form" | "detail" | "guide";
  group: string;
  entity: string;
  columns: string[];
  stats: [string, string, string, string?][];
  fields: EducationField[];
}
interface EducationNavGroup {
  label: string;
  items: { label: string; path: string }[];
}
interface EducationClassLevel {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
}
interface EducationClassSection {
  id: string;
  levelId: string;
  name: string;
  capacity: number;
  occupied: number;
  campus: string;
  shift: string;
  teacher: string;
  pending: number;
}
interface EducationApplication {
  id: string;
  applicationNo: string;
  studentFirstName: string;
  studentLastName: string;
  guardianName: string;
  guardianPhone: string;
  status: "draft" | "submitted" | "verified" | "approved" | "rejected";
  campus: string;
  created: string;
  className: string;
  category: string;
  group: string;
  documents: {
    name: string;
    verified: boolean;
    fileName?: string;
    size?: string;
    signed?: boolean;
  }[];
  enrolledStudentId?: string;
  feeAssigned?: boolean;
  dateOfBirth?: string;
  gender?: string;
  guardianRelation?: string;
  guardianEmail?: string;
  section?: string;
  feeStatus?: "pending" | "pending_verification" | "paid";
  admissionFee?: number;
  paidAmount?: number;
  paymentMethod?: string;
  payerAccount?: string;
  paymentDate?: string;
  paymentNote?: string;
  receiptNo?: string;
  campaignTitle?: string;
  campaignId?: string;
  campaignVersion?: number;
  approvedAt?: string;
}
interface EducationApplicationActivity {
  title: string;
  detail: string;
  when: string;
}
interface EducationUserRequest {
  id: string;
  type: "profile_link" | "guardian_link" | "new_profile" | "question";
  status: "pending" | "approved" | "rejected";
  requestedByUserId: string;
  requesterName: string;
  requesterEmail: string;
  note: string;
  reviewNote: string;
  createdAt: string;
}
interface MockAcademicSession {
  id: string;
  name: string;
  start: string;
  end: string;
  year: number;
  active: boolean;
  locked: boolean;
}

const students = [
  "Amina Rahman",
  "Zayan Ahmed",
  "Sadia Islam",
  "Rafi Chowdhury",
  "Nusrat Jahan",
  "Ibrahim Hasan",
  "Maliha Kabir",
  "Adnan Karim",
  "Tasmia Akter",
  "Nabil Hossain",
];
const instructors = [
  "Farhana Ahmed",
  "Mahmud Hasan",
  "Nusrat Karim",
  "Sajid Chowdhury",
  "Tania Rahman",
  "Arif Hossain",
  "Mariam Islam",
  "Rashed Kabir",
];
const classes = [
  "Grade 8 · Blue",
  "Grade 7 · Green",
  "Grade 9 · Science",
  "Grade 6 · Rose",
  "Grade 10 · Commerce",
  "Grade 5 · Blue",
];
const courses = [
  "Digital Skills for Work",
  "Business English Essentials",
  "Advanced Excel & Reporting",
  "Project Management Foundations",
  "Front-end Development",
  "Data Analytics with SQL",
];
const studentSections = ["Blue", "Green", "Science", "Rose", "Commerce"];
const statuses = [
  "Active",
  "In progress",
  "Pending review",
  "Scheduled",
  "Completed",
  "Needs attention",
  "Draft",
  "Approved",
];

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MockPaginationComponent],
  templateUrl: "./education-page.component.html",
  styleUrl: "./education-page.component.css",
})
export class EducationPageComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  page!: EducationPage;
  rows: EducationRow[] = [];
  private createdStudents: EducationRow[] = [];
  private studentFormOverrides: Record<string, Record<string, string>> = {};
  search = "";
  statusFilter = "";
  currentPage = 1;
  pageSize = 10;
  createOpen = false;
  submitted = false;
  reviewerOpen = false;
  toast = "";
  scopeFilter = "";
  sectionFilter = "";
  studentTab = "overview";
  studentAttendanceClass = "";
  studentAttendancePage = 1;
  studentAttendancePageSize = 10;
  studentFormValues: Record<string, string> = {};
  studentParentContactError = false;
  requestSearch = "";
  requestTypeFilter = "";
  requestStatusFilter = "pending";
  requestPage = 1;
  requestPageSize = 10;
  requestSortBy: "requesterName" | "type" | "status" | "createdAt" =
    "createdAt";
  requestSortDir: "asc" | "desc" = "desc";
  requestDecision: {
    requestId: string;
    status: "approved" | "rejected";
  } | null = null;
  requestReviewNote = "";
  studentSourceRequestId = "";
  academicSessions: MockAcademicSession[] = Array.from(
    { length: 26 },
    (_, index) => {
      const year = 2001 + index;
      return {
        id: `session-${year}`,
        name: `${year}-${year + 1}`,
        start: `Jan 1, ${year}`,
        end: `Dec 31, ${year}`,
        year,
        active: year === 2026,
        locked: year < 2025,
      };
    },
  );
  academicSessionSearch = "";
  academicSessionPage = 1;
  academicSessionPageSize = 20;
  academicSessionView: "list" | "card" = "list";
  academicSessionDrawerOpen = false;
  academicSessionEditingId = "";
  academicSessionSubmitted = false;
  academicSessionForm = { name: "", start: "", end: "", active: false };
  academicSessionToast = "";
  identityForm = {
    nameEn: "Stravix International School",
    nameBn: "",
    eiin: "123456",
    principalName: "",
    establishedYear: "",
    website: "",
    email: "contact@stravixschool.test",
    phonePrimary: "+8801700000000",
    phoneSecondary: "",
    postcode: "",
    addressLine1: "123 Gulshan Avenue",
    addressLine2: "",
    upazila: "",
    district: "",
    division: "",
  };
  identitySavedMessage = "";
  identitySubmitted = false;
  identityValidationMessage = "";
  identityLogoName = "";
  identityHistoryUnavailable = false;
  userRequests: EducationUserRequest[] = Array.from({ length: 32 }, (_, i) => {
    const names = [
      "Ayesha Rahman",
      "Tanvir Ahmed",
      "Nabila Islam",
      "Sajid Chowdhury",
      "Maliha Kabir",
      "Arif Hossain",
      "Farzana Akter",
      "Raihan Karim",
    ];
    const type = (
      [
        "profile_link",
        "guardian_link",
        "new_profile",
        "question",
      ] as EducationUserRequest["type"][]
    )[i % 4];
    const status: EducationUserRequest["status"] =
      i < 20 ? "pending" : i < 27 ? "approved" : "rejected";
    const name = names[i % names.length];
    const slug = name.toLowerCase().replace(/\s+/g, ".");
    return {
      id: `SUR-26-${String(1041 + i).padStart(4, "0")}`,
      type,
      status,
      requestedByUserId: `usr-preview-${String(i + 1).padStart(3, "0")}`,
      requesterName: name,
      requesterEmail: `${slug}${i ? `.${i + 1}` : ""}@mail.example`,
      note: [
        "Please connect my parent account to the student profile.",
        "I need help accessing the class portal.",
        "My profile is not linked to my student record.",
        "Please create a student profile for the new enrolment.",
      ][i % 4],
      reviewNote:
        status === "pending"
          ? ""
          : status === "approved"
            ? "Verified against the school record."
            : "Please contact the school office to update the submitted details.",
      createdAt: `${String(24 - (i % 20)).padStart(2, "0")} Sep 2026 · ${String(8 + (i % 9)).padStart(2, "0")}:${i % 2 ? "42" : "16"}`,
    };
  });
  classAcademicYear = "2026–2027";
  classCampus = "Stravix Main Campus";
  selectedClassLevelId = "level-c1";
  classLevelDrawerOpen = false;
  classSectionDrawerOpen = false;
  classCopyModalOpen = false;
  classDeleteTarget: {
    kind: "level" | "section";
    id: string;
    label: string;
  } | null = null;
  classFormSubmitted = false;
  classCodeError = "";
  classNameError = "";
  classSectionNameError = "";
  classCapacityError = "";
  classEditingLevelId = "";
  classEditingSectionId = "";
  classForm = { code: "", name: "", sortOrder: 12 };
  classSectionForm = {
    name: "",
    capacity: 32,
    campus: "Stravix Main Campus",
    shift: "Morning",
    teacher: "",
  };
  readonly classShifts = [
    "Morning · 08:00–12:30",
    "Day · 09:00–14:30",
    "Afternoon · 13:00–17:30",
  ];
  readonly classTeachers = [
    "Mahmud Hasan",
    "Farhana Ahmed",
    "Nusrat Karim",
    "Sajid Chowdhury",
    "Tania Rahman",
    "Arif Hossain",
  ];
  classLevels: EducationClassLevel[] = [
    { id: "level-c1", name: "Class One", code: "C1", sortOrder: 1 },
    { id: "level-g6", name: "Grade 6", code: "G6", sortOrder: 2 },
    { id: "level-c2", name: "Class Two", code: "C2", sortOrder: 3 },
    { id: "level-c3", name: "Class Three", code: "C3", sortOrder: 4 },
    { id: "level-c4", name: "Class Four", code: "C4", sortOrder: 5 },
    { id: "level-c5", name: "Class Five", code: "C5", sortOrder: 6 },
    { id: "level-c6", name: "Class Six", code: "C6", sortOrder: 7 },
    { id: "level-c7", name: "Class Seven", code: "C7", sortOrder: 8 },
    { id: "level-c8", name: "Class Eight", code: "C8", sortOrder: 9 },
    { id: "level-c9", name: "Class Nine", code: "C9", sortOrder: 10 },
    { id: "level-c10", name: "Class Ten", code: "C10", sortOrder: 11 },
  ];
  classSections: EducationClassSection[] = [
    {
      id: "section-c1-a",
      levelId: "level-c1",
      name: "A",
      capacity: 40,
      occupied: 34,
      campus: "Stravix Main Campus",
      shift: "Morning · 08:00–12:30",
      teacher: "Mahmud Hasan",
      pending: 2,
    },
    {
      id: "section-c1-b",
      levelId: "level-c1",
      name: "B",
      capacity: 40,
      occupied: 37,
      campus: "Stravix Main Campus",
      shift: "Morning · 08:00–12:30",
      teacher: "Farhana Ahmed",
      pending: 1,
    },
    {
      id: "section-g6-a",
      levelId: "level-g6",
      name: "A",
      capacity: 36,
      occupied: 29,
      campus: "Stravix Main Campus",
      shift: "Day · 09:00–14:30",
      teacher: "Nusrat Karim",
      pending: 0,
    },
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `section-c${i + 2}-a`,
      levelId: `level-c${i + 2}`,
      name: "A",
      capacity: 40,
      occupied: 25 + ((i * 3) % 14),
      campus: "Stravix Main Campus",
      shift: i % 2 ? "Day · 09:00–14:30" : "Morning · 08:00–12:30",
      teacher: this.classTeachers[i % this.classTeachers.length],
      pending: i % 3,
    })),
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `section-c${i + 2}-b`,
      levelId: `level-c${i + 2}`,
      name: "B",
      capacity: 40,
      occupied: 22 + ((i * 4) % 17),
      campus: "Stravix Main Campus",
      shift: i % 2 ? "Afternoon · 13:00–17:30" : "Morning · 08:00–12:30",
      teacher: this.classTeachers[(i + 2) % this.classTeachers.length],
      pending: (i + 1) % 3,
    })),
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `section-gulshan-${i + 1}`,
      levelId: `level-${i === 0 ? "g6" : `c${i}`}`,
      name: i % 2 ? "B" : "A",
      capacity: 36,
      occupied: 24 + ((i * 3) % 12),
      campus: "Gulshan Campus",
      shift: i % 2 ? "Day · 09:00–14:30" : "Morning · 08:00–12:30",
      teacher: this.classTeachers[(i + 1) % this.classTeachers.length],
      pending: i % 2,
    })),
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `section-chattogram-${i + 1}`,
      levelId: `level-c${i + 1}`,
      name: i < 2 ? "A" : "B",
      capacity: 32,
      occupied: 20 + ((i * 2) % 12),
      campus: "Chattogram Campus",
      shift: i % 2 ? "Afternoon · 13:00–17:30" : "Morning · 08:00–12:30",
      teacher: this.classTeachers[(i + 3) % this.classTeachers.length],
      pending: (i + 1) % 2,
    })),
  ];
  applicationCampus = "Stravix Main Campus";
  applicationsView: "list" | "cards" = "list";
  applicationSearch = "";
  applicationPage = 1;
  applicationPageSize = 20;
  applicationCreateSubmitted = false;
  applicationCreateErrors: Record<string, string> = {};
  applicationNew = {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    guardianName: "",
    guardianRelation: "",
    guardianPhone: "",
    guardianEmail: "",
    className: "",
    applicantCategory: "General",
    group: "",
  };
  applicationPhotoName = "";
  applicationPhotoReviewOpen = false;
  applicationAdminOverride = false;
  applicationDocumentName = "";
  applicationDocumentType = "";
  applicationEditOpen = false;
  applicationEditSubmitted = false;
  applicationEditErrors: Record<string, string> = {};
  applicationEditForm: Record<string, string> = {};
  applicationConfirmAction: "verify" | "approve" | "reject" | "delete" | null =
    null;
  applicationPaymentOpen = false;
  applicationPaymentError = "";
  applicationPayment = {
    status: "pending",
    method: "manual",
    reference: "",
    date: "",
    amount: "",
    note: "",
  };
  applicationAdmitCardOpen = false;
  applicationSignatureDocument: string | null = null;
  applicationSignatureDrawn = false;
  selectedApplicationActivity: EducationApplicationActivity | null = null;
  applicationActivityExpanded = false;
  applicationActivityLog: EducationApplicationActivity[] = [];
  readonly applicationPaymentMethods = [
    "Manual",
    "bKash",
    "Bank transfer",
    "Online bank",
  ];
  readonly applicationCategories = [
    "General",
    "Sibling",
    "Transfer",
    "Staff family",
  ];
  readonly applicationDocumentTypes = [
    "Birth certificate",
    "Previous school record",
    "Guardian identity",
    "Transfer certificate",
  ];
  readonly applicationGroups = [
    "General",
    "Science",
    "Business Studies",
    "Humanities",
  ];
  readonly applicationPageSizes = [10, 20, 50];
  mockApplications: EducationApplication[] = Array.from(
    { length: 32 },
    (_, i) => {
      const name = students[(i + 2) % students.length].split(" ");
      const status = (
        [
          "submitted",
          "verified",
          "draft",
          "approved",
          "submitted",
          "rejected",
          "verified",
          "submitted",
        ] as EducationApplication["status"][]
      )[i % 8];
      const campus =
        i < 28
          ? "Stravix Main Campus"
          : i < 30
            ? "Gulshan Campus"
            : "Chattogram Campus";
      return {
        id: `app-26-${String(i + 1).padStart(4, "0")}`,
        applicationNo: `ADM-2026-${String(1041 + i).padStart(4, "0")}`,
        studentFirstName: name[0],
        studentLastName: name.slice(1).join(" "),
        guardianName: `${i % 3 === 0 ? "Mrs." : i % 3 === 1 ? "Mr." : "Ms."} ${students[(i + 4) % students.length].split(" ").at(-1)}`,
        guardianPhone: `+880 17${String(13000000 + i * 173).slice(0, 8)}`,
        status,
        campus,
        created: `${24 - (i % 19)} Sep 2026`,
        className: this.classLevels[i % this.classLevels.length].name,
        category:
          this.applicationCategories[i % this.applicationCategories.length],
        group: this.applicationGroups[i % this.applicationGroups.length],
        documents:
          i % 4 === 0
            ? []
            : [
                {
                  name: "Birth certificate",
                  verified: i % 3 !== 0,
                  fileName: `birth-certificate-${1041 + i}.pdf`,
                  size: "1.2 MB",
                  signed: i % 7 === 0,
                },
                {
                  name: "Previous school record",
                  verified: i % 5 === 0,
                  fileName: `previous-school-record-${1041 + i}.pdf`,
                  size: "856 KB",
                },
              ],
        enrolledStudentId:
          status === "approved"
            ? `STU-26-${String(501 + i).padStart(4, "0")}`
            : undefined,
        feeAssigned: status === "approved" && i % 2 === 0,
        dateOfBirth: `${2011 + (i % 6)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 26) + 1).padStart(2, "0")}`,
        gender: i % 2 ? "Female" : "Male",
        guardianRelation:
          i % 3 === 0 ? "Mother" : i % 3 === 1 ? "Father" : "Guardian",
        guardianEmail: `guardian.${1041 + i}@mail.example`,
        section: ["A", "B", "C"][i % 3],
        feeStatus:
          status === "approved" && i % 2 === 0
            ? "paid"
            : i % 4 === 1
              ? "pending_verification"
              : "pending",
        admissionFee: 6500 + (i % 4) * 500,
        paidAmount:
          status === "approved" && i % 2 === 0 ? 6500 + (i % 4) * 500 : 0,
        paymentMethod:
          status === "approved" && i % 2 === 0
            ? ["Manual", "bKash", "Bank transfer"][i % 3]
            : undefined,
        payerAccount:
          status === "approved" && i % 2 === 0
            ? `TXN-ADM-${1041 + i}`
            : undefined,
        paymentDate:
          status === "approved" && i % 2 === 0
            ? `${12 + (i % 12)} Sep 2026`
            : undefined,
        receiptNo:
          status === "approved" && i % 2 === 0
            ? `RC-26-${String(2801 + i).padStart(4, "0")}`
            : undefined,
        campaignTitle: "2026–27 General Admission",
        campaignId: "campaign-26-general",
        campaignVersion: 3,
        approvedAt:
          status === "approved" ? `${18 + (i % 7)} Sep 2026` : undefined,
      };
    },
  );
  routePath = "";
  selectedAcademicYear = "2026–27";
  selectedCampus = "Stravix Main Campus";
  readonly pageSizes = [10, 20, 50];
  readonly classes = classes;
  readonly gradeOptions = [
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
  ];
  readonly studentSections = studentSections;
  readonly reviewStates = [
    "populated",
    "empty",
    "loading",
    "error",
    "validation",
    "success",
    "forbidden",
  ];
  readonly courses = courses;
  readonly classOptions = classes;
  readonly courseOptions = courses;
  readonly studentTabs = [
    { id: "overview", label: "Overview" },
    { id: "academic", label: "Academic History" },
    { id: "attendance", label: "Attendance" },
    { id: "exams", label: "Exams & Results" },
    { id: "access", label: "Access & Audit" },
  ];
  readonly studentAcademicHistory = [
    {
      when: "18 Aug 2026",
      action: "Promoted",
      from: "Grade 7 / Green",
      to: "Grade 8 / Blue",
      session: "2025–26 → 2026–27",
      by: "Nadia Akter",
      note: "Annual promotion",
    },
    {
      when: "06 Jan 2026",
      action: "Section changed",
      from: "Grade 7 / Rose",
      to: "Grade 7 / Green",
      session: "2025–26",
      by: "School Admin",
      note: "Midyear balancing",
    },
    {
      when: "15 Jun 2025",
      action: "Enrolled",
      from: "—",
      to: "Grade 7 / Rose",
      session: "2025–26",
      by: "Admissions",
      note: "Admission approved",
    },
  ];
  readonly studentAttendanceHistory = Array.from({ length: 18 }, (_, i) => ({
    when: `${22 - (i % 12)} Sep 2026 · ${i % 4 === 0 ? "08:14" : "08:03"}`,
    className: classes[i % classes.length],
    sectionName: classes[i % classes.length].split(" · ")[1],
    subjectCode: ["MTH-08", "SCI-08", "ENG-08", "ICT-08"][i % 4],
    status: i % 8 === 0 ? "Late" : i % 11 === 0 ? "Absent" : "Present",
    recordedBy: instructors[i % instructors.length],
    markedAt: i % 4 === 0 ? "08:14" : "08:03",
  }));
  readonly studentExamResults = [
    {
      entered: "22 Sep 2026",
      term: "Term 2",
      className: "Grade 8",
      section: "Blue",
      subject: "MTH-08",
      type: "Monthly test",
      marks: "42 / 50",
      percent: "84%",
      grade: "A",
      pass: "Yes",
      publish: "Final",
      remarks: "Strong progress",
    },
    {
      entered: "18 Sep 2026",
      term: "Term 2",
      className: "Grade 8",
      section: "Blue",
      subject: "SCI-08",
      type: "Practical",
      marks: "45 / 50",
      percent: "90%",
      grade: "A+",
      pass: "Yes",
      publish: "Final",
      remarks: "Excellent lab work",
    },
    {
      entered: "12 Sep 2026",
      term: "Term 2",
      className: "Grade 8",
      section: "Blue",
      subject: "ENG-08",
      type: "Class test",
      marks: "36 / 40",
      percent: "90%",
      grade: "A+",
      pass: "Yes",
      publish: "Final",
      remarks: "Clear written work",
    },
  ];
  readonly studentAuditTrail = [
    {
      when: "24 Sep 2026 · 09:42",
      action: "Profile viewed",
      actor: "Registrar · Nadia Akter",
      note: "Student record opened",
    },
    {
      when: "18 Aug 2026 · 14:16",
      action: "Academic promotion",
      actor: "School Admin",
      note: "Moved to Grade 8 · Blue",
    },
    {
      when: "15 Jun 2025 · 11:08",
      action: "Student registered",
      actor: "Admissions team",
      note: "Initial profile created",
    },
  ];
  readonly transferCertificates = [
    {
      number: "TC-25-0014",
      session: "2024–25",
      issued: "18 Jun 2025",
      by: "Registrar",
      reason: "School transfer",
    },
  ];
  readonly guideSections: [string, string][] = [
    [
      "Set the academic context",
      "Confirm the active academic year and campus or learning centre before working with records.",
    ],
    [
      "Keep learner records connected",
      "Link guardians, classes, enrolments, attendance, billing, and communications to the same learner profile.",
    ],
    [
      "Review and complete the workflow",
      "Use the visible status, assigned owner, and due date to move the record through its next step.",
    ],
    [
      "Use sample actions safely",
      "This Site is a local design preview; save, export, and communication actions show browser-only outcomes.",
    ],
  ];

  get navItems(): { label: string; path: string }[] {
    if (this.page?.app.includes("Training"))
      return [
        {
          label: "Operations dashboard",
          path: "/app/training-institute/learning/dashboard",
        },
        { label: "Courses", path: "/app/training-institute/learning/courses" },
        {
          label: "Course offerings",
          path: "/app/training-institute/learning/runs",
        },
        { label: "Learners", path: "/app/training-institute/trainees" },
        {
          label: "Admissions",
          path: "/app/training-institute/admission-applications",
        },
        {
          label: "Programmes & batches",
          path: "/app/training-institute/programmes",
        },
        { label: "Instructors", path: "/app/training-institute/instructors" },
        {
          label: "Payments",
          path: "/app/training-institute/learning/payments",
        },
        {
          label: "Analytics",
          path: "/app/training-institute/learning/analytics",
        },
        {
          label: "Instructor workspace",
          path: "/app/training-institute/learning/instructor/dashboard",
        },
      ];
    if (this.page?.app.includes("Guardian"))
      return [
        { label: "Family overview", path: "/app/guardian/home" },
        { label: "My students", path: "/app/guardian/students" },
        { label: "Fee accounts", path: "/app/guardian/fees" },
        { label: "My profile", path: "/app/guardian/profile" },
      ];
    return [
      { label: "School overview", path: "/app/school-management/home" },
      { label: "Dashboard", path: "/app/school-management/dashboard" },
      { label: "Students", path: "/app/school-management/students" },
      {
        label: "Admissions",
        path: "/app/school-management/admissions/applications",
      },
      { label: "Teachers", path: "/app/school-management/teachers" },
      {
        label: "Attendance",
        path: "/app/school-management/attendance/daily-marking",
      },
      {
        label: "Exams & results",
        path: "/app/school-management/exams/schedules",
      },
      {
        label: "Classes & timetable",
        path: "/app/school-management/timetable",
      },
      { label: "Fees", path: "/app/school-management/fees" },
      { label: "Assignments", path: "/app/school-management/assignments" },
      { label: "Announcements", path: "/app/school-management/announcements" },
      {
        label: "School setup",
        path: "/app/school-management/settings/school-identity",
      },
    ];
  }

  get navGroups(): EducationNavGroup[] {
    if (this.page?.app.includes("Training"))
      return [
        {
          label: "Overview",
          items: [
            {
              label: "Learning dashboard",
              path: "/app/training-institute/learning/dashboard",
            },
          ],
        },
        {
          label: "Institute identity & branding",
          items: [
            {
              label: "Institute identity",
              path: "/app/training-institute/settings/identity",
            },
            {
              label: "Public site & portal",
              path: "/app/training-institute/settings/public-site",
            },
          ],
        },
        {
          label: "Catalogue & delivery",
          items: [
            {
              label: "Course categories",
              path: "/app/training-institute/learning/settings/course-categories",
            },
            {
              label: "Courses",
              path: "/app/training-institute/learning/courses",
            },
            {
              label: "Course offerings",
              path: "/app/training-institute/learning/runs",
            },
            {
              label: "Certificates",
              path: "/app/training-institute/learning/certificates",
            },
            {
              label: "Live sessions",
              path: "/app/training-institute/learning/live",
            },
          ],
        },
        {
          label: "Learners & admissions",
          items: [
            {
              label: "Admission campaigns",
              path: "/app/training-institute/admission-campaigns",
            },
            {
              label: "Applications",
              path: "/app/training-institute/admission-applications",
            },
            {
              label: "Course inquiries",
              path: "/app/training-institute/course-inquiries",
            },
            { label: "Support inbox", path: "/app/training-institute/support" },
            {
              label: "Enrollment requests",
              path: "/app/training-institute/learning/enrollment-requests",
            },
            { label: "Trainees", path: "/app/training-institute/trainees" },
          ],
        },
        {
          label: "Institute operations",
          items: [
            { label: "Programmes", path: "/app/training-institute/programmes" },
            { label: "Batches", path: "/app/training-institute/batches" },
            {
              label: "Instructors",
              path: "/app/training-institute/instructors",
            },
            {
              label: "Payments",
              path: "/app/training-institute/learning/payments",
            },
            {
              label: "Moderation",
              path: "/app/training-institute/learning/moderation",
            },
          ],
        },
        {
          label: "Insights",
          items: [
            {
              label: "Learning analytics",
              path: "/app/training-institute/learning/analytics",
            },
            {
              label: "Audit timeline",
              path: "/app/training-institute/learning/audit",
            },
            {
              label: "Notification delivery",
              path: "/app/training-institute/learning/notifications",
            },
          ],
        },
        ...(this.routePath.includes("/learning/instructor/")
          ? [
              {
                label: "Instructor workspace",
                items: [
                  ["Dashboard", "instructor/dashboard"],
                  ["My batches", "instructor/batches"],
                  ["My courses", "instructor/courses"],
                  ["Course authoring", "instructor/courses/authoring"],
                  ["Pending enrollments", "instructor/enrollment-requests"],
                  ["Create course", "instructor/courses/authoring/create"],
                  [
                    "Edit authored course",
                    "instructor/courses/authoring/CRS-DIGI-01/edit",
                  ],
                  [
                    "New course run",
                    "instructor/courses/authoring/CRS-DIGI-01/runs/new",
                  ],
                  [
                    "Edit course run",
                    "instructor/courses/authoring/CRS-DIGI-01/runs/RUN-26-B/edit",
                  ],
                  [
                    "Course question banks",
                    "instructor/courses/CRS-DIGI-01/question-banks",
                  ],
                  [
                    "Question bank detail",
                    "instructor/courses/CRS-DIGI-01/question-banks/QB-DIGI-01",
                  ],
                  ["Course content", "instructor/courses/CRS-DIGI-01/content"],
                  ["Course detail", "instructor/courses/CRS-DIGI-01"],
                  ["My work", "instructor/work"],
                  ["Calendar", "instructor/calendar"],
                  ["Batch detail", "instructor/batches/BAT-26-B"],
                  [
                    "Batch participants",
                    "instructor/batches/BAT-26-B/participants",
                  ],
                  ["Trainee progress", "instructor/trainees/TRN-126/progress"],
                  [
                    "Participant progress",
                    "instructor/batches/BAT-26-B/participants/TRN-126/progress",
                  ],
                  ["My profile", "instructor/profile"],
                  [
                    "Batch attendance",
                    "instructor/batches/BAT-26-B/attendance",
                  ],
                  [
                    "Batch communications",
                    "instructor/batches/BAT-26-B/communications",
                  ],
                  ["Run detail", "instructor/runs/RUN-26-B"],
                  ["Manage run", "instructor/runs/RUN-26-B/manage"],
                  ["Run plan", "instructor/runs/RUN-26-B/plan"],
                  ["Run sessions", "instructor/runs/RUN-26-B/sessions"],
                  ["Run messages", "instructor/runs/RUN-26-B/messages"],
                  ["Enrolled learners", "instructor/runs/RUN-26-B/learners"],
                  ["Run attendance", "instructor/runs/RUN-26-B/attendance"],
                  [
                    "Create assignment",
                    "instructor/runs/RUN-26-B/assignments/new",
                  ],
                  [
                    "Edit assignment",
                    "instructor/runs/RUN-26-B/assignments/ASN-26-01/edit",
                  ],
                  [
                    "Assignment detail",
                    "instructor/runs/RUN-26-B/assignments/ASN-26-01",
                  ],
                  ["Assignment review", "instructor/runs/RUN-26-B/assignments"],
                ].map(([label, path]) => ({
                  label,
                  path: `/app/training-institute/learning/${path}`,
                })),
              },
            ]
          : []),
      ];
    if (this.page?.app.includes("Guardian"))
      return [
        {
          label: "Family portal",
          items: [
            { label: "My students", path: "/app/guardian/home" },
            { label: "Student list", path: "/app/guardian/students" },
            { label: "Fee accounts", path: "/app/guardian/fees" },
            {
              label: "Online payment",
              path: "/app/guardian/fees/online-payment",
            },
            {
              label: "Bank transfer",
              path: "/app/guardian/fees/bank-transfer",
            },
            { label: "Profile", path: "/app/guardian/profile" },
          ],
        },
      ];
    return [
      {
        label: "Overview",
        items: [
          { label: "Home", path: "/app/school-management/home" },
          { label: "Dashboard", path: "/app/school-management/dashboard" },
        ],
      },
      {
        label: "School setup",
        items: [
          {
            label: "School identity",
            path: "/app/school-management/settings/school-identity",
          },
          {
            label: "Branches",
            path: "/app/school-management/settings/branches",
          },
          {
            label: "Academic years",
            path: "/app/school-management/settings/academic-sessions",
          },
          {
            label: "Academic year rollover",
            path: "/app/school-management/settings/academic-year-rollover",
          },
          {
            label: "Academic groups",
            path: "/app/school-management/settings/academic-groups",
          },
          {
            label: "Curriculum setup wizard",
            path: "/app/school-management/settings/curriculum-setup-wizard",
          },
          {
            label: "Classes & sections",
            path: "/app/school-management/classes",
          },
          { label: "Shifts", path: "/app/school-management/shifts" },
          { label: "Subjects", path: "/app/school-management/subjects" },
          {
            label: "Class subjects",
            path: "/app/school-management/class-subjects",
          },
          {
            label: "Subject teachers",
            path: "/app/school-management/subject-teachers",
          },
          {
            label: "Teacher workload",
            path: "/app/school-management/teacher-workload",
          },
          { label: "Classrooms", path: "/app/school-management/classrooms" },
          { label: "Timetable", path: "/app/school-management/timetable" },
        ],
      },
      {
        label: "Admissions",
        items: [
          {
            label: "Admission rules",
            path: "/app/school-management/admissions/rules",
          },
          {
            label: "Admission campaigns",
            path: "/app/school-management/admissions/campaigns",
          },
          {
            label: "Document types",
            path: "/app/school-management/admissions/setup/document-types",
          },
          {
            label: "Applicant categories",
            path: "/app/school-management/admissions/setup/applicant-categories",
          },
          {
            label: "Create application",
            path: "/app/school-management/admissions/applications/create",
          },
          {
            label: "Applications",
            path: "/app/school-management/admissions/applications",
          },
          {
            label: "Admission statistics",
            path: "/app/school-management/admissions/statistics",
          },
          {
            label: "Admission logs",
            path: "/app/school-management/admissions/logs",
          },
          {
            label: "Student promotions",
            path: "/app/school-management/admissions/promotions",
          },
          {
            label: "Promotion history",
            path: "/app/school-management/admissions/promotion-history",
          },
          {
            label: "Guardians",
            path: "/app/school-management/admissions/guardians",
          },
          {
            label: "Roll & ID rules",
            path: "/app/school-management/admissions/identity-rules",
          },
          { label: "Public application", path: "/app/admissions/apply" },
        ],
      },
      {
        label: "Student records",
        items: [
          { label: "Students", path: "/app/school-management/students" },
          {
            label: "Register student",
            path: "/app/school-management/students/new",
          },
          {
            label: "Student exports",
            path: "/app/school-management/students/exports",
          },
          {
            label: "Bulk import",
            path: "/app/school-management/students/bulk-import",
          },
          {
            label: "Student requests",
            path: "/app/school-management/students/requests",
          },
          {
            label: "My student profile",
            path: "/app/school-management/students/me",
          },
          { label: "Teachers", path: "/app/school-management/teachers" },
          {
            label: "Register teacher",
            path: "/app/school-management/teachers/new",
          },
          {
            label: "My teacher profile",
            path: "/app/school-management/teachers/me/profile",
          },
        ],
      },
      {
        label: "Attendance",
        items: [
          {
            label: "Attendance workspace",
            path: "/app/school-management/attendance/workspace",
          },
          {
            label: "Daily marking",
            path: "/app/school-management/attendance/daily-marking",
          },
          {
            label: "Bulk upload",
            path: "/app/school-management/attendance/student/bulk-upload",
          },
          {
            label: "Student reports",
            path: "/app/school-management/attendance/students/reports",
          },
          {
            label: "Student detail report",
            path: "/app/school-management/attendance/students/detail-report",
          },
          {
            label: "Teacher attendance",
            path: "/app/school-management/attendance/teacher-attendance",
          },
          {
            label: "Edit requests",
            path: "/app/school-management/attendance/edit-requests",
          },
          {
            label: "Policy & holidays",
            path: "/app/school-management/attendance/policy-holidays",
          },
          {
            label: "Notifications",
            path: "/app/school-management/attendance/notifications",
          },
          {
            label: "Devices",
            path: "/app/school-management/attendance/devices",
          },
          {
            label: "Student attendance",
            path: "/app/school-management/student/attendance/me",
          },
          {
            label: "Guardian attendance",
            path: "/app/school-management/attendance/guardian",
          },
        ],
      },
      {
        label: "Exams & results",
        items: [
          { label: "Exam terms", path: "/app/school-management/exams/terms" },
          {
            label: "Subject marks",
            path: "/app/school-management/exams/subject-marks",
          },
          {
            label: "Schedule planning",
            path: "/app/school-management/exams/schedules/plan",
          },
          {
            label: "Exam schedules",
            path: "/app/school-management/exams/schedules",
          },
          { label: "Marks entry", path: "/app/school-management/exams/marks" },
          { label: "Results", path: "/app/school-management/exams/results" },
          {
            label: "Corrections",
            path: "/app/school-management/exams/corrections",
          },
          { label: "Exam papers", path: "/app/school-management/exams/papers" },
          {
            label: "Notifications & analytics",
            path: "/app/school-management/exams/notifications-analytics",
          },
          { label: "My exams", path: "/app/school-management/exams/me" },
          {
            label: "Guardian exams",
            path: "/app/school-management/exams/guardian",
          },
          { label: "Quizzes", path: "/app/school-management/quizzes" },
          { label: "My quizzes", path: "/app/school-management/quizzes/me" },
        ],
      },
      {
        label: "Student billing",
        items: [
          { label: "Billing home", path: "/app/school-management/fees" },
          {
            label: "Fee audit reports",
            path: "/app/school-management/fees/audit-reports",
          },
          {
            label: "Fee heads",
            path: "/app/school-management/settings/fee-heads",
          },
          {
            label: "Fee terms",
            path: "/app/school-management/settings/fee-terms",
          },
          {
            label: "Fee templates",
            path: "/app/school-management/settings/fee-templates",
          },
          {
            label: "Pricing rules",
            path: "/app/school-management/settings/fee-pricing-rules",
          },
          {
            label: "Fee schedules",
            path: "/app/school-management/settings/fee-schedules",
          },
          {
            label: "Late fee rules",
            path: "/app/school-management/settings/fee-fine-rules",
          },
          {
            label: "Discount types",
            path: "/app/school-management/settings/fee-discount-types",
          },
          {
            label: "Fee overrides",
            path: "/app/school-management/settings/fee-overrides",
          },
          {
            label: "Bulk invoices",
            path: "/app/school-management/settings/fee-bulk-invoices",
          },
          {
            label: "Single invoice",
            path: "/app/school-management/settings/fee-single-invoice",
          },
          {
            label: "Invoice delivery",
            path: "/app/school-management/settings/fee-delivery",
          },
          {
            label: "Online payments",
            path: "/app/school-management/settings/fee-online-payments",
          },
          {
            label: "Transfer verification",
            path: "/app/school-management/settings/fee-bank-transfer-verification",
          },
          {
            label: "Counter collection",
            path: "/app/school-management/settings/fee-counter-collection",
          },
          {
            label: "Finance education billing",
            path: "/app/finance/education-billing/overview",
          },
          {
            label: "Fee catalog",
            path: "/app/finance/education-billing/catalog",
          },
          {
            label: "Fee plans",
            path: "/app/finance/education-billing/fee-plans",
          },
          {
            label: "Billing accounts & audit",
            path: "/app/finance/education-billing/audit",
          },
          { label: "Finance receivables", path: "/app/finance/receivables" },
        ],
      },
      {
        label: "Learning & engagement",
        items: [
          { label: "Assignments", path: "/app/school-management/assignments" },
          {
            label: "My assignments",
            path: "/app/school-management/assignments/me",
          },
          {
            label: "Announcements",
            path: "/app/school-management/announcements",
          },
          {
            label: "My announcements",
            path: "/app/school-management/announcements/my",
          },
          {
            label: "Parent–teacher messages",
            path: "/app/school-management/messaging/parent-teacher",
          },
          {
            label: "Message reports",
            path: "/app/school-management/messaging/student-teacher-reports",
          },
          {
            label: "Meeting availability",
            path: "/app/school-management/meetings/availability",
          },
          {
            label: "Book a meeting",
            path: "/app/school-management/meetings/book",
          },
          {
            label: "Meeting oversight",
            path: "/app/school-management/meetings/bookings",
          },
          {
            label: "Student ID cards",
            path: "/app/school-management/id-cards/students",
          },
          {
            label: "Staff ID cards",
            path: "/app/school-management/id-cards/staff",
          },
        ],
      },
      {
        label: "Public website",
        items: [
          {
            label: "Public page",
            path: "/app/school-management/settings/public-page",
          },
          {
            label: "Events",
            path: "/app/school-management/settings/public-events",
          },
          {
            label: "Notices",
            path: "/app/school-management/settings/public-notices",
          },
        ],
      },
      {
        label: "Guides",
        items: [
          { label: "User manual", path: "/app/school-management/user-manual" },
          {
            label: "Business process guide",
            path: "/app/school-management/business-process-guide",
          },
          {
            label: "Component reference guide",
            path: "/app/school-management/app.component-reference-guide",
          },
        ],
      },
    ];
  }

  isCurrentNav(path: string): boolean {
    return this.routePath === path;
  }
  isNavGroupActive(group: EducationNavGroup): boolean {
    return group.items.some(
      (item) =>
        this.isCurrentNav(item.path) ||
        this.routePath.startsWith(`${item.path}/`),
    );
  }

  constructor() {
    this.sync();
    const subscription = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe(() => this.sync());
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  get state(): string {
    return (
      new URLSearchParams(this.router.url.split("?")[1] ?? "").get(
        "mockState",
      ) ?? "populated"
    );
  }
  get filteredRows(): EducationRow[] {
    const query = this.search.trim().toLowerCase();
    return this.rows.filter((row) => {
      const studentGrade = row.values[0]?.split(" · ")[0] ?? "";
      const studentSection = row.values[0]?.split(" · ")[1] ?? "";
      return (
        (!query ||
          `${row.code} ${row.name} ${row.email ?? ""} ${row.detail} ${row.values.join(" ")}`
            .toLowerCase()
            .includes(query)) &&
        (!this.statusFilter || row.status === this.statusFilter) &&
        (!this.scopeFilter ||
          (this.isStudentDirectory
            ? studentGrade === this.scopeFilter
            : `${row.detail} ${row.values.join(" ")}`
                .toLowerCase()
                .includes(this.scopeFilter.toLowerCase()))) &&
        (!this.sectionFilter || studentSection === this.sectionFilter)
      );
    });
  }
  get filteredUserRequests(): EducationUserRequest[] {
    const query = this.requestSearch.trim().toLowerCase();
    return this.userRequests
      .filter(
        (request) =>
          (!query ||
            `${request.id} ${request.requesterName} ${request.requesterEmail} ${request.note}`
              .toLowerCase()
              .includes(query)) &&
          (!this.requestTypeFilter ||
            request.type === this.requestTypeFilter) &&
          (!this.requestStatusFilter ||
            request.status === this.requestStatusFilter),
      )
      .sort((a, b) => {
        const left =
          this.requestSortBy === "createdAt"
            ? a.createdAt
            : a[this.requestSortBy];
        const right =
          this.requestSortBy === "createdAt"
            ? b.createdAt
            : b[this.requestSortBy];
        const comparison = left.localeCompare(right);
        return this.requestSortDir === "asc" ? comparison : -comparison;
      });
  }
  get visibleUserRequests(): EducationUserRequest[] {
    return this.filteredUserRequests.slice(
      (this.requestPage - 1) * this.requestPageSize,
      this.requestPage * this.requestPageSize,
    );
  }
  get filteredAcademicSessions(): MockAcademicSession[] {
    const query = this.academicSessionSearch.trim().toLowerCase();
    return this.academicSessions
      .filter(
        (session) =>
          !query ||
          `${session.name} ${session.start} ${session.end} ${session.active ? "active" : "inactive"} ${session.locked ? "locked" : "unlocked"}`
            .toLowerCase()
            .includes(query),
      )
      .sort((a, b) => b.year - a.year);
  }
  get visibleAcademicSessions(): MockAcademicSession[] {
    return this.filteredAcademicSessions.slice(
      (this.academicSessionPage - 1) * this.academicSessionPageSize,
      this.academicSessionPage * this.academicSessionPageSize,
    );
  }
  get academicSessionPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.filteredAcademicSessions.length / this.academicSessionPageSize,
      ),
    );
  }
  get academicSessionFirst(): number {
    return this.filteredAcademicSessions.length
      ? (this.academicSessionPage - 1) * this.academicSessionPageSize + 1
      : 0;
  }
  get academicSessionLast(): number {
    return Math.min(
      this.academicSessionPage * this.academicSessionPageSize,
      this.filteredAcademicSessions.length,
    );
  }
  get userRequestPageCount(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredUserRequests.length / this.requestPageSize),
    );
  }
  get userRequestFirst(): number {
    return this.filteredUserRequests.length
      ? (this.requestPage - 1) * this.requestPageSize + 1
      : 0;
  }
  get userRequestLast(): number {
    return Math.min(
      this.requestPage * this.requestPageSize,
      this.filteredUserRequests.length,
    );
  }
  get pendingUserRequestCount(): number {
    return this.userRequests.filter((request) => request.status === "pending")
      .length;
  }
  get newProfileRequestCount(): number {
    return this.userRequests.filter(
      (request) =>
        request.status === "pending" && request.type === "new_profile",
    ).length;
  }
  get guardianLinkRequestCount(): number {
    return this.userRequests.filter(
      (request) =>
        request.status === "pending" && request.type === "guardian_link",
    ).length;
  }
  get pageCount(): number {
    return this.isStudentRequests
      ? this.userRequestPageCount
      : Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }
  get firstVisible(): number {
    return this.isStudentRequests
      ? this.userRequestFirst
      : this.filteredRows.length
        ? (this.currentPage - 1) * this.pageSize + 1
        : 0;
  }
  get lastVisible(): number {
    return this.isStudentRequests
      ? this.userRequestLast
      : Math.min(this.currentPage * this.pageSize, this.filteredRows.length);
  }
  get visibleRows(): EducationRow[] {
    return this.filteredRows.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize,
    );
  }
  get stateTitle(): string {
    return (
      (
        {
          empty: "No records match this view",
          loading: "Loading this workspace",
          error: "This view could not be loaded",
          validation: "Required information needs attention",
          success: "Sample action completed",
          forbidden: "This view is restricted",
        } as Record<string, string>
      )[this.state] ?? ""
    );
  }
  get stateDescription(): string {
    return (
      (
        {
          empty:
            "Adjust the filters or clear them to return to the sample records.",
          loading: "The mock is showing a loading state for design review.",
          error: "The sample service is unavailable in this preview state.",
          validation:
            "Complete the required fields before saving this sample record.",
          success: "The preview action finished locally in this browser.",
          forbidden:
            "The selected sample role does not have access to this screen.",
        } as Record<string, string>
      )[this.state] ?? ""
    );
  }
  get stateOnly(): boolean {
    return ["empty", "loading", "error", "forbidden"].includes(this.state);
  }
  get isStudentDirectory(): boolean {
    return this.routePath === "/app/school-management/students";
  }
  get isStudentRequests(): boolean {
    return this.routePath === "/app/school-management/students/requests";
  }
  get isAcademicSessions(): boolean {
    return (
      this.routePath === "/app/school-management/settings/academic-sessions"
    );
  }
  get isSchoolIdentity(): boolean {
    return this.routePath === "/app/school-management/settings/school-identity";
  }
  get isClassStructure(): boolean {
    return this.routePath === "/app/school-management/classes";
  }
  get isApplicationsList(): boolean {
    return this.routePath === "/app/school-management/admissions/applications";
  }
  get isApplicationCreate(): boolean {
    return (
      this.routePath === "/app/school-management/admissions/applications/create"
    );
  }
  get isApplicationDetail(): boolean {
    return /^\/app\/school-management\/admissions\/applications\/[^/]+$/.test(
      this.routePath,
    );
  }
  get applicationDetail(): EducationApplication | undefined {
    if (!this.isApplicationDetail) return undefined;
    const id = this.routePath.split("/").at(-1);
    return this.mockApplications.find(
      (application) =>
        application.id === id || application.applicationNo === id,
    );
  }
  get applicationPaidAmount(): number {
    return this.applicationDetail?.paidAmount ?? 0;
  }
  get applicationDueAmount(): number {
    return Math.max(
      0,
      (this.applicationDetail?.admissionFee ?? 0) - this.applicationPaidAmount,
    );
  }
  get applicationPaymentStatusLabel(): string {
    const status = this.applicationDetail?.feeStatus ?? "pending";
    return status === "pending_verification"
      ? "Pending verification"
      : status === "paid"
        ? "Paid"
        : "Pending";
  }
  get applicationPolicyLocked(): boolean {
    return ["submitted", "verified", "approved"].includes(
      this.applicationDetail?.status ?? "",
    );
  }
  get applicationActivity(): EducationApplicationActivity[] {
    const application = this.applicationDetail;
    if (!application) return [];
    const entries: EducationApplicationActivity[] = [
      {
        title: "Application received",
        detail: `${application.applicationNo} created for ${application.campus}.`,
        when: `${application.created} · 09:18`,
      },
      ...(application.documents.length
        ? [
            {
              title: "Supporting documents attached",
              detail: `${application.documents.length} documents are on file for review.`,
              when: `${application.created} · 09:24`,
            },
          ]
        : []),
      ...(application.documents.some((document) => document.verified)
        ? [
            {
              title: "Document review updated",
              detail: "At least one supporting document has been verified.",
              when: "23 Sep 2026 · 14:12",
            },
          ]
        : []),
      ...(application.status !== "draft"
        ? [
            {
              title: `Application ${application.status}`,
              detail: `Current lifecycle status is ${application.status}.`,
              when: application.approvedAt
                ? `${application.approvedAt} · 11:06`
                : "24 Sep 2026 · 10:42",
            },
          ]
        : []),
      ...this.applicationActivityLog,
    ];
    return entries;
  }
  get visibleApplicationActivity(): EducationApplicationActivity[] {
    return this.applicationActivity.slice(
      0,
      this.applicationActivityExpanded ? 8 : 4,
    );
  }
  get applicationDetailConfirmTitle(): string {
    return (
      (
        {
          verify: "Verify application?",
          approve: "Approve this application?",
          reject: "Reject application?",
          delete: "Delete application?",
        } as Record<string, string>
      )[this.applicationConfirmAction ?? ""] ?? ""
    );
  }
  get applicationDetailConfirmCopy(): string {
    const application = this.applicationDetail;
    return (
      (
        {
          verify: `Confirm that ${application?.applicationNo} has been reviewed before continuing.`,
          approve:
            "This will enroll the applicant as a student and continue the admission workflow.",
          reject: `Reject ${application?.applicationNo}? This local preview will update its status.`,
          delete: `Delete ${application?.applicationNo} from this browser preview?`,
        } as Record<string, string>
      )[this.applicationConfirmAction ?? ""] ?? ""
    );
  }
  get selectedClassLevel(): EducationClassLevel | undefined {
    return this.classLevels.find(
      (level) => level.id === this.selectedClassLevelId,
    );
  }
  get selectedClassSections(): EducationClassSection[] {
    return this.classSections.filter(
      (section) =>
        section.levelId === this.selectedClassLevelId &&
        section.campus === this.classCampus,
    );
  }
  get classSectionCount(): number {
    return this.classSections.filter(
      (section) => section.campus === this.classCampus,
    ).length;
  }
  classSectionsForLevel(levelId: string): EducationClassSection[] {
    return this.classSections.filter(
      (section) =>
        section.levelId === levelId && section.campus === this.classCampus,
    );
  }
  get filteredApplications(): EducationApplication[] {
    const query = this.applicationSearch.trim().toLowerCase();
    return this.mockApplications.filter(
      (application) =>
        application.campus === this.applicationCampus &&
        (!query ||
          `${application.applicationNo} ${application.studentFirstName} ${application.studentLastName} ${application.guardianName} ${application.guardianPhone}`
            .toLowerCase()
            .includes(query)),
    );
  }
  get visibleApplications(): EducationApplication[] {
    return this.filteredApplications.slice(
      (this.applicationPage - 1) * this.applicationPageSize,
      this.applicationPage * this.applicationPageSize,
    );
  }
  get applicationPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredApplications.length / this.applicationPageSize),
    );
  }
  get applicationFirst(): number {
    return this.filteredApplications.length
      ? (this.applicationPage - 1) * this.applicationPageSize + 1
      : 0;
  }
  get applicationLast(): number {
    return Math.min(
      this.applicationPage * this.applicationPageSize,
      this.filteredApplications.length,
    );
  }
  get isStudentDetail(): boolean {
    return /^\/app\/school-management\/students\/[^/]+$/.test(this.routePath);
  }
  get isStudentEdit(): boolean {
    return /^\/app\/school-management\/students\/[^/]+\/edit$/.test(
      this.routePath,
    );
  }
  get isStudentForm(): boolean {
    return (
      this.routePath === "/app/school-management/students/new" ||
      this.isStudentEdit
    );
  }
  get studentRecord(): EducationRow | undefined {
    if (!this.isStudentDetail && !this.isStudentEdit) return undefined;
    const code = this.routePath.split("/")[4];
    return this.rows.find((row) => row.code === code);
  }
  get filteredStudentAttendance(): typeof this.studentAttendanceHistory {
    return this.studentAttendanceClass
      ? this.studentAttendanceHistory.filter(
          (record) => record.className === this.studentAttendanceClass,
        )
      : this.studentAttendanceHistory;
  }
  get visibleStudentAttendance(): typeof this.studentAttendanceHistory {
    return this.filteredStudentAttendance.slice(
      (this.studentAttendancePage - 1) * this.studentAttendancePageSize,
      this.studentAttendancePage * this.studentAttendancePageSize,
    );
  }
  get studentAttendancePages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.filteredStudentAttendance.length / this.studentAttendancePageSize,
      ),
    );
  }
  get studentAttendanceLast(): number {
    return Math.min(
      this.studentAttendancePage * this.studentAttendancePageSize,
      this.filteredStudentAttendance.length,
    );
  }
  get statusOptions(): string[] {
    return this.isStudentDirectory
      ? ["Active", "Inactive"]
      : [...new Set(this.rows.map((row) => row.status))].sort();
  }
  get scopeOptions(): string[] {
    return this.isStudentDirectory
      ? this.gradeOptions
      : this.page.app.includes("Training")
        ? courses
        : classes;
  }
  get filteredSectionOptions(): string[] {
    return [
      ...new Set(
        this.rows
          .filter((row) => row.values[0]?.startsWith(`${this.scopeFilter} · `))
          .map((row) => row.values[0].split(" · ")[1])
          .filter(Boolean),
      ),
    ].sort();
  }
  get quickAccess(): { label: string; description: string; path: string }[] {
    if (this.page?.app.includes("Training"))
      return [
        {
          label: "Courses",
          description: "Catalogue and course authoring",
          path: "/app/training-institute/learning/courses",
        },
        {
          label: "Course offerings",
          description: "Cohorts, schedules and enrolment",
          path: "/app/training-institute/learning/runs",
        },
        {
          label: "Enrollment requests",
          description: "Review pending learner requests",
          path: "/app/training-institute/learning/enrollment-requests",
        },
        {
          label: "Certificates",
          description: "Review the certificate queue",
          path: "/app/training-institute/learning/certificates",
        },
        {
          label: "Live sessions",
          description: "Coordinate upcoming classes",
          path: "/app/training-institute/learning/live",
        },
        {
          label: "Payments",
          description: "Settlement and payment follow-up",
          path: "/app/training-institute/learning/payments",
        },
      ];
    if (this.page?.app.includes("Guardian"))
      return [
        {
          label: "My students",
          description: "Profiles, class details and progress",
          path: "/app/guardian/home",
        },
        {
          label: "Fee accounts",
          description: "Invoices, balances and payments",
          path: "/app/guardian/fees",
        },
      ];
    return [
      {
        label: "Students",
        description: "Admissions, records & guardian linkage",
        path: "/app/school-management/students",
      },
      {
        label: "Attendance",
        description: "Track daily student & teacher attendance",
        path: "/app/school-management/attendance",
      },
      {
        label: "Fees",
        description: "Templates, invoices, collection & payments",
        path: "/app/school-management/fees",
      },
      {
        label: "Exams",
        description: "Schedules, marks, results & report cards",
        path: "/app/school-management/exams",
      },
      {
        label: "School setup",
        description: "Identity, academic years & class structure",
        path: "/app/school-management/settings/school-identity",
      },
      {
        label: "Public page",
        description: "Notices & public-facing school profile",
        path: "/app/school-management/settings/public-page",
      },
    ];
  }

  setSearch(value: string): void {
    this.search = value;
    this.currentPage = 1;
  }
  setClassFilter(value: string): void {
    this.scopeFilter = value;
    this.sectionFilter = "";
    this.currentPage = 1;
  }
  setSectionFilter(value: string): void {
    this.sectionFilter = value;
    this.currentPage = 1;
  }
  setStudentTab(tab: string): void {
    this.studentTab = tab;
  }
  setStudentAttendanceClass(value: string): void {
    this.studentAttendanceClass = value;
    this.studentAttendancePage = 1;
  }
  setStudentAttendancePage(page: number): void {
    this.studentAttendancePage = Math.max(
      1,
      Math.min(this.studentAttendancePages, page),
    );
  }
  setStudentAttendancePageSize(size: number): void {
    this.studentAttendancePageSize = size;
    this.studentAttendancePage = 1;
  }
  openClassLevelForm(level?: EducationClassLevel): void {
    this.classEditingLevelId = level?.id ?? "";
    this.classForm = level
      ? { code: level.code, name: level.name, sortOrder: level.sortOrder }
      : { code: "", name: "", sortOrder: this.classLevels.length + 1 };
    this.classFormSubmitted = false;
    this.classCodeError = "";
    this.classNameError = "";
    this.classLevelDrawerOpen = true;
  }
  saveClassLevel(): void {
    this.classFormSubmitted = true;
    this.classCodeError = this.classForm.code.trim()
      ? ""
      : "Enter a class code.";
    this.classNameError = this.classForm.name.trim()
      ? ""
      : "Enter a class name.";
    if (
      this.classCodeError ||
      this.classNameError ||
      !Number.isFinite(Number(this.classForm.sortOrder))
    )
      return;
    if (this.classEditingLevelId) {
      this.classLevels = this.classLevels.map((level) =>
        level.id === this.classEditingLevelId
          ? {
              ...level,
              code: this.classForm.code.trim(),
              name: this.classForm.name.trim(),
              sortOrder: Number(this.classForm.sortOrder),
            }
          : level,
      );
      this.notify("Class level updated in this preview.");
    } else {
      const id = `level-${Date.now()}`;
      this.classLevels = [
        ...this.classLevels,
        {
          id,
          code: this.classForm.code.trim(),
          name: this.classForm.name.trim(),
          sortOrder: Number(this.classForm.sortOrder),
        },
      ].sort((a, b) => a.sortOrder - b.sortOrder);
      this.selectedClassLevelId = id;
      this.notify("Class level created in this preview.");
    }
    this.classLevelDrawerOpen = false;
  }
  openClassLevelFormFromEmptyState(): void {
    void this.router
      .navigateByUrl(this.routePath)
      .then(() => this.openClassLevelForm());
  }
  openClassSectionForm(section?: EducationClassSection): void {
    this.classEditingSectionId = section?.id ?? "";
    this.classSectionForm = section
      ? {
          name: section.name,
          capacity: section.capacity,
          campus: section.campus,
          shift: section.shift,
          teacher: section.teacher,
        }
      : {
          name: "",
          capacity: 32,
          campus: this.classCampus,
          shift: this.classShifts[0],
          teacher: "",
        };
    this.classFormSubmitted = false;
    this.classSectionNameError = "";
    this.classCapacityError = "";
    this.classSectionDrawerOpen = true;
  }
  saveClassSection(): void {
    this.classFormSubmitted = true;
    this.classSectionNameError = this.classSectionForm.name.trim()
      ? ""
      : "Enter a section name.";
    this.classCapacityError =
      Number(this.classSectionForm.capacity) > 0
        ? ""
        : "Capacity must be greater than 0.";
    if (
      this.classSectionNameError ||
      this.classCapacityError ||
      !this.selectedClassLevel
    )
      return;
    const existing = this.classSections.find(
      (section) => section.id === this.classEditingSectionId,
    );
    const next: EducationClassSection = {
      id: existing?.id ?? `section-${Date.now()}`,
      levelId: this.selectedClassLevelId,
      name: this.classSectionForm.name.trim(),
      capacity: Number(this.classSectionForm.capacity),
      occupied: existing?.occupied ?? 0,
      campus: this.classSectionForm.campus,
      shift: this.classSectionForm.shift,
      teacher: this.classSectionForm.teacher || "—",
      pending: existing?.pending ?? 0,
    };
    this.classSections = existing
      ? this.classSections.map((section) =>
          section.id === existing.id ? next : section,
        )
      : [...this.classSections, next];
    this.classSectionDrawerOpen = false;
    this.notify(
      existing
        ? "Section updated in this preview."
        : "Section created in this preview.",
    );
  }
  requestClassDelete(
    kind: "level" | "section",
    item: EducationClassLevel | EducationClassSection,
  ): void {
    this.classDeleteTarget = {
      kind,
      id: item.id,
      label:
        kind === "level"
          ? (item as EducationClassLevel).name
          : `${this.selectedClassLevel?.name ?? "Class"} · ${(item as EducationClassSection).name}`,
    };
  }
  confirmClassDelete(): void {
    const target = this.classDeleteTarget;
    if (!target) return;
    if (target.kind === "level") {
      this.classLevels = this.classLevels.filter(
        (level) => level.id !== target.id,
      );
      this.classSections = this.classSections.filter(
        (section) => section.levelId !== target.id,
      );
      this.selectedClassLevelId = this.classLevels[0]?.id ?? "";
    } else
      this.classSections = this.classSections.filter(
        (section) => section.id !== target.id,
      );
    this.classDeleteTarget = null;
    this.notify("Record removed from this local preview.");
  }
  capacityStatus(
    section: EducationClassSection,
  ): "Full" | "Near capacity" | "Available" {
    return section.occupied >= section.capacity
      ? "Full"
      : section.occupied / section.capacity >= 0.9
        ? "Near capacity"
        : "Available";
  }
  copyClassStructure(): void {
    this.classCopyModalOpen = false;
    this.notify("Class levels and sections copied into the sample preview.");
  }
  setApplicationSearch(value: string): void {
    this.applicationSearch = value;
    this.applicationPage = 1;
  }
  setApplicationPage(page: number): void {
    this.applicationPage = Math.max(1, Math.min(this.applicationPages, page));
  }
  setApplicationPageSize(size: number): void {
    this.applicationPageSize = size;
    this.applicationPage = 1;
  }
  onApplicationPhotoSelected(event: Event): void {
    this.applicationPhotoName =
      (event.target as HTMLInputElement).files?.[0]?.name ?? "";
    if (this.applicationPhotoName) this.applicationPhotoReviewOpen = true;
  }
  onApplicationDocumentSelected(event: Event): void {
    this.applicationDocumentName =
      (event.target as HTMLInputElement).files?.[0]?.name ?? "";
  }
  removeApplicationDocument(): void {
    this.applicationDocumentName = "";
    this.applicationDocumentType = "";
  }
  createApplicationRecord(): void {
    this.applicationCreateSubmitted = true;
    this.applicationCreateErrors = {
      firstName: this.applicationNew.firstName.trim()
        ? ""
        : "Enter the student’s first name.",
      lastName: this.applicationNew.lastName.trim()
        ? ""
        : "Enter the student’s last name.",
      className: this.applicationNew.className ? "" : "Choose a class.",
      applicantCategory: this.applicationNew.applicantCategory
        ? ""
        : "Choose an applicant category.",
      guardianName: this.applicationNew.guardianName.trim()
        ? ""
        : "Enter the guardian’s name.",
      documentType:
        this.applicationDocumentName && !this.applicationDocumentType
          ? "Choose a document type for the attached file."
          : "",
    };
    if (Object.values(this.applicationCreateErrors).some(Boolean)) return;
    const number = 1041 + this.mockApplications.length;
    const record: EducationApplication = {
      id: `app-26-${Date.now()}`,
      applicationNo: `ADM-2026-${String(number).padStart(4, "0")}`,
      studentFirstName: this.applicationNew.firstName.trim(),
      studentLastName: this.applicationNew.lastName.trim(),
      guardianName: this.applicationNew.guardianName.trim(),
      guardianPhone: this.applicationNew.guardianPhone.trim(),
      status: "draft",
      campus: this.applicationCampus,
      created: "25 Sep 2026",
      className: this.applicationNew.className,
      category: this.applicationNew.applicantCategory,
      group: this.applicationNew.group || "General",
      documents:
        this.applicationDocumentName && this.applicationDocumentType
          ? [{ name: this.applicationDocumentType, verified: false }]
          : [],
    };
    this.mockApplications = [record, ...this.mockApplications];
    this.applicationSearch = "";
    this.applicationPage = 1;
    this.notify(`Application ${record.applicationNo} created as a draft.`);
    void this.router.navigateByUrl(
      "/app/school-management/admissions/applications",
    );
  }
  resetApplicationForm(): void {
    this.applicationCreateSubmitted = false;
    this.applicationCreateErrors = {};
    this.applicationAdminOverride = false;
    this.applicationNew = {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      guardianName: "",
      guardianRelation: "",
      guardianPhone: "",
      guardianEmail: "",
      className: "",
      applicantCategory: "General",
      group: "",
    };
    this.applicationPhotoName = "";
    this.applicationPhotoReviewOpen = false;
    this.removeApplicationDocument();
  }
  updateApplicationStatus(
    application: EducationApplication,
    status: EducationApplication["status"],
  ): void {
    this.mockApplications = this.mockApplications.map((item) =>
      item.id === application.id
        ? {
            ...item,
            status,
            enrolledStudentId:
              status === "approved"
                ? (item.enrolledStudentId ??
                  `STU-26-${String(900 + this.mockApplications.indexOf(item)).padStart(4, "0")}`)
                : item.enrolledStudentId,
          }
        : item,
    );
    this.notify(`${application.applicationNo} moved to ${status}.`);
  }
  verifyApplicationDocument(
    application: EducationApplication,
    documentName: string,
  ): void {
    this.mockApplications = this.mockApplications.map((item) =>
      item.id === application.id
        ? {
            ...item,
            documents: item.documents.map((document) =>
              document.name === documentName
                ? { ...document, verified: !document.verified }
                : document,
            ),
          }
        : item,
    );
    this.notify(`${documentName} verification updated.`);
  }
  assignApplicationFees(application: EducationApplication): void {
    this.mockApplications = this.mockApplications.map((item) =>
      item.id === application.id ? { ...item, feeAssigned: true } : item,
    );
    this.notify(`Admission fees assigned for ${application.applicationNo}.`);
  }
  applicationDocumentSummary(application: EducationApplication): string {
    const verified = application.documents.filter(
      (document) => document.verified,
    ).length;
    return `${application.documents.length} attached · ${verified} verified`;
  }
  applicationInitials(application: EducationApplication): string {
    return `${application.studentFirstName.charAt(0)}${application.studentLastName.charAt(0)}`.toUpperCase();
  }
  openApplicationEdit(): void {
    const application = this.applicationDetail;
    if (!application || application.status === "approved") return;
    this.applicationEditSubmitted = false;
    this.applicationEditErrors = {};
    this.applicationEditOpen = true;
    this.applicationEditForm = {
      firstName: application.studentFirstName,
      lastName: application.studentLastName,
      dateOfBirth: application.dateOfBirth ?? "",
      gender: application.gender ?? "",
      guardianName: application.guardianName,
      guardianRelation: application.guardianRelation ?? "",
      guardianPhone: application.guardianPhone,
      guardianEmail: application.guardianEmail ?? "",
      className: application.className,
      section: application.section ?? "",
      campus: application.campus,
      group: application.group,
    };
  }
  cancelApplicationEdit(): void {
    this.applicationEditOpen = false;
    this.applicationEditSubmitted = false;
    this.applicationEditErrors = {};
  }
  saveApplicationEdit(): void {
    const application = this.applicationDetail;
    if (!application) return;
    this.applicationEditSubmitted = true;
    this.applicationEditErrors = {
      firstName: this.applicationEditForm["firstName"]?.trim()
        ? ""
        : "Enter the student’s first name.",
      lastName: this.applicationEditForm["lastName"]?.trim()
        ? ""
        : "Enter the student’s last name.",
      guardianName: this.applicationEditForm["guardianName"]?.trim()
        ? ""
        : "Enter the guardian’s name.",
      className: this.applicationEditForm["className"] ? "" : "Choose a class.",
      guardianEmail:
        this.applicationEditForm["guardianEmail"] &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          this.applicationEditForm["guardianEmail"],
        )
          ? "Enter a valid email address."
          : "",
    };
    if (Object.values(this.applicationEditErrors).some(Boolean)) return;
    this.updateApplication(application, {
      studentFirstName: this.applicationEditForm["firstName"].trim(),
      studentLastName: this.applicationEditForm["lastName"].trim(),
      dateOfBirth: this.applicationEditForm["dateOfBirth"],
      gender: this.applicationEditForm["gender"],
      guardianName: this.applicationEditForm["guardianName"].trim(),
      guardianRelation: this.applicationEditForm["guardianRelation"].trim(),
      guardianPhone: this.applicationEditForm["guardianPhone"].trim(),
      guardianEmail: this.applicationEditForm["guardianEmail"].trim(),
      className: this.applicationEditForm["className"],
      section: this.applicationEditForm["section"],
      campus: this.applicationEditForm["campus"],
      group: this.applicationEditForm["group"],
    });
    this.applicationEditOpen = false;
    this.recordApplicationActivity(
      "Application updated",
      "Student, guardian, or placement details were updated in the local preview.",
    );
    this.notify("Application updated in this browser preview.");
  }
  openApplicationConfirm(
    action: "verify" | "approve" | "reject" | "delete",
  ): void {
    this.applicationConfirmAction = action;
  }
  confirmApplicationAction(): void {
    const application = this.applicationDetail;
    const action = this.applicationConfirmAction;
    if (!application || !action) return;
    this.applicationConfirmAction = null;
    if (action === "delete") {
      this.mockApplications = this.mockApplications.filter(
        (item) => item.id !== application.id,
      );
      this.notify(
        `${application.applicationNo} removed from this local preview.`,
      );
      void this.router.navigateByUrl(
        "/app/school-management/admissions/applications",
      );
      return;
    }
    const status =
      action === "verify"
        ? "verified"
        : action === "approve"
          ? "approved"
          : action === "reject"
            ? "rejected"
            : application.status;
    const enrollment =
      action === "approve"
        ? {
            enrolledStudentId:
              application.enrolledStudentId ??
              `STU-26-${String(900 + this.mockApplications.indexOf(application)).padStart(4, "0")}`,
            approvedAt: "25 Sep 2026",
            feeAssigned: application.feeAssigned ?? false,
          }
        : {};
    this.updateApplication(application, { status, ...enrollment });
    const messages = {
      verify: "Application verified in this preview.",
      approve: "Application approved and student enrollment recorded.",
      reject: "Application rejected in this preview.",
    };
    this.recordApplicationActivity(
      messages[action],
      `Status changed to ${status}.`,
    );
    this.notify(messages[action]);
  }
  openApplicationPayment(): void {
    const application = this.applicationDetail;
    if (!application || application.status === "approved") return;
    this.applicationPaymentError = "";
    this.applicationPayment = {
      status: application.feeStatus ?? "pending",
      method: application.paymentMethod ?? "manual",
      reference: application.payerAccount ?? "",
      date: "",
      amount: application.paidAmount ? String(application.paidAmount) : "",
      note: "",
    };
    this.applicationPaymentOpen = true;
  }
  saveApplicationPayment(): void {
    const application = this.applicationDetail;
    if (!application) return;
    const amountText = String(this.applicationPayment.amount ?? "").trim();
    const amount = amountText ? Number(amountText) : 0;
    if (!this.applicationPayment.status) {
      this.applicationPaymentError = "Choose a payment status.";
      return;
    }
    if (!this.applicationPayment.method) {
      this.applicationPaymentError = "Choose a payment option.";
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      this.applicationPaymentError = "Enter a valid non-negative amount.";
      return;
    }
    const paidAmount =
      this.applicationPayment.status === "paid" && amount <= 0
        ? (application.admissionFee ?? 0)
        : amount;
    this.updateApplication(application, {
      feeStatus: this.applicationPayment
        .status as EducationApplication["feeStatus"],
      paidAmount,
      paymentMethod: this.applicationPayment.method,
      payerAccount: this.applicationPayment.reference.trim(),
      paymentDate: this.applicationPayment.date || "25 Sep 2026",
      paymentNote: this.applicationPayment.note.trim(),
      receiptNo:
        this.applicationPayment.status === "paid"
          ? (application.receiptNo ??
            `RC-26-${String(3100 + this.mockApplications.indexOf(application)).padStart(4, "0")}`)
          : application.receiptNo,
    });
    this.applicationPaymentOpen = false;
    this.applicationPaymentError = "";
    this.recordApplicationActivity(
      "Payment status updated",
      `${this.applicationPayment.status.replace("_", " ")} · ${paidAmount.toLocaleString("en-BD")} BDT${this.applicationPayment.note.trim() ? ` · ${this.applicationPayment.note.trim()}` : ""}`,
    );
    this.notify("Payment status updated in this browser preview.");
  }
  openApplicationSignature(documentName: string): void {
    this.applicationSignatureDocument = documentName;
    this.applicationSignatureDrawn = false;
  }
  saveApplicationSignature(): void {
    const application = this.applicationDetail;
    const name = this.applicationSignatureDocument;
    if (!application || !name || !this.applicationSignatureDrawn) return;
    this.updateApplication(application, {
      documents: application.documents.map((document) =>
        document.name === name ? { ...document, signed: true } : document,
      ),
    });
    this.applicationSignatureDocument = null;
    this.applicationSignatureDrawn = false;
    this.recordApplicationActivity(
      "Document signed",
      `${name} marked as signed in the local preview.`,
    );
    this.notify("Document signature recorded in this browser preview.");
  }
  toggleApplicationDocument(documentName: string): void {
    const application = this.applicationDetail;
    if (!application) return;
    const target = application.documents.find(
      (document) => document.name === documentName,
    );
    if (!target) return;
    const verified = !target.verified;
    this.updateApplication(application, {
      documents: application.documents.map((document) =>
        document.name === documentName ? { ...document, verified } : document,
      ),
    });
    this.recordApplicationActivity(
      verified ? "Document verified" : "Document verification removed",
      `${documentName} review updated.`,
    );
    this.notify(
      `${documentName} ${verified ? "verified" : "returned to pending"} in this preview.`,
    );
  }
  downloadApplicationDocument(documentName: string): void {
    this.notify(
      `${documentName} is available as a sample attachment in this preview.`,
    );
  }
  recordApplicationActivity(title: string, detail: string): void {
    this.applicationActivityLog = [
      { title, detail, when: "25 Sep 2026 · Just now" },
      ...this.applicationActivityLog,
    ].slice(0, 8);
  }
  selectApplicationActivity(activity: EducationApplicationActivity): void {
    this.selectedApplicationActivity = activity;
  }
  applicationStatusClass(status: EducationApplication["status"]): string {
    return status === "approved" || status === "verified"
      ? "active"
      : status === "rejected"
        ? "needs-attention"
        : "pending-review";
  }
  applicationWorkflowStep(status: EducationApplication["status"]): number {
    return status === "draft"
      ? 0
      : status === "submitted"
        ? 1
        : status === "verified"
          ? 2
          : status === "approved"
            ? 3
            : 2;
  }
  get applicationPaymentAccountLabel(): string {
    return this.applicationPayment.method.toLowerCase() === "bkash"
      ? "bKash mobile number"
      : ["bank transfer", "online bank"].includes(
            this.applicationPayment.method.toLowerCase(),
          )
        ? "Bank account / reference"
        : "Manual payment reference";
  }
  get canUpdateApplicationPayment(): boolean {
    return (
      !!this.applicationDetail && this.applicationDetail.status !== "approved"
    );
  }
  private updateApplication(
    application: EducationApplication,
    changes: Partial<EducationApplication>,
  ): void {
    this.mockApplications = this.mockApplications.map((item) =>
      item.id === application.id ? { ...item, ...changes } : item,
    );
  }
  setSize(value: number): void {
    this.pageSize = value;
    this.currentPage = 1;
  }
  setPage(page: number): void {
    this.currentPage = Math.max(1, Math.min(this.pageCount, page));
  }
  setUserRequestPage(page: number): void {
    this.requestPage = Math.max(1, Math.min(this.userRequestPageCount, page));
  }
  setUserRequestPageSize(size: number): void {
    this.requestPageSize = size;
    this.requestPage = 1;
  }
  setAcademicSessionPage(page: number): void {
    this.academicSessionPage = Math.max(
      1,
      Math.min(this.academicSessionPages, page),
    );
  }
  setAcademicSessionPageSize(size: number): void {
    this.academicSessionPageSize = size;
    this.academicSessionPage = 1;
  }
  openAcademicSessionDrawer(session?: MockAcademicSession): void {
    this.academicSessionEditingId = session?.id ?? "";
    this.academicSessionForm = session
      ? {
          name: session.name,
          start: `${session.year}-01-01`,
          end: `${session.year}-12-31`,
          active: session.active,
        }
      : { name: "", start: "", end: "", active: false };
    this.academicSessionSubmitted = false;
    this.academicSessionDrawerOpen = true;
  }
  saveAcademicSession(): void {
    this.academicSessionSubmitted = true;
    if (
      !this.academicSessionForm.name.trim() ||
      !this.academicSessionForm.start ||
      !this.academicSessionForm.end ||
      this.academicSessionForm.end < this.academicSessionForm.start
    )
      return;
    const year = Number(this.academicSessionForm.start.slice(0, 4));
    const editing = this.academicSessions.find(
      (session) => session.id === this.academicSessionEditingId,
    );
    const updated: MockAcademicSession = {
      id: editing?.id ?? `session-${Date.now()}`,
      name: this.academicSessionForm.name.trim(),
      start: new Date(
        `${this.academicSessionForm.start}T00:00:00`,
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      end: new Date(
        `${this.academicSessionForm.end}T00:00:00`,
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      year,
      active: this.academicSessionForm.active,
      locked: editing?.locked ?? false,
    };
    this.academicSessions = this.academicSessionForm.active
      ? this.academicSessions
          .map((item) => ({ ...item, active: item.id === updated.id }))
          .map((item) => (item.id === updated.id ? updated : item))
      : editing
        ? this.academicSessions.map((item) =>
            item.id === updated.id ? updated : item,
          )
        : [...this.academicSessions, updated];
    this.academicSessionDrawerOpen = false;
    this.academicSessionPage = 1;
    this.notify(
      editing
        ? "Academic session updated in this preview."
        : "Academic session created in this preview.",
    );
  }
  activateAcademicSession(session: MockAcademicSession): void {
    this.academicSessions = this.academicSessions.map((item) => ({
      ...item,
      active: item.id === session.id,
    }));
    this.notify(`${session.name} activated in this preview.`);
  }
  toggleAcademicSessionLock(session: MockAcademicSession): void {
    this.academicSessions = this.academicSessions.map((item) =>
      item.id === session.id ? { ...item, locked: !item.locked } : item,
    );
    this.notify(
      `${session.name} ${session.locked ? "unlocked" : "locked"} in this preview.`,
    );
  }
  saveSchoolIdentity(): void {
    this.identitySubmitted = true;
    this.identitySavedMessage = "";
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      this.identityForm.email.trim(),
    );
    if (
      !this.identityForm.nameEn.trim() ||
      !this.identityForm.eiin.trim() ||
      !this.identityForm.addressLine1.trim() ||
      !this.identityForm.phonePrimary.trim() ||
      !emailIsValid
    ) {
      this.identityValidationMessage =
        "Complete the required school profile fields with a valid email before saving.";
      return;
    }
    this.identityValidationMessage = "";
    this.identitySavedMessage =
      "School identity saved in this browser preview.";
    this.notify(this.identitySavedMessage);
  }
  toggleSchoolIdentityHistory(): void {
    this.identityHistoryUnavailable = !this.identityHistoryUnavailable;
  }
  onIdentityLogoSelected(event: Event): void {
    this.identityLogoName =
      (event.target as HTMLInputElement).files?.[0]?.name ?? "";
  }
  setUserRequestFilter(kind: "type" | "status", value: string): void {
    if (kind === "type") this.requestTypeFilter = value;
    else this.requestStatusFilter = value;
    this.requestPage = 1;
  }
  toggleRequestSort(
    sortBy: "requesterName" | "type" | "status" | "createdAt",
  ): void {
    this.requestSortDir =
      this.requestSortBy === sortBy
        ? this.requestSortDir === "asc"
          ? "desc"
          : "asc"
        : sortBy === "createdAt"
          ? "desc"
          : "asc";
    this.requestSortBy = sortBy;
  }
  createProfileFromRequest(request: EducationUserRequest): void {
    const [firstName = "", ...lastName] = request.requesterName
      .trim()
      .split(/\s+/);
    void this.router.navigate(["/app/school-management/students/new"], {
      queryParams: {
        userId: request.requestedByUserId,
        firstName,
        lastName: lastName.join(" "),
        email: request.requesterEmail,
        sourceRequestId: request.id,
      },
    });
  }
  openUserRequestDecision(
    request: EducationUserRequest,
    status: "approved" | "rejected",
  ): void {
    this.requestDecision = { requestId: request.id, status };
    this.requestReviewNote = "";
  }
  confirmUserRequestDecision(): void {
    if (!this.requestDecision) return;
    const { requestId, status } = this.requestDecision;
    this.userRequests = this.userRequests.map((request) =>
      request.id === requestId
        ? {
            ...request,
            status,
            reviewNote:
              this.requestReviewNote.trim() ||
              (status === "approved"
                ? "Approved in the local preview."
                : "Rejected in the local preview."),
          }
        : request,
    );
    this.requestDecision = null;
    this.requestReviewNote = "";
    this.notify(`Request ${status} in this browser preview.`);
  }
  requestTypeLabel(type: EducationUserRequest["type"]): string {
    return (
      {
        profile_link: "Profile link",
        guardian_link: "Guardian link",
        new_profile: "New profile",
        question: "Question",
      } as const
    )[type];
  }
  requestStatusLabel(status: EducationUserRequest["status"]): string {
    return status === "pending"
      ? "Pending"
      : status === "approved"
        ? "Approved"
        : "Rejected";
  }
  requestStatusClass(status: EducationUserRequest["status"]): string {
    return status === "approved"
      ? "active"
      : status === "rejected"
        ? "needs-attention"
        : "pending-review";
  }
  setState(value: string): void {
    this.reviewerOpen = false;
    void this.router.navigateByUrl(
      `${this.routePath}${value === "populated" ? "" : `?mockState=${value}`}`,
    );
  }
  showCreate(): void {
    this.createOpen = true;
    this.submitted = false;
  }
  createPrimary(): void {
    const path = this.routePath;
    const createRoutes: Record<string, string> = {
      "/app/school-management/students": "/app/school-management/students/new",
      "/app/school-management/teachers": "/app/school-management/teachers/new",
      "/app/school-management/admissions/campaigns":
        "/app/school-management/admissions/campaigns/new",
      "/app/school-management/admissions/applications":
        "/app/school-management/admissions/applications/create",
      "/app/school-management/meetings/availability":
        "/app/school-management/meetings/book",
      "/app/training-institute/learning/courses":
        "/app/training-institute/learning/courses/create",
      "/app/training-institute/programmes":
        "/app/training-institute/programmes/new",
      "/app/training-institute/batches": "/app/training-institute/batches/new",
      "/app/training-institute/instructors":
        "/app/training-institute/instructors/new",
      "/app/training-institute/trainees":
        "/app/training-institute/trainees/new",
      "/app/training-institute/admission-campaigns":
        "/app/training-institute/admission-campaigns/new",
    };
    if (createRoutes[path]) void this.router.navigateByUrl(createRoutes[path]);
    else this.showCreate();
  }
  openRow(row: EducationRow): void {
    const path = this.routePath;
    const details: Record<string, string> = {
      "/app/school-management/students": `${path}/${row.code}`,
      "/app/school-management/teachers": `${path}/${row.code}`,
      "/app/school-management/admissions/campaigns": `${path}/${row.code}`,
      "/app/school-management/admissions/applications": `${path}/${row.code}`,
      "/app/training-institute/learning/courses": `${path}/CRS-DIGI-${String((Number(row.code.slice(-3)) % 6) + 1).padStart(2, "0")}`,
      "/app/training-institute/learning/runs": `${path}/RUN-26-${String.fromCharCode(65 + (row.code.length % 4))}`,
      "/app/training-institute/programmes": `${path}/PRG-26-01`,
      "/app/training-institute/batches": `${path}/BAT-26-B`,
      "/app/training-institute/instructors": `${path}/${row.code}`,
      "/app/training-institute/trainees": `${path}/${row.code}`,
      "/app/training-institute/admission-applications": `${path}/${row.code}`,
    };
    const destination = details[path];
    if (destination) void this.router.navigateByUrl(destination);
    else this.notify(`${row.code} opened in the local preview.`);
  }
  closeCreate(): void {
    this.createOpen = false;
  }
  save(form: NgForm): void {
    this.submitted = true;
    if (form.invalid) {
      this.notify("Complete the required fields to continue.");
      return;
    }
    if (this.isStudentForm && !this.hasStudentParentContact()) {
      this.studentParentContactError = true;
      this.notify("Add a name and phone for either a parent or guardian.");
      return;
    }
    this.studentParentContactError = false;
    this.createOpen = false;
    this.notify("Saved in this browser preview. No live records were changed.");
    form.resetForm();
  }
  saveStudent(form: NgForm): void {
    this.submitted = true;
    this.studentParentContactError = false;
    if (form.invalid) {
      this.notify(
        "Complete the required fields and correct invalid email addresses.",
      );
      return;
    }
    if (!this.hasStudentParentContact()) {
      this.studentParentContactError = true;
      this.notify("Add a name and phone for either the father or mother.");
      return;
    }

    const firstName = this.studentFormValues["First Name"].trim();
    const lastName = this.studentFormValues["Last Name"].trim();
    const code =
      this.isStudentEdit && this.studentRecord
        ? this.studentRecord.code
        : `STU-26-${String(7001 + this.createdStudents.length).padStart(4, "0")}`;
    const [grade, section] = [
      this.studentFormValues["Class"],
      this.studentFormValues["Section"],
    ];
    const record: EducationRow = {
      code,
      name: `${firstName} ${lastName}`,
      detail: `${grade} · ${section}`,
      values: [`${grade} · ${section}`, "25 Sep 2026", this.selectedCampus],
      status: this.studentFormValues["Status"] || "Active",
      amount: "—",
      email:
        this.studentFormValues["Email"] ||
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}@students.stravix.edu.bd`,
    };
    this.studentFormOverrides[code] = {
      ...this.studentFormValues,
      "Student Number": code,
    };
    if (this.isStudentEdit) {
      this.createdStudents = this.createdStudents.map((row) =>
        row.code === code ? record : row,
      );
      this.rows = this.rows.map((row) => (row.code === code ? record : row));
      this.notify("Student updated in this browser preview.");
    } else {
      this.createdStudents.unshift(record);
      this.rows = [record, ...this.rows];
      this.notify("Student registered in this browser preview.");
    }
    void this.router.navigateByUrl(`/app/school-management/students/${code}`);
  }
  act(message: string): void {
    this.notify(message);
  }
  private notify(message: string): void {
    this.toast = message;
    window.setTimeout(() => {
      if (this.toast === message) this.toast = "";
    }, 3000);
  }

  private hasStudentParentContact(): boolean {
    return !!(
      (this.studentFormValues["Father Name"]?.trim() &&
        this.studentFormValues["Father Phone"]?.trim()) ||
      (this.studentFormValues["Mother Name"]?.trim() &&
        this.studentFormValues["Mother Phone"]?.trim())
    );
  }

  private initialStudentFormValues(path: string): Record<string, string> {
    if (path === "/app/school-management/students/new") {
      const query = this.router.parseUrl(this.router.url).queryParams;
      this.studentSourceRequestId = String(query["sourceRequestId"] ?? "");
      return this.studentSourceRequestId
        ? {
            "First Name": String(query["firstName"] ?? ""),
            "Last Name": String(query["lastName"] ?? ""),
            Email: String(query["email"] ?? ""),
          }
        : {};
    }
    this.studentSourceRequestId = "";
    if (!/^\/app\/school-management\/students\/[^/]+\/edit$/.test(path))
      return {};
    const record = this.studentRecord;
    if (!record) return {};
    const [firstName = "", lastName = ""] = record.name.split(" ");
    const [grade = "Grade 8", section = "Blue"] = record.values[0].split(" · ");
    const defaults: Record<string, string> = {
      "Student Number": record.code,
      "First Name": firstName,
      "Last Name": lastName,
      Email: record.email ?? "",
      Phone: "+880 1712 340 567",
      "Date of Birth": "2012-04-18",
      Status: record.status,
      "Father Name": `Mr. ${lastName}`,
      "Father Phone": "+880 1712 340 500",
      "Father Email": `father.${lastName.toLowerCase()}@mail.example`,
      "Father Occupation": "Business owner",
      "Mother Name": `Mrs. ${lastName}`,
      "Mother Phone": "+880 1712 340 501",
      "Mother Email": `mother.${lastName.toLowerCase()}@mail.example`,
      "Mother Occupation": "Teacher",
      Grade: grade,
      Class: grade,
      Section: section,
      Group: "General",
      "Roll Number": "08",
      "Father Identity": "1990•••••",
      "Mother Identity": "1992•••••",
      "Local Guardian Name": "Nusrat Karim",
      "Local Guardian Relation": "Aunt",
      "Local Guardian Phone": "+880 1712 340 502",
      "Local Guardian Email": "nusrat.karim@mail.example",
      "Emergency Contact Name": "Mr. Chowdhury",
      "Emergency Contact Relation": "Uncle",
      "Emergency Contact Phone": "+880 1712 340 503",
      "Address Line 1": "House 18, Road 6",
      "Address Line 2": "Dhanmondi",
      City: "Dhaka",
      State: "Dhaka",
      "Postal Code": "1209",
      Notes: "Sample student profile for design review.",
    };
    return { ...defaults, ...(this.studentFormOverrides[record.code] ?? {}) };
  }

  private sync(): void {
    let path = this.router.url.split(/[?#]/)[0].replace(/\/$/, "");
    if (
      [
        "/app/guardian",
        "/app/guardian/profile",
        "/app/guardian/students",
      ].includes(path)
    )
      path = "/app/guardian/home";
    if (path === "/app/admissions/apply") path = "/app/admissions/apply";
    if (
      path === "/app/school-management" ||
      path === "/app/school-management/attendance"
    )
      path = path.endsWith("/attendance")
        ? `${path}/daily-marking`
        : `${path}/home`;
    if (path === "/app/school-management/attendance/bulk-upload")
      path += "/student";
    if (path === "/app/school-management/attendance/reports")
      path += "/students";
    if (path === "/app/school-management/exams") path += "/schedules";
    if (path === "/app/school-management/teachers/me") path += "/profile";
    if (path === "/app/training-institute")
      path = "/app/training-institute/learning/courses";
    if (path === "/app/training-institute/learning")
      path = "/app/training-institute/learning/dashboard";
    if (path === "/app/training-institute/academy-identity")
      path = "/app/training-institute/settings/identity";
    this.routePath = path;
    this.submitted = false;
    this.page = this.describe(path);
    this.rows = this.makeRows();
    this.studentTab = "overview";
    this.studentAttendanceClass = "";
    this.studentAttendancePage = 1;
    this.studentParentContactError = false;
    this.studentFormValues = this.initialStudentFormValues(path);
    this.search = "";
    this.statusFilter = "";
    this.requestSearch = "";
    this.requestTypeFilter = "";
    this.requestStatusFilter = this.isStudentRequests ? "pending" : "";
    this.requestPage = 1;
    this.requestPageSize = 10;
    this.requestDecision = null;
    this.requestReviewNote = "";
    this.scopeFilter = "";
    this.sectionFilter = "";
    this.currentPage = 1;
    this.createOpen = false;
    this.reviewerOpen = false;
    this.applicationEditOpen = false;
    this.applicationConfirmAction = null;
    this.applicationPaymentOpen = false;
    this.applicationSignatureDocument = null;
    this.applicationAdmitCardOpen = false;
    this.selectedApplicationActivity = null;
    this.applicationActivityExpanded = false;
    this.applicationActivityLog = [];
  }

  private describe(path: string): EducationPage {
    const publicAdmission = path === "/app/admissions/apply";
    const training = path.startsWith("/app/training-institute");
    const app = training
      ? "Training Institute Management"
      : path.startsWith("/app/guardian")
        ? "Guardian Portal"
        : "School Management";
    const base = training
      ? "/app/training-institute"
      : path.startsWith("/app/guardian")
        ? "/app/guardian"
        : "/app/school-management";
    const part = publicAdmission
      ? ["admissions", "apply"]
      : path.slice(base.length).split("/").filter(Boolean);
    const edit = part.at(-1) === "edit";
    const form =
      publicAdmission ||
      edit ||
      part.at(-1) === "new" ||
      part.at(-1) === "create" ||
      part.at(-1) === "book" ||
      part.at(-1) === "bulk-upload" ||
      part.at(-1) === "bulk-import" ||
      part.at(-1) === "single-invoice" ||
      part.at(-1) === "rollover" ||
      part.at(-1) === "enroll" ||
      part.at(-1) === "plan" ||
      part.at(-1) === "curriculum-setup-wizard" ||
      (part.at(-1) === "identity" && training) ||
      (part.at(-1) === "public-site" && training) ||
      (part.at(-1) === "online-payment" && path.includes("guardian"));
    const applicationDetail =
      /^\/app\/school-management\/admissions\/applications\/[^/]+$/.test(path);
    const guide = part.some(
      (segment) => segment.includes("guide") || segment === "manual",
    );
    const title = this.titleFor(path, part, training);
    const kind: EducationPage["kind"] = guide
      ? "guide"
      : form
        ? "form"
        : applicationDetail
          ? "detail"
          : part.length > 1 &&
              /^(?:[A-Z0-9-]{3,}|\d+)$/.test(part.at(-1) ?? "") &&
              !["new", "edit", "create"].includes(part.at(-1) ?? "")
            ? "detail"
            : part.length === 0 ||
                ["home", "dashboard"].includes(part.at(-1) ?? "")
              ? "home"
              : "list";
    const entity = this.entityFor(path, part);
    const columns = this.columnsFor(path, part, training);
    const description = this.descriptionFor(path, title, training);
    const stats = this.statsFor(path, title, training);
    const fields = this.fieldsFor(path, part, title, training);
    return {
      app,
      base,
      title,
      description,
      kind,
      group: this.groupFor(path, training),
      entity,
      columns,
      stats,
      fields,
    };
  }

  private titleFor(path: string, part: string[], training: boolean): string {
    if (path === "/app/school-management/classes") return "Classes & Sections";
    if (path === "/app/school-management/students/requests")
      return "School User Requests";
    if (path === "/app/school-management/admissions/applications")
      return "Student applications";
    if (path === "/app/school-management/admissions/applications/create")
      return "Create student application";
    if (
      /^\/app\/school-management\/admissions\/applications\/[^/]+$/.test(path)
    )
      return "Application Details";
    if (path === "/app/school-management/students/new")
      return "Register student";
    if (/^\/app\/school-management\/students\/[^/]+\/edit$/.test(path))
      return "Edit student";
    if (/^\/app\/school-management\/students\/[^/]+$/.test(path))
      return "Student Detail";
    const explicit: Record<string, string> = {
      "/app/school-management/home": "Stravix Group BD",
      "/app/school-management/dashboard": "School dashboard",
      "/app/school-management/students/me": "My student profile",
      "/app/admissions/apply": "Apply for admission",
      "/app/school-management/attendance/daily-marking":
        "Daily attendance marking",
      "/app/school-management/attendance/student/bulk-upload":
        "Bulk attendance upload",
      "/app/school-management/attendance/students/reports":
        "Student attendance reports",
      "/app/school-management/exams/schedules": "Exam schedule",
      "/app/school-management/teachers/me/profile": "My teacher profile",
      "/app/school-management/teachers/me/class-routine": "My class routine",
      "/app/school-management/teachers/me/class-students": "My class students",
      "/app/school-management/teachers/me/attendance": "My attendance",
      "/app/school-management/teachers/me/class-attendance": "Class attendance",
      "/app/training-institute/learning/dashboard": "Operations dashboard",
      "/app/training-institute/learning/instructor/dashboard":
        "Instructor dashboard",
      "/app/training-institute/learning/instructor/work": "My work",
      "/app/training-institute/learning/courses/create": "Create course",
      "/app/training-institute/learning/instructor/courses/authoring/create":
        "Create course",
    };
    if (explicit[path]) return explicit[path];
    const last = part.at(-1) ?? "";
    if (path.includes("/courses/") && part.at(-2) === "runs" && last === "new")
      return "Create course run";
    if (path.includes("/courses/") && part.at(-2) === "runs" && last === "edit")
      return "Edit course run";
    if (path.includes("/attempts/") && last === "review")
      return "Review assessment attempt";
    if (last === "new" || last === "create")
      return `New ${this.titleFor(path, part.slice(0, -1), training).replace(/s$/, "")}`;
    if (last === "edit")
      return `Edit ${this.titleFor(path, part.slice(0, -1), training).replace(/s$/, "")}`;
    if (last === "book") return "Book a parent–teacher meeting";
    if (last === "bulk-upload") return "Bulk upload";
    if (last === "rollover" || path.includes("academic-year-rollover"))
      return "Academic year rollover";
    let candidate =
      part.at(-1) ?? (training ? "learning dashboard" : "school overview");
    if (["edit", "new", "create", "book", "bulk-upload"].includes(candidate))
      candidate = part.at(-2) ?? candidate;
    if (/^[A-Z0-9-]{3,}$/.test(candidate) || /^\d+$/.test(candidate))
      candidate = part.at(-2) ?? candidate;
    const labels: Record<string, string> = {
      "user-manual": "User manual",
      "business-process-guide": "Business process guide",
      "component-reference-guide": "Component reference guide",
      "detail-report": "Student detail report",
      "policy-holidays": "Attendance policies & holidays",
      "notifications-analytics": "Exam notifications & analytics",
      "academic-sessions": "Academic Years (Sessions)",
      "school-identity": "School Identity & Branding",
      "academic-year-rollover": "Academic year rollover",
      "academic-year-archive": "Academic year archive",
      "academic-groups": "Academic groups",
      "curriculum-setup-wizard": "Curriculum setup",
      "setup-seeds": "Setup & sample data",
      "fee-heads": "Fee heads",
      "fee-terms": "Fee terms",
      "fee-templates": "Fee templates",
      "fee-pricing-rules": "Fee pricing rules",
      "fee-schedules": "Fee schedules",
      "fee-fine-rules": "Late fee rules",
      "fee-discount-types": "Discount types",
      "fee-overrides": "Fee overrides",
      "fee-bulk-invoices": "Bulk invoices",
      "fee-single-invoice": "Create fee invoice",
      "fee-delivery": "Invoice delivery",
      "fee-online-payments": "Online payments",
      "fee-bank-transfer-verification": "Bank transfer verification",
      "public-page": "Public school page",
      "public-events": "Public events",
      "public-notices": "Public notices",
      "subject-marks": "Subject marks",
      schedules: "Exam schedules",
      "subject-teachers": "Subject teachers",
      "teacher-workload": "Teacher workload",
      "applicant-categories": "Applicant categories",
      "document-types": "Admission document types",
      "identity-rules": "Identity rules",
      "promotion-history": "Promotion history",
      "edit-requests": "Attendance edit requests",
      "daily-marking": "Daily attendance marking",
      "teacher-attendance": "Teacher attendance",
      "student-teacher-reports": "Student–teacher reports",
      "parent-teacher": "Parent–teacher messaging",
      "public-site": "Public site & portal",
      "admission-campaigns": "Admission campaigns",
      "admission-applications": "Admission applications",
      "course-inquiries": "Course inquiries",
      "enrollment-requests": "Enrollment requests",
      "course-categories": "Course categories",
      "question-banks": "Question banks",
      runs: "Course offerings",
      recordings: "Session recordings",
      certificates: "Certificates",
      attempts: "Assessment attempts",
      moderation: "Content moderation",
      audit: "Learning audit timeline",
      payments: "Course payments",
      live: "Live sessions",
      experience: "Learning experience",
      authoring: "Course authoring",
      plan: "Course plan",
      sessions: "Run sessions",
      learners: "Enrolled learners",
      progress: "Learner progress",
      communications: "Batch communications",
      batches: "My batches",
      instructors: "Instructors",
    };
    if (labels[candidate]) return labels[candidate];
    return candidate
      .split(/[-_]/)
      .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
      .join(" ");
  }

  private groupFor(path: string, training: boolean): string {
    if (path.includes("guardian")) return "Family services";
    if (path === "/app/school-management/home")
      return "School management workspace";
    if (training) {
      if (path.includes("/instructor/")) return "Instructor workspace";
      if (
        path.includes("admission") ||
        path.includes("trainee") ||
        path.includes("enrollment")
      )
        return "Learners & admissions";
      if (
        path.includes("payment") ||
        path.includes("certificate") ||
        path.includes("instructor")
      )
        return "Institute operations";
      if (
        path.includes("analytics") ||
        path.includes("audit") ||
        path.includes("notifications")
      )
        return "Insights";
      if (
        path.includes("settings") ||
        path.includes("identity") ||
        path.includes("public-site")
      )
        return "Institute setup";
      return "Catalogue & delivery";
    }
    if (path.includes("admission")) return "Admissions";
    if (path.includes("attendance")) return "Attendance";
    if (path.includes("exam")) return "Exams & results";
    if (path.includes("fee")) return "Student billing";
    if (
      path.includes("assignment") ||
      path.includes("quiz") ||
      path.includes("announcement") ||
      path.includes("messaging") ||
      path.includes("meeting")
    )
      return "Learning & engagement";
    if (
      path.includes("setting") ||
      path.includes("archive") ||
      path.includes("shift") ||
      path.includes("classroom") ||
      path.includes("subject") ||
      path.includes("timetable")
    )
      return "School setup";
    if (path.includes("teacher")) return "Teachers";
    return "Student records";
  }

  private entityFor(path: string, part: string[]): string {
    const str = path.toLowerCase();
    if (str.includes("student") || str.includes("guardian")) return "student";
    if (str.includes("teacher") || str.includes("instructor"))
      return "instructor";
    if (str.includes("attendance")) return "attendance";
    if (
      str.includes("exam") ||
      str.includes("quiz") ||
      str.includes("assessment") ||
      str.includes("question-bank")
    )
      return "assessment";
    if (
      str.includes("fee") ||
      str.includes("payment") ||
      str.includes("invoice")
    )
      return "fee";
    if (
      str.includes("course") ||
      str.includes("run") ||
      str.includes("programme") ||
      str.includes("batch")
    )
      return "course";
    if (
      str.includes("admission") ||
      str.includes("application") ||
      str.includes("inquir")
    )
      return "admission";
    if (str.includes("assignment")) return "assignment";
    if (
      str.includes("timetable") ||
      str.includes("routine") ||
      str.includes("session")
    )
      return "schedule";
    return part.at(-1) ?? "workspace";
  }

  private columnsFor(
    path: string,
    part: string[],
    training: boolean,
  ): string[] {
    const s = path.toLowerCase();
    if (s.includes("attendance"))
      return ["Learner / staff", "Class / batch", "Date & time", "Recorded by"];
    if (
      s.includes("exam") ||
      s.includes("quiz") ||
      s.includes("question-bank") ||
      s.includes("assessment")
    )
      return ["Assessment", "Class / course", "Scheduled", "Submissions"];
    if (s.includes("fee") || s.includes("payment") || s.includes("invoice"))
      return ["Learner", "Class / programme", "Due date", "Balance"];
    if (s.includes("teacher") || s.includes("instructor"))
      return ["Name", "Subject / expertise", "Class / batch", "Contact"];
    if (
      s.includes("course") ||
      s.includes("run") ||
      s.includes("programme") ||
      s.includes("batch") ||
      s.includes("certificate")
    )
      return ["Course / cohort", "Instructor", "Learners", "Next session"];
    if (
      s.includes("admission") ||
      s.includes("application") ||
      s.includes("inquir")
    )
      return ["Applicant", "Applying for", "Submitted", "Next step"];
    if (
      s.includes("timetable") ||
      s.includes("routine") ||
      s.includes("session") ||
      s.includes("meeting")
    )
      return ["Time", "Class / group", "Subject / activity", "Room / venue"];
    if (s.includes("assignment"))
      return ["Assignment", "Class / course", "Due date", "Submissions"];
    if (
      s.includes("announcement") ||
      s.includes("messaging") ||
      s.includes("notification")
    )
      return ["Subject", "Audience", "Published", "Delivery"];
    if (
      s.includes("classroom") ||
      s.includes("shift") ||
      s.includes("subject") ||
      s.includes("academic") ||
      s.includes("curriculum")
    )
      return ["Name", "Code", "Classes / usage", "Updated"];
    if (
      s.includes("setting") ||
      s.includes("rule") ||
      s.includes("template") ||
      s.includes("policy") ||
      s.includes("identity") ||
      s.includes("category")
    )
      return ["Name", "Scope", "Last updated", "Owner"];
    if (s.includes("guardian"))
      return ["Student", "Relationship", "Class", "Outstanding fees"];
    return training
      ? ["Learner / activity", "Course / cohort", "Updated", "Owner"]
      : ["Student / record", "Class / section", "Updated", "Owner"];
  }

  private descriptionFor(
    path: string,
    title: string,
    training: boolean,
  ): string {
    const s = path.toLowerCase();
    if (path === "/app/school-management/settings/academic-sessions")
      return "Create academic sessions and keep exactly one active.";
    if (path === "/app/school-management/settings/school-identity")
      return "Keep your institution profile complete so reports, certificates, and public pages stay accurate.";
    if (path === "/app/school-management/students/requests")
      return "Review requests from users whose student or guardian profile is not linked yet.";
    if (path === "/app/school-management/classes")
      return "Create class levels, organize sections, and assign teachers for the selected academic year.";
    if (path === "/app/school-management/admissions/applications")
      return "Review applications, verify documents, and complete approval actions.";
    if (path === "/app/school-management/admissions/applications/create")
      return "Record the student, guardian, placement, and supporting documents in one clear workflow.";
    if (
      /^\/app\/school-management\/admissions\/applications\/[^/]+$/.test(path)
    )
      return "Review the applicant record, policy snapshot, documents, and lifecycle decisions.";
    if (path === "/app/school-management/students")
      return "Search and manage student records for the active academic year.";
    if (/^\/app\/school-management\/students\/[^/]+$/.test(path))
      return "Student profile, academic history, attendance, results, and lifecycle records.";
    if (
      path === "/app/school-management/students/new" ||
      /^\/app\/school-management\/students\/[^/]+\/edit$/.test(path)
    )
      return "Capture a student profile, family contacts, class assignment, and address.";
    if (path.endsWith("/home") || path.endsWith("/dashboard"))
      return training
        ? "Monitor learning delivery, approvals, grading, revenue, and operational exceptions."
        : "Manage admissions, attendance, fees, exams, and more — all from one connected workspace.";
    if (s.includes("attendance"))
      return "Review daily attendance, exceptions, and follow-up across the selected campus and academic session.";
    if (s.includes("exam") || s.includes("quiz") || s.includes("assessment"))
      return "Plan assessments, coordinate marking, and keep results and learner feedback moving on schedule.";
    if (s.includes("fee") || s.includes("payment") || s.includes("invoice"))
      return "Manage education billing, payment collection, balances, and finance follow-up for the selected session.";
    if (
      s.includes("admission") ||
      s.includes("application") ||
      s.includes("inquir")
    )
      return "Move prospective learners through a clear, consistent admissions workflow.";
    if (
      s.includes("course") ||
      s.includes("run") ||
      s.includes("programme") ||
      s.includes("batch")
    )
      return "Coordinate course content, cohorts, instructors, learner progress, and delivery schedules.";
    if (s.includes("guide") || s.includes("manual"))
      return "Practical guidance for the Stravix Group BD education workspace and its day-to-day workflows.";
    if (s.includes("teacher") || s.includes("instructor"))
      return "Keep teaching profiles, class assignments, availability, and learner support in one place.";
    return `${title} for Stravix Group BD. Review records, keep campus or cohort work organized, and coordinate the next action.`;
  }

  private statsFor(
    path: string,
    title: string,
    training: boolean,
  ): [string, string, string, string?][] {
    const s = path.toLowerCase();
    if (training) {
      if (s.includes("dashboard") || path.endsWith("/learning"))
        return [
          [
            "Courses",
            "24",
            "Across 6 learning areas",
            "/app/training-institute/learning/courses",
          ],
          [
            "Runs",
            "8",
            "Across current offerings",
            "/app/training-institute/learning/courses",
          ],
          [
            "Active enrolments",
            "186",
            "5 cohorts in progress",
            "/app/training-institute/learning/courses",
          ],
          [
            "Pending approvals",
            "11",
            "Oldest request 2 days ago",
            "/app/training-institute/learning/enrollment-requests",
          ],
          [
            "Overdue grading",
            "4",
            "Across 3 course runs",
            "/app/training-institute/learning/instructor",
          ],
          [
            "Certificate queue",
            "7",
            "Ready for issue",
            "/app/training-institute/learning/certificates",
          ],
        ];
      if (s.includes("payment"))
        return [
          ["Settled revenue", "৳ 684,200", "Current session"],
          ["Awaiting settlement", "৳ 28,400", "12 payment orders"],
          ["Payment exceptions", "3", "Needs follow-up"],
        ];
      if (
        s.includes("admission") ||
        s.includes("inquir") ||
        s.includes("enrollment")
      )
        return [
          ["Open applications", "42", "Across 4 programmes"],
          ["Awaiting review", "11", "Oldest submitted 2 days ago"],
          ["Conversion this term", "68%", "Up 6 points"],
        ];
      if (s.includes("instructor"))
        return [
          ["Active instructors", "18", "Across 7 subject areas"],
          ["Sessions this week", "26", "4 cohorts in progress"],
          ["Reviews due", "9", "Assignments and quizzes"],
        ];
      return [
        ["Active learners", "186", "Across 8 current runs"],
        ["Completion rate", "82%", "Current term"],
        ["Next live sessions", "6", "Over the next 7 days"],
      ];
    }
    if (s.includes("attendance"))
      return [
        ["Present today", "1,184", "94.6% of expected learners"],
        ["Classes in session", "38", "Across 3 campus blocks"],
        ["Follow-up needed", "17", "Absence notifications queued"],
      ];
    if (s.includes("exam") || s.includes("quiz"))
      return [
        ["Upcoming assessments", "12", "Across 8 class groups"],
        ["Marks pending", "84", "6 teachers assigned"],
        ["Results published", "9", "Current academic year"],
      ];
    if (s.includes("fee") || s.includes("payment"))
      return [
        ["Collected this month", "৳ 1.84M", "91% of billed fees"],
        ["Outstanding balance", "৳ 286,400", "Across 73 accounts"],
        ["Transfers to verify", "12", "Submitted by guardians"],
      ];
    if (s.includes("admission"))
      return [
        ["Applications received", "148", "Current intake"],
        ["Awaiting review", "23", "Across 4 entry grades"],
        ["Offers accepted", "86", "58% conversion"],
      ];
    if (s.includes("teacher"))
      return [
        ["Teaching staff", "64", "Across 3 campuses"],
        ["Classes assigned", "42", "Current session"],
        ["Profiles to review", "3", "Recent updates"],
      ];
    return [
      ["Enrolled learners", "1,248", "Across 3 campuses"],
      ["Active classes", "42", "2026–27 session"],
      ["New this term", "86", "Admissions confirmed"],
    ];
  }

  private fieldsFor(
    path: string,
    part: string[],
    title: string,
    training: boolean,
  ): EducationField[] {
    const s = path.toLowerCase();
    if (this.isStudentForm)
      return [
        {
          label: "Student Number",
          placeholder: "Leave blank to auto-generate",
          readOnly: this.isStudentEdit,
        },
        { label: "First Name", required: true },
        { label: "Last Name", required: true },
        { label: "Email", type: "email" },
        { label: "Phone", placeholder: "01xxxxxxxxx" },
        { label: "Date of Birth", type: "date" },
        { label: "Status", options: ["Active", "Enrolled", "Inactive"] },
        { label: "Father Name" },
        { label: "Father Phone" },
        { label: "Father Email", type: "email" },
        { label: "Father Occupation" },
        { label: "Father Identity" },
        { label: "Mother Name" },
        { label: "Mother Phone" },
        { label: "Mother Email", type: "email" },
        { label: "Mother Occupation" },
        { label: "Mother Identity" },
        { label: "Local Guardian Name" },
        { label: "Local Guardian Relation" },
        { label: "Local Guardian Phone" },
        { label: "Local Guardian Email", type: "email" },
        { label: "Emergency Contact Name" },
        { label: "Emergency Contact Relation" },
        { label: "Emergency Contact Phone" },
        { label: "Class", required: true, options: this.gradeOptions },
        { label: "Section", required: true, options: studentSections },
        {
          label: "Group",
          options: ["General", "Science", "Business Studies", "Humanities"],
        },
        { label: "Roll Number" },
        { label: "Address Line 1" },
        { label: "Address Line 2" },
        { label: "City" },
        { label: "State" },
        { label: "Postal Code" },
        { label: "Notes", type: "textarea", wide: true },
      ];
    if (
      s.includes("student") ||
      s.includes("guardian") ||
      s.includes("application")
    )
      return [
        { label: "Learner full name", required: true },
        {
          label: "Class / programme",
          required: true,
          options: training ? courses : classes,
        },
        { label: "Date of birth", type: "date" },
        { label: "Guardian / contact", required: true },
        { label: "Email address", type: "email" },
        { label: "Phone number" },
        { label: "Admission / enrollment date", type: "date" },
        { label: "Notes", type: "textarea", wide: true },
      ];
    if (s.includes("teacher") || s.includes("instructor"))
      return [
        { label: "Full name", required: true },
        { label: "Subject / expertise", required: true },
        { label: "Email address", type: "email", required: true },
        { label: "Phone number" },
        {
          label: "Campus / cohort",
          options: training
            ? ["Dhaka Learning Centre", "Online", "Chattogram Centre"]
            : ["Stravix Main Campus", "Gulshan Campus", "Chattogram Campus"],
        },
        { label: "Start date", type: "date" },
        { label: "Profile notes", type: "textarea", wide: true },
      ];
    if (s.includes("fee") || s.includes("invoice") || s.includes("payment"))
      return [
        { label: "Learner / account", required: true },
        {
          label: "Fee plan / programme",
          options: [
            "Primary · Standard",
            "Secondary · Science",
            "Diploma · Evening",
          ],
        },
        { label: "Amount (BDT)", type: "number", required: true },
        { label: "Due date", type: "date", required: true },
        {
          label: "Payment method",
          options: ["Bank transfer", "Card", "Mobile wallet", "Cash"],
        },
        { label: "Reference", required: true },
        { label: "Notes", type: "textarea", wide: true },
      ];
    if (s.includes("admission") || s.includes("campaign"))
      return [
        { label: "Campaign / application title", required: true },
        {
          label: "Entry class / programme",
          required: true,
          options: training ? courses : classes,
        },
        { label: "Application opens", type: "date", required: true },
        { label: "Application closes", type: "date", required: true },
        { label: "Seats available", type: "number" },
        { label: "Description", type: "textarea", wide: true },
      ];
    if (
      s.includes("course") ||
      s.includes("programme") ||
      s.includes("batch") ||
      s.includes("run")
    )
      return [
        { label: "Course / cohort name", required: true },
        { label: "Instructor", required: true, options: instructors },
        { label: "Start date", type: "date", required: true },
        { label: "End date", type: "date" },
        { label: "Capacity", type: "number" },
        { label: "Delivery mode", options: ["In person", "Online", "Hybrid"] },
        { label: "Learning outcomes", type: "textarea", wide: true },
      ];
    return [
      { label: `${title} name`, required: true },
      { label: "Code", required: true },
      {
        label: "Campus / scope",
        options: training
          ? ["Dhaka Learning Centre", "Online", "Chattogram Centre"]
          : ["Stravix Main Campus", "Gulshan Campus", "Chattogram Campus"],
      },
      { label: "Effective from", type: "date" },
      { label: "Status", options: ["Draft", "Active", "Archived"] },
      { label: "Description", type: "textarea", wide: true },
    ];
  }

  private makeRows(): EducationRow[] {
    const s = this.routePath.toLowerCase();
    const names =
      s.includes("teacher") || s.includes("instructor")
        ? instructors
        : s.includes("course") ||
            s.includes("batch") ||
            s.includes("run") ||
            s.includes("programme")
          ? courses
          : students;
    const generatedRows = Array.from({ length: 28 }, (_, i) => {
      const n = names[i % names.length];
      const className = classes[i % classes.length];
      const code = s.includes("attendance")
        ? `ATT-26-${String(150 + i).padStart(3, "0")}`
        : s.includes("fee") || s.includes("payment")
          ? `FEE-26-${String(410 + i).padStart(3, "0")}`
          : s.includes("admission") || s.includes("application")
            ? `ADM-26-${String(230 + i).padStart(3, "0")}`
            : s.includes("course") ||
                s.includes("run") ||
                s.includes("programme") ||
                s.includes("batch")
              ? `LRN-${String(121 + i).padStart(3, "0")}`
              : `EDU-${String(2601 + i).padStart(4, "0")}`;
      const training = s.startsWith("/app/training-institute");
      const detail =
        s.includes("course") ||
        s.includes("run") ||
        s.includes("batch") ||
        s.includes("programme") ||
        (training &&
          (s.includes("dashboard") || s.includes("enrollment-requests")))
          ? courses[i % courses.length]
          : className;
      let values: string[];
      if (s.includes("attendance"))
        values = [
          className,
          `${23 + (i % 3)} Sep · ${i % 5 === 0 ? "08:15" : "08:03"}`,
          instructors[i % instructors.length],
        ];
      else if (
        s.includes("exam") ||
        s.includes("quiz") ||
        s.includes("assessment")
      )
        values = [
          detail,
          `${12 + (i % 8)} Oct 2026`,
          `${32 + ((i * 7) % 90)} submissions`,
        ];
      else if (
        s.includes("fee") ||
        s.includes("payment") ||
        s.includes("invoice")
      )
        values = [
          className,
          `${25 + (i % 5)} Sep 2026`,
          `৳ ${(4200 + i * 675).toLocaleString("en-BD")}`,
        ];
      else if (s.includes("teacher") || s.includes("instructor"))
        values = [
          ["Mathematics", "Science", "English", "Business Studies"][i % 4],
          training ? courses[i % courses.length] : className,
          `${instructors[i % instructors.length].toLowerCase().replace(" ", ".")}@stravix.edu.bd`,
        ];
      else if (
        s.includes("course") ||
        s.includes("run") ||
        s.includes("programme") ||
        s.includes("batch") ||
        s.includes("certificate")
      )
        values = [
          instructors[i % instructors.length],
          `${18 + (i % 14)} learners`,
          `Next session · ${26 + (i % 4)} Sep`,
        ];
      else if (
        s.includes("admission") ||
        s.includes("application") ||
        s.includes("inquir")
      )
        values = [
          training ? courses[i % courses.length] : className,
          `${20 + (i % 5)} Sep 2026`,
          ["Documents review", "Interview", "Placement check"][i % 3],
        ];
      else if (
        s.includes("timetable") ||
        s.includes("routine") ||
        s.includes("session") ||
        s.includes("meeting")
      )
        values = [
          `${8 + (i % 8)}:${i % 2 ? "30" : "00"}`,
          className,
          ["Mathematics", "Science lab", "Business English"][i % 3],
        ];
      else if (s.includes("assignment"))
        values = [
          detail,
          className,
          `${28 + (i % 5)} Sep 2026`,
          `${12 + (i % 28)} / 32 submitted`,
        ];
      else if (
        s.includes("announcement") ||
        s.includes("messaging") ||
        s.includes("notification")
      )
        values = [
          [
            "Term dates published",
            "Parent meeting reminder",
            "Assessment schedule",
          ][i % 3],
          ["Students & guardians", "Grade 8 families", "Teaching staff"][i % 3],
          `${22 + (i % 3)} Sep`,
          ["Delivered", "Scheduled", "Read"][i % 3],
        ];
      else if (s.includes("guardian"))
        values = [
          className,
          ["Mother", "Father", "Guardian"][i % 3],
          `${i % 3 ? "Current" : "৳ 2,400 due"}`,
        ];
      else if (
        s.includes("setting") ||
        s.includes("rule") ||
        s.includes("template") ||
        s.includes("policy") ||
        s.includes("identity") ||
        s.includes("category")
      )
        values = [
          training ? "Institute wide" : "Main campus",
          `${24 - (i % 6)} Sep 2026`,
          instructors[i % instructors.length],
        ];
      else
        values = [
          className,
          `${24 - (i % 6)} Sep 2026`,
          training ? "Learning Services" : "Stravix Main Campus",
        ];
      while (values.length < 3) values.push("—");
      const isStudentRoute = s.startsWith("/app/school-management/students");
      const isStudentDirectory = s === "/app/school-management/students";
      const status = isStudentRoute
        ? i % 7 === 0
          ? "Inactive"
          : "Active"
        : statuses[(i + 2) % statuses.length];
      const emailName = n
        .toLowerCase()
        .replace(/[^a-z ]/g, "")
        .trim()
        .split(/\s+/)
        .join(".");
      if (isStudentRoute) {
        const grade = this.gradeOptions[i % this.gradeOptions.length];
        const section = studentSections[i % studentSections.length];
        values = [
          `${grade} · ${section}`,
          `${24 - (i % 6)} Sep 2026`,
          "Stravix Main Campus",
        ];
      }
      return {
        code,
        name: n,
        detail,
        values,
        status,
        amount: `৳ ${(4200 + i * 675).toLocaleString("en-BD")}`,
        email: isStudentRoute
          ? `${emailName}@students.stravix.edu.bd`
          : undefined,
      };
    });
    return [...this.createdStudents, ...generatedRows].map((row) => {
      const saved = this.studentFormOverrides[row.code];
      if (!saved) return row;
      const [firstName = "", ...rest] = [
        saved["First Name"] ?? "",
        saved["Last Name"] ?? "",
      ];
      return {
        ...row,
        name: [firstName, ...rest].filter(Boolean).join(" "),
        status: saved["Status"] || row.status,
        email: saved["Email"] || row.email,
        values: [
          `${saved["Class"] || "Grade 8"} · ${saved["Section"] || "A"}`,
          row.values[1],
          this.selectedCampus,
        ],
      };
    });
  }
}
