import { createCrudService } from "@/src/shared/api/createCrudService";

type ModellPayload = { name: string; hersteller_id: number; objekttyp_id?: number | null };

const modellService = createCrudService<Modell, ModellPayload, ModellPayload>("modell");

export default modellService;
