import { createCrudService } from "@/src/shared/api/createCrudService";
import { createMergeService } from "@/src/features/masterdata/services/createMergeService";

type Objekttyp = { id: number; name: string };

const objekttypService = {
    ...createCrudService<Objekttyp, { name: string }, { name: string }>("objekttyp"),
    ...createMergeService("objekttyp"),
};

export default objekttypService;
