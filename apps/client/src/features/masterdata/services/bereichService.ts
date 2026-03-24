import { createCrudService } from "@/src/shared/api/createCrudService";

const bereichService = createCrudService<Bereich, { name: string }>("bereich");

export default bereichService;
