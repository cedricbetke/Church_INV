import { createCrudService } from "@/src/shared/api/createCrudService";

const statusService = createCrudService<Status, { name: string }>("status");

export default statusService;
