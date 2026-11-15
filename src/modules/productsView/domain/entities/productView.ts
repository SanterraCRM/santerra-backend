export interface ProductView {
  id: number | null;
  product: string | null;      
  isActive: number | null;
  manufacturerId: string | null;
  manufacturer: string | null;
  department: string | null;
  section: string | null;
  category: string | null;  
  line: string | null;
  stockUnity: string | null;
  purchaseUnity: string | null;
  purchaseQuantity: number | null;
  weight: number | null;
  weightNet: number | null;
  volume: number | null;
  ncm: string | null;
}
