const fs = require('fs');
const path = require('path');

const uploadsRootDir = path.resolve(__dirname, '..', '..', 'uploads');
const geraeteUploadDir = path.join(uploadsRootDir, 'geraete');
const geraeteThumbsDir = path.join(geraeteUploadDir, 'thumbs');
const THUMBNAIL_SIZE = 240;
const OPTIMIZED_MAX_SIZE = 1400;
const OPTIMIZED_QUALITY = 82;

let jimpModule = null;

const getJimp = () => {
    if (jimpModule) {
        return jimpModule;
    }

    try {
        jimpModule = require('jimp-compact');
        return jimpModule;
    } catch {
        jimpModule = require(path.resolve(__dirname, '..', '..', '..', 'client', 'node_modules', 'jimp-compact'));
        return jimpModule;
    }
};

const normalizeStoredPhotoPath = (storedPath) => {
    if (!storedPath || typeof storedPath !== 'string' || !storedPath.startsWith('/uploads/geraete/')) {
        return null;
    }

    return storedPath.replace(/\\/g, '/');
};

const isThumbnailEligible = (fileNameOrPath) => {
    const normalized = (fileNameOrPath || '').toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.bmp', '.webp'].some((extension) => normalized.endsWith(extension));
};

const getThumbnailFileName = (fileName) => {
    const parsed = path.parse(fileName);
    return `${parsed.name}__thumb.jpg`;
};

const getThumbnailRelativePath = (storedPath) => {
    const normalized = normalizeStoredPhotoPath(storedPath);
    if (!normalized) {
        return null;
    }

    const fileName = path.posix.basename(normalized);
    return `/uploads/geraete/thumbs/${getThumbnailFileName(fileName)}`;
};

const getStoredAbsolutePath = (storedPath) => {
    const normalized = normalizeStoredPhotoPath(storedPath);
    if (!normalized) {
        return null;
    }

    const relativePath = normalized.replace(/^\/uploads\//, '');
    return path.resolve(uploadsRootDir, relativePath);
};

const getThumbnailAbsolutePath = (storedPath) => {
    const thumbnailRelativePath = getThumbnailRelativePath(storedPath);
    if (!thumbnailRelativePath) {
        return null;
    }

    const relativePath = thumbnailRelativePath.replace(/^\/uploads\//, '');
    return path.resolve(uploadsRootDir, relativePath);
};

const writeJpeg = (image, targetPath) =>
    new Promise((resolve, reject) => {
        image.write(targetPath, (error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });

const optimizePhotoToStoredPath = async (source, targetPath) => {
    const Jimp = getJimp();
    const image = await Jimp.read(source);

    image.quality(OPTIMIZED_QUALITY).scaleToFit(OPTIMIZED_MAX_SIZE, OPTIMIZED_MAX_SIZE);

    const targetDir = path.dirname(targetPath);
    fs.mkdirSync(targetDir, { recursive: true });
    await writeJpeg(image, targetPath);
};

const ensureThumbnailForStoredPhoto = async (storedPath) => {
    const sourceAbsolutePath = getStoredAbsolutePath(storedPath);
    const thumbnailAbsolutePath = getThumbnailAbsolutePath(storedPath);
    const thumbnailRelativePath = getThumbnailRelativePath(storedPath);

    if (!sourceAbsolutePath || !thumbnailAbsolutePath || !thumbnailRelativePath) {
        return null;
    }

    if (!fs.existsSync(sourceAbsolutePath) || !isThumbnailEligible(sourceAbsolutePath)) {
        return null;
    }

    fs.mkdirSync(geraeteThumbsDir, { recursive: true });

    const Jimp = getJimp();
    const image = await Jimp.read(sourceAbsolutePath);
    image.quality(72).scaleToFit(THUMBNAIL_SIZE, THUMBNAIL_SIZE);
    await writeJpeg(image, thumbnailAbsolutePath);

    return thumbnailRelativePath;
};

const getExistingThumbnailRelativePath = (storedPath) => {
    const thumbnailAbsolutePath = getThumbnailAbsolutePath(storedPath);
    const thumbnailRelativePath = getThumbnailRelativePath(storedPath);

    if (!thumbnailAbsolutePath || !thumbnailRelativePath) {
        return null;
    }

    return fs.existsSync(thumbnailAbsolutePath) ? thumbnailRelativePath : null;
};

const deleteThumbnailForStoredPhoto = (storedPath) => {
    const thumbnailAbsolutePath = getThumbnailAbsolutePath(storedPath);
    if (!thumbnailAbsolutePath || !fs.existsSync(thumbnailAbsolutePath)) {
        return;
    }

    fs.unlinkSync(thumbnailAbsolutePath);
};

module.exports = {
    optimizePhotoToStoredPath,
    ensureThumbnailForStoredPhoto,
    getExistingThumbnailRelativePath,
    getStoredAbsolutePath,
    getThumbnailAbsolutePath,
    getThumbnailRelativePath,
    deleteThumbnailForStoredPhoto,
    isThumbnailEligible,
};
