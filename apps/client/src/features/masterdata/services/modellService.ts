import { createCrudService } from "@/src/shared/api/createCrudService";
import { createMergeService } from "@/src/features/masterdata/services/createMergeService";

type ModellPayload = { name: string; hersteller_id: number; objekttyp_id?: number | null };

const modellService = {
    ...createCrudService<Modell, ModellPayload, ModellPayload>("modell"),
    ...createMergeService("modell"),
};

export default modellService;
