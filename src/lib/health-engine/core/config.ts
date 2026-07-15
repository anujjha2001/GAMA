export const config = {
  algorithms: {
    stress: {
      version: "1.0.0",
      weights: {
        hrv: 0.30,
        restingHeartRate: 0.25,
        sleep: 0.20,
        activity: 0.15,
        mood: 0.10
      }
    },
    recovery: {
      version: "1.0.0",
      weights: {
        sleep: 0.35,
        hrv: 0.30,
        restingHeartRate: 0.20,
        stress: 0.15
      }
    },
    heart: {
      version: "1.0.0",
      weights: {
        currentHeartRate: 0.20,
        restingHeartRate: 0.20,
        hrv: 0.20,
        bloodOxygen: 0.20,
        bloodPressure: 0.20
      }
    },
    sleep: {
      version: "1.0.0",
      weights: {
        duration: 0.40,
        efficiency: 0.30,
        deepRatio: 0.15,
        remRatio: 0.15
      }
    },
    focus: {
      version: "1.0.0",
      weights: {
        deepWorkRatio: 0.40,
        screenTimePenalty: 0.30,
        stressPenalty: 0.30
      }
    },
    energy: {
      version: "1.0.0",
      weights: {
        sleep: 0.40,
        activity: 0.30,
        hydration: 0.20,
        stressPenalty: 0.10
      }
    }
  },
  thresholds: {
    stress: {
      critical: 80,
      high: 60,
      moderate: 40,
      low: 20
    },
    hrv: {
      low: 35,
      critical: 20
    },
    sleep: {
      poor: 55,
      critical: 40
    },
    oxygen: {
      low: 95,
      critical: 90
    },
    restingHr: {
      high: 85,
      critical: 100
    }
  }
};
