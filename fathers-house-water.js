/* Continuous image refraction with feathered masks, following the site's
   photographic layering approach. No scanline slicing or drawn ripple grids. */
(() => {
  'use strict';

  function create(image) {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const gl = canvas.getContext('webgl', {
      alpha: true, premultipliedAlpha: false, antialias: false,
      depth: false, stencil: false, preserveDrawingBuffer: true
    });
    if (!gl) return null;

    const vertexSource = `
      attribute vec2 position;
      varying vec2 uv;
      void main() {
        uv = vec2((position.x + 1.0) * 0.5, (1.0 - position.y) * 0.5);
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    const fragmentSource = `
      precision highp float;
      varying vec2 uv;
      uniform sampler2D photograph;
      uniform float time;
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
      }
      float softBox(vec2 p, vec4 box) {
        vec2 edge = min(p - box.xy, box.zw - p);
        return smoothstep(0.0, 12.0, min(edge.x, edge.y));
      }
      float softEllipse(vec2 p, vec2 center, vec2 radius) {
        float distance = length((p - center) / radius);
        return 1.0 - smoothstep(0.72, 1.0, distance);
      }
      void main() {
        vec2 p = uv * vec2(1672.0, 941.0);
        float falls = softBox(p,vec4(615.0,495.0,718.0,684.0));
        falls = max(falls,softBox(p,vec4(460.0,478.0,519.0,620.0)));
        falls = max(falls,softBox(p,vec4(1192.0,388.0,1250.0,482.0)));
        falls = max(falls,softBox(p,vec4(832.0,399.0,883.0,456.0)));
        falls = max(falls,softBox(p,vec4(1336.0,667.0,1405.0,733.0)));
        falls = max(falls,softBox(p,vec4(955.0,612.0,1015.0,651.0)));
        float river = softEllipse(p,vec2(1110.0,567.0),vec2(85.0,35.0));
        river = max(river,softEllipse(p,vec2(1020.0,660.0),vec2(155.0,60.0)));
        river = max(river,softEllipse(p,vec2(1130.0,755.0),vec2(190.0,80.0)));
        river = max(river,softEllipse(p,vec2(1370.0,855.0),vec2(245.0,110.0)));
        river = max(river,softEllipse(p,vec2(1400.0,940.0),vec2(300.0,90.0)));
        vec3 baseColor = texture2D(photograph,uv).rgb;
        float waterColor = smoothstep(0.7,0.95,baseColor.b / (baseColor.g + 0.001))
                         * smoothstep(0.92,1.08,baseColor.g / (baseColor.r + 0.001));
        river *= waterColor;
        float plants = softEllipse(p,vec2(300.0,475.0),vec2(110.0,110.0));
        plants = max(plants,softEllipse(p,vec2(120.0,570.0),vec2(100.0,140.0)));
        plants = max(plants,softEllipse(p,vec2(1520.0,630.0),vec2(140.0,140.0)));
        plants = max(plants,softEllipse(p,vec2(385.0,820.0),vec2(150.0,110.0)));
        float depth = clamp((p.y - 480.0) / 460.0,0.0,1.0);
        vec2 flow = vec2(
          noise(p * vec2(0.027,0.035) + vec2(time * 0.2,-time * 0.8)) - 0.5,
          noise(p * 0.026 + vec2(8.0,-time * 1.3)) - 0.5
        );
        vec2 riverOffset = vec2(flow.x * (4.0 + depth * 10.0),flow.y * 5.0);
        float fallingDetail = noise(p * vec2(0.06,0.023) + vec2(0.0,-time * 2.0)) - 0.5;
        vec2 fallOffset = vec2(flow.x * 3.0,fallingDetail * 18.0);
        vec2 offset = riverOffset * river * (1.0 - falls) + fallOffset * falls;
        float wind = sin(time * 1.25 + p.x * 0.004) + sin(time * 1.9 + p.y * 0.012) * 0.3;
        offset += vec2(wind * 4.0, sin(time * 1.1 + p.x * 0.01) * 1.2) * plants;
        vec2 sampleUV = clamp(uv + offset / vec2(1672.0,941.0),0.001,0.999);
        vec3 color = texture2D(photograph,sampleUV).rgb;
        float glint = noise(p * 0.018 + vec2(time * 0.17,-time * 0.25));
        color += vec3(0.025,0.04,0.04) * glint * river;
        float foam = noise(p * vec2(0.045,0.03) - vec2(0.0,time * 1.9));
        color += vec3(0.055,0.065,0.075) * smoothstep(0.55,0.88,foam) * falls;
        gl_FragColor = vec4(color,max(max(falls,river),plants) * 0.94);
      }
    `;

    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

    gl.useProgram(program);
    const vertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(gl.getUniformLocation(program, 'photograph'), 0);
    const timeLocation = gl.getUniformLocation(program, 'time');
    let available = true;
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      available = false;
    });

    return {
      draw(time) {
        if (!available) return null;
        gl.viewport(0,0,canvas.width,canvas.height);
        gl.uniform1f(timeLocation,time);
        gl.drawArrays(gl.TRIANGLES,0,6);
        return canvas;
      }
    };
  }

  window.FathersHouseWater = { create };
})();
