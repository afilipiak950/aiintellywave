
export interface CustomerMetric {
  id: string;
  customer_id: string;
  conversion_rate: number;
  booking_candidates: number;
  previous_conversion_rate: number;
  previous_booking_candidates: number;
  updated_at: string;
  created_at: string;
}

export interface CustomerMetricFormData {
  conversion_rate: number;
  booking_candidates: number;
}
