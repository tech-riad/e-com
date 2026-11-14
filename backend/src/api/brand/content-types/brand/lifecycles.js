const { errors } = require('@strapi/utils');

const CARD_IMAGE_WIDTH = 800;
const CARD_IMAGE_HEIGHT = 500;

function getMediaId(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  if (!value || typeof value !== 'object') return undefined;
  if (typeof value.id === 'number') return value.id;
  const connected = value.connect ?? value.set;
  const first = Array.isArray(connected) ? connected[0] : connected;
  return typeof first?.id === 'number' ? first.id : undefined;
}

async function validateCardImage(event) {
  const value = event.params.data?.cardImage;
  if (value === undefined || value === null) return;

  const id = getMediaId(value);
  if (!id) return;

  const file = await strapi.db.query('plugin::upload.file').findOne({
    where: { id },
    select: ['id', 'width', 'height'],
  });
  if (!file) return;

  if (file.width !== CARD_IMAGE_WIDTH || file.height !== CARD_IMAGE_HEIGHT) {
    throw new errors.ValidationError('Brand Shop image must be exactly 800 x 500 pixels.');
  }
}

module.exports = {
  beforeCreate: validateCardImage,
  beforeUpdate: validateCardImage,
};