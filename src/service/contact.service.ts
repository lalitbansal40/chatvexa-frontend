import axiosServices from "utils/axios";

class ContactService {

  async getContacts() {
    const response = await axiosServices.get("contact");
    return response.data;
  }

//   async getContactById(id: string) {
//     const response = await axiosServices.get(`${this.baseUrl}/${id}`);
//     return response.data;
//   }
}

export const contactService = new ContactService();