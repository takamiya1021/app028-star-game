import type { ImgHTMLAttributes } from 'react';

const MockNextImage = (props: ImgHTMLAttributes<HTMLImageElement>) => {
  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...props} />;
};

export default MockNextImage;
