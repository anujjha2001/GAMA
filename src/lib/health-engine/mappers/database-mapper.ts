import { HealthEvent, UserBaseline } from '../types';

export class DatabaseMapper {
  static mapToUserBaseline(dbRecord: any): UserBaseline {
    if (!dbRecord) {
      return {
        hrvAvg7d: 78,
        hrvAvg30d: 74,
        restingHrAvg7d: 59,
        sleepAvg7d: 7.5,
        activityAvg7d: 12000,
        waterAvg7d: 22000,
        stressAvg7d: 45
      };
    }
    return {
      hrvAvg7d: dbRecord.hrvAvg7d ?? 78,
      hrvAvg30d: dbRecord.hrvAvg30d ?? 74,
      restingHrAvg7d: dbRecord.restingHrAvg7d ?? 59,
      sleepAvg7d: dbRecord.sleepAvg7d ?? 7.5,
      activityAvg7d: dbRecord.activityAvg7d ?? 12000,
      waterAvg7d: dbRecord.waterAvg7d ?? 22000,
      stressAvg7d: dbRecord.stressAvg7d ?? 45
    };
  }

  static mapToHealthEvent(dbEvent: any): HealthEvent {
    return {
      id: dbEvent.id,
      type: dbEvent.type,
      title: dbEvent.title,
      timestamp: dbEvent.timestamp ? new Date(dbEvent.timestamp).toISOString() : new Date().toISOString(),
      value: dbEvent.value
    };
  }
}
