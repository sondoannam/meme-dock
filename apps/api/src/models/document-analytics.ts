/**
 * Models for document analytics data
 */

export type DocumentIncreaseTimePeriod = 'day' | 'week' | 'month';

export interface DocumentCountPeriod {
  period: string;
  count: number;
  periodStartDate: string;
  periodEndDate: string;
}

export interface DocumentIncreaseResponse {
  collectionId: string;
  duration: DocumentIncreaseTimePeriod;
  periods: DocumentCountPeriod[];
}
