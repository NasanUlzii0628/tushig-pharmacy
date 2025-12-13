export interface SupplierType {
    id: number
    name: string
    contact: string
    wechat: string
    status: string
    created_user_id: number
    updated_user_id: string
    deleted_user_id: string
    createdAt: string
    updatedAt: string
}

export interface SupplierCreateForm {
    name: string,
    contact: string,
    wechat: string
}

export interface SupplierUpdateForm {
    id: number,
    name: string,
    contact: string,
    wechat: string
}