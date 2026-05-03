export interface ProductType {
  id: number
  name: string
  img: string
  currency: string
  addi_imgs: string
  default_price: number
  default_supplier_id: number | null
  status: string
  created_user_id: number
  updated_user_id: string
  deleted_user_id: string
  createdAt: string
  updatedAt: string
  default_supplier: defaultSupplier
}

export interface ProductCreateForm {
  name: string
  img: string
  currency: string
  addi_imgs: string[]
  default_price: number
  default_supplier_id: number | null
}

export interface ProductUpdateForm {
  id: number
  name: string
  img: string
  addi_imgs: string[]
  default_price: number
  default_supplier_id: number | null
}

export interface defaultSupplier {
  id: number,
  name: string
}