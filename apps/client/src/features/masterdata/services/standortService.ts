import { createCrudService } from "@/src/shared/api/createCrudService";

const standortService = createCrudService<Standort, { name: string; adresse: string }>("standort");

export default standortService;
