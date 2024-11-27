// src/lib/db/focus-sessions.ts
export interface FocusSession {
    startTime: number;
    endTime?: number;
    focusScore: number;
    interruptions: number;
    flowStates: number;
    applicationData: ApplicationUsage[];
  }
  
  interface ApplicationUsage {
    name: string;
    timeSpent: number;
    category: 'productive' | 'neutral' | 'distracting';
  }
  
  class FocusSessionsDB {
    private dbName = 'OddlyFocusDB';
    private dbVersion = 1;
  
    async initDB(): Promise<IDBDatabase> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);
  
        request.onerror = () => {
          reject(request.error);
        };
  
        request.onsuccess = () => {
          resolve(request.result);
        };
  
        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains('sessions')) {
            const store = db.createObjectStore('sessions', { keyPath: 'startTime' });
            
            // Create indexes for common queries
            store.createIndex('byDate', 'startTime');
            store.createIndex('byFocusScore', 'focusScore');
            store.createIndex('byFlowStates', 'flowStates');
          }
        };
      });
    }
  
    async saveSession(session: FocusSession): Promise<void> {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['sessions'], 'readwrite');
        const store = transaction.objectStore('sessions');
        
        const request = store.add(session);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  
    async getSessions(startDate: Date, endDate: Date): Promise<FocusSession[]> {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['sessions'], 'readonly');
        const store = transaction.objectStore('sessions');
        const index = store.index('byDate');
        
        const range = IDBKeyRange.bound(startDate.getTime(), endDate.getTime());
        const request = index.getAll(range);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  
    async getAverages(days: number): Promise<{
      averageFocusScore: number;
      averageFlowStates: number;
      averageInterruptions: number;
    }> {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const sessions = await this.getSessions(startDate, endDate);
      
      if (sessions.length === 0) {
        return {
          averageFocusScore: 0,
          averageFlowStates: 0,
          averageInterruptions: 0,
        };
      }
  
      const totals = sessions.reduce(
        (acc, session) => ({
          focusScore: acc.focusScore + session.focusScore,
          flowStates: acc.flowStates + session.flowStates,
          interruptions: acc.interruptions + session.interruptions,
        }),
        { focusScore: 0, flowStates: 0, interruptions: 0 }
      );
  
      return {
        averageFocusScore: totals.focusScore / sessions.length,
        averageFlowStates: totals.flowStates / sessions.length,
        averageInterruptions: totals.interruptions / sessions.length,
      };
    }
  
    async getApplicationUsage(days: number): Promise<{
      [key: string]: { timeSpent: number; category: string };
    }> {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const sessions = await this.getSessions(startDate, endDate);
      
      return sessions.reduce((acc, session) => {
        session.applicationData.forEach((app) => {
          if (!acc[app.name]) {
            acc[app.name] = { timeSpent: 0, category: app.category };
          }
          acc[app.name].timeSpent += app.timeSpent;
        });
        return acc;
      }, {} as { [key: string]: { timeSpent: number; category: string } });
    }
  
    async getFlowStatePatterns(): Promise<{
      timeOfDay: { [key: string]: number };
      dayOfWeek: { [key: string]: number };
    }> {
      const sessions = await this.getSessions(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        new Date()
      );
  
      const patterns = {
        timeOfDay: {} as { [key: string]: number },
        dayOfWeek: {} as { [key: string]: number },
      };
  
      sessions.forEach((session) => {
        if (session.flowStates > 0) {
          const date = new Date(session.startTime);
          const hour = date.getHours();
          const day = date.getDay();
  
          // Track time of day (in 3-hour blocks)
          const timeBlock = Math.floor(hour / 3) * 3;
          const timeKey = `${timeBlock}-${timeBlock + 3}`;
          patterns.timeOfDay[timeKey] = (patterns.timeOfDay[timeKey] || 0) + 1;
  
          // Track day of week
          const dayKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
          patterns.dayOfWeek[dayKey] = (patterns.dayOfWeek[dayKey] || 0) + 1;
        }
      });
  
      return patterns;
    }
  
    async clearOldData(daysToKeep: number): Promise<void> {
      const db = await this.initDB();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['sessions'], 'readwrite');
        const store = transaction.objectStore('sessions');
        const range = IDBKeyRange.upperBound(cutoffDate.getTime());
        const request = store.delete(range);
  
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  
    async exportData(): Promise<string> {
      const sessions = await this.getSessions(
        new Date(0), // Beginning of time
        new Date()   // Current time
      );
  
      return JSON.stringify(sessions, null, 2);
    }
  
    async importData(jsonData: string): Promise<void> {
      try {
        const sessions = JSON.parse(jsonData) as FocusSession[];
        const db = await this.initDB();
  
        const transaction = db.transaction(['sessions'], 'readwrite');
        const store = transaction.objectStore('sessions');
  
        for (const session of sessions) {
          await new Promise<void>((resolve, reject) => {
            const request = store.add(session);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        }
      } catch (error) {
        throw new Error(`Failed to import data: ${error}`);
      }
    }
  }
  
  export const focusSessionsDB = new FocusSessionsDB();