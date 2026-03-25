import { createCrudService } from "@/src/shared/api/createCrudService";

type Objekttyp = { id: number; name: string; beschreibung?: string };

const objekttypService = createCrudService<Objekttyp>("objekttyp");

export default objekttypService;
