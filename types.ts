
export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface RondaRecord {
  id?: string;
  pointId: string;
  pointName: string;
  timestamp: Date;
  location: GeoLocation;
}

export interface PointMapping {
  [key: string]: string;
}
