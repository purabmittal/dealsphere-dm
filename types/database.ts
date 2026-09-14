export type ClientLabel =
  | 'new_lead'
  | 'interested'
  | 'follow_up'
  | 'potential_partner'
  | 'client'
  | 'completed'
  | 'not_interested';

export const CLIENT_LABELS: { value: ClientLabel; display: string }[] = [
  { value: 'new_lead', display: 'New Lead' },
  { value: 'interested', display: 'Interested' },
  { value: 'follow_up', display: 'Follow-up' },
  { value: 'potential_partner', display: 'Potential Partner' },
  { value: 'client', display: 'Client' },
  { value: 'completed', display: 'Completed' },
  { value: 'not_interested', display: 'Not Interested' },
];

export type Profile = {
  id: string;
  email: string;
  instagram_username: string;
  role: 'visitor' | 'admin';
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  status: 'active' | 'archived';
  label: ClientLabel;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'file' | 'link';
  content: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_size: number | null;
  created_at: string;
  read_at: string | null;
};

export type Notification = {
  id: string;
  user_id: string;
  conversation_id: string;
  message_id: string;
  is_read: boolean;
  created_at: string;
};

export type AdminNote = {
  id: string;
  client_id: string;
  admin_id: string;
  note: string;
  created_at: string;
  updated_at: string;
};
