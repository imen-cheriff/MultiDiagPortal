import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../environment';

export interface HistoryAction {
  id: number;
  actionType: 'add' | 'modify' | 'delete' | 'approve' | 'reject';
  entityType: 'carto' | 'family' | 'ecu';
  entityId: number;
  entityName: string;
  timestamp: Date;
  userId: number;
  userName: string;
  details?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = `${environment.apiUrl}/api/history`;
  private historySubject = new BehaviorSubject<HistoryAction[]>([]);
  public history$ = this.historySubject.asObservable();

  constructor(private http: HttpClient) {}

  // Get all history records
  getAllHistory(): Observable<HistoryAction[]> {
    return this.http.get<HistoryAction[]>(`${this.apiUrl}`);
  }

  // Get history for a specific cartography
  getHistoryByCartoId(cartoId: number): Observable<HistoryAction[]> {
    return this.http.get<HistoryAction[]>(`${this.apiUrl}/carto/${cartoId}`);
  }

  deleteAllHistory():Observable<HistoryAction[]> {
    return this.http.delete<HistoryAction[]>(`${this.apiUrl}`)
  }

  deleteAction(actionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/actions/${actionId}`);
  }
  

  // Log a new action
  logAction(action: Omit<HistoryAction, 'id' | 'timestamp'>): Observable<HistoryAction> {
    return this.http.post<HistoryAction>(`${this.apiUrl}`, action);
  }

  // Helper methods to simplify logging different types of actions
  logAddAction(entityType: 'carto' | 'family' | 'ecu', entityId: number, entityName: string, userId: number, userName: string, details?: string): Observable<HistoryAction> {
    return this.logAction({
      actionType: 'add',
      entityType,
      entityId,
      entityName,
      userId,
      userName,
      details
    });
  }

  logModifyAction(entityType: 'carto' | 'family' | 'ecu', entityId: number, entityName: string, userId: number, userName: string, details?: string): Observable<HistoryAction> {
    return this.logAction({
      actionType: 'modify',
      entityType,
      entityId,
      entityName,
      userId,
      userName,
      details
    });
  }
 
  logDeleteAction(entityType: 'carto' | 'family' | 'ecu', entityId: number, entityName: string, userId: number, userName: string, details?: string): Observable<HistoryAction> {
    return this.logAction({
      actionType: 'delete',
      entityType,
      entityId,
      entityName,
      userId,
      userName,
      details
    });
  }

  logApproveAction(entityType: 'carto' | 'family' | 'ecu', entityId: number, entityName: string, userId: number, userName: string, details?: string): Observable<HistoryAction> {
    return this.logAction({
      actionType: 'approve',
      entityType,
      entityId,
      entityName,
      userId,
      userName,
      details
    });
  }

  logRejectAction(entityType: 'carto' | 'family' | 'ecu', entityId: number, entityName: string, userId: number, userName: string, details?: string): Observable<HistoryAction> {
    return this.logAction({
      actionType: 'reject',
      entityType,
      entityId,
      entityName,
      userId,
      userName,
      details
    });
  }
}