import { createCrudService } from "@/src/shared/api/createCrudService";

const kategorieService = createCrudService<Kategorie, { name: string; bereich_id: number }>("kategorie");

export default kategorieService;
