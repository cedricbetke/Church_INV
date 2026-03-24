import { createCrudService } from "@/src/shared/api/createCrudService";

type DokumentPayload = { name: string; url: string; geraete_id: number };

const dokumenteService = createCrudService<Dokument, DokumentPayload>("dokumente");

export default dokumenteService;
