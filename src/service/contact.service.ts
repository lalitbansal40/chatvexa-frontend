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

  async createContact(channelId: string, name: string, phone: string) {
    const response = await axiosServices.post(`contact/${channelId}`, {
      name,
      phone,
    });

    return response.data;
  }

  async markAsRead(contactId: string) {
    return axiosServices.patch(`/message/read/${contactId}`);
  }
}

export const contactService = new ContactService();
