const resolveAdminPassword = () => {
    const configuredPassword = process.env.ADMIN_PASSWORD ?? process.env.EXPO_PUBLIC_ADMIN_PASSWORD;
    const trimmedPassword = configuredPassword?.trim();
    return trimmedPassword ? trimmedPassword : null;
};

const requireAdmin = (req, res, next) => {
    const adminPassword = resolveAdminPassword();

    if (!adminPassword) {
        return res.status(503).json({ error: "Admin-Passwort ist auf dem Server nicht konfiguriert." });
    }

    const providedPassword = req.header("x-admin-password")?.trim();
    if (!providedPassword || providedPassword !== adminPassword) {
        return res.status(403).json({ error: "Nur Admins duerfen diese Aktion ausfuehren." });
    }

    next();
};

module.exports = requireAdmin;
