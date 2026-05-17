export interface Store {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  schedule: string | null;
  phone: string | null;
}
