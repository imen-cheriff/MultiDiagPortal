export interface User {
  id?: number
  username: string
  email: string
  firstname: string
  lastname: string
  password?: string
  role: string
  locked?: boolean
  dateofbirth?: Date
  phone?: number
  country?: string
}


