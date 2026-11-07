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
        f = f * f * (3.0 - 2.0 * f);
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
        float falls = softBox(p, vec4(440.0,444.0,545.0,609.0));
        falls = max(falls, softBox(p,vec4(369.0,466.0,418.0,574.0)));
        falls = max(falls, softBox(p,vec4(1017.0,387.0,1172.0,487.0)));
        falls = max(falls, softBox(p,vec4(1205.0,391.0,1298.0,477.0)));
        falls = max(falls, softBox(p,vec4(1380.0,607.0,1457.0,683.0)));
        falls = max(falls, softBox(p,vec4(838.0,571.0,933.0,619.0)));
        float river = softEllipse(p,vec2(1000.0,535.0),vec2(90.0,45.0));
        river = max(river,softEllipse(p,vec2(950.0,610.0),vec2(140.0,70.0)));
        river = max(river,softEllipse(p,vec2(1060.0,750.0),vec2(285.0,125.0)));
        river = max(river,softEllipse(p,vec2(1070.0,900.0),vec2(360.0,180.0)));
        float depth = clamp((p.y - 480.0) / 460.0,0.0,1.0);
        vec2 flow = vec2(
          noise(p * vec2(0.027,0.035) + vec2(time * 0.2,-time * 0.8)) - 0.5,
          noise(p * 0.026 + vec2(8.0,-time * 1.3)) - 0.5
        );
        vec2 riverOffset = vec2(flow.x * (4.0 + depth * 10.0),flow.y * 5.0);
        vec2 fallOffset = vec2(flow.x * 3.5,flow.y * 13.0);
        vec2 offset = riverOffset * river * (1.0 - falls) + fallOffset * falls;
        vec2 sampleUV = clamp(uv + offset / vec2(1672.0,941.0),0.001,0.999);
        vec3 color = texture2D(photograph,sampleUV).rgb;
        float glint = noise(p * 0.018 + vec2(time * 0.17,-time * 0.25));
        color += vec3(0.025,0.04,0.04) * glint * river;
        gl_FragColor = vec4(color,max(falls,river) * 0.94);
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
