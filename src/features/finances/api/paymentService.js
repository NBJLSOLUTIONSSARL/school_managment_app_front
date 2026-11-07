import { axiosClient } from '@/lib/axios'

const BASE_URL = '/v1/finances/payments'

export const paymentService = {
  /**
   * Record a payment for an invoice
   * @param {Object} data
   * @param {number} data.invoiceId
   * @param {number} data.amount
   * @param {string} data.method - CASH, BANK_TRANSFER, CHECK
   * @param {string} [data.paidAt]
   */
  async createPayment(data) {
    const response = await axiosClient.post(BASE_URL, data)
    return response.data?.data || response.data
  },

  /**
   * Get payments for a specific invoice
   * @param {number|string} invoiceId
   */
  async getPaymentsByInvoice(invoiceId) {
    const response = await axiosClient.get(`${BASE_URL}/invoice/${invoiceId}`)
    return response.data?.data || response.data
  },

  /**
   * Download payment receipt PDF
   * @param {number|string} paymentId
   */
  async downloadReceipt(paymentId) {
    const response = await axiosClient.get(`${BASE_URL}/${paymentId}/receipt`, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recu-${paymentId}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  },
}
