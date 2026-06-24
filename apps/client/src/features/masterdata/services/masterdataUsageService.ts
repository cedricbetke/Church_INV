import apiClient from "@/src/shared/api/apiClient";

export type MasterdataUsageMap = Record<number, number>;

export interface MasterdataUsage {
    brands: MasterdataUsageMap;
    objectTypes: MasterdataUsageMap;
    models: MasterdataUsageMap;
    states: MasterdataUsageMap;
    bereiche: MasterdataUsageMap;
    standorte: MasterdataUsageMap;
    kategorien: MasterdataUsageMap;
    personen: MasterdataUsageMap;
}

export const emptyMasterdataUsage: MasterdataUsage = {
    brands: {},
    objectTypes: {},
    models: {},
    states: {},
    bereiche: {},
    standorte: {},
    kategorien: {},
    personen: {},
};

const masterdataUsageService = {
    getAll: () => apiClient.getAll<MasterdataUsage>("masterdata/usage"),
};

export default masterdataUsageService;
