import { useEffect, useRef, type FC } from "react";

// --- FRAGMENT SHADER ---
const fragmentShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
uniform vec3 u_color;
#define FC gl_FragCoord.xy
#define R resolution
#define T (time+660.)
float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(rnd(i),rnd(i+vec2(1,0)),u.x),mix(rnd(i+vec2(0,1)),rnd(i+1.),u.x),u.y);}
float fbm(vec2 p){float t=.0,a=1.;for(int i=0;i<5;i++){t+=a*noise(p);p*=mat2(1,-1.2,.2,1.2)*2.;a*=.5;}return t;}
void main(){
  vec2 uv=(FC-.5*R)/R.y;
  vec3 col=vec3(1);
  uv.x+=.25;
  uv*=vec2(2,1);
  float n=fbm(uv*.28-vec2(T*.01,0));
  n=noise(uv*3.+n*2.);
  col.r-=fbm(uv+vec2(0,T*.015)+n);
  col.g-=fbm(uv*1.003+vec2(0,T*.015)+n+.003);
  col.b-=fbm(uv*1.006+vec2(0,T*.015)+n+.006);
  col=mix(col, u_color, dot(col,vec3(.21,.71,.07)));
  col=mix(vec3(.08),col,min(time*.8,1.));
  col=clamp(col,.08,1.);
  O=vec4(col,1);
}`;

// --- RENDERER CLASS ---
// Defensivo: nunca lanca excecao pra fora (evita derrubar a arvore React
// inteira caso WebGL2 nao esteja disponivel ou o contexto seja perdido).
class Renderer {
  private readonly vertexSrc =
    "#version 300 es\nprecision highp float;\nin vec4 position;\nvoid main(){gl_Position=position;}";
  private readonly vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

  private gl: WebGL2RenderingContext | null = null;
  private canvas: HTMLCanvasElement;
  private program: WebGLProgram | null = null;
  private vs: WebGLShader | null = null;
  private fs: WebGLShader | null = null;
  private buffer: WebGLBuffer | null = null;
  private color: [number, number, number] = [0.5, 0.5, 0.5];
  ready = false;

  constructor(canvas: HTMLCanvasElement, fragmentSource: string) {
    this.canvas = canvas;
    try {
      this.gl = canvas.getContext("webgl2", {
        alpha: false,
        antialias: true,
        failIfMajorPerformanceCaveat: false,
      }) as WebGL2RenderingContext | null;
      if (!this.gl) {
        console.warn("SmokeBackground: WebGL2 indisponivel, fundo animado desativado.");
        return;
      }
      this.setup(fragmentSource);
      this.init();
      this.ready = !!this.program;
    } catch (err) {
      console.error("SmokeBackground: falha ao iniciar WebGL2", err);
      this.ready = false;
    }
  }

  updateColor(newColor: [number, number, number]) {
    this.color = newColor;
  }

  updateScale() {
    if (!this.gl) return;
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const { innerWidth: width, innerHeight: height } = window;
    this.canvas.width = Math.max(1, Math.floor(width * dpr));
    this.canvas.height = Math.max(1, Math.floor(height * dpr));
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  private compile(shader: WebGLShader, source: string) {
    const gl = this.gl;
    if (!gl) return;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`Shader compilation error: ${gl.getShaderInfoLog(shader)}`);
    }
  }

  reset() {
    const { gl, program, vs, fs, buffer } = this;
    this.ready = false;
    if (!gl) return;
    try {
      if (program) {
        if (vs) {
          gl.detachShader(program, vs);
          gl.deleteShader(vs);
        }
        if (fs) {
          gl.detachShader(program, fs);
          gl.deleteShader(fs);
        }
        gl.deleteProgram(program);
      }
      if (buffer) gl.deleteBuffer(buffer);
    } catch (err) {
      console.warn("SmokeBackground: erro ao limpar recursos WebGL", err);
    }
    this.program = null;
    this.vs = null;
    this.fs = null;
    this.buffer = null;
  }

  private setup(fragmentSource: string) {
    const gl = this.gl;
    if (!gl) return;
    this.vs = gl.createShader(gl.VERTEX_SHADER);
    this.fs = gl.createShader(gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!this.vs || !this.fs || !program) return;
    this.compile(this.vs, this.vertexSrc);
    this.compile(this.fs, fragmentSource);
    this.program = program;
    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error(`Program linking error: ${gl.getProgramInfoLog(this.program)}`);
      this.program = null;
    }
  }

  private init() {
    const { gl, program } = this;
    if (!gl || !program) return;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    Object.assign(program, {
      resolution: gl.getUniformLocation(program, "resolution"),
      time: gl.getUniformLocation(program, "time"),
      u_color: gl.getUniformLocation(program, "u_color"),
    });
  }

  render(now = 0) {
    const { gl, program, buffer, canvas, ready } = this;
    if (!ready || !gl || !program || !gl.isProgram(program)) return;
    gl.clearColor(0.05, 0.05, 0.06, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = program as any;
    gl.uniform2f(p.resolution, canvas.width, canvas.height);
    gl.uniform1f(p.time, now * 1e-3);
    gl.uniform3fv(p.u_color, this.color);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

// Converte hex ("#8B5CF6") para [r,g,b] normalizado 0-1
const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
    : null;
};

interface SmokeBackgroundProps {
  smokeColor?: string;
}

export const SmokeBackground: FC<SmokeBackgroundProps> = ({ smokeColor = "#808080" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new Renderer(canvas, fragmentShaderSource);
    rendererRef.current = renderer;

    const handleResize = () => renderer.updateScale();
    handleResize();
    window.addEventListener("resize", handleResize);

    // Se o contexto for perdido (troca de GPU, muitas abas com WebGL etc.),
    // evita crash e tenta recriar o renderer quando ele for restaurado.
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn("SmokeBackground: contexto WebGL perdido.");
    };
    const handleContextRestored = () => {
      const fresh = new Renderer(canvas, fragmentShaderSource);
      fresh.updateScale();
      const rgbColor = hexToRgb(smokeColor);
      if (rgbColor) fresh.updateColor(rgbColor);
      rendererRef.current = fresh;
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);

    let animationFrameId: number;
    const loop = (now: number) => {
      rendererRef.current?.render(now);
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      cancelAnimationFrame(animationFrameId);
      rendererRef.current?.reset();
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (renderer) {
      const rgbColor = hexToRgb(smokeColor);
      if (rgbColor) {
        renderer.updateColor(rgbColor);
      }
    }
  }, [smokeColor]);

  return <canvas ref={canvasRef} className="smoke-canvas" />;
};
