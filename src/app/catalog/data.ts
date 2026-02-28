export interface Version {
  id: string
  filename: string
  uploadDate: string
  fileSize: string
  isCurrent: boolean
}

export interface CatalogItem {
  id: string
  name: string
  lastUpdated: string
  visibility: "all" | "restricted"
  restrictedTo: string[]
  subscribed: boolean
  lastDownloaded: string | null
  currentVersion: string
  versions: Version[]
  cloudfrontUrl: string
}

export interface MockUser {
  id: string
  name: string
  email: string
}

export const mockUsers: MockUser[] = [
  { id: "jsmith", name: "John Smith", email: "jsmith@company.com" },
  { id: "analyst2", name: "Sarah Chen", email: "schen@company.com" },
  { id: "mwilson", name: "Mike Wilson", email: "mwilson@company.com" },
  { id: "klee", name: "Karen Lee", email: "klee@company.com" },
  { id: "tjohnson", name: "Tom Johnson", email: "tjohnson@company.com" },
  { id: "agarcia", name: "Ana Garcia", email: "agarcia@company.com" },
  { id: "rpatil", name: "Raj Patil", email: "rpatil@company.com" },
  { id: "lnguyen", name: "Lisa Nguyen", email: "lnguyen@company.com" },
  { id: "dkumar", name: "Dev Kumar", email: "dkumar@company.com" },
  { id: "ewright", name: "Emma Wright", email: "ewright@company.com" },
  { id: "bmartin", name: "Brian Martin", email: "bmartin@company.com" },
  { id: "jdavis", name: "Julia Davis", email: "jdavis@company.com" },
]

export const catalogItems: CatalogItem[] = [
  {
    id: "1",
    name: "Q4 Revenue Report",
    lastUpdated: "2026-02-15",
    visibility: "all",
    restrictedTo: [],
    subscribed: true,
    lastDownloaded: "2026-01-20",
    currentVersion: "v3",
    versions: [
      {
        id: "1-v1",
        filename: "q4_revenue_v1.xlsx",
        uploadDate: "2025-11-01",
        fileSize: "2.4 MB",
        isCurrent: false,
      },
      {
        id: "1-v2",
        filename: "q4_revenue_v2.xlsx",
        uploadDate: "2026-01-10",
        fileSize: "2.6 MB",
        isCurrent: false,
      },
      {
        id: "1-v3",
        filename: "q4_revenue_v3.xlsx",
        uploadDate: "2026-02-15",
        fileSize: "2.8 MB",
        isCurrent: true,
      },
    ],
    cloudfrontUrl:
      "https://d1234.cloudfront.net/catalog/q4-revenue/q4_revenue_v3.xlsx",
  },
  {
    id: "2",
    name: "Customer Segmentation Data",
    lastUpdated: "2026-02-20",
    visibility: "all",
    restrictedTo: [],
    subscribed: true,
    lastDownloaded: "2026-02-01",
    currentVersion: "v2",
    versions: [
      {
        id: "2-v1",
        filename: "segmentation_v1.csv",
        uploadDate: "2025-12-15",
        fileSize: "15.1 MB",
        isCurrent: false,
      },
      {
        id: "2-v2",
        filename: "segmentation_v2.csv",
        uploadDate: "2026-02-20",
        fileSize: "16.3 MB",
        isCurrent: true,
      },
    ],
    cloudfrontUrl:
      "https://d1234.cloudfront.net/catalog/segmentation/segmentation_v2.csv",
  },
  {
    id: "3",
    name: "Monthly KPI Dashboard Export",
    lastUpdated: "2026-02-25",
    visibility: "all",
    restrictedTo: [],
    subscribed: false,
    lastDownloaded: "2026-02-25",
    currentVersion: "v1",
    versions: [
      {
        id: "3-v1",
        filename: "kpi_export_feb2026.xlsx",
        uploadDate: "2026-02-25",
        fileSize: "1.1 MB",
        isCurrent: true,
      },
    ],
    cloudfrontUrl:
      "https://d1234.cloudfront.net/catalog/kpi/kpi_export_feb2026.xlsx",
  },
  {
    id: "4",
    name: "Compliance Audit Trail",
    lastUpdated: "2026-01-30",
    visibility: "restricted",
    restrictedTo: ["jsmith", "analyst2"],
    subscribed: true,
    lastDownloaded: null,
    currentVersion: "v2",
    versions: [
      {
        id: "4-v1",
        filename: "audit_trail_v1.pdf",
        uploadDate: "2025-10-15",
        fileSize: "4.2 MB",
        isCurrent: false,
      },
      {
        id: "4-v2",
        filename: "audit_trail_v2.pdf",
        uploadDate: "2026-01-30",
        fileSize: "4.8 MB",
        isCurrent: true,
      },
    ],
    cloudfrontUrl:
      "https://d1234.cloudfront.net/catalog/audit/audit_trail_v2.pdf",
  },
  {
    id: "5",
    name: "Vendor Performance Metrics",
    lastUpdated: "2026-02-10",
    visibility: "restricted",
    restrictedTo: ["mwilson"],
    subscribed: false,
    lastDownloaded: "2026-02-10",
    currentVersion: "v1",
    versions: [
      {
        id: "5-v1",
        filename: "vendor_metrics_q4.xlsx",
        uploadDate: "2026-02-10",
        fileSize: "3.7 MB",
        isCurrent: true,
      },
    ],
    cloudfrontUrl:
      "https://d1234.cloudfront.net/catalog/vendor/vendor_metrics_q4.xlsx",
  },
]
