import { createCrudService } from "@/src/shared/api/createCrudService";
import { createMergeService } from "@/src/features/masterdata/services/createMergeService";

const statusService = {
    ...createCrudService<Status, { name: string }>("status"),
    ...createMergeService("status"),
};

export default statusService;
