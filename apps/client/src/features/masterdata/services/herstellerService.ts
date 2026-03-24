import { createCrudService } from "@/src/shared/api/createCrudService";

const herstellerService = createCrudService<Hersteller>("hersteller");

export default herstellerService;
