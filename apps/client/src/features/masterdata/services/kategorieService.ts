import { createCrudService } from "@/src/shared/api/createCrudService";
import { createMergeService } from "@/src/features/masterdata/services/createMergeService";

const kategorieService = {
    ...createCrudService<Kategorie, { name: string; bereich_id: number }>("kategorie"),
    ...createMergeService("kategorie"),
};

export default kategorieService;
