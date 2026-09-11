export interface CartoRequest {
  brandId: number;
  carId: number;
  cartoData: any;
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { Carto } from './models/car';
import { environment } from '../environment';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private apiUrl = `${environment.apiUrl}/api/workspace`;
  private APIURL = `${environment.apiUrl}/base-ecu`;

  private pendingCountSubject = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  // Optional service-level state (if really needed)
  public brandId?: number;
  public carId?: number;

  markCartoAsReadOnly(cartoId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/cartos/${cartoId}/readonly`, {});
  }

  /* brands */
  // Get all brands
  getBrands(): Observable<any[]> {
    return this.http.get<any[]>(`${this.APIURL}/marques`);
  }

  // Get all brands with pagination
  getBrandsPaginated(page: number, size: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.APIURL}/marques/paginated`, {
      params: { page: page.toString(), size: size.toString() },
    });
  }

  // Post a new brand
  createBrand(brand: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/brands`, brand);
  }

  // Update an existing brand
  updateBrand(id: number, brand: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/brands/${id}`, brand);
  }

  // Delete a brand
  deleteBrand(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/brands/${id}`);
  }

  /* Cars */
  // Get all cars
  getCars(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cars`);
  }

  // Get all cars with pagination
  getCarsPaginated(page: number, size: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.APIURL}/vehicules/paginated`, {
      params: { page: page.toString(), size: size.toString() },
    });
  }

  // Get a single car by ID
  getCar(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cars/${id}`);
  }

  // Get all cars by brand ID
  // getCarsByBrand(id: number): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.apiUrl}/brands/${id}/cars`);
  // }

  getCarsByBrand(codmar: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.APIURL}/vehicules/by-marque/${codmar}`);
  }

  // Post a new car
  createCar(brandId: number, car: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/brands/${brandId}/cars`, car);
  }

  // Update an existing car
  updateCar(id: number, car: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cars/${id}`, car);
  }

  // Delete a car
  deleteCar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/cars/${id}`);
  }

  /* Cartos */
  // Get all cartos
  getCartos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cartos`);
  }

  // Get all cartos with pagination
  getCartosPaginated(page: number, size: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cartos/paginated`, {
      params: { page: page.toString(), size: size.toString() },
    });
  }

  // Get a single carto by ID
  getCarto(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cartos/${id}`);
  }

  // Get all cartos by ID car
  // getCartosByCar(id: number): Observable<any[]> {
  //   return this.http.get<any[]>(`${this.APIURL}/devs/vehicules/${id}/details`);
  // }

  // Get all cartos by ID car
  getCartosByCar(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cars/${id}/cartos`);
  }

  // Post a new carto
  createCarto(carId: number, cartoData: Carto): Observable<any> {
    const url = `${this.apiUrl}/cars/${carId}/cartos`;
    return this.http.post<any>(url, cartoData);
  }

  // Update an existing carto
  updateCarto(id: number, carto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cartos/${id}`, carto);
  }

  // Delete a carto
  deleteCarto(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/cartos/${id}`);
  }

  // Get detailed cartography by ID
  getCartoById(id: number): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/cartos/${id}`);
  }

  /* families */
  // Get all families
  addFamily(cartoId: number, family: any): Observable<any> {
    // Replace the URL with the correct endpoint for adding a family
    const url = `/api/cartographies/${cartoId}/families`;
    return this.http.post<any>(url, family);
  }

  getFamilies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.APIURL}/familles`);
  }

  // Get all families with pagination
  getFamiliesPaginated(page: number, size: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/families/paginated`, {
      params: { page: page.toString(), size: size.toString() },
    });
  }

  // Get a single family by ID
  getFamily(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/families/${id}`);
  }

  // Get all families by ID car
  getFamiliesByCarto(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cartos/${id}/families`);
  }

  // Post a new family
  createFamily(family: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/families`, family);
  }

  // Update an existing family
  updateFamily(id: number, family: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/families/${id}`, family);
  }

  // Delete a family
  deleteFamily(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/families/${id}`);
  }

  /* Ecus  */
  // Get all ecus
  getEcus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.APIURL}/ecus`);
  }

  // Get all ecus with pagination
  getEcusPaginated(page: number, size: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ecus/paginated`, {
      params: { page: page.toString(), size: size.toString() },
    });
  }

  // Get a single ecu by ID
  getEcu(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ecus/${id}`);
  }

  // Get all ecus by ID car
  getEcusByFamily(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/families/${id}/ecus`);
  }

  // Post a new ecu
  createEcu(ecu: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ecus`, ecu);
  }

  // Update an existing ecu
  updateEcu(id: number, ecu: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/ecus/${id}`, ecu);
  }

  // Delete an ecu
  deleteEcu(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/ecus/${id}`);
  }

  getPendingCartos(): Observable<Carto[]> {
    return this.http.get<Carto[]>(`${this.apiUrl}/verify-cartos`);
  }

  approveCarto(cartoId: number): Observable<Carto> {
    return this.http.put<Carto>(`${this.apiUrl}/verify-cartos/cartos/${cartoId}/approve`, {});
  }

  rejectCarto(cartoId: number): Observable<Carto> {
    return this.http.put<Carto>(`${this.apiUrl}/verify-cartos/cartos/${cartoId}/reject`, {});
  }

  getPendingCartosCount(): Observable<Carto[]> {
    return this.http.get<Carto[]>(`${this.apiUrl}/verify-cartos/count`);
  }

  updatePendingCount(count: number): void {
    this.pendingCountSubject.next(count);
  }
}
