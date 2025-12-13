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
