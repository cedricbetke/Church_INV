const parseBoolean = (value?: string) => {
    if (!value) {
        return false;
    }

    return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
};

const parsePassword = (value?: string) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};

export const hasAdminBypass = parseBoolean(process.env.EXPO_PUBLIC_IS_ADMIN);
export const adminPassword = parsePassword(process.env.EXPO_PUBLIC_ADMIN_PASSWORD);
