export interface OrderAdd {
  product_id: number;
  quantity: number;
}

export interface OrderCheck {
  exists: boolean;
  quantity: number;
}

export interface BucketList {
  id: number
  product_id: number
  quantity: number
  unit_price: string
  createdAt: string
  updatedAt: string
  product_name: string
  supplier_name: string
  supplier_id: number
}


export interface OrderTypes {
  id: number
  order_date: string
  amount: string
  supplier_id: number
  supplier_name: string
}

export interface OrderDetailData {
  message: string
  data: OrderDetailTypes
}


export interface OrderDetailTypes {
  id: number
  order_date: string
  amount: string
  order_number: string
  supplier_id: number
  supplier_name: string
  details: Detail[]
}

export interface Detail {
  product_id: number
  product_name: string
  product_image: any
  quantity: number
  unit_price: any
  total_price: string
}

