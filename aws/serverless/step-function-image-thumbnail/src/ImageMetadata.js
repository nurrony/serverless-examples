module.exports.execute = async event => {
  const {
    detail: {
      bucket: { name },
      object: { key: fileName, size }
    }
  } = event;
  const validImages = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
  const extension = fileName.split('.')[1];
  const isValidImage = validImages.includes(extension);
  console.log('image info', { name, fileName, size, extension, isValidImage });
  return { name, fileName, size, extension, isValidImage };
};
