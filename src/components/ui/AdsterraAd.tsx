'use client';

interface AdsterraAdProps {
  idKey: string;
  width: number | string;
  height: number | string;
  format?: string;
  className?: string;
}

export default function AdsterraAd({ idKey, width, height, format = 'iframe', className = '' }: AdsterraAdProps) {
  const isNative = format === 'native';
  
  let html = '';
  if (isNative) {
    html = `
<!DOCTYPE html>
<html>
<head>
<style>body { margin: 0; padding: 0; background: transparent; overflow: hidden; }</style>
</head>
<body>
  <script async="async" data-cfasync="false" src="https://pl30417811.effectivecpmnetwork.com/${idKey}/invoke.js"></script>
  <div id="container-${idKey}"></div>
</body>
</html>
    `;
  } else {
    html = `
<!DOCTYPE html>
<html>
<head>
<style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }</style>
</head>
<body>
<script>
  atOptions = {
    'key' : '${idKey}',
    'format' : '${format}',
    'height' : ${height},
    'width' : ${width},
    'params' : {}
  };
</script>
<script type="text/javascript" src="https://www.highperformanceformat.com/${idKey}/invoke.js"></script>
</body>
</html>
    `;
  }

  // Use 100% for width/height if they are not fixed numbers (for native banner mostly)
  const frameWidth = typeof width === 'number' ? width : '100%';
  const frameHeight = typeof height === 'number' ? height : '100%';
  const containerWidth = typeof width === 'number' ? `${width}px` : width;
  const containerHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={`flex justify-center items-center ${className}`} style={{ width: containerWidth, minHeight: containerHeight, margin: '0 auto' }}>
      <iframe
        srcDoc={html}
        width={frameWidth}
        height={frameHeight}
        frameBorder="0"
        scrolling="no"
        title="Advertisement"
        style={{ display: 'block', width: frameWidth, height: frameHeight, maxWidth: '100%' }}
      />
    </div>
  );
}
