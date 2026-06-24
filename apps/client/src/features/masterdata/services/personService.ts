import { createCrudService } from "@/src/shared/api/createCrudService";

type PersonPayload = { vorname: string; nachname: string };

const personService = createCrudService<Person, PersonPayload, PersonPayload>("person");

export default personService;
