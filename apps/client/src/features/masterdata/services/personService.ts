import { createCrudService } from "@/src/shared/api/createCrudService";
import { createMergeService } from "@/src/features/masterdata/services/createMergeService";

type PersonPayload = { vorname: string; nachname: string };

const personService = {
    ...createCrudService<Person, PersonPayload, PersonPayload>("person"),
    ...createMergeService("person"),
};

export default personService;
