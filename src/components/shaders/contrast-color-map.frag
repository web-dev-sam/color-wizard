precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_colorPalette;
uniform vec2 u_paletteSize;
uniform float u_boxSize;
uniform vec2 u_hoveredColor;
uniform vec2 u_selectedColor;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec2 grid = floor(st * u_resolution / u_boxSize);
    vec2 invertedGrid = vec2(grid.x, u_paletteSize.y - 1.0 - grid.y);
    
    if (grid.x < u_paletteSize.x && grid.y < u_paletteSize.y) {
        vec2 texCoord = (grid + 0.5) / u_paletteSize;
        vec4 color = texture2D(u_colorPalette, texCoord);
        
        if (invertedGrid == u_hoveredColor || invertedGrid == u_selectedColor) {
            vec2 boxSt = fract(st * u_resolution / u_boxSize);
            
            if (boxSt.x >= 0.0 && boxSt.x <= 1.0 && boxSt.y >= 0.0 && boxSt.y <= 1.0) {
                float borderWidth = u_selectedColor == invertedGrid ? 0.16 : 0.08;
                if (boxSt.x < borderWidth || boxSt.x > 1.0 - borderWidth ||
                    boxSt.y < borderWidth || boxSt.y > 1.0 - borderWidth) {
                    gl_FragColor = u_selectedColor == invertedGrid 
                      ? vec4(1.0, 1.0, 1.0, 1.0) 
                      : mix(color, vec4(1.0, 1.0, 1.0, 1.0), 0.4);
                } else {
                    gl_FragColor = color;
                }
            } else {
                gl_FragColor = vec4(0.5, 0.5, 0.5, 0.5); // Gray for debugging
            }
        } else {
            gl_FragColor = color;
        }
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
}
