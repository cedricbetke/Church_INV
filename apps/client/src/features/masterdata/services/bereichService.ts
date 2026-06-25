import { createCrudService } from "@/src/shared/api/createCrudService";
import { createMergeService } from "@/src/features/masterdata/services/createMergeService";

const bereichService = {
    ...createCrudService<Bereich, { name: string }>("bereich"),
    ...createMergeService("bereich"),
};

export default bereichService;
