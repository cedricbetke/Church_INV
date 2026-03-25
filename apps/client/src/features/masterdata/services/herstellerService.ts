import { createCrudService } from "@/src/shared/api/createCrudService";

const herstellerService = createCrudService<Hersteller, { name: string }, { name: string }>("hersteller");

export default herstellerService;
