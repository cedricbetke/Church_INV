import { createCrudService } from "@/src/shared/api/createCrudService";
import apiClient from "@/src/shared/api/apiClient";

type DokumentPayload = { name: string; url: string; geraete_id: number };

const dokumenteService = {
    ...createCrudService<Dokument, DokumentPayload>("dokumente"),
    getAllByGeraetId: (geraeteId: number) => apiClient.getAll<Dokument[]>(`dokumente?geraete_id=${geraeteId}`),
    upload: (fileName: string, dataUrl: string) =>
        apiClient.create<{ path: string }>("dokumente/upload", { fileName, dataUrl }),
};

export default dokumenteService;
