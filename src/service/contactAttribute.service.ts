import axiosServices from "utils/axios";

export interface ContactAttribute {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "object";
}

class ContactAttributeService {
  // 🔥 GET ATTRIBUTES
  async getAttributes() {
    const response = await axiosServices.get("/contact-attributes");
    return response.data;
  }

  // 🔥 CREATE / UPDATE ATTRIBUTES (UPSERT)
  async upsertAttributes(attributes: ContactAttribute[]) {
    const response = await axiosServices.post("/contact-attributes", {
      attributes
    });
    return response.data;
  }
}

export const contactAttributeService = new ContactAttributeService();