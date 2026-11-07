import { axiosClient } from '@/lib/axios'

const BASE_URL = '/v1/finances/invoices'

export const invoiceService = {
  /**
   * List invoices with filters and pagination
   * @param {Object} params
   * @param {number} [params.studentId]
   * @param {string} [params.status] - UNPAID, PARTIAL, PAID, OVERDUE
   * @param {string} [params.number]
   * @param {string} [params.dueFrom]
   * @param {string} [params.dueTo]
   * @param {number} [params.page=0]
   * @param {number} [params.size=20]
   */
  async getInvoices({ studentId, status, number, dueFrom, dueTo, page = 0, size = 20 } = {}) {
    const params = { page, size }
    if (studentId) params.studentId = studentId
    if (status && status !== 'ALL') params.status = status
    if (number) params.number = number
    if (dueFrom) params.dueFrom = dueFrom
    if (dueTo) params.dueTo = dueTo

    const response = await axiosClient.get(BASE_URL, { params })
    return response.data?.data || response.data
  },

  /**
   * Get invoice with lines by ID
   * @param {number|string} id
   */
  async getInvoiceById(id) {
    const response = await axiosClient.get(`${BASE_URL}/${id}`)
    return response.data?.data || response.data
  },

  /**
   * Create invoice with line items
   * @param {Object} data
   * @param {number} data.studentId
   * @param {string} data.dueDate
   * @param {number} [data.discount=0]
   * @param {Array<{ feeTypeId: number, quantity: number, unitAmount: number }>} data.lines
   */
  async createInvoice(data) {
    const response = await axiosClient.post(BASE_URL, data)
    return response.data?.data || response.data
  },

  /**
   * Update invoice due date or discount
   * @param {number|string} id
   * @param {Object} data
   */
  async updateInvoice(id, data) {
    const response = await axiosClient.put(`${BASE_URL}/${id}`, data)
    return response.data?.data || response.data
  },

  /**
   * Delete invoice without payments
   * @param {number|string} id
   */
  async deleteInvoice(id) {
    const response = await axiosClient.delete(`${BASE_URL}/${id}`)
    return response.data?.data || response.data
  },

  /**
   * Add line to invoice
   * @param {number|string} invoiceId
   * @param {Object} lineData
   */
  async addLine(invoiceId, lineData) {
    const response = await axiosClient.post(`${BASE_URL}/${invoiceId}/lines`, lineData)
    return response.data?.data || response.data
  },

  /**
   * Remove line from invoice
   * @param {number|string} invoiceId
   * @param {number|string} lineId
   */
  async removeLine(invoiceId, lineId) {
    const response = await axiosClient.delete(`${BASE_URL}/${invoiceId}/lines/${lineId}`)
    return response.data?.data || response.data
  },
}
