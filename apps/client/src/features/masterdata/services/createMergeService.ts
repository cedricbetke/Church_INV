import apiClient from "@/src/shared/api/apiClient";

export type MasterdataMergeResult = {
    sourceId: number;
    sourceName: string;
    targetId: number;
    targetName: string;
    updatedReferences: number;
    deletedSource: boolean;
};

export const createMergeService = (resource: string) => ({
    merge: (sourceId: number, targetId: number) =>
        apiClient.create<MasterdataMergeResult>(`${resource}/${sourceId}/merge`, { targetId }),
});
