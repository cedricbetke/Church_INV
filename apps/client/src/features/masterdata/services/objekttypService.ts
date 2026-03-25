import { createCrudService } from "@/src/shared/api/createCrudService";

type Objekttyp = { id: number; name: string };

const objekttypService = createCrudService<Objekttyp, { name: string }, { name: string }>("objekttyp");

export default objekttypService;
