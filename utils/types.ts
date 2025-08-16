export type PayReq = {
  amount: number
  btcpay: string
  project_name: string
  email?: string
  name?: string
  zaprite: string
}

export type Stats = {
  usd: {
    donations: number
    total: number
  }
  btc: {
    donations: number
    total: number
  }
}
