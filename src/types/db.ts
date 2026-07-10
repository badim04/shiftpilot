export type TravelMode = "driving" | "transit" | "bicycling" | "walking";
export type ShiftStatus = "pending_review" | "confirmed" | "completed" | "cancelled";

export interface Profile {
  id: string;
  full_name: string | null;
  default_buffer_mins: number;
  default_travel_mode: TravelMode;
  inbound_token: string;
}

export interface SavedLocation {
  id: string;
  user_id: string;
  label: string;
  address: string;
  lat: number | null;
  lng: number | null;
  is_default: boolean;
}

export interface Shift {
  id: string;
  user_id: string;
  company: string;
  venue_name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  starts_at: string;
  ends_at: string;
  notes: string | null;
  pay_rate: number | null;
  pay_type: "hourly" | "flat" | null;
  origin_location_id: string | null;
  travel_mode: TravelMode;
  reminder_offset_mins: number;
  buffer_mins: number;
  status: ShiftStatus;
  source: "manual" | "email" | "template" | "ical";
  travel_duration_secs: number | null;
  leave_by_at: string | null;
  traffic_checked_at: string | null;
  leave_alert_sent: boolean;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  company: string;
  venue_name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  duration_mins: number;
  notes: string | null;
  pay_rate: number | null;
  pay_type: "hourly" | "flat" | null;
}
