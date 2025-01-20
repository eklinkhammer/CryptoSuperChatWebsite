import { ApiCreateInvoice } from "./ApiCreateInvoice";
import { ApiHandleWebhook } from "./ApiHandleWebhook";
import { messageGateway, invoiceController } from "../controllers/Controllers";

export const apiCreateInvoice = new ApiCreateInvoice(messageGateway);

export const apiHandleWebhook = new ApiHandleWebhook(invoiceController);
