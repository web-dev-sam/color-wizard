precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    gl_FragColor  = vec4(st.x, st.y, sin(u_time) * 0.5 + 0.5, 1.0);
}
