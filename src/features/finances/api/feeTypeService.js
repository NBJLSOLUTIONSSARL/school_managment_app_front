import { axiosClient } from '@/lib/axios'

const BASE_URL = '/v1/finances/fee-types'

export const feeTypeService = {
  /**
   * List all fee types
   */
  async getAllFeeTypes() {
    const response = await axiosClient.get(BASE_URL)
    return response.data?.data || response.data
  },

  /**
   * Create a new fee type
   * @param {Object} data
   * @param {string} data.name
   * @param {number} data.defaultAmount
   */
  async createFeeType(data) {
    const response = await axiosClient.post(BASE_URL, data)
    return response.data?.data || response.data
  },

  /**
   * Delete fee type
   * @param {number|string} id
   */
  async deleteFeeType(id) {
    const response = await axiosClient.delete(`${BASE_URL}/${id}`)
    return response.data?.data || response.data
  },
}
