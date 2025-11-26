export type UserRole = 'STAFF' | 'MANAGEMENT' | 'FINANCE';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string; // Changed to string to support UUIDs
  username: string;
  role: UserRole;
}

// New Interface matching your Backend Response
export interface BackendUserDetail {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  address: string;
  user_type: string; // e.g., "staff"
  is_active?: boolean;
  about_me?: string | null;
  gender?: string;
  marital_status?: string;
  date_of_birth?: string | null;
  age?: number | null;
}

export interface AuthResponse {
  successMessage: string;
  status_code: number;
  access: string;
  refresh: string;
  user_short_detail: BackendUserDetail;
}

export interface ApprovalLog {
  id: number;
  action: string;
  timestamp: string;
  approver_name: string;
}

export interface PurchaseRequest {
  id: string; // Backend returns UUID string
  title: string;
  description: string;
  amount: string;
  status: string; // Backend sends lowercase: "pending", "approved", etc.
  created_at: string;
  timestamps?: string; // Backend also includes this field

  // Backend field names (without _file suffix)
  proforma: string | null;
  purchase_order: string | null;
  receipt: string | null;

  // Backend returns nested object with full user details
  requester_details: BackendUserDetail;
  approver_details: BackendUserDetail | null;
  approved_by: string | null;

  logs?: ApprovalLog[];
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  amount: string;
  proforma_file: File | null;
}