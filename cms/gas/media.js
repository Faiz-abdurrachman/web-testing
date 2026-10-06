// Shared private-folder helpers; append to both existing GAS projects.
const CMS_MEDIA_PATH = /^\/images\/cms\/projects\/([a-f0-9]{64})\.webp$/;
const CMS_MEDIA_MAX_BYTES = 256 * 1024;

function cmsMediaHash_(bytes) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes)
    .map((byte) => ('0' + ((byte + 256) % 256).toString(16)).slice(-2))
    .join('');
}
function cmsMediaFolder_() {
  const props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty('DRIVE_FOLDER_ID');
  const owner = props.getProperty('OWNER_EMAIL');
  if (!folderId || !owner) throw new Error('Media configuration unavailable.');
  const folder = DriveApp.getFolderById(folderId);
  if (folder.getOwner().getEmail().toLowerCase() !== owner)
    throw new Error('Media access denied.');
  return folder;
}
function cmsMediaFile_(image) {
  const match = CMS_MEDIA_PATH.exec(image);
  if (!match) throw new Error('Invalid media reference.');
  const files = cmsMediaFolder_().getFilesByName(
    'ds-project-' + match[1] + '.webp',
  );
  if (!files.hasNext()) throw new Error('Media unavailable.');
  const file = files.next();
  if (
    files.hasNext() ||
    file.isTrashed() ||
    file.getMimeType() !== 'image/webp' ||
    file.getSize() > CMS_MEDIA_MAX_BYTES
  )
    throw new Error('Invalid media file.');
  return file;
}
function cmsMediaRead_(image) {
  const bytes = cmsMediaFile_(image).getBlob().getBytes();
  if (
    !bytes.length ||
    bytes.length > CMS_MEDIA_MAX_BYTES ||
    cmsMediaHash_(bytes) !== CMS_MEDIA_PATH.exec(image)[1]
  )
    throw new Error('Media integrity failed.');
  return { image, mimeType: 'image/webp', data: Utilities.base64Encode(bytes) };
}
