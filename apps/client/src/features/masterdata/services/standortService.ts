import { createCrudService } from "@/src/shared/api/createCrudService";
import apiClient from "@/src/shared/api/apiClient";

export type StandortMergeResult = {
    sourceId: number;
    sourceName: string;
    targetId: number;
    targetName: string;
    updatedDevices: number;
    deletedSource: boolean;
};

const standortCrudService = createCrudService<Standort, { name: string }, { name: string }>("standort");

const standortService = {
    ...standortCrudService,
    merge: (sourceId: number, targetId: number) =>
        apiClient.create<StandortMergeResult>(`standort/${sourceId}/merge`, { targetId }),
};

export default standortService;
