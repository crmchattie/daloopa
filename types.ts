export interface CompanyData {
  // Add appropriate types based on your actual data structure
  [key: string]: any
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

