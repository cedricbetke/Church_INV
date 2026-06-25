import { createCrudService } from "@/src/shared/api/createCrudService";
import { createMergeService } from "@/src/features/masterdata/services/createMergeService";

const herstellerService = {
    ...createCrudService<Hersteller, { name: string }, { name: string }>("hersteller"),
    ...createMergeService("hersteller"),
};

export default herstellerService;
