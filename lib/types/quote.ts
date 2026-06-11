export type QuoteItem = {
  productId: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string | null;
  quantity: number;
};

export type QuoteRequestInsert = {
  customer_name: string;
  customer_phone: string;
  items: QuoteItem[];
  unique_products: number;
  desired_total_pieces: number;
  estimated_subtotal: number;
  status: string;
  privacy_accepted: boolean;
  customer_instagram?: string | null;
  customer_email?: string | null;
  event_type?: string | null;
  event_date?: string | null;
  custom_notes?: string | null;
};

export type QuoteRequest = QuoteRequestInsert & {
  id: number;
  created_at: string | null;
};

export type QuoteRequestAdmin = {
  id: number;
  created_at: string | null;
  customer_name: string;
  customer_phone: string;
  event_type: string | null;
  desired_total_pieces: number;
  estimated_subtotal: number;
  status: string;
};

export type QuoteFormData = {
  customer_name: string;
  customer_phone: string;
  customer_instagram: string;
  customer_email: string;
  event_type: string;
  event_date: string;
  custom_notes: string;
  privacy_accepted: boolean;
};
