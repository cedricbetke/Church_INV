import { createCrudService } from "@/src/shared/api/createCrudService";

const standortService = createCrudService<Standort, { name: string }, { name: string }>("standort");

export default standortService;
