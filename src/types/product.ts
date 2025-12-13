export interface ProductType {
  id: number
  name: string
  img: string
  addi_imgs: string
  default_price: string
  default_supplier_id: number
  status: string
  created_user_id: number
  updated_user_id: string
  deleted_user_id: string
  createdAt: string
  updatedAt: string
}

export interface ProductCreateForm {
  name: string
  img: string
  addi_imgs: string[]
  default_price: number
  default_supplier_id: number
}

export interface ProductUpdateForm {
  id: number
  name: string
  img: string
  addi_imgs: string[]
  default_price: number
  default_supplier_id: number
}