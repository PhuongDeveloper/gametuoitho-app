// Performance: Use OffscreenCanvas for temporary drawing operations when available
// This avoids DOM-attached canvas overhead and is faster on most browsers
const ctx = (typeof OffscreenCanvas !== 'undefined')
    ? new OffscreenCanvas(10, 10).getContext('2d')
    : document.createElement('canvas').getContext('2d');
let _ctxW = 10, _ctxH = 10;

// Avoid unnecessary canvas resize (each resize forces GPU buffer reallocation)
function ensureCtxSize(w, h) {
    if (_ctxW !== w) { ctx.canvas.width = w; _ctxW = w; }
    if (_ctxH !== h) { ctx.canvas.height = h; _ctxH = h; }
}

async function transformBitmapOrCanvas(src, sx, sy, sw, sh, a90, mirror) {
  if (a90 == 0 && !mirror) {
    return await createImageBitmap(src, sx, sy, sw, sh);
  }

  const swap = a90 & 1;
  const cw = swap ? sh : sw;
  const ch = swap ? sw : sh;

  ensureCtxSize(cw, ch);

  ctx.save();
  if (a90 || mirror) {
    ctx.translate(cw/2, ch/2);
    if (mirror) {
      ctx.scale(swap ? 1 : -1, swap ? -1 : 1);
    }
    ctx.rotate(a90 * 90 * Math.PI / 180);
    if (swap) {
      ctx.translate(-ch/2, -cw/2);
    } else {
      ctx.translate(-cw/2, -ch/2);
    }
  }
  ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
  ctx.restore();

  return await createImageBitmap(ctx.canvas);
}

function castToUint8Clamped(int8) {
  return new Uint8ClampedArray(int8.buffer, int8.byteOffset, int8.byteLength);
}

function castToInt8(uint8) {
  return new Int8Array(uint8.buffer, uint8.byteOffset, uint8.byteLength);
}


const CanvasImage = {
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasImage_bitmapFromColor(lib, width, height, r, g, b, a) {
    ensureCtxSize(width, height);
    ctx.fillStyle = `rgba(${r} ${g} ${b} / ${a/255})`;
    ctx.fillRect(0, 0, width, height);
    return await createImageBitmap(ctx.canvas);
  },
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasImage_bitmapFromBytes(lib, bytes, result) {
    const blob = new Blob([bytes]);

    try {
      const bitmap = await createImageBitmap(blob);
      result[0] = bitmap.width;
      result[1] = bitmap.height;
      return bitmap;
    } catch (e) {
      return null;
    }
  },
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasImage_transformBitmap(lib, bmp, sx, sy, sw, sh, a90, mirror) {
    return await transformBitmapOrCanvas(bmp, sx, sy, sw, sh, a90, mirror);
  },
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasImage_bitmapFromRGBAData(lib, rgba, width, height) {
    ensureCtxSize(width, height);
    const imageData = new ImageData(castToUint8Clamped(rgba), width, height);
    ctx.putImageData(imageData, 0, 0);
    return await createImageBitmap(ctx.canvas);
  },
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasImage_getRGBAFromBitmap(lib, bmp, sx, sy, width, height) {
    ensureCtxSize(width, height);
    ctx.drawImage(bmp, sx, sy, width, height, 0, 0, width, height);
    return castToInt8(ctx.getImageData(0, 0, width, height).data);
  },
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasImage_setRGBAToBitmap(lib, bmp, rgbaData, x, y, width, height) {
    ensureCtxSize(bmp.width, bmp.height);
    ctx.drawImage(bmp, 0, 0);
    ctx.putImageData(new ImageData(castToUint8Clamped(rgbaData), width, height), x, y);
    bmp.close();
    return await createImageBitmap(ctx.canvas);
  },
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasImage_closeBitmap(lib, bmp) {
    bmp.close();
  }
};


function roundRectPath(ctx, x, y, width, height, arcWidth, arcHeight) {
  const radiusX = arcWidth / 2;
  const radiusY = arcHeight / 2;

  ctx.beginPath();

  // Top edge
  ctx.moveTo(x + radiusX, y);
  ctx.lineTo(x + width - radiusX, y);

  // Top-right corner
  ctx.ellipse(x + width - radiusX, y + radiusY, radiusX, radiusY, 0, -Math.PI / 2, 0);

  // Right edge
  ctx.lineTo(x + width, y + height - radiusY);

  // Bottom-right corner
  ctx.ellipse(x + width - radiusX, y + height - radiusY, radiusX, radiusY, 0, 0, Math.PI / 2);

  // Bottom edge
  ctx.lineTo(x + radiusX, y + height);

  // Bottom-left corner
  ctx.ellipse(x + radiusX, y + height - radiusY, radiusX, radiusY, 0, Math.PI / 2, Math.PI);

  // Left edge
  ctx.lineTo(x, y + radiusY);

  // Top-left corner
  ctx.ellipse(x + radiusX, y + radiusY, radiusX, radiusY, 0, Math.PI, -Math.PI / 2);

  ctx.closePath();
}

function setColor(ctx, r, g, b, a) {
  ctx.fillStyle = `rgba(${r} ${g} ${b} / ${a/255})`;
  ctx.strokeStyle = `rgba(${r} ${g} ${b} / ${a/255})`;
}

const CanvasGraphics = ({
  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_getRGBAFromCtx(lib, ctx, sx, sy, width, height) {
    const imageData = ctx.getImageData(sx, sy, width, height);

    return castToInt8(imageData.data);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawRGBAData(lib, targetCtx, rgba, width, height, x, y, blend) {
    if (blend) {
      ensureCtxSize(width, height);
      ctx.putImageData(new ImageData(castToUint8Clamped(rgba), width, height), 0, 0);
      targetCtx.drawImage(ctx.canvas, x, y);
    } else {
      targetCtx.putImageData(new ImageData(castToUint8Clamped(rgba), width, height), x, y);
    }
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_bitmapToCanvasCtx(lib, bmp) {
    const newCtx = document.createElement('canvas').getContext('2d');
    newCtx.canvas.width = bmp.width; newCtx.canvas.height = bmp.height;

    newCtx.drawImage(bmp, 0, 0);

    bmp.close();

    return newCtx;
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_getCanvasFromCtx(lib, ctx) {
    return ctx.canvas;
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_createCanvasCtx(lib, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    //document.body.appendChild(canvas);


    const ctx = canvas.getContext('2d');

    // we measure with this baseline
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = "left";

    ctx.save();
    return ctx;
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_setFullState(lib, ctx, fontStr, dotted, r, g, b, a, clipX, clipY, clipWidth, clipHeight, translateX, translateY) {
    ctx.restore();
    ctx.save();

    ctx.font = fontStr;
    if (dotted) {
      ctx.setLineDash([2, 2]);
    }

    setColor(ctx, r, g, b, a);

    if (clipX !== 0 || clipY !== 0 || clipWidth !== ctx.canvas.width || clipHeight !== ctx.canvas.height) {
      ctx.beginPath();
      ctx.rect(clipX, clipY, clipWidth, clipHeight);
      ctx.clip();
    }

    ctx.translate(translateX, translateY);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_setColor(lib, ctx, r, g, b, a) {
    setColor(ctx, r, g, b, a);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_setFont(lib, ctx, fontStr) {
    ctx.font = fontStr;
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_setDotted(lib, ctx, dotted) {
    ctx.setLineDash(dotted ? [2, 2] : []);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_applyTranslate(lib, ctx, x, y) {
    ctx.translate(x, y);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_putRGBAData(lib, ctx, rgbaData, x, y, width, height) {
    const imageData = new ImageData(castToUint8Clamped(rgbaData), width, height);
    ctx.putImageData(imageData, x, y);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawArc(lib, ctx, x, y, width, height, start, arc) {
    ctx.beginPath();
    ctx.ellipse(x+width/2+0.5, y+height/2+0.5, width/2, height/2, 0, -start*Math.PI/180, -start*Math.PI/180-arc*Math.PI/180, arc > 0);
    ctx.stroke();
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_fillArc(lib, ctx, x, y, width, height, start, arc) {
    ctx.beginPath();
    ctx.moveTo(x+width/2, y+height/2);
    ctx.ellipse(x+width/2, y+height/2, width/2, height/2, 0, -start*Math.PI/180, -start*Math.PI/180-arc*Math.PI/180, arc > 0);
    ctx.moveTo(x+width/2, y+height/2);
    ctx.fill();
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawRect(lib, ctx, x, y, width, height) {
    // 0, 0 doesn't work like in java..
    width = width || 1;
    height = height || 1;

    ctx.strokeRect(x+0.5, y+0.5, width, height);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_clearRect(lib, ctx, x, y, width, height) {
    ctx.clearRect(x, y, width, height);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_fillRect(lib, ctx, x, y, width, height) {
    ctx.fillRect(x, y, width, height);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawRoundRect(lib, ctx, x, y, width, height, arcWidth, arcHeight) {
    roundRectPath(ctx, x+0.5, y+0.5, width, height, arcWidth, arcHeight);
    ctx.stroke();
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_fillRoundRect(lib, ctx, x, y, width, height, arcWidth, arcHeight) {
    roundRectPath(ctx, x, y, width, height, arcWidth, arcHeight);
    ctx.fill();
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawLine(lib, ctx, x1, y1, x2, y2) {
    // we at least try to be sharp..
    if (y1 === y2) {
      y1 = y1 + 0.5;
      y2 = y2 + 0.5;
    }
    else if (x1 === x2) {
      x1 = x1 + 0.5;
      x2 = x2 + 0.5;
    }

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawPolygon(lib, ctx, x, y, n) {
    ctx.beginPath();
    ctx.moveTo(x[0]+0.5, y[0]+0.5);
    for (let t=1;t<n;t++) {
      ctx.lineTo(x[t]+0.5, y[t]+0.5);
    }
    ctx.closePath();
    ctx.stroke();
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_fillPolygon(lib, ctx, x, y, n, useSharpFillHack) {
    ctx.beginPath();
    ctx.moveTo(x[0], y[0]);
    for (let t=1;t<n;t++) {
      ctx.lineTo(x[t], y[t]);
    }
    ctx.closePath();
    ctx.fill();

    if (useSharpFillHack) {
      // canvas has no API to disable antialiasing but some games draw polygons
      // using multiple calls to fillTriangle.. to make it consistent, we apply
      // additional 3 fills (this currently only works for opaque triangles)

      // strokes would need changing lineJoin, could be slower
      ctx.fill();
      ctx.fill();
      ctx.fill();
    }
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawText(lib, ctx, text, x, y) {
    ctx.fillText(text, x, y);
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_drawImage2(lib, ctx, source, sx, sy, dx, dy, width, height, flipY, withAlpha) {
    if (!withAlpha) {
      // somehow needed?
      ctx.save();
      ctx.fillStyle = 'black';
      ctx.fillRect(dx, dy, width, height);
      ctx.restore();
    }
    if (!flipY) {
      ctx.drawImage(source, sx, sy, width, height, dx, dy, width, height);
    } else {
      ctx.save();
      ctx.translate(dx, dy + height);
      ctx.scale(1, -1);
      ctx.drawImage(source, sx, sy, width, height, 0, 0, width, height);
      ctx.restore();
    }
  },

  async Java_pl_zb3_freej2me_bridge_graphics_CanvasGraphics_encode(lib, ctx, type) {
    const canvas = ctx.canvas;

    const buffer = await new Promise(resolve => {
      canvas.toBlob(
        async (blob) => {
          resolve(blob ? (await blob.arrayBuffer()) : null);
        },
        type,
        0.9
      );
    });

    if (buffer) {
      return new Int8Array(buffer);
    }
  }

});

export default {
  ...CanvasImage,
  ...CanvasGraphics,
  async Java_pl_zb3_freej2me_bridge_graphics_Utils_getCanvasFromCtx(lib, ctx) {
    return ctx.canvas;
  },
}
