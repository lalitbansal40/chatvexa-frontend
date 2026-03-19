import axiosServices from "utils/axios";

class ContactService {
  async getContacts(channelId: string, search?: string) {
    const response = await axiosServices.get(`contact/${channelId}`, {
      params: {
        search: search || undefined,
      },
    });

    return response.data;
  }

  async getContactById(contactId: string) {
    const response = await axiosServices.get(`contact/details/${contactId}`);
    return response.data;
  }

  async createContact(
    channelId: string,
    name: string,
    phone: string,
    attributes?: Record<string, any>,
  ) {
    const response = await axiosServices.post(`contact/${channelId}`, {
      name,
      phone,
      attributes, // ✅ now supported
    });

    return response.data;
  }

  // 🔥 UPDATE CONTACT
  async updateContact(
    contactId: string,
    payload: {
      name?: string;
      phone?: string;
      attributes?: Record<string, any>;
    },
  ) {
    const response = await axiosServices.patch(`contact/${contactId}`, payload);
    return response.data;
  }

  async markAsRead(contactId: string) {
    return axiosServices.patch(`/message/read/${contactId}`);
  }
}

export const contactService = new ContactService();
