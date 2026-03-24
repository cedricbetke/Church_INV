import { createCrudService } from "@/src/shared/api/createCrudService";

const personService = createCrudService<Person, { vorname: string; nachname: string; email: string }>("person");

export default personService;
