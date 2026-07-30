import { createClient } from '@/lib/supabase/client'; // Assuming standard GAMA supabase client pattern
import { HealthMetric, DeviceConnection, SyncHistory } from '@prisma/client';

export type RealtimeCallback<T> = (payload: { new: T; old: T | null; eventType: 'INSERT' | 'UPDATE' | 'DELETE' }) => void;

/**
 * Service to handle real-time sync with Supabase
 */
class DeviceRealtimeService {
  private supabase = createClient();
  
  constructor() {
    this.supabase = createClient();
  }

  /**
   * Listen for updates on the HealthMetric table
   */
  public subscribeToMetrics(profileId: string, callback: RealtimeCallback<HealthMetric>) {
    const channel = this.supabase
      .channel(`public:HealthMetric:profileId=eq.${profileId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'HealthMetric', filter: `profileId=eq.${profileId}` },
        (payload: any) => {
          callback({
            new: payload.new as HealthMetric,
            old: payload.old as HealthMetric,
            eventType: payload.eventType,
          });
        }
      )
      .subscribe((status: string) => {
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('Supabase Realtime disconnected. Retrying...');
        }
      });

    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  /**
   * Listen for updates to device connections
   */
  public subscribeToConnections(profileId: string, callback: RealtimeCallback<DeviceConnection>) {
    const channel = this.supabase
      .channel(`public:DeviceConnection:profileId=eq.${profileId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'DeviceConnection', filter: `profileId=eq.${profileId}` },
        (payload: any) => {
          callback({
            new: payload.new as DeviceConnection,
            old: payload.old as DeviceConnection,
            eventType: payload.eventType,
          });
        }
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  /**
   * Subscribe to SyncHistory for job tracking
   */
  public subscribeToSyncHistory(profileId: string, callback: RealtimeCallback<SyncHistory>) {
    const channel = this.supabase
      .channel(`public:SyncHistory:profileId=eq.${profileId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'SyncHistory', filter: `profileId=eq.${profileId}` },
        (payload: any) => {
          callback({
            new: payload.new as SyncHistory,
            old: payload.old as SyncHistory,
            eventType: payload.eventType,
          });
        }
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }
}

// Export singleton instance
export const deviceRealtimeService = new DeviceRealtimeService();
