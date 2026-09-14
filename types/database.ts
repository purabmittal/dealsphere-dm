export type Profile = {
  id: string;
  email: string;
  instagram_username: string;
  role: 'visitor' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'link';
  content: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
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
