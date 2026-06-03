export type QuoteItem = {
  productId: string;
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
  customer_instagram?: string | null;
  customer_email?: string | null;
  event_type?: string | null;
  event_date?: string | null;
  custom_notes?: string | null;
};

export type QuoteFormData = {
  customer_name: string;
  customer_phone: string;
  customer_instagram: string;
  customer_email: string;
  event_type: string;
  event_date: string;
  custom_notes: string;
};
