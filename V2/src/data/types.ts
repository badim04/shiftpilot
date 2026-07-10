export type CompanyId = 'oak' | 'bright' | 'metro';

export interface Company {
  id: CompanyId;
  name: string;
  short: string;
  color: string;
  kind: string;
}

export interface Worker {
  id: string;
  name: string;
  first: string;
  initials: string;
  color: string;
  rate: number;
  holiday: number;
  rtw: boolean;
}

export type ShiftStatus = 'scheduled' | 'active' | 'completed' | 'open';

export interface Shift {
  id: string;
  companyId: CompanyId;
  workerId: string | null;
  role: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  rate: number;
  status: ShiftStatus;
  clockIn: string | null;
  clockOut: string | null;
  breakMins: number;
  swap: boolean;
  drop: boolean;
  approved: boolean;
}

export type Period = 'morning' | 'afternoon' | 'evening' | 'night';
export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type Availability = Record<Day, Record<Period, boolean>>;

export interface ChatMsg {
  from: 'manager' | 'worker';
  text: string;
  t: string;
}

export interface Thread {
  id: string;
  workerId: string;
  unread: boolean;
  msgs: ChatMsg[];
}

export interface RotaData {
  shifts: Shift[];
  messages: Thread[];
  availability: Availability;
}

export type Mode = 'landing' | 'worker' | 'company';
