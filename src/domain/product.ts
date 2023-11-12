export interface Product {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  inventoryStatus?: string;
  category?: string;
  image?: string;
  rating?: number;
  customer?: string;
  productName?: string;
}

export interface GroupedProduct {
  code: string;
  products: Product[];
  totalRows: number;
}

export enum cargoType {
  Transfer = 'Kuorma',
  ShippingDocument = 'Siirtoasiakirja',
}

export type TransferState =
  | 'SHOPPING_CART_DRAFT'
  | 'REGISTERED'
  | 'WEIGHTING'
  | 'COMPLETED'
  | 'DELETED';

export interface ProductCollectionPoint {
  id: string;
  identifier: string;
  name: string;
}

export interface ProductBatchName {
  productName: string;

  batchName: string;
}

export enum WasteOrigin {
  HOUSEHOLD = 'HOUSEHOLD',
  COMPANY = 'COMPANY',
  UNKNOWN = 'UNKNOWN',
}
export enum UnitType {
  MASS = 'MASS', //weight in tons
  PCS = 'PCS', // units in pieces
  VOLUME = 'VOLUME', //liquid in litres
}

export interface cargoEvent {
  id: string; // unique per event. 
  transferId: string; // a cargo load can have several cargoEvents.
  productId: string; // one product per cargoEvent.
  productCode: string; // unique per product
  productName: string; // unique per product
  batchName: string; // product can belong in a certain batch
  categoryName: string;
  wasteOrigin: WasteOrigin; // origin is the same  for transferId. Randomly set values per transferId
  contractNumber: string; // contractNumber is the same  for transferId. Randomly set values per transferId
  incoming: boolean; // incoming, outgoing is the same for transferId. one of these can be active per transferId.  Randomly set values per transferId
  outgoing: boolean;
  categoryId: string;
  totalPriceWithVat?: number; // price per productId is the same for the same contractNumber
  unitType: UnitType;
  quantity?: number; // in pieces.
  weight?: number; // in tons.
  volume?: number; // in m3
  customer?: string; // Owner of the event line
  registerNumber?: string; // register numbr of transport vehicle
  transportCompany?: string; // name of the company
  type: cargoType; 
  state: TransferState; 
  sourceCollectionPoint: ProductCollectionPoint;
  targetCollectionPoint: ProductCollectionPoint;
  fetchCollectionPoint: ProductCollectionPoint;
  eventDate: Date; // value is the same for transferId.
}
